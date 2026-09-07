using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

namespace Jenga.UI
{
    /// <summary>
    /// Utilidades para construir la interfaz por código con uGUI.
    /// Se usa fuente y sprites integrados de Unity, así el proyecto no necesita
    /// importar recursos adicionales para que la UI se vea bien.
    /// </summary>
    public static class UIFactory
    {
        public static readonly Color Ink = new Color(0.93f, 0.95f, 1f);
        public static readonly Color InkDim = new Color(0.68f, 0.72f, 0.80f);
        public static readonly Color PanelDark = new Color(0.07f, 0.08f, 0.11f, 0.96f);
        public static readonly Color PanelMid = new Color(0.12f, 0.14f, 0.18f, 0.98f);
        public static readonly Color PanelSoft = new Color(0.17f, 0.20f, 0.26f, 1f);
        public static readonly Color Accent = new Color(0.32f, 0.72f, 1f);
        public static readonly Color Gold = new Color(1f, 0.82f, 0.30f);
        public static readonly Color Danger = new Color(0.95f, 0.33f, 0.33f);
        public static readonly Color Good = new Color(0.42f, 0.88f, 0.52f);

        static Font _font;
        static Sprite _box;
        static Sprite _button;
        static Sprite _white;

        public static Font Font
        {
            get
            {
                if (_font == null)
                {
                    _font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
                    if (_font == null) _font = Resources.GetBuiltinResource<Font>("Arial.ttf");
                    if (_font == null) _font = Font.CreateDynamicFontFromOSFont("Arial", 16);
                }
                return _font;
            }
        }

        public static Sprite BoxSprite
        {
            get
            {
                if (_box == null) _box = Resources.GetBuiltinResource<Sprite>("UI/Skin/Background.psd");
                return _box != null ? _box : WhiteSprite;
            }
        }

        public static Sprite ButtonSprite
        {
            get
            {
                if (_button == null) _button = Resources.GetBuiltinResource<Sprite>("UI/Skin/UISprite.psd");
                return _button != null ? _button : WhiteSprite;
            }
        }

        public static Sprite WhiteSprite
        {
            get
            {
                if (_white == null)
                {
                    var tex = new Texture2D(4, 4, TextureFormat.RGBA32, false);
                    var pixels = new Color32[16];
                    for (int i = 0; i < pixels.Length; i++) pixels[i] = new Color32(255, 255, 255, 255);
                    tex.SetPixels32(pixels);
                    tex.Apply();
                    tex.hideFlags = HideFlags.HideAndDontSave;
                    _white = Sprite.Create(tex, new Rect(0, 0, 4, 4), new Vector2(0.5f, 0.5f), 100f);
                    _white.hideFlags = HideFlags.HideAndDontSave;
                }
                return _white;
            }
        }

        public static RectTransform NewRect(string name, Transform parent)
        {
            var go = new GameObject(name, typeof(RectTransform));
            var rt = go.GetComponent<RectTransform>();
            rt.SetParent(parent, false);
            rt.localScale = Vector3.one;
            return rt;
        }

        public static RectTransform Stretch(RectTransform rt, float left = 0, float bottom = 0, float right = 0, float top = 0)
        {
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = new Vector2(left, bottom);
            rt.offsetMax = new Vector2(-right, -top);
            return rt;
        }

        public static RectTransform Anchor(RectTransform rt, Vector2 anchorMin, Vector2 anchorMax, Vector2 pivot, Vector2 anchoredPos, Vector2 size)
        {
            rt.anchorMin = anchorMin;
            rt.anchorMax = anchorMax;
            rt.pivot = pivot;
            rt.sizeDelta = size;
            rt.anchoredPosition = anchoredPos;
            return rt;
        }

        public static Image Panel(string name, Transform parent, Color color, bool sliced = true)
        {
            var rt = NewRect(name, parent);
            var img = rt.gameObject.AddComponent<Image>();
            img.sprite = sliced ? BoxSprite : WhiteSprite;
            img.type = sliced ? Image.Type.Sliced : Image.Type.Simple;
            img.color = color;
            return img;
        }

        public static Text Label(string name, Transform parent, string text, int size, TextAnchor anchor, Color color, FontStyle style = FontStyle.Normal)
        {
            var rt = NewRect(name, parent);
            var t = rt.gameObject.AddComponent<Text>();
            t.font = Font;
            t.text = text;
            t.fontSize = size;
            t.fontStyle = style;
            t.alignment = anchor;
            t.color = color;
            t.horizontalOverflow = HorizontalWrapMode.Wrap;
            t.verticalOverflow = VerticalWrapMode.Overflow;
            t.raycastTarget = false;
            t.supportRichText = true;
            return t;
        }

        public static Image Icon(string name, Transform parent, Sprite sprite, Color color)
        {
            var rt = NewRect(name, parent);
            var img = rt.gameObject.AddComponent<Image>();
            img.sprite = sprite;
            img.color = color;
            img.preserveAspect = true;
            img.raycastTarget = false;
            img.enabled = sprite != null;
            return img;
        }

        public static Button TextButton(string name, Transform parent, string label, Color bg, Color fg, int fontSize, UnityAction onClick)
        {
            var img = Panel(name, parent, bg);
            img.sprite = ButtonSprite;
            img.type = Image.Type.Sliced;
            var btn = img.gameObject.AddComponent<Button>();
            btn.targetGraphic = img;
            SetButtonColor(btn, bg);

            var text = Label("Label", img.transform, label, fontSize, TextAnchor.MiddleCenter, fg, FontStyle.Bold);
            Stretch(text.rectTransform, 6, 2, 6, 2);

            if (onClick != null) btn.onClick.AddListener(onClick);
            return btn;
        }

        /// <summary>
        /// Cambia el color de un botón. Hay que tocar el ColorBlock y no el Image
        /// directamente, porque la transición de color del Selectable lo sobrescribe.
        /// </summary>
        public static void SetButtonColor(Button btn, Color bg)
        {
            if (btn == null) return;
            var colors = btn.colors;
            colors.normalColor = bg;
            colors.highlightedColor = Color.Lerp(bg, Color.white, 0.22f);
            colors.pressedColor = Color.Lerp(bg, Color.black, 0.25f);
            colors.selectedColor = bg;
            colors.disabledColor = new Color(bg.r * 0.45f, bg.g * 0.45f, bg.b * 0.45f, bg.a * 0.6f);
            colors.colorMultiplier = 1f;
            colors.fadeDuration = 0.06f;
            btn.colors = colors;
            if (btn.targetGraphic != null) btn.targetGraphic.color = bg;
        }

        public static Text ButtonLabel(Button b)
        {
            return b != null ? b.GetComponentInChildren<Text>() : null;
        }

        /// <summary>Barra de progreso simple (fondo + relleno con Image.Filled).</summary>
        public static Image Bar(string name, Transform parent, Color background, Color fill, out Image fillImage)
        {
            var bg = Panel(name, parent, background);
            var f = Panel("Fill", bg.transform, fill, false);
            Stretch(f.rectTransform, 3, 3, 3, 3);
            f.type = Image.Type.Filled;
            f.fillMethod = Image.FillMethod.Horizontal;
            f.fillOrigin = 0;
            f.fillAmount = 1f;
            fillImage = f;
            return bg;
        }

        /// <summary>Crea un ScrollRect vertical y devuelve el contenedor de contenido.</summary>
        public static RectTransform ScrollView(string name, Transform parent, out ScrollRect scrollRect, bool grid, Vector2 cellSize = default, int padding = 8, int spacing = 8)
        {
            var root = Panel(name, parent, new Color(0f, 0f, 0f, 0.25f));
            scrollRect = root.gameObject.AddComponent<ScrollRect>();
            scrollRect.horizontal = false;
            scrollRect.vertical = true;
            scrollRect.movementType = ScrollRect.MovementType.Clamped;
            scrollRect.scrollSensitivity = 28f;

            var viewport = Panel("Viewport", root.transform, new Color(1f, 1f, 1f, 0.004f));
            Stretch(viewport.rectTransform, 2, 2, 2, 2);
            var mask = viewport.gameObject.AddComponent<Mask>();
            mask.showMaskGraphic = false;

            var content = NewRect("Content", viewport.transform);
            content.anchorMin = new Vector2(0f, 1f);
            content.anchorMax = new Vector2(1f, 1f);
            content.pivot = new Vector2(0.5f, 1f);
            content.anchoredPosition = Vector2.zero;
            content.sizeDelta = new Vector2(0f, 0f);

            if (grid)
            {
                var g = content.gameObject.AddComponent<GridLayoutGroup>();
                g.cellSize = cellSize == default ? new Vector2(88, 88) : cellSize;
                g.spacing = new Vector2(spacing, spacing);
                g.padding = new RectOffset(padding, padding, padding, padding);
                g.childAlignment = TextAnchor.UpperLeft;
                g.constraint = GridLayoutGroup.Constraint.Flexible;
            }
            else
            {
                var v = content.gameObject.AddComponent<VerticalLayoutGroup>();
                v.spacing = spacing;
                v.padding = new RectOffset(padding, padding, padding, padding);
                v.childForceExpandHeight = false;
                v.childForceExpandWidth = true;
                v.childControlHeight = true;
                v.childControlWidth = true;
                v.childAlignment = TextAnchor.UpperCenter;
            }

            var fitter = content.gameObject.AddComponent<ContentSizeFitter>();
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;
            fitter.horizontalFit = ContentSizeFitter.FitMode.Unconstrained;

            scrollRect.viewport = viewport.rectTransform;
            scrollRect.content = content;
            return content;
        }

        public static void ClearChildren(Transform parent)
        {
            for (int i = parent.childCount - 1; i >= 0; i--)
            {
                var child = parent.GetChild(i);
                // Se desvincula antes de destruir para que el layout no cuente
                // los hijos que desaparecen al final del frame.
                child.SetParent(null, false);
                Object.Destroy(child.gameObject);
            }
        }

        public static string Money(int amount) => $"{amount:n0} $";
    }
}
