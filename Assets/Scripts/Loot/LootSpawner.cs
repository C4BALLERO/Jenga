using UnityEngine;
using Jenga.Core;
using Jenga.Items;

namespace Jenga.Loot
{
    /// <summary>Crea los objetos de botín en el mundo usando los prefabs de la base de datos.</summary>
    public static class LootSpawner
    {
        static Sprite _coinSprite;

        public static void SpawnMoney(Vector3 position, int money)
        {
            if (money <= 0) return;
            var db = GameDatabase.Instance;
            var prefab = db != null ? (db.moneyPickupPrefab != null ? db.moneyPickupPrefab : db.lootPickupPrefab) : null;
            var go = Create(prefab, position);
            if (go == null) return;
            var drop = go.GetComponent<LootDrop>();
            if (drop == null) drop = go.AddComponent<LootDrop>();
            drop.SetupMoney(money, CoinSprite());
        }

        public static void SpawnItem(Vector3 position, ItemData item, int amount)
        {
            if (item == null || amount <= 0) return;
            var db = GameDatabase.Instance;
            var prefab = db != null ? db.lootPickupPrefab : null;
            var go = Create(prefab, position);
            if (go == null) return;
            var drop = go.GetComponent<LootDrop>();
            if (drop == null) drop = go.AddComponent<LootDrop>();
            drop.SetupItem(item, amount);
        }

        static GameObject Create(GameObject prefab, Vector3 position)
        {
            Vector2 jitter = Random.insideUnitCircle * 0.8f;
            Vector3 pos = position + new Vector3(jitter.x, 0f, jitter.y);
            if (prefab != null) return Object.Instantiate(prefab, pos, Quaternion.identity);

            // Respaldo si la base de datos no está disponible.
            var go = new GameObject("Loot");
            go.transform.position = pos;
            var spin = new GameObject("Spin").transform;
            spin.SetParent(go.transform, false);
            var sr = spin.gameObject.AddComponent<SpriteRenderer>();
            sr.drawMode = SpriteDrawMode.Simple;
            go.AddComponent<LootDrop>();
            return go;
        }

        static Sprite CoinSprite()
        {
            if (_coinSprite != null) return _coinSprite;
            var db = GameDatabase.Instance;
            if (db != null)
            {
                foreach (var i in db.items)
                    if (i != null && i.itemId == "item.coin") { _coinSprite = i.icon; break; }
            }
            return _coinSprite;
        }
    }
}
