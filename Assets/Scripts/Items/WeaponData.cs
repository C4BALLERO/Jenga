using UnityEngine;

namespace Jenga.Items
{
    /// <summary>
    /// Objeto equipable. Define tanto el modelo 3D que se ve en las manos del
    /// jugador como las estadísticas de disparo que afectan al juego.
    /// </summary>
    [CreateAssetMenu(fileName = "Weapon", menuName = "Jenga/Items/Weapon", order = 1)]
    public class WeaponData : ItemData
    {
        [Header("Modelo equipado")]
        [Tooltip("Prefab que se instancia en la mano del jugador al equipar el arma.")]
        public GameObject weaponModel;
        public Vector3 holdPosition = new Vector3(0.28f, -0.24f, 0.45f);
        public Vector3 holdRotation = Vector3.zero;

        [Header("Disparo")]
        [Min(1f)] public float damage = 20f;
        [Tooltip("Disparos por segundo.")]
        [Min(0.1f)] public float fireRate = 5f;
        [Min(1f)] public float range = 60f;
        [Tooltip("Proyectiles por disparo. Mayor a 1 para escopetas.")]
        [Min(1)] public int pellets = 1;
        [Tooltip("Dispersión en grados. 0 = precisión perfecta.")]
        [Range(0f, 20f)] public float spread = 1f;
        [Min(0f)] public float impactForce = 8f;
        public bool automatic = true;

        [Header("Munición")]
        [Min(1)] public int magazineSize = 12;
        [Min(0.1f)] public float reloadTime = 1.4f;

        [Header("Sensación")]
        [Range(0f, 5f)] public float recoil = 1.2f;
        public Color tracerColor = new Color(1f, 0.85f, 0.35f, 1f);

        /// <summary>Daño por segundo teórico, ignorando recargas.</summary>
        public float DamagePerSecond => damage * pellets * fireRate;

        public override string GetStatsText()
        {
            return
                $"Categoría: Arma\n" +
                $"Daño: {damage:0} x {pellets}\n" +
                $"Cadencia: {fireRate:0.##}/s\n" +
                $"DPS: {DamagePerSecond:0}\n" +
                $"Cargador: {magazineSize}   Recarga: {reloadTime:0.0}s\n" +
                $"Alcance: {range:0} m   Dispersión: {spread:0.#}°";
        }

        void Reset()
        {
            category = ItemCategory.Weapon;
            maxStack = 1;
            basePrice = 150;
            sellRatio = 0.4f;
        }
    }
}
