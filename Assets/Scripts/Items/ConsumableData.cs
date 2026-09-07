using UnityEngine;

namespace Jenga.Items
{
    /// <summary>Objeto de un solo uso: cura al jugador o le devuelve munición.</summary>
    [CreateAssetMenu(fileName = "Consumable", menuName = "Jenga/Items/Consumable", order = 2)]
    public class ConsumableData : ItemData
    {
        [Min(0f)] public float healAmount = 40f;
        [Min(0)] public int ammoAmount = 0;

        public override string GetStatsText()
        {
            string s = "Categoría: Consumible";
            if (healAmount > 0f) s += $"\nCura: +{healAmount:0} PV";
            if (ammoAmount > 0) s += $"\nMunición: +{ammoAmount}";
            s += "\nUso: click en el inventario";
            return s;
        }

        void Reset()
        {
            category = ItemCategory.Consumable;
            maxStack = 10;
            basePrice = 40;
        }
    }
}
