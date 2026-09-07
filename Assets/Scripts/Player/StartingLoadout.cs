using System;
using System.Collections.Generic;
using UnityEngine;
using Jenga.Inventory;
using Jenga.Items;

namespace Jenga.Player
{
    /// <summary>Objetos con los que empieza la partida el jugador.</summary>
    [RequireComponent(typeof(PlayerInventory))]
    public class StartingLoadout : MonoBehaviour
    {
        [Serializable]
        public class Entry
        {
            public ItemData item;
            [Min(1)] public int amount = 1;
        }

        [SerializeField] List<Entry> entries = new List<Entry>();

        void Start()
        {
            var inventory = GetComponent<PlayerInventory>();
            if (inventory == null) return;
            foreach (var e in entries)
            {
                if (e == null || e.item == null) continue;
                inventory.Add(e.item, e.amount);
            }
        }
    }
}
