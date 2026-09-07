using System;
using UnityEngine;
using Jenga.Items;

namespace Jenga.Inventory
{
    /// <summary>Una posición del inventario: un objeto y su cantidad.</summary>
    [Serializable]
    public class InventorySlot
    {
        public ItemData item;
        public int amount;

        public InventorySlot() { }
        public InventorySlot(ItemData item, int amount)
        {
            this.item = item;
            this.amount = amount;
        }

        public bool IsEmpty => item == null || amount <= 0;
        public int FreeSpace => item == null ? 0 : Mathf.Max(0, item.maxStack - amount);

        public void Clear()
        {
            item = null;
            amount = 0;
        }
    }
}
