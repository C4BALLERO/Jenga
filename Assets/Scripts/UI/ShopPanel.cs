using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Jenga.Core;
using Jenga.Inventory;
using Jenga.Items;
using Jenga.Shop;
using Jenga.Waves;

namespace Jenga.UI
{
    /// <summary>
    /// Tienda con pestañas de compra y venta. Muestra el sprite, la cantidad que
    /// tienes y el precio de cada objeto, y permite elegir cuántas unidades mover.
    /// </summary>
    public class ShopPanel : MonoBehaviour
    {
        enum Tab { Buy, Sell }

        ShopController _shop;
        PlayerInventory _inventory;
        Wallet _wallet;
        Jenga.Player.PlayerEquipment _equipment;

        RectTransform _grid;
        ItemInfoView _info;
        Text _moneyText;
        Text _tabHint;
        Text _quantityText;
        Button _buyTabButton;
        Button _sellTabButton;
        Button _actionButton;
        Button _actionAllButton;
        readonly List<ItemSlotView> _slots = new List<ItemSlotView>();

        Tab _tab = Tab.Buy;
        ItemData _selected;
        int _quantity = 1;

        public bool IsOpen => gameObject.activeSelf;

        public static ShopPanel Create(Transform parent)
        {
            var dim = UIFactory.Panel("ShopPanel", parent, new Color(0f, 0f, 0f, 0.72f), false);
            UIFactory.Stretch(dim.rectTransform);
            var panel = dim.gameObject.AddComponent<ShopPanel>();

            var window = UIFactory.Panel("Window", dim.transform, UIFactory.PanelDark);
            UIFactory.Anchor(window.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                new Vector2(0.5f, 0.5f), Vector2.zero, new Vector2(1180f, 760f));

            var header = UIFactory.Panel("Header", window.transform, UIFactory.PanelMid);
            UIFactory.Anchor(header.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f),
                new Vector2(0.5f, 1f), new Vector2(0f, -12f), new Vector2(-24f, 56f));

            var title = UIFactory.Label("Title", header.transform, "TIENDA DE CAMPAÑA", 28, TextAnchor.MiddleLeft, Color.white, FontStyle.Bold);
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

            // Pestañas.
            panel._buyTabButton = UIFactory.TextButton("TabBuy", window.transform, "COMPRAR", UIFactory.Accent, Color.black, 20, () => panel.SetTab(Tab.Buy));
            var buyRt = panel._buyTabButton.GetComponent<RectTransform>();
            UIFactory.Anchor(buyRt, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f),
                new Vector2(14f, -76f), new Vector2(190f, 42f));

            panel._sellTabButton = UIFactory.TextButton("TabSell", window.transform, "VENDER", UIFactory.PanelSoft, Color.white, 20, () => panel.SetTab(Tab.Sell));
            var sellRt = panel._sellTabButton.GetComponent<RectTransform>();
            UIFactory.Anchor(sellRt, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f),
                new Vector2(212f, -76f), new Vector2(190f, 42f));

            panel._tabHint = UIFactory.Label("TabHint", window.transform, "", 16, TextAnchor.MiddleLeft, UIFactory.InkDim);
            UIFactory.Anchor(panel._tabHint.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f),
                new Vector2(416f, -76f), new Vector2(-440f, 42f));

            var gridContent = UIFactory.ScrollView("Grid", window.transform, out _, true, new Vector2(116f, 116f), 10, 10);
            var gridRoot = gridContent.parent.parent as RectTransform;
            UIFactory.Anchor(gridRoot, new Vector2(0f, 0f), new Vector2(0f, 1f), new Vector2(0f, 0.5f),
                new Vector2(12f, -34f), new Vector2(760f, -176f));
            var layout = gridContent.GetComponent<GridLayoutGroup>();
            layout.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            layout.constraintCount = 6;
            panel._grid = gridContent;

            panel._info = ItemInfoView.Create(window.transform);
            UIFactory.Anchor(panel._info.GetComponent<RectTransform>(), new Vector2(1f, 0f), new Vector2(1f, 1f),
                new Vector2(1f, 0.5f), new Vector2(-12f, -22f), new Vector2(370f, -152f));

            // Selector de cantidad.
            var qtyRow = UIFactory.Panel("Quantity", panel._info.transform, new Color(0f, 0f, 0f, 0.3f));
            var qtyRt = qtyRow.rectTransform;
            qtyRt.anchorMin = new Vector2(0f, 0f);
            qtyRt.anchorMax = new Vector2(1f, 0f);
            qtyRt.pivot = new Vector2(0.5f, 0f);
            qtyRt.offsetMin = new Vector2(16f, 138f);
            qtyRt.offsetMax = new Vector2(-16f, 178f);

            var minus = UIFactory.TextButton("Minus", qtyRow.transform, "-", UIFactory.PanelSoft, Color.white, 24, () => panel.ChangeQuantity(-1));
            var minusRt = minus.GetComponent<RectTransform>();
            UIFactory.Anchor(minusRt, new Vector2(0f, 0.5f), new Vector2(0f, 0.5f), new Vector2(0f, 0.5f), new Vector2(6f, 0f), new Vector2(48f, 32f));

            panel._quantityText = UIFactory.Label("Qty", qtyRow.transform, "x1", 22, TextAnchor.MiddleCenter, Color.white, FontStyle.Bold);
            UIFactory.Stretch(panel._quantityText.rectTransform, 60, 0, 60, 0);

            var plus = UIFactory.TextButton("Plus", qtyRow.transform, "+", UIFactory.PanelSoft, Color.white, 24, () => panel.ChangeQuantity(1));
            var plusRt = plus.GetComponent<RectTransform>();
            UIFactory.Anchor(plusRt, new Vector2(1f, 0.5f), new Vector2(1f, 0.5f), new Vector2(1f, 0.5f), new Vector2(-6f, 0f), new Vector2(48f, 32f));

            panel._actionButton = UIFactory.TextButton("Action", panel._info.transform, "Comprar", UIFactory.Good, Color.black, 20, panel.OnAction);
            var actionRt = panel._actionButton.GetComponent<RectTransform>();
            actionRt.anchorMin = new Vector2(0f, 0f);
            actionRt.anchorMax = new Vector2(0.62f, 0f);
            actionRt.pivot = new Vector2(0.5f, 0f);
            actionRt.offsetMin = new Vector2(16f, 88f);
            actionRt.offsetMax = new Vector2(-6f, 132f);

            panel._actionAllButton = UIFactory.TextButton("ActionAll", panel._info.transform, "Todo", UIFactory.PanelSoft, Color.white, 18, panel.OnActionAll);
            var allRt = panel._actionAllButton.GetComponent<RectTransform>();
            allRt.anchorMin = new Vector2(0.62f, 0f);
            allRt.anchorMax = new Vector2(1f, 0f);
            allRt.pivot = new Vector2(0.5f, 0f);
            allRt.offsetMin = new Vector2(6f, 88f);
            allRt.offsetMax = new Vector2(-16f, 132f);

            var hint = UIFactory.Label("Hint", window.transform, "E o B para abrir/cerrar la tienda   ·   ESC para salir", 16, TextAnchor.LowerRight, UIFactory.InkDim);
            UIFactory.Anchor(hint.rectTransform, new Vector2(1f, 0f), new Vector2(1f, 0f), new Vector2(1f, 0f),
                new Vector2(-14f, 14f), new Vector2(520f, 22f));

            dim.gameObject.SetActive(false);
            return panel;
        }

        public void Bind(ShopController shop, PlayerInventory inventory, Wallet wallet, Jenga.Player.PlayerEquipment equipment)
        {
            _shop = shop;
            _inventory = inventory;
            _wallet = wallet;
            _equipment = equipment;

            if (_shop != null) _shop.Changed += Refresh;
            if (_inventory != null) _inventory.Changed += Refresh;
            if (_wallet != null) _wallet.Changed += _ => RefreshMoney();
        }

        void OnDestroy()
        {
            if (_shop != null) _shop.Changed -= Refresh;
            if (_inventory != null) _inventory.Changed -= Refresh;
        }

        public void Open()
        {
            if (IsOpen) return;
            gameObject.SetActive(true);
            _quantity = 1;
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

        void SetTab(Tab tab)
        {
            _tab = tab;
            _selected = null;
            _quantity = 1;
            Refresh();
        }

        void ChangeQuantity(int delta)
        {
            _quantity = Mathf.Clamp(_quantity + delta, 1, 99);
            RefreshSelection();
        }

        public void Refresh()
        {
            if (_shop == null) _shop = ShopController.Instance;
            if (_shop == null) return;

            UIFactory.SetButtonColor(_buyTabButton, _tab == Tab.Buy ? UIFactory.Accent : UIFactory.PanelSoft);
            UIFactory.SetButtonColor(_sellTabButton, _tab == Tab.Sell ? UIFactory.Accent : UIFactory.PanelSoft);
            var buyLabel = UIFactory.ButtonLabel(_buyTabButton);
            var sellLabel = UIFactory.ButtonLabel(_sellTabButton);
            if (buyLabel != null) buyLabel.color = _tab == Tab.Buy ? Color.black : Color.white;
            if (sellLabel != null) sellLabel.color = _tab == Tab.Sell ? Color.black : Color.white;

            if (_tabHint != null)
                _tabHint.text = _tab == Tab.Buy
                    ? "Compra equipo entre oleadas. El precio sube según el objeto."
                    : "Vende el botín que sueltan los enemigos.";

            UIFactory.ClearChildren(_grid);
            _slots.Clear();

            if (_tab == Tab.Buy) BuildBuyList();
            else BuildSellList();

            RefreshMoney();
            RefreshSelection();
        }

        void BuildBuyList()
        {
            int wave = WaveManager.Instance != null ? Mathf.Max(1, WaveManager.Instance.CurrentWave) : 1;
            var entries = _shop.GetAvailableEntries(wave);
            for (int i = 0; i < entries.Count; i++)
            {
                var entry = entries[i];
                int price = _shop.Stock.GetBuyPrice(entry);
                int owned = _inventory != null ? _inventory.CountOf(entry.item) : 0;

                var slot = ItemSlotView.Create(_grid, i, new Vector2(116f, 116f));
                bool affordable = _wallet != null && _wallet.CanAfford(price);
                slot.Setup(entry.item, owned, $"{price} $", affordable ? UIFactory.Gold : UIFactory.Danger);
                slot.Clicked += OnSlotClicked;
                slot.Hovered += OnSlotClicked;
                _slots.Add(slot);
            }

            if (entries.Count == 0)
                UIFactory.Label("Empty", _grid, "La tienda no tiene nada disponible.", 18, TextAnchor.MiddleCenter, UIFactory.InkDim);
        }

        void BuildSellList()
        {
            if (_inventory == null) return;
            var owned = _inventory.GetAggregated();
            for (int i = 0; i < owned.Count; i++)
            {
                var (item, amount) = owned[i];
                int price = _shop.GetSellPrice(item);

                var slot = ItemSlotView.Create(_grid, i, new Vector2(116f, 116f));
                slot.Setup(item, amount, $"+{price} $", UIFactory.Gold);
                slot.Clicked += OnSlotClicked;
                slot.Hovered += OnSlotClicked;
                _slots.Add(slot);
            }

            if (owned.Count == 0)
                UIFactory.Label("Empty", _grid, "No tienes nada que vender. Elimina enemigos para conseguir botín.", 18, TextAnchor.MiddleCenter, UIFactory.InkDim);
        }

        void OnSlotClicked(ItemSlotView view)
        {
            if (view.Item == null) return;
            if (_selected != view.Item) _quantity = 1;
            _selected = view.Item;
            RefreshSelection();
        }

        void RefreshMoney()
        {
            if (_moneyText != null && _wallet != null)
                _moneyText.text = UIFactory.Money(_wallet.Money);
        }

        void RefreshSelection()
        {
            for (int i = 0; i < _slots.Count; i++)
                _slots[i].SetSelected(_slots[i].Item == _selected && _selected != null);

            int owned = _selected != null && _inventory != null ? _inventory.CountOf(_selected) : 0;

            if (_selected != null)
            {
                int unit = _tab == Tab.Buy ? _shop.GetBuyPrice(_selected) : _shop.GetSellPrice(_selected);
                int total = unit * _quantity;
                string line = _tab == Tab.Buy
                    ? $"Precio: {UIFactory.Money(unit)}  ·  Total: {UIFactory.Money(total)}"
                    : $"Te pagan: {UIFactory.Money(unit)}  ·  Total: {UIFactory.Money(total)}";

                if (_tab == Tab.Buy)
                {
                    int stockLeft = _shop.GetStockLeft(_selected);
                    if (stockLeft >= 0) line += $"\nExistencias: {stockLeft}";
                }
                _info.Show(_selected, owned, line);
            }
            else
            {
                _info.Show(null, 0, null);
            }

            if (_quantityText != null) _quantityText.text = $"x{_quantity}";

            var actionLabel = UIFactory.ButtonLabel(_actionButton);
            var allLabel = UIFactory.ButtonLabel(_actionAllButton);
            if (actionLabel != null) actionLabel.text = _tab == Tab.Buy ? "Comprar" : "Vender";
            if (allLabel != null) allLabel.text = _tab == Tab.Buy ? "Máximo" : "Vender todo";

            bool can = false;
            if (_selected != null)
            {
                can = _tab == Tab.Buy
                    ? _shop.CanBuy(_selected, _quantity, out _)
                    : _shop.CanSell(_selected, _quantity, out _);
            }
            if (_actionButton != null) _actionButton.interactable = can;
            if (_actionAllButton != null) _actionAllButton.interactable = _selected != null;
        }

        void OnAction()
        {
            if (_selected == null) return;
            if (_tab == Tab.Buy) _shop.Buy(_selected, _quantity);
            else _shop.Sell(_selected, _quantity);
            Refresh();
        }

        void OnActionAll()
        {
            if (_selected == null) return;

            if (_tab == Tab.Buy)
            {
                int unit = Mathf.Max(1, _shop.GetBuyPrice(_selected));
                int affordable = _wallet != null ? _wallet.Money / unit : 0;
                int space = _inventory != null ? _inventory.SpaceFor(_selected) : 0;
                int stockLeft = _shop.GetStockLeft(_selected);
                int max = Mathf.Min(affordable, space);
                if (stockLeft >= 0) max = Mathf.Min(max, stockLeft);
                if (max > 0) _shop.Buy(_selected, max);
                else Notifications.Post("No puedes comprar más de eso.", _selected.icon, UIFactory.Danger);
            }
            else
            {
                int owned = _inventory != null ? _inventory.CountOf(_selected) : 0;
                if (owned > 0) _shop.Sell(_selected, owned);
            }

            _quantity = 1;
            Refresh();
        }
    }
}
