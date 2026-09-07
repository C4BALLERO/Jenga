using UnityEngine;

namespace Jenga.Core
{
    /// <summary>Cualquier cosa que pueda recibir daño de un arma.</summary>
    public interface IDamageable
    {
        bool IsAlive { get; }
        void TakeDamage(float amount, Vector3 hitPoint, Vector3 hitNormal, GameObject source);
    }
}
