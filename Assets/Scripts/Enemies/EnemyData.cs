using UnityEngine;
using Jenga.Loot;

namespace Jenga.Enemies
{
    /// <summary>
    /// Estadísticas base de un tipo de enemigo. Las oleadas no modifican este asset:
    /// leen estos valores y los multiplican para generar el bloque de estadísticas
    /// final de cada enemigo instanciado.
    /// </summary>
    [CreateAssetMenu(fileName = "EnemyData", menuName = "Jenga/Enemy Data", order = 10)]
    public class EnemyData : ScriptableObject
    {
        [Header("Identidad")]
        public string enemyId = "enemy.new";
        public string displayName = "Enemigo";
        [Tooltip("Prefab con el modelo 3D y el componente Enemy.")]
        public GameObject prefab;

        [Header("Estadísticas base (oleada 1)")]
        [Min(1f)] public float maxHealth = 60f;
        [Min(0.1f)] public float moveSpeed = 3.2f;
        [Min(0f)] public float damage = 10f;
        [Tooltip("Segundos entre ataques.")]
        [Min(0.1f)] public float attackInterval = 1.2f;
        [Min(0.5f)] public float attackRange = 2.2f;
        [Min(1f)] public float detectionRange = 80f;

        [Header("Presentación")]
        public Color bodyColor = new Color(0.75f, 0.2f, 0.2f);
        [Min(0.2f)] public float bodyScale = 1f;

        [Header("Recompensa")]
        public LootTable lootTable;
        [Min(0)] public int scoreValue = 10;

        [Header("Aparición")]
        [Tooltip("Primera oleada en la que este enemigo puede aparecer.")]
        [Min(1)] public int firstWave = 1;
        [Tooltip("Peso relativo al elegir qué enemigo generar.")]
        [Min(0.01f)] public float spawnWeight = 1f;
    }
}
