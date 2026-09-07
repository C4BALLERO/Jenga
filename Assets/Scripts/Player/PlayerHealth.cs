using System;
using UnityEngine;
using Jenga.Core;

namespace Jenga.Player
{
    /// <summary>Vida del jugador con regeneración lenta tras dejar de recibir daño.</summary>
    public class PlayerHealth : MonoBehaviour, IDamageable
    {
        [SerializeField] float maxHealth = 100f;
        [SerializeField] float regenPerSecond = 3f;
        [SerializeField] float regenDelay = 5f;

        float _health;
        float _lastDamageTime = -99f;

        public event Action<float, float> HealthChanged;
        public event Action Died;

        public float Health => _health;
        public float MaxHealth => maxHealth;
        public bool IsAlive => _health > 0f;

        void Awake()
        {
            _health = maxHealth;
        }

        void Start()
        {
            HealthChanged?.Invoke(_health, maxHealth);
        }

        void Update()
        {
            if (!IsAlive) return;
            if (regenPerSecond > 0f && Time.time - _lastDamageTime > regenDelay && _health < maxHealth)
            {
                _health = Mathf.Min(maxHealth, _health + regenPerSecond * Time.deltaTime);
                HealthChanged?.Invoke(_health, maxHealth);
            }
        }

        public void TakeDamage(float amount, Vector3 hitPoint, Vector3 hitNormal, GameObject source)
        {
            if (!IsAlive || amount <= 0f) return;
            _health = Mathf.Max(0f, _health - amount);
            _lastDamageTime = Time.time;
            HealthChanged?.Invoke(_health, maxHealth);

            if (_health <= 0f)
            {
                Died?.Invoke();
                if (GameManager.Instance != null) GameManager.Instance.NotifyPlayerDied();
            }
        }

        public void Heal(float amount)
        {
            if (!IsAlive || amount <= 0f) return;
            _health = Mathf.Min(maxHealth, _health + amount);
            HealthChanged?.Invoke(_health, maxHealth);
        }
    }
}
