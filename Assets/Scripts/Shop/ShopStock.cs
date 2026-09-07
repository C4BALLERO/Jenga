using System;
using System.Collections.Generic;
using UnityEngine;
using Jenga.Items;

namespace Jenga.Shop
{
    /// <summary>Catálogo de la tienda: qué vende, a qué precio y cuántas unidades quedan.</summary>
    [CreateAssetMenu(fileName = "ShopStock", menuName = "Jenga/Shop Stock", order = 12)]
    public class ShopStock : ScriptableObject
    {
        [Serializable]
        public class Entry
        {
            public ItemData item;
            [Tooltip("-1 = existencias infinitas.")]
            public int stock = -1;
            [Min(0.1f)] public float priceMultiplier = 1f;
            [Tooltip("Oleada a partir de la cual la tienda ofrece este objeto.")]
            [Min(1)] public int unlockWave = 1;

            [NonSerialized] public int runtimeStock;
        }

        public List<Entry> entries = new List<Entry>();

        [Header("Precios")]
        [Tooltip("Multiplicador global aplicado a lo que paga la tienda al comprarte objetos.")]
        [Range(0.1f, 1f)] public float buybackRatio = 1f;

        public void ResetRuntimeStock()
        {
            foreach (var e in entries)
                if (e != null) e.runtimeStock = e.stock;
        }

        public Entry Find(ItemData item)
        {
            foreach (var e in entries)
                if (e != null && e.item == item) return e;
            return null;
        }

        public int GetBuyPrice(Entry entry)
        {
            if (entry == null || entry.item == null) return 0;
            return Mathf.Max(1, Mathf.RoundToInt(entry.item.BuyPrice * entry.priceMultiplier));
        }

        public int GetSellPrice(ItemData item)
        {
            if (item == null) return 0;
            return Mathf.Max(1, Mathf.RoundToInt(item.SellPrice * buybackRatio));
        }
    }
}
