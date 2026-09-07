using UnityEngine;

namespace Jenga.Items
{
    /// <summary>
    /// Definición base de un objeto. Contiene todo lo que la UI necesita mostrar
    /// (nombre, descripción, sprite y precios) y lo que el mundo necesita para
    /// representarlo como botín (modelo 3D).
    /// </summary>
    [CreateAssetMenu(fileName = "Item", menuName = "Jenga/Items/Item", order = 0)]
    public class ItemData : ScriptableObject
    {
        [Header("Identidad")]
        [Tooltip("Identificador único y estable. Se usa para guardar/cargar y comparar objetos.")]
        public string itemId = "item.new";
        public string displayName = "Objeto";
        [TextArea(2, 5)]
        public string description = "Descripción del objeto.";

        [Header("Presentación")]
        [Tooltip("Sprite 2D que se muestra en el inventario y en la tienda.")]
        public Sprite icon;
        [Tooltip("Modelo 3D usado cuando el objeto aparece en el suelo como botín.")]
        public GameObject worldModel;
        public Color tint = Color.white;

        [Header("Economía")]
        public ItemCategory category = ItemCategory.Material;
        [Min(0)] public int basePrice = 10;
        [Range(0.05f, 1f)]
        [Tooltip("Porcentaje del precio base que paga la tienda al vender.")]
        public float sellRatio = 0.5f;
        [Min(1)] public int maxStack = 99;

        [Header("Botín")]
        [Tooltip("Si es falso, el objeto nunca cae de los enemigos (sólo se compra).")]
        public bool canDrop = true;

        public virtual int BuyPrice => Mathf.Max(1, basePrice);
        public virtual int SellPrice => Mathf.Max(1, Mathf.RoundToInt(basePrice * sellRatio));

        public bool IsStackable => maxStack > 1;

        /// <summary>Texto de estadísticas que la ficha de información muestra bajo la descripción.</summary>
        public virtual string GetStatsText()
        {
            return $"Categoría: {CategoryLabel(category)}";
        }

        public static string CategoryLabel(ItemCategory c)
        {
            switch (c)
            {
                case ItemCategory.Weapon: return "Arma";
                case ItemCategory.Consumable: return "Consumible";
                case ItemCategory.Ammo: return "Munición";
                default: return "Material";
            }
        }

        void OnValidate()
        {
            if (string.IsNullOrWhiteSpace(itemId)) itemId = name.ToLowerInvariant();
            if (maxStack < 1) maxStack = 1;
        }
    }
}
