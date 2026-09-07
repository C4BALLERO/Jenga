using System;
using System.Collections.Generic;
using UnityEngine;
using Jenga.Core;
using Jenga.Inventory;
using Jenga.Items;

namespace Jenga.Shop
{
    /// <summary>
    /// Lógica de compra y venta. No sabe nada de la interfaz: expone métodos que
    /// devuelven el resultado de la operación y un evento para refrescar la vista.
    /// </summary>
    public class ShopController : MonoBehaviour
    {
        public static ShopController Instance { get; private set; }

        [SerializeField] ShopStock stock;
        [SerializeField] PlayerInventory inventory;
        [SerializeField] Wallet wallet;

        public event Action Changed;

        public ShopStock Stock => stock;
        public PlayerInventory Inventory => inventory;
        public Wallet Wallet => wallet;

        void Awake()
        {
            Instance = this;
            if (stock != null) stock.ResetRuntimeStock();
            ResolveRefs();
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        void ResolveRefs()
        {
            if (inventory == null) inventory = FindFirstObjectByType<PlayerInventory>();
            if (wallet == null) wallet = FindFirstObjectByType<Wallet>();
        }

        /// <summary>Objetos que la tienda ofrece en la oleada actual.</summary>
        public List<ShopStock.Entry> GetAvailableEntries(int wave)
        {
            var list = new List<ShopStock.Entry>();
            if (stock == null) return list;
            foreach (var e in stock.entries)
            {
                if (e == null || e.item == null) continue;
                if (e.unlockWave > Mathf.Max(1, wave)) continue;
                list.Add(e);
            }
            return list;
        }

        public int GetBuyPrice(ItemData item)
        {
            if (stock == null) return item != null ? item.BuyPrice : 0;
            return stock.GetBuyPrice(stock.Find(item));
        }

        public int GetSellPrice(ItemData item)
        {
            if (stock == null) return item != null ? item.SellPrice : 0;
            return stock.GetSellPrice(item);
        }

        public bool CanBuy(ItemData item, int amount, out string reason)
        {
            reason = null;
            ResolveRefs();
            if (item == null) { reason = "Objeto inválido."; return false; }
            if (wallet == null || inventory == null) { reason = "Jugador no encontrado."; return false; }

            var entry = stock != null ? stock.Find(item) : null;
            if (entry == null) { reason = "La tienda no vende eso."; return false; }
            if (entry.runtimeStock >= 0 && entry.runtimeStock < amount) { reason = "Sin existencias."; return false; }

            int price = stock.GetBuyPrice(entry) * amount;
            if (!wallet.CanAfford(price)) { reason = "Dinero insuficiente."; return false; }
            if (inventory.SpaceFor(item) < amount) { reason = "Inventario lleno."; return false; }
            return true;
        }

        public bool Buy(ItemData item, int amount = 1)
        {
            if (!CanBuy(item, amount, out string reason))
            {
                if (!string.IsNullOrEmpty(reason)) Notifications.Post(reason, null, new Color(1f, 0.5f, 0.5f));
                return false;
            }

            var entry = stock.Find(item);
            int price = stock.GetBuyPrice(entry) * amount;
            if (!wallet.Spend(price)) return false;

            int left = inventory.Add(item, amount);
            if (left > 0)
            {
                // Devuelve el dinero de lo que no cupo.
                wallet.Add(stock.GetBuyPrice(entry) * left);
                amount -= left;
            }
            if (entry.runtimeStock >= 0) entry.runtimeStock -= amount;

            Notifications.Post($"Comprado: {item.displayName} x{amount} (-{stock.GetBuyPrice(entry) * amount} $)", item.icon);
            Changed?.Invoke();
            return true;
        }

        public bool CanSell(ItemData item, int amount, out string reason)
        {
            reason = null;
            ResolveRefs();
            if (item == null) { reason = "Objeto inválido."; return false; }
            if (inventory == null || wallet == null) { reason = "Jugador no encontrado."; return false; }
            if (!inventory.Has(item, amount)) { reason = "No tienes suficientes."; return false; }
            return true;
        }

        public bool Sell(ItemData item, int amount = 1)
        {
            if (!CanSell(item, amount, out string reason))
            {
                if (!string.IsNullOrEmpty(reason)) Notifications.Post(reason, null, new Color(1f, 0.5f, 0.5f));
                return false;
            }

            if (!inventory.Remove(item, amount)) return false;

            int total = GetSellPrice(item) * amount;
            wallet.Add(total);

            // Lo vendido vuelve al catálogo si la tienda lleva existencias limitadas.
            var entry = stock != null ? stock.Find(item) : null;
            if (entry != null && entry.runtimeStock >= 0) entry.runtimeStock += amount;

            Notifications.Post($"Vendido: {item.displayName} x{amount} (+{total} $)", item.icon, new Color(1f, 0.9f, 0.4f));
            Changed?.Invoke();
            return true;
        }

        public int GetStockLeft(ItemData item)
        {
            var e = stock != null ? stock.Find(item) : null;
            return e == null ? 0 : e.runtimeStock;
        }
    }
}
