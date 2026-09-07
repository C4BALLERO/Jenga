using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace Jenga.UI
{
    /// <summary>Pila de avisos que aparecen arriba a la izquierda y se desvanecen solos.</summary>
    public class NotificationFeed : MonoBehaviour
    {
        class Entry
        {
            public CanvasGroup group;
            public float life;
        }

        readonly List<Entry> _entries = new List<Entry>();
        VerticalLayoutGroup _layout;
        const float Life = 3.2f;
        const int MaxEntries = 6;

        public static NotificationFeed Create(Transform parent)
        {
            var rt = UIFactory.NewRect("Notifications", parent);
            UIFactory.Anchor(rt, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f),
                new Vector2(24f, -110f), new Vector2(420f, 300f));

            var feed = rt.gameObject.AddComponent<NotificationFeed>();
            var layout = rt.gameObject.AddComponent<VerticalLayoutGroup>();
            layout.spacing = 6f;
            layout.childForceExpandHeight = false;
            layout.childForceExpandWidth = true;
            layout.childControlHeight = true;
            layout.childControlWidth = true;
            layout.childAlignment = TextAnchor.UpperLeft;
            feed._layout = layout;
            return feed;
        }

        public void Push(string message, Sprite icon, Color color)
        {
            var row = UIFactory.Panel("Note", transform, new Color(0.05f, 0.06f, 0.09f, 0.82f));
            var le = row.gameObject.AddComponent<LayoutElement>();
            le.preferredHeight = 40f;
            le.minHeight = 40f;

            var group = row.gameObject.AddComponent<CanvasGroup>();
            group.blocksRaycasts = false;
            group.interactable = false;

            var img = UIFactory.Icon("Icon", row.transform, icon, Color.white);
            UIFactory.Anchor(img.rectTransform, new Vector2(0f, 0.5f), new Vector2(0f, 0.5f), new Vector2(0f, 0.5f),
                new Vector2(8f, 0f), new Vector2(28f, 28f));

            var text = UIFactory.Label("Text", row.transform, message, 18, TextAnchor.MiddleLeft, color, FontStyle.Bold);
            UIFactory.Stretch(text.rectTransform, icon != null ? 44 : 12, 0, 10, 0);

            _entries.Add(new Entry { group = group, life = Life });

            while (_entries.Count > MaxEntries)
            {
                var oldest = _entries[0];
                _entries.RemoveAt(0);
                if (oldest.group != null) Destroy(oldest.group.gameObject);
            }
        }

        void Update()
        {
            for (int i = _entries.Count - 1; i >= 0; i--)
            {
                var e = _entries[i];
                if (e.group == null) { _entries.RemoveAt(i); continue; }
                e.life -= Time.unscaledDeltaTime;
                e.group.alpha = Mathf.Clamp01(e.life / 0.8f);
                if (e.life <= 0f)
                {
                    Destroy(e.group.gameObject);
                    _entries.RemoveAt(i);
                }
            }
        }
    }
}
