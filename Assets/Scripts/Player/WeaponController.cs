using System;
using System.Collections;
using UnityEngine;
using Jenga.Core;
using Jenga.Items;

namespace Jenga.Player
{
    /// <summary>
    /// Dispara el arma equipada: cadencia, dispersión, munición, recarga,
    /// retroceso de cámara y trazador visual del disparo.
    /// </summary>
    [RequireComponent(typeof(PlayerEquipment))]
    public class WeaponController : MonoBehaviour
    {
        [SerializeField] Camera aimCamera;
        [SerializeField] LayerMask hitMask = ~0;

        PlayerEquipment _equipment;
        PlayerController _player;
        float _nextFireTime;
        int _magazine;
        bool _reloading;
        float _recoilOffset;
        float _reloadEndTime;

        public event Action AmmoChanged;
        public event Action<float> Fired;
        /// <summary>Se dispara cuando un disparo impacta en un enemigo (para la marca de acierto).</summary>
        public event Action Hitmarker;

        public int Magazine => _magazine;
        public int Reserve => _equipment != null ? _equipment.GetReserve(_equipment.EquippedWeapon) : 0;
        public bool IsReloading => _reloading;
        public float ReloadProgress => _reloading && _equipment.EquippedWeapon != null
            ? Mathf.Clamp01(1f - (_reloadEndTime - Time.time) / Mathf.Max(0.01f, _equipment.EquippedWeapon.reloadTime))
            : 1f;

        void Awake()
        {
            _equipment = GetComponent<PlayerEquipment>();
            _player = GetComponent<PlayerController>();
            if (aimCamera == null) aimCamera = GetComponentInChildren<Camera>();
        }

        void OnEnable()
        {
            _equipment.WeaponChanged += OnWeaponChanged;
        }

        void OnDisable()
        {
            _equipment.WeaponChanged -= OnWeaponChanged;
        }

        void OnWeaponChanged(WeaponData weapon)
        {
            StopAllCoroutines();
            _reloading = false;
            _magazine = weapon != null ? Mathf.Min(weapon.magazineSize, weapon.magazineSize) : 0;
            if (weapon != null)
            {
                // El cargador inicial no consume la reserva.
                _magazine = weapon.magazineSize;
            }
            AmmoChanged?.Invoke();
        }

        void Update()
        {
            if (_player != null && !_player.ControlsEnabled)
            {
                RecoverRecoil();
                return;
            }

            var weapon = _equipment.EquippedWeapon;
            if (weapon != null)
            {
                bool wantsFire = weapon.automatic ? InputHelper.FireHeld : InputHelper.FirePressed;
                if (wantsFire) TryFire(weapon);
                if (InputHelper.ReloadPressed) TryReload(weapon);
                if (_magazine <= 0 && !_reloading) TryReload(weapon);
            }

            RecoverRecoil();
        }

        void RecoverRecoil()
        {
            if (_recoilOffset <= 0f) return;
            _recoilOffset = Mathf.MoveTowards(_recoilOffset, 0f, 8f * Time.deltaTime);
        }

        void TryFire(WeaponData weapon)
        {
            if (_reloading || Time.time < _nextFireTime) return;
            if (_magazine <= 0)
            {
                TryReload(weapon);
                return;
            }

            _nextFireTime = Time.time + 1f / Mathf.Max(0.05f, weapon.fireRate);
            _magazine--;
            AmmoChanged?.Invoke();

            Transform origin = aimCamera != null ? aimCamera.transform : transform;
            Vector3 muzzle = _equipment.MuzzlePoint != null ? _equipment.MuzzlePoint.position : origin.position + origin.forward * 0.5f;
            bool anyHit = false;

            for (int i = 0; i < Mathf.Max(1, weapon.pellets); i++)
            {
                Vector3 dir = ApplySpread(origin.forward, weapon.spread);
                if (Physics.Raycast(origin.position, dir, out RaycastHit hit, weapon.range, hitMask, QueryTriggerInteraction.Ignore))
                {
                    var damageable = hit.collider.GetComponentInParent<IDamageable>();
                    if (damageable != null && damageable.IsAlive && !(damageable is PlayerHealth))
                    {
                        damageable.TakeDamage(weapon.damage, hit.point, hit.normal, gameObject);
                        anyHit = true;
                    }
                    var rb = hit.collider.attachedRigidbody;
                    if (rb != null && !rb.isKinematic)
                        rb.AddForceAtPosition(dir * weapon.impactForce, hit.point, ForceMode.Impulse);

                    ShotEffects.SpawnTracer(muzzle, hit.point, weapon.tracerColor);
                    ShotEffects.SpawnImpact(hit.point, hit.normal);
                }
                else
                {
                    ShotEffects.SpawnTracer(muzzle, origin.position + dir * weapon.range, weapon.tracerColor);
                }
            }

            if (anyHit) Hitmarker?.Invoke();

            _recoilOffset = Mathf.Min(3f, _recoilOffset + weapon.recoil * 0.25f);
            ApplyCameraKick(weapon.recoil);
            Fired?.Invoke(weapon.recoil);
        }

        Vector3 ApplySpread(Vector3 forward, float spreadDegrees)
        {
            float spread = spreadDegrees + _recoilOffset;
            if (spread <= 0.01f) return forward;
            Vector2 circle = UnityEngine.Random.insideUnitCircle * spread;
            return Quaternion.Euler(circle.y, circle.x, 0f) * forward;
        }

        void ApplyCameraKick(float amount)
        {
            if (aimCamera == null) return;
            StartCoroutine(KickRoutine(amount));
        }

        IEnumerator KickRoutine(float amount)
        {
            Transform t = aimCamera.transform;
            Vector3 start = t.localPosition;
            Vector3 back = start - Vector3.forward * (0.02f * amount) + Vector3.up * (0.01f * amount);
            float e = 0f;
            while (e < 1f)
            {
                e += Time.deltaTime * 14f;
                t.localPosition = Vector3.Lerp(back, start, Mathf.Clamp01(e));
                yield return null;
            }
            t.localPosition = start;
        }

        public void TryReload(WeaponData weapon)
        {
            if (weapon == null || _reloading) return;
            if (_magazine >= weapon.magazineSize) return;
            if (_equipment.GetReserve(weapon) <= 0) return;
            StartCoroutine(ReloadRoutine(weapon));
        }

        IEnumerator ReloadRoutine(WeaponData weapon)
        {
            _reloading = true;
            _reloadEndTime = Time.time + weapon.reloadTime;
            AmmoChanged?.Invoke();

            while (Time.time < _reloadEndTime)
            {
                if (_equipment.EquippedWeapon != weapon)
                {
                    _reloading = false;
                    yield break;
                }
                yield return null;
            }

            int needed = weapon.magazineSize - _magazine;
            int taken = _equipment.TakeFromReserve(weapon, needed);
            _magazine += taken;
            _reloading = false;
            AmmoChanged?.Invoke();
        }
    }
}
