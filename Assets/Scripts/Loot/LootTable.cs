using System;
using System.Collections.Generic;
using UnityEngine;
using Jenga.Items;

namespace Jenga.Loot
{
    /// <summary>Tabla de botín: dinero y objetos que un enemigo puede soltar al morir.</summary>
    [CreateAssetMenu(fileName = "LootTable", menuName = "Jenga/Loot Table", order = 20)]
    public class LootTable : ScriptableObject
    {
        [Serializable]
        public class Entry
        {
            public ItemData item;
            [Range(0f, 1f)] public float chance = 0.25f;
            [Min(1)] public int minAmount = 1;
            [Min(1)] public int maxAmount = 1;
        }

        [Header("Dinero")]
        [Range(0f, 1f)] public float moneyChance = 1f;
        [Min(0)] public int minMoney = 5;
        [Min(0)] public int maxMoney = 12;

        [Header("Objetos")]
        public List<Entry> entries = new List<Entry>();

        /// <summary>Resultado de una tirada de botín.</summary>
        public struct Roll
        {
            public int money;
            public List<(ItemData item, int amount)> items;
        }

        /// <param name="luckMultiplier">Escala cantidad de dinero (las oleadas altas dan más).</param>
        public Roll RollLoot(float luckMultiplier = 1f)
        {
            var roll = new Roll { money = 0, items = new List<(ItemData, int)>() };

            if (maxMoney > 0 && UnityEngine.Random.value <= moneyChance)
            {
                int raw = UnityEngine.Random.Range(minMoney, Mathf.Max(minMoney, maxMoney) + 1);
                roll.money = Mathf.Max(0, Mathf.RoundToInt(raw * Mathf.Max(0.1f, luckMultiplier)));
            }

            foreach (var e in entries)
            {
                if (e == null || e.item == null) continue;
                if (UnityEngine.Random.value > e.chance) continue;
                int amount = UnityEngine.Random.Range(e.minAmount, Mathf.Max(e.minAmount, e.maxAmount) + 1);
                if (amount > 0) roll.items.Add((e.item, amount));
            }

            return roll;
        }
    }
}
