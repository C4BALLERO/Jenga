using System;
using System.Collections.Generic;
using UnityEngine;
using Jenga.Items;

namespace Jenga.Inventory
{
    /// <summary>
    /// Inventario con casillas y apilamiento. Emite <see cref="Changed"/> cada vez que
    /// su contenido varía para que la UI se refresque sola.
    /// </summary>
    public class PlayerInventory : MonoBehaviour
    {
        [Min(1)] public int slotCount = 24;
        [SerializeField] List<InventorySlot> slots = new List<InventorySlot>();

        public event Action Changed;

        public IReadOnlyList<InventorySlot> Slots => slots;

        void Awake()
        {
            EnsureSlots();
        }

        void EnsureSlots()
        {
            if (slots == null) slots = new List<InventorySlot>();
            while (slots.Count < slotCount) slots.Add(new InventorySlot());
            while (slots.Count > slotCount && slots.Count > 0) slots.RemoveAt(slots.Count - 1);
        }

        public void RaiseChanged() => Changed?.Invoke();

        /// <summary>Cuántas unidades del objeto hay en total.</summary>
        public int CountOf(ItemData item)
        {
            if (item == null) return 0;
            int total = 0;
            for (int i = 0; i < slots.Count; i++)
                if (slots[i].item == item) total += slots[i].amount;
            return total;
        }

        public bool Has(ItemData item, int amount = 1) => CountOf(item) >= amount;

        /// <summary>Cuántas unidades del objeto caben todavía.</summary>
        public int SpaceFor(ItemData item)
        {
            if (item == null) return 0;
            EnsureSlots();
            int space = 0;
            for (int i = 0; i < slots.Count; i++)
            {
                if (slots[i].IsEmpty) space += item.maxStack;
                else if (slots[i].item == item) space += slots[i].FreeSpace;
            }
            return space;
        }

        /// <summary>Añade objetos. Devuelve cuántos no cupieron.</summary>
        public int Add(ItemData item, int amount = 1)
        {
            if (item == null || amount <= 0) return amount;
            EnsureSlots();
            int remaining = amount;

            // Primero completa pilas existentes.
            if (item.IsStackable)
            {
                for (int i = 0; i < slots.Count && remaining > 0; i++)
                {
                    var s = slots[i];
                    if (s.item != item) continue;
                    int add = Mathf.Min(s.FreeSpace, remaining);
                    s.amount += add;
                    remaining -= add;
                }
            }

            // Luego usa casillas vacías.
            for (int i = 0; i < slots.Count && remaining > 0; i++)
            {
                var s = slots[i];
                if (!s.IsEmpty) continue;
                int add = Mathf.Min(item.maxStack, remaining);
                s.item = item;
                s.amount = add;
                remaining -= add;
            }

            if (remaining != amount) Changed?.Invoke();
            return remaining;
        }

        /// <summary>Quita objetos. Devuelve true sólo si pudo quitar la cantidad completa.</summary>
        public bool Remove(ItemData item, int amount = 1)
        {
            if (item == null || amount <= 0) return false;
            if (CountOf(item) < amount) return false;

            int remaining = amount;
            for (int i = slots.Count - 1; i >= 0 && remaining > 0; i--)
            {
                var s = slots[i];
                if (s.item != item) continue;
                int take = Mathf.Min(s.amount, remaining);
                s.amount -= take;
                remaining -= take;
                if (s.amount <= 0) s.Clear();
            }

            Changed?.Invoke();
            return true;
        }

        public bool RemoveAt(int index, int amount = 1)
        {
            if (index < 0 || index >= slots.Count) return false;
            var s = slots[index];
            if (s.IsEmpty || s.amount < amount) return false;
            s.amount -= amount;
            if (s.amount <= 0) s.Clear();
            Changed?.Invoke();
            return true;
        }

        public InventorySlot GetSlot(int index)
        {
            EnsureSlots();
            if (index < 0 || index >= slots.Count) return null;
            return slots[index];
        }

        /// <summary>Lista compacta de objetos distintos con su cantidad total (para la pestaña de venta).</summary>
        public List<(ItemData item, int amount)> GetAggregated()
        {
            var result = new List<(ItemData, int)>();
            var index = new Dictionary<ItemData, int>();
            for (int i = 0; i < slots.Count; i++)
            {
                var s = slots[i];
                if (s.IsEmpty) continue;
                if (index.TryGetValue(s.item, out int at))
                    result[at] = (s.item, result[at].Item2 + s.amount);
                else
                {
                    index[s.item] = result.Count;
                    result.Add((s.item, s.amount));
                }
            }
            return result;
        }
    }
}
