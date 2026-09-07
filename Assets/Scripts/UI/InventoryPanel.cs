using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Jenga.Core;
using Jenga.Inventory;
using Jenga.Items;
using Jenga.Player;

namespace Jenga.UI
{
    /// <summary>
    /// Ventana de inventario: rejilla de casillas con sprite y cantidad,
    /// ficha de información y acciones (equipar, usar, tirar).
    /// </summary>
    public class InventoryPanel : MonoBehaviour
    {
        PlayerInventory _inventory;
        Wallet _wallet;
        PlayerEquipment _equipment;

        RectTransform _grid;
        ItemInfoView _info;
        Text _moneyText;
        Text _capacityText;
        Button _primaryButton;
        Button _dropButton;
        readonly List<ItemSlotView> _slots = new List<ItemSlotView>();
        int _selectedIndex = -1;

        public bool IsOpen => gameObject.activeSelf;

        public static InventoryPanel Create(Transform parent)
        {
            var dim = UIFactory.Panel("InventoryPanel", parent, new Color(0f, 0f, 0f, 0.72f), false);
            UIFactory.Stretch(dim.rectTransform);
            var panel = dim.gameObject.AddComponent<InventoryPanel>();

            var window = UIFactory.Panel("Window", dim.transform, UIFactory.PanelDark);
            UIFactory.Anchor(window.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                new Vector2(0.5f, 0.5f), Vector2.zero, new Vector2(1180f, 760f));

            var header = UIFactory.Panel("Header", window.transform, UIFactory.PanelMid);
            UIFactory.Anchor(header.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f),
                new Vector2(0.5f, 1f), new Vector2(0f, -12f), new Vector2(-24f, 56f));

            var title = UIFactory.Label("Title", header.transform, "INVENTARIO", 28, TextAnchor.MiddleLeft, Color.white, FontStyle.Bold);
            UIFactory.Stretch(title.rectTransform, 18, 0, 0, 0);

            panel._moneyText = UIFactory.Label("Money", header.transform, "0 $", 24, TextAnchor.MiddleRight, UIFactory.Gold, FontStyle.Bold);
            UIFactory.Stretch(panel._moneyText.rectTransform, 0, 0, 74, 0);

            var closeButton = UIFactory.TextButton("Close", header.transform, "X", UIFactory.Danger, Color.white, 20, panel.Close);
            var closeRt = closeButton.GetComponent<RectTransform>();
            closeRt.anchorMin = new Vector2(1f, 0.5f);
            closeRt.anchorMax = new Vector2(1f, 0.5f);
            closeRt.pivot = new Vector2(1f, 0.5f);
            closeRt.sizeDelta = new Vector2(44f, 40f);
            closeRt.anchoredPosition = new Vector2(-8f, 0f);

            // Rejilla de casillas.
            var gridScroll = UIFactory.ScrollView("Grid", window.transform, out _, true, new Vector2(104f, 104f), 10, 10);
            var gridRoot = gridScroll.parent.parent as RectTransform;
            UIFactory.Anchor(gridRoot, new Vector2(0f, 0f), new Vector2(0f, 1f),
                new Vector2(0f, 0.5f), new Vector2(12f, -18f), new Vector2(760f, -110f));
            var gridLayout = gridScroll.GetComponent<GridLayoutGroup>();
            gridLayout.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            gridLayout.constraintCount = 6;
            panel._grid = gridScroll;

            panel._capacityText = UIFactory.Label("Capacity", window.transform, "", 16, TextAnchor.LowerLeft, UIFactory.InkDim);
            UIFactory.Anchor(panel._capacityText.rectTransform, new Vector2(0f, 0f), new Vector2(0f, 0f),
                new Vector2(0f, 0f), new Vector2(18f, 14f), new Vector2(500f, 22f));

            // Ficha lateral.
            panel._info = ItemInfoView.Create(window.transform);
            UIFactory.Anchor(panel._info.GetComponent<RectTransform>(), new Vector2(1f, 0f), new Vector2(1f, 1f),
                new Vector2(1f, 0.5f), new Vector2(-12f, -18f), new Vector2(370f, -110f));

            panel._primaryButton = UIFactory.TextButton("Primary", panel._info.transform, "Equipar", UIFactory.Accent, Color.black, 20, panel.OnPrimary);
            var primRt = panel._primaryButton.GetComponent<RectTransform>();
            primRt.pivot = new Vector2(0.5f, 0f);
            primRt.anchorMin = new Vector2(0f, 0f);
            primRt.anchorMax = new Vector2(0.62f, 0f);
            primRt.offsetMin = new Vector2(16f, 88f);
            primRt.offsetMax = new Vector2(-6f, 132f);

            panel._dropButton = UIFactory.TextButton("Drop", panel._info.transform, "Tirar", new Color(0.35f, 0.36f, 0.42f), Color.white, 18, panel.OnDrop);
            var dropRt = panel._dropButton.GetComponent<RectTransform>();
            dropRt.anchorMin = new Vector2(0.62f, 0f);
            dropRt.anchorMax = new Vector2(1f, 0f);
            dropRt.pivot = new Vector2(0.5f, 0f);
            dropRt.offsetMin = new Vector2(6f, 88f);
            dropRt.offsetMax = new Vector2(-16f, 132f);

            var hint = UIFactory.Label("Hint", window.transform, "TAB para cerrar   ·   1-5 equipa armas rápidamente", 16, TextAnchor.LowerRight, UIFactory.InkDim);
            UIFactory.Anchor(hint.rectTransform, new Vector2(1f, 0f), new Vector2(1f, 0f), new Vector2(1f, 0f),
                new Vector2(-14f, 14f), new Vector2(420f, 22f));

            dim.gameObject.SetActive(false);
            return panel;
        }

        public void Bind(PlayerInventory inventory, Wallet wallet, PlayerEquipment equipment)
        {
            _inventory = inventory;
            _wallet = wallet;
            _equipment = equipment;

            if (_inventory != null) _inventory.Changed += Refresh;
            if (_wallet != null) _wallet.Changed += _ => RefreshMoney();
            if (_equipment != null) _equipment.WeaponChanged += _ => Refresh();
            BuildSlots();
            Refresh();
        }

        void OnDestroy()
        {
            if (_inventory != null) _inventory.Changed -= Refresh;
        }

        void BuildSlots()
        {
            if (_inventory == null || _grid == null) return;
            UIFactory.ClearChildren(_grid);
            _slots.Clear();

            for (int i = 0; i < _inventory.Slots.Count; i++)
            {
                var slot = ItemSlotView.Create(_grid, i, new Vector2(104f, 104f));
                slot.Clicked += OnSlotClicked;
                slot.Hovered += OnSlotHovered;
                _slots.Add(slot);
            }
        }

        void OnSlotClicked(ItemSlotView view)
        {
            _selectedIndex = view.Index;
            RefreshSelection();
        }

        void OnSlotHovered(ItemSlotView view)
        {
            if (view.Item == null) return;
            _selectedIndex = view.Index;
            RefreshSelection();
        }

        public void Open()
        {
            if (IsOpen) return;
            gameObject.SetActive(true);
            Refresh();
            if (GameManager.Instance != null) GameManager.Instance.PushUiBlocker();
        }

        public void Close()
        {
            if (!gameObject.activeSelf) return;
            gameObject.SetActive(false);
            if (GameManager.Instance != null) GameManager.Instance.PopUiBlocker();
        }

        public void Toggle()
        {
            if (IsOpen) Close(); else Open();
        }

        public void Refresh()
        {
            if (_inventory == null) return;
            if (_slots.Count != _inventory.Slots.Count) BuildSlots();

            int used = 0;
            for (int i = 0; i < _slots.Count; i++)
            {
                var data = _inventory.GetSlot(i);
                var item = data != null ? data.item : null;
                int amount = data != null ? data.amount : 0;
                if (item != null) used++;

                string footer = null;
                Color color = UIFactory.Gold;
                if (item != null && _equipment != null && _equipment.EquippedWeapon == item)
                {
                    footer = "EQUIPADA";
                    color = UIFactory.Good;
                }
                _slots[i].Setup(item, amount, footer, color);
            }

            if (_capacityText != null)
                _capacityText.text = $"Casillas usadas: {used}/{_slots.Count}";

            RefreshMoney();
            RefreshSelection();
        }

        void RefreshMoney()
        {
            if (_moneyText != null && _wallet != null)
                _moneyText.text = UIFactory.Money(_wallet.Money);
        }

        void RefreshSelection()
        {
            ItemData selected = null;
            if (_selectedIndex >= 0 && _selectedIndex < _slots.Count)
            {
                var s = _inventory.GetSlot(_selectedIndex);
                selected = s != null ? s.item : null;
            }

            for (int i = 0; i < _slots.Count; i++)
                _slots[i].SetSelected(i == _selectedIndex && selected != null);

            int owned = selected != null ? _inventory.CountOf(selected) : 0;
            string price = selected != null ? $"Valor de venta: {UIFactory.Money(selected.SellPrice)}" : null;
            if (_info != null) _info.Show(selected, owned, price);

            var label = UIFactory.ButtonLabel(_primaryButton);
            bool canPrimary = false;
            if (selected is WeaponData)
            {
                if (label != null) label.text = _equipment != null && _equipment.EquippedWeapon == selected ? "Equipada" : "Equipar";
                canPrimary = _equipment != null && _equipment.EquippedWeapon != selected;
            }
            else if (selected is ConsumableData)
            {
                if (label != null) label.text = "Usar";
                canPrimary = true;
            }
            else
            {
                if (label != null) label.text = "Sin acción";
                canPrimary = false;
            }

            if (_primaryButton != null) _primaryButton.interactable = canPrimary;
            if (_dropButton != null) _dropButton.interactable = selected != null;
        }

        void OnPrimary()
        {
            var slot = _inventory != null ? _inventory.GetSlot(_selectedIndex) : null;
            if (slot == null || slot.IsEmpty) return;

            if (slot.item is WeaponData weapon)
            {
                if (_equipment != null) _equipment.Equip(weapon);
            }
            else if (slot.item is ConsumableData consumable)
            {
                UseConsumable(consumable);
            }
            Refresh();
        }

        void UseConsumable(ConsumableData consumable)
        {
            bool used = false;
            var player = _inventory.GetComponent<PlayerHealth>();

            if (consumable.healAmount > 0f && player != null && player.Health < player.MaxHealth)
            {
                player.Heal(consumable.healAmount);
                used = true;
            }
            if (consumable.ammoAmount > 0 && _equipment != null && _equipment.EquippedWeapon != null)
            {
                _equipment.AddReserve(_equipment.EquippedWeapon, consumable.ammoAmount);
                used = true;
            }

            if (!used)
            {
                Notifications.Post("No hace falta usarlo ahora.", consumable.icon, UIFactory.InkDim);
                return;
            }

            _inventory.Remove(consumable, 1);
            Notifications.Post($"Usado: {consumable.displayName}", consumable.icon, UIFactory.Good);
        }

        void OnDrop()
        {
            var slot = _inventory != null ? _inventory.GetSlot(_selectedIndex) : null;
            if (slot == null || slot.IsEmpty) return;

            var item = slot.item;
            var player = _inventory.transform;
            Vector3 pos = player.position + player.forward * 1.6f + Vector3.up * 0.4f;
            Jenga.Loot.LootSpawner.SpawnItem(pos, item, 1);
            _inventory.RemoveAt(_selectedIndex, 1);
            Refresh();
        }
    }
}
