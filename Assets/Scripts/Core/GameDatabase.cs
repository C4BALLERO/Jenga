using System.Collections.Generic;
using UnityEngine;
using Jenga.Items;
using Jenga.Enemies;
using Jenga.Waves;

namespace Jenga.Core
{
    /// <summary>
    /// Registro central de contenido. Vive en Assets/Resources para que cualquier
    /// sistema pueda encontrarlo en tiempo de ejecución sin depender del cableado
    /// de la escena.
    /// </summary>
    [CreateAssetMenu(fileName = "GameDatabase", menuName = "Jenga/Game Database", order = 100)]
    public class GameDatabase : ScriptableObject
    {
        public const string ResourcePath = "GameDatabase";

        [Header("Contenido")]
        public List<ItemData> items = new List<ItemData>();
        public List<WeaponData> weapons = new List<WeaponData>();
        public List<EnemyData> enemies = new List<EnemyData>();

        [Header("Configuración")]
        public WaveConfig waveConfig;
        public WeaponData starterWeapon;

        [Header("Prefabs comunes")]
        public GameObject lootPickupPrefab;
        public GameObject moneyPickupPrefab;

        [Header("Materiales generados")]
        public Material tracerMaterial;
        public Material impactMaterial;

        static GameDatabase _instance;

        public static GameDatabase Instance
        {
            get
            {
                if (_instance == null)
                    _instance = Resources.Load<GameDatabase>(ResourcePath);
                return _instance;
            }
        }

        public static void SetInstance(GameDatabase db)
        {
            if (db != null) _instance = db;
        }

        public ItemData FindItem(string id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            foreach (var i in items) if (i != null && i.itemId == id) return i;
            foreach (var w in weapons) if (w != null && w.itemId == id) return w;
            return null;
        }

        /// <summary>Todos los objetos, armas incluidas, sin duplicados.</summary>
        public List<ItemData> AllItems()
        {
            var all = new List<ItemData>();
            foreach (var i in items) if (i != null && !all.Contains(i)) all.Add(i);
            foreach (var w in weapons) if (w != null && !all.Contains(w)) all.Add(w);
            return all;
        }
    }
}
