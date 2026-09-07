using System;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using Jenga.Items;

namespace Jenga.UI
{
    /// <summary>
    /// Casilla visual de un objeto: sprite, cantidad y un pie de texto opcional
    /// (precio en la tienda, "Equipada" en el inventario...).
    /// </summary>
    public class ItemSlotView : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
    {
        Image _icon;
        Image _selection;
        Text _amountText;
        Text _footerText;
        Button _button;

        public ItemData Item { get; private set; }
        public int Index { get; private set; }
        public event Action<ItemSlotView> Clicked;
        public event Action<ItemSlotView> Hovered;

        public static ItemSlotView Create(Transform parent, int index, Vector2 size)
        {
            var bg = UIFactory.Panel($"Slot_{index}", parent, UIFactory.PanelSoft);
            var rt = bg.rectTransform;
            rt.sizeDelta = size;

            var view = bg.gameObject.AddComponent<ItemSlotView>();
            view.Index = index;

            var sel = UIFactory.Panel("Selection", bg.transform, new Color(0.32f, 0.72f, 1f, 0f));
            UIFactory.Stretch(sel.rectTransform, -2, -2, -2, -2);
            sel.raycastTarget = false;
            view._selection = sel;
            sel.transform.SetAsFirstSibling();

            var icon = UIFactory.Icon("Icon", bg.transform, null, Color.white);
            UIFactory.Stretch(icon.rectTransform, 8, 16, 8, 8);
            view._icon = icon;

            var amount = UIFactory.Label("Amount", bg.transform, "", 18, TextAnchor.LowerRight, Color.white, FontStyle.Bold);
            UIFactory.Stretch(amount.rectTransform, 4, 2, 6, 4);
            view._amountText = amount;

            var footer = UIFactory.Label("Footer", bg.transform, "", 14, TextAnchor.LowerLeft, UIFactory.Gold, FontStyle.Bold);
            UIFactory.Stretch(footer.rectTransform, 6, 2, 4, 4);
            view._footerText = footer;

            var btn = bg.gameObject.AddComponent<Button>();
            btn.targetGraphic = bg;
            btn.onClick.AddListener(() => view.Clicked?.Invoke(view));
            view._button = btn;

            return view;
        }

        public void Setup(ItemData item, int amount, string footer = null, Color? footerColor = null)
        {
            Item = item;
            if (_icon != null)
            {
                _icon.sprite = item != null ? item.icon : null;
                _icon.color = item != null ? item.tint : Color.white;
                _icon.enabled = item != null && item.icon != null;
            }
            if (_amountText != null)
                _amountText.text = (item != null && amount > 1) ? $"x{amount}" : "";
            if (_footerText != null)
            {
                _footerText.text = footer ?? "";
                _footerText.color = footerColor ?? UIFactory.Gold;
            }
            UIFactory.SetButtonColor(_button, item != null ? UIFactory.PanelSoft : new Color(0.12f, 0.13f, 0.16f, 0.85f));
        }

        public void SetSelected(bool selected)
        {
            if (_selection == null) return;
            var c = _selection.color;
            c.a = selected ? 0.45f : 0f;
            _selection.color = c;
        }

        public void SetInteractable(bool value)
        {
            if (_button != null) _button.interactable = value;
        }

        public void OnPointerEnter(PointerEventData eventData) => Hovered?.Invoke(this);
        public void OnPointerExit(PointerEventData eventData) { }
    }
}
