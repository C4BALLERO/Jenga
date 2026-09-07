using UnityEngine;
using Jenga.Core;
using Jenga.Inventory;
using Jenga.Items;

namespace Jenga.Loot
{
    /// <summary>
    /// Botín en el suelo. Puede ser dinero o un objeto con cantidad.
    /// Se recoge al acercarse el jugador.
    /// </summary>
    public class LootDrop : MonoBehaviour
    {
        [SerializeField] SpriteRenderer iconRenderer;
        [SerializeField] Transform spinRoot;
        [SerializeField] float lifeTime = 60f;
        [SerializeField] float pickupRadius = 1.8f;
        [SerializeField] float magnetRadius = 4.5f;

        ItemData _item;
        int _amount = 1;
        int _money;
        Transform _player;
        float _spawnTime;
        bool _collected;

        void Awake()
        {
            if (spinRoot == null) spinRoot = transform;
            if (iconRenderer == null) iconRenderer = GetComponentInChildren<SpriteRenderer>();
            _spawnTime = Time.time;
        }

        public void SetupMoney(int money, Sprite icon)
        {
            _money = Mathf.Max(1, money);
            _item = null;
            if (iconRenderer != null)
            {
                if (icon != null) iconRenderer.sprite = icon;
                iconRenderer.color = new Color(1f, 0.85f, 0.25f);
            }
            gameObject.name = $"Loot_Money_{_money}";
        }

        public void SetupItem(ItemData item, int amount)
        {
            _item = item;
            _amount = Mathf.Max(1, amount);
            _money = 0;
            if (iconRenderer != null && item != null)
            {
                iconRenderer.sprite = item.icon;
                iconRenderer.color = item.tint;
            }
            if (item != null && item.worldModel != null)
            {
                var model = Instantiate(item.worldModel, spinRoot);
                model.transform.localPosition = Vector3.zero;
                model.transform.localScale = Vector3.one * 0.6f;
                if (iconRenderer != null) iconRenderer.enabled = false;
            }
            gameObject.name = $"Loot_{(item != null ? item.itemId : "null")}";
        }

        void Update()
        {
            float t = Time.time;
            if (spinRoot != null)
            {
                spinRoot.Rotate(Vector3.up, 90f * Time.deltaTime, Space.World);
                var p = spinRoot.localPosition;
                p.y = 0.35f + Mathf.Sin(t * 2.5f) * 0.12f;
                spinRoot.localPosition = p;
            }

            if (_player == null)
            {
                var pc = FindFirstObjectByType<Jenga.Player.PlayerController>();
                if (pc != null) _player = pc.transform;
                if (_player == null) return;
            }

            float dist = Vector3.Distance(transform.position, _player.position);
            if (dist < magnetRadius)
            {
                Vector3 target = _player.position;
                transform.position = Vector3.MoveTowards(transform.position, target, (magnetRadius - dist + 1.5f) * 2f * Time.deltaTime);
            }
            if (dist <= pickupRadius) Collect();

            if (lifeTime > 0f && t - _spawnTime > lifeTime) Destroy(gameObject);
        }

        void Collect()
        {
            if (_collected || _player == null) return;

            if (_money > 0)
            {
                var wallet = _player.GetComponent<Wallet>();
                if (wallet == null) return;
                wallet.Add(_money);
                Notifications.Post($"+{_money} $", iconRenderer != null ? iconRenderer.sprite : null, new Color(1f, 0.85f, 0.3f));
            }
            else if (_item != null)
            {
                var inv = _player.GetComponent<PlayerInventory>();
                if (inv == null) return;
                int left = inv.Add(_item, _amount);
                if (left >= _amount)
                {
                    // Inventario lleno: el botín se queda en el suelo.
                    return;
                }
                int taken = _amount - left;
                Notifications.Post($"+{taken} {_item.displayName}", _item.icon, Color.white);
                if (left > 0)
                {
                    _amount = left;
                    return;
                }
            }
            else return;

            _collected = true;
            Destroy(gameObject);
        }
    }
}
