using System;
using UnityEngine;
using Jenga.Core;
using Jenga.Loot;
using Jenga.Player;

namespace Jenga.Enemies
{
    /// <summary>
    /// Enemigo persecutor. Recibe sus estadísticas ya escaladas por la oleada,
    /// persigue al jugador, le golpea de cerca y suelta botín al morir.
    /// </summary>
    [RequireComponent(typeof(Rigidbody))]
    public class Enemy : MonoBehaviour, IDamageable
    {
        [SerializeField] EnemyData data;
        [SerializeField] Transform visualRoot;
        [SerializeField] Renderer[] bodyRenderers;
        [SerializeField] LayerMask groundMask = 1;

        EnemyStats _stats;
        float _health;
        float _nextAttackTime;
        Transform _target;
        PlayerHealth _targetHealth;
        Rigidbody _rb;
        float _flashUntil;
        MaterialPropertyBlock _mpb;
        float _groundOffset = 1f;
        static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");
        static readonly int ColorId = Shader.PropertyToID("_Color");

        public event Action<Enemy> Died;

        public EnemyData Data => data;
        public EnemyStats Stats => _stats;
        public float Health => _health;
        public float MaxHealth => _stats.maxHealth;
        public bool IsAlive => _health > 0f;

        void Awake()
        {
            _rb = GetComponent<Rigidbody>();
            _rb.isKinematic = true;
            _rb.useGravity = false;

            // Distancia del pivote a los pies, para apoyar al enemigo en el suelo.
            var capsule = GetComponent<CapsuleCollider>();
            if (capsule != null) _groundOffset = capsule.height * 0.5f - capsule.center.y;
            if (visualRoot == null) visualRoot = transform;
            if (bodyRenderers == null || bodyRenderers.Length == 0)
                bodyRenderers = GetComponentsInChildren<Renderer>();
            _mpb = new MaterialPropertyBlock();
            if (data != null && _stats.maxHealth <= 0f) Initialize(data, EnemyStats.FromBase(data));
        }

        void Start()
        {
            AcquireTarget();
        }

        /// <summary>Llamado por el generador de oleadas justo después de instanciar.</summary>
        public void Initialize(EnemyData enemyData, EnemyStats stats)
        {
            data = enemyData;
            _stats = stats;
            _health = stats.maxHealth;
            _nextAttackTime = Time.time + 0.4f;

            if (visualRoot == null) visualRoot = transform;
            transform.localScale = Vector3.one * Mathf.Max(0.2f, (data != null ? data.bodyScale : 1f) * stats.scaleMultiplier);
            ApplyColor(stats.colorTint);
            AcquireTarget();
        }

        void AcquireTarget()
        {
            if (_target != null) return;
            var pc = FindFirstObjectByType<PlayerController>();
            if (pc != null)
            {
                _target = pc.transform;
                _targetHealth = pc.GetComponent<PlayerHealth>();
            }
        }

        void Update()
        {
            if (!IsAlive) return;
            if (_target == null)
            {
                AcquireTarget();
                if (_target == null) return;
            }
            if (_targetHealth != null && !_targetHealth.IsAlive) return;

            Vector3 toTarget = _target.position - transform.position;
            toTarget.y = 0f;
            float distance = toTarget.magnitude;

            if (distance > _stats.attackRange)
            {
                Vector3 dir = distance > 0.001f ? toTarget / distance : Vector3.zero;
                dir += Separation() * 0.6f;
                dir.y = 0f;
                if (dir.sqrMagnitude > 0.0001f) dir.Normalize();
                transform.position += dir * (_stats.moveSpeed * Time.deltaTime);
            }
            else if (Time.time >= _nextAttackTime)
            {
                _nextAttackTime = Time.time + Mathf.Max(0.15f, _stats.attackInterval);
                if (_targetHealth != null)
                    _targetHealth.TakeDamage(_stats.damage, transform.position, Vector3.up, gameObject);
                StartCoroutine(AttackLunge());
            }

            if (toTarget.sqrMagnitude > 0.0001f)
            {
                Quaternion look = Quaternion.LookRotation(toTarget.normalized, Vector3.up);
                transform.rotation = Quaternion.Slerp(transform.rotation, look, 10f * Time.deltaTime);
            }

            KeepGrounded();

            if (_flashUntil > 0f && Time.time > _flashUntil)
            {
                _flashUntil = 0f;
                ApplyColor(_stats.colorTint);
            }
        }

        void KeepGrounded()
        {
            var pos = transform.position;
            if (Physics.Raycast(pos + Vector3.up * 3f, Vector3.down, out RaycastHit hit, 12f, groundMask, QueryTriggerInteraction.Ignore))
            {
                float targetY = hit.point.y + _groundOffset * transform.localScale.y;
                pos.y = Mathf.Lerp(pos.y, targetY, 12f * Time.deltaTime);
                transform.position = pos;
            }
        }

        /// <summary>Empuje suave para que los enemigos no se apilen en el mismo punto.</summary>
        Vector3 Separation()
        {
            Vector3 push = Vector3.zero;
            var hits = Physics.OverlapSphere(transform.position, 1.6f);
            for (int i = 0; i < hits.Length; i++)
            {
                var other = hits[i].GetComponentInParent<Enemy>();
                if (other == null || other == this) continue;
                Vector3 away = transform.position - other.transform.position;
                away.y = 0f;
                float d = away.magnitude;
                if (d > 0.001f) push += away / d * (1.6f - Mathf.Min(d, 1.6f)) / 1.6f;
            }
            return push;
        }

        System.Collections.IEnumerator AttackLunge()
        {
            if (visualRoot == null) yield break;
            Vector3 start = visualRoot.localPosition;
            Vector3 forward = Vector3.forward * 0.35f;
            float t = 0f;
            while (t < 1f)
            {
                t += Time.deltaTime * 6f;
                float curve = Mathf.Sin(Mathf.Clamp01(t) * Mathf.PI);
                visualRoot.localPosition = start + forward * curve;
                yield return null;
            }
            visualRoot.localPosition = start;
        }

        public void TakeDamage(float amount, Vector3 hitPoint, Vector3 hitNormal, GameObject source)
        {
            if (!IsAlive || amount <= 0f) return;
            _health -= amount;
            ApplyColor(Color.Lerp(_stats.colorTint, Color.white, 0.8f));
            _flashUntil = Time.time + 0.07f;

            if (_health <= 0f) Die();
        }

        void Die()
        {
            _health = 0f;
            DropLoot();
            Died?.Invoke(this);
            Destroy(gameObject);
        }

        void DropLoot()
        {
            if (data == null || data.lootTable == null) return;
            var roll = data.lootTable.RollLoot(_stats.lootMultiplier);
            Vector3 origin = transform.position + Vector3.up * 0.4f;

            if (roll.money > 0)
                LootSpawner.SpawnMoney(origin, roll.money);

            foreach (var (item, amount) in roll.items)
                LootSpawner.SpawnItem(origin, item, amount);
        }

        void ApplyColor(Color c)
        {
            if (bodyRenderers == null) return;
            if (_mpb == null) _mpb = new MaterialPropertyBlock();
            for (int i = 0; i < bodyRenderers.Length; i++)
            {
                var r = bodyRenderers[i];
                if (r == null) continue;
                r.GetPropertyBlock(_mpb);
                _mpb.SetColor(BaseColorId, c);
                _mpb.SetColor(ColorId, c);
                r.SetPropertyBlock(_mpb);
            }
        }
    }
}
