using System;
using System.Collections.Generic;
using UnityEngine;
using Jenga.Core;
using Jenga.Items;

namespace Jenga.Player
{
    /// <summary>
    /// Arma equipada del jugador. Instancia el modelo 3D en el soporte de la mano
    /// y guarda la munición de reserva de cada arma.
    /// </summary>
    public class PlayerEquipment : MonoBehaviour
    {
        [SerializeField] Transform weaponSocket;
        [SerializeField] WeaponData startingWeapon;

        readonly Dictionary<WeaponData, int> _reserveAmmo = new Dictionary<WeaponData, int>();
        GameObject _currentModel;

        public event Action<WeaponData> WeaponChanged;
        public event Action AmmoChanged;

        public WeaponData EquippedWeapon { get; private set; }
        public Transform WeaponSocket => weaponSocket;
        /// <summary>Punta del cañón del modelo equipado (para los trazadores).</summary>
        public Transform MuzzlePoint { get; private set; }

        void Start()
        {
            var weapon = startingWeapon;
            if (weapon == null)
            {
                var db = GameDatabase.Instance;
                if (db != null) weapon = db.starterWeapon;
            }
            if (weapon != null) Equip(weapon);
        }

        public bool Equip(WeaponData weapon)
        {
            if (weapon == null) return false;
            if (EquippedWeapon == weapon) return true;

            EquippedWeapon = weapon;
            if (!_reserveAmmo.ContainsKey(weapon))
                _reserveAmmo[weapon] = weapon.magazineSize * 3;

            SpawnModel(weapon);
            WeaponChanged?.Invoke(weapon);
            Notifications.Post($"Equipado: {weapon.displayName}", weapon.icon);
            return true;
        }

        public void Unequip()
        {
            EquippedWeapon = null;
            if (_currentModel != null) Destroy(_currentModel);
            _currentModel = null;
            MuzzlePoint = null;
            WeaponChanged?.Invoke(null);
        }

        void SpawnModel(WeaponData weapon)
        {
            if (_currentModel != null) Destroy(_currentModel);
            _currentModel = null;
            MuzzlePoint = null;

            if (weaponSocket == null || weapon.weaponModel == null) return;

            _currentModel = Instantiate(weapon.weaponModel, weaponSocket);
            _currentModel.transform.localPosition = weapon.holdPosition;
            _currentModel.transform.localRotation = Quaternion.Euler(weapon.holdRotation);
            _currentModel.transform.localScale = Vector3.one;
            SetLayerRecursive(_currentModel, weaponSocket.gameObject.layer);

            var muzzle = _currentModel.transform.Find("Muzzle");
            MuzzlePoint = muzzle != null ? muzzle : _currentModel.transform;
        }

        static void SetLayerRecursive(GameObject go, int layer)
        {
            go.layer = layer;
            foreach (Transform child in go.transform) SetLayerRecursive(child.gameObject, layer);
        }

        public int GetReserve(WeaponData weapon)
        {
            if (weapon == null) return 0;
            return _reserveAmmo.TryGetValue(weapon, out int v) ? v : 0;
        }

        public int TakeFromReserve(WeaponData weapon, int amount)
        {
            if (weapon == null || amount <= 0) return 0;
            int have = GetReserve(weapon);
            int take = Mathf.Min(have, amount);
            _reserveAmmo[weapon] = have - take;
            if (take > 0) AmmoChanged?.Invoke();
            return take;
        }

        public void AddReserve(WeaponData weapon, int amount)
        {
            if (weapon == null || amount <= 0) return;
            _reserveAmmo[weapon] = GetReserve(weapon) + amount;
            AmmoChanged?.Invoke();
        }

        /// <summary>Añade munición al arma equipada (usado por las cajas de munición).</summary>
        public bool AddAmmoToEquipped(int amount)
        {
            if (EquippedWeapon == null) return false;
            AddReserve(EquippedWeapon, amount);
            return true;
        }
    }
}
