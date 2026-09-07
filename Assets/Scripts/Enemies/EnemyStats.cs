using UnityEngine;

namespace Jenga.Enemies
{
    /// <summary>Estadísticas ya escaladas por la oleada con las que arranca un enemigo concreto.</summary>
    public struct EnemyStats
    {
        public float maxHealth;
        public float moveSpeed;
        public float damage;
        public float attackInterval;
        public float attackRange;
        public float scaleMultiplier;
        public float lootMultiplier;
        public int wave;
        public bool isElite;
        public Color colorTint;

        public static EnemyStats FromBase(EnemyData data)
        {
            return new EnemyStats
            {
                maxHealth = data.maxHealth,
                moveSpeed = data.moveSpeed,
                damage = data.damage,
                attackInterval = data.attackInterval,
                attackRange = data.attackRange,
                scaleMultiplier = 1f,
                lootMultiplier = 1f,
                wave = 1,
                isElite = false,
                colorTint = data.bodyColor
            };
        }
    }
}
