using UnityEngine;
using UnityEngine.UI;
using Jenga.Items;

namespace Jenga.UI
{
    /// <summary>
    /// Ficha de información del objeto seleccionado: sprite grande, nombre,
    /// categoría, descripción, estadísticas, precio y cuántos tienes.
    /// </summary>
    public class ItemInfoView : MonoBehaviour
    {
        Image _icon;
        Text _name;
        Text _category;
        Text _description;
        Text _stats;
        Text _price;
        Text _owned;

        public static ItemInfoView Create(Transform parent)
        {
            var panel = UIFactory.Panel("ItemInfo", parent, UIFactory.PanelMid);
            var view = panel.gameObject.AddComponent<ItemInfoView>();

            var iconBox = UIFactory.Panel("IconBox", panel.transform, new Color(0f, 0f, 0f, 0.35f));
            UIFactory.Anchor(iconBox.rectTransform, new Vector2(0.5f, 1f), new Vector2(0.5f, 1f),
                new Vector2(0.5f, 1f), new Vector2(0f, -12f), new Vector2(124f, 124f));

            view._icon = UIFactory.Icon("Icon", iconBox.transform, null, Color.white);
            UIFactory.Stretch(view._icon.rectTransform, 10, 10, 10, 10);

            view._name = UIFactory.Label("Name", panel.transform, "", 25, TextAnchor.UpperCenter, Color.white, FontStyle.Bold);
            UIFactory.Anchor(view._name.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f),
                new Vector2(0.5f, 1f), new Vector2(0f, -142f), new Vector2(-24f, 30f));

            view._category = UIFactory.Label("Category", panel.transform, "", 16, TextAnchor.UpperCenter, UIFactory.Accent);
            UIFactory.Anchor(view._category.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f),
                new Vector2(0.5f, 1f), new Vector2(0f, -174f), new Vector2(-24f, 20f));

            view._description = UIFactory.Label("Description", panel.transform, "", 17, TextAnchor.UpperLeft, UIFactory.InkDim);
            UIFactory.Anchor(view._description.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f),
                new Vector2(0.5f, 1f), new Vector2(0f, -198f), new Vector2(-32f, 76f));

            view._stats = UIFactory.Label("Stats", panel.transform, "", 17, TextAnchor.UpperLeft, UIFactory.Ink);
            UIFactory.Anchor(view._stats.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f),
                new Vector2(0.5f, 1f), new Vector2(0f, -278f), new Vector2(-32f, 130f));

            view._price = UIFactory.Label("Price", panel.transform, "", 21, TextAnchor.LowerLeft, UIFactory.Gold, FontStyle.Bold);
            UIFactory.Anchor(view._price.rectTransform, new Vector2(0f, 0f), new Vector2(1f, 0f),
                new Vector2(0.5f, 0f), new Vector2(0f, 34f), new Vector2(-32f, 46f));

            view._owned = UIFactory.Label("Owned", panel.transform, "", 18, TextAnchor.LowerLeft, UIFactory.InkDim);
            UIFactory.Anchor(view._owned.rectTransform, new Vector2(0f, 0f), new Vector2(1f, 0f),
                new Vector2(0.5f, 0f), new Vector2(0f, 8f), new Vector2(-32f, 22f));

            view.Show(null, 0, null);
            return view;
        }

        public void Show(ItemData item, int owned, string priceLine)
        {
            bool has = item != null;
            if (_icon != null)
            {
                _icon.sprite = has ? item.icon : null;
                _icon.color = has ? item.tint : Color.white;
                _icon.enabled = has && item.icon != null;
            }
            if (_name != null) _name.text = has ? item.displayName : "Selecciona un objeto";
            if (_category != null) _category.text = has ? ItemData.CategoryLabel(item.category) : "";
            if (_description != null) _description.text = has ? item.description : "Pasa el ratón o haz clic sobre una casilla para ver su información.";
            if (_stats != null) _stats.text = has ? item.GetStatsText() : "";
            if (_price != null) _price.text = priceLine ?? "";
            if (_owned != null) _owned.text = has ? $"En el inventario: {owned}" : "";
        }
    }
}
