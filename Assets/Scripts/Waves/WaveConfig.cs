using System.Collections.Generic;
using UnityEngine;
using Jenga.Enemies;

namespace Jenga.Waves
{
    /// <summary>
    /// Reglas de progresión de las oleadas. Aquí se define cómo se manipulan las
    /// estadísticas base de cada <see cref="EnemyData"/> según el número de oleada:
    /// el asset del enemigo nunca se modifica, sólo se escalan sus valores.
    /// </summary>
    [CreateAssetMenu(fileName = "WaveConfig", menuName = "Jenga/Wave Config", order = 11)]
    public class WaveConfig : ScriptableObject
    {
        [Header("Composición de la oleada")]
        [Min(1)] public int baseEnemyCount = 4;
        [Tooltip("Enemigos extra por cada oleada superada.")]
        [Min(0f)] public float enemiesAddedPerWave = 2f;
        [Min(1)] public int maxEnemiesAlive = 18;
        [Min(0.05f)] public float spawnInterval = 0.9f;
        [Tooltip("Segundos de preparación antes de cada oleada (tiempo para comprar).")]
        [Min(0f)] public float prepTime = 20f;
        public bool autoStartWaves = true;

        [Header("Escalado por oleada (multiplicador compuesto)")]
        [Min(1f)] public float healthGrowth = 1.18f;
        [Min(1f)] public float damageGrowth = 1.12f;
        [Tooltip("Velocidad extra sumada por oleada.")]
        [Min(0f)] public float speedAddedPerWave = 0.12f;
        [Min(0.5f)] public float maxSpeedMultiplier = 2.2f;
        [Min(1f)] public float lootGrowth = 1.10f;
        [Tooltip("Crecimiento del tamaño por oleada, sólo estético.")]
        [Min(0f)] public float scaleAddedPerWave = 0.015f;
        [Tooltip("Ataques más rápidos: el intervalo se multiplica por este valor cada oleada.")]
        [Range(0.8f, 1f)] public float attackIntervalDecay = 0.97f;

        [Header("Élites")]
        [Tooltip("Cada cuántas oleadas aparece un élite. 0 = nunca.")]
        [Min(0)] public int eliteEveryWaves = 5;
        [Min(1f)] public float eliteHealthMultiplier = 3.5f;
        [Min(1f)] public float eliteDamageMultiplier = 1.8f;
        [Min(1f)] public float eliteLootMultiplier = 3f;
        [Min(1f)] public float eliteScale = 1.5f;
        public Color eliteTint = new Color(0.55f, 0.15f, 0.8f);

        [Header("Enemigos disponibles")]
        public List<EnemyData> enemyPool = new List<EnemyData>();

        public int EnemiesInWave(int wave)
        {
            wave = Mathf.Max(1, wave);
            return Mathf.Max(1, Mathf.RoundToInt(baseEnemyCount + enemiesAddedPerWave * (wave - 1)));
        }

        /// <summary>Escoge un enemigo del pool disponible para esa oleada, por peso.</summary>
        public EnemyData PickEnemy(int wave)
        {
            float total = 0f;
            for (int i = 0; i < enemyPool.Count; i++)
            {
                var e = enemyPool[i];
                if (e == null || e.firstWave > wave) continue;
                total += Mathf.Max(0.01f, e.spawnWeight);
            }
            if (total <= 0f)
            {
                for (int i = 0; i < enemyPool.Count; i++)
                    if (enemyPool[i] != null) return enemyPool[i];
                return null;
            }

            float roll = Random.value * total;
            for (int i = 0; i < enemyPool.Count; i++)
            {
                var e = enemyPool[i];
                if (e == null || e.firstWave > wave) continue;
                roll -= Mathf.Max(0.01f, e.spawnWeight);
                if (roll <= 0f) return e;
            }
            return null;
        }

        /// <summary>Aplica el escalado de la oleada sobre las estadísticas base del enemigo.</summary>
        public EnemyStats BuildStats(EnemyData data, int wave, bool elite)
        {
            wave = Mathf.Max(1, wave);
            int steps = wave - 1;

            var stats = EnemyStats.FromBase(data);
            stats.wave = wave;
            stats.isElite = elite;
            stats.maxHealth = data.maxHealth * Mathf.Pow(healthGrowth, steps);
            stats.damage = data.damage * Mathf.Pow(damageGrowth, steps);
            stats.moveSpeed = Mathf.Min(data.moveSpeed + speedAddedPerWave * steps,
                                        data.moveSpeed * maxSpeedMultiplier);
            stats.attackInterval = Mathf.Max(0.25f, data.attackInterval * Mathf.Pow(attackIntervalDecay, steps));
            stats.attackRange = data.attackRange;
            stats.lootMultiplier = Mathf.Pow(lootGrowth, steps);
            stats.scaleMultiplier = 1f + scaleAddedPerWave * steps;
            stats.colorTint = Color.Lerp(data.bodyColor, new Color(1f, 0.35f, 0.1f), Mathf.Clamp01(steps * 0.05f));

            if (elite)
            {
                stats.maxHealth *= eliteHealthMultiplier;
                stats.damage *= eliteDamageMultiplier;
                stats.lootMultiplier *= eliteLootMultiplier;
                stats.scaleMultiplier *= eliteScale;
                stats.colorTint = eliteTint;
            }

            return stats;
        }

        public bool IsEliteWave(int wave) => eliteEveryWaves > 0 && wave % eliteEveryWaves == 0;
    }
}
