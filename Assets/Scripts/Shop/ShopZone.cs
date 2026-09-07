using UnityEngine;

namespace Jenga.Shop
{
    /// <summary>Zona del kiosco. Marca si el jugador está lo bastante cerca para comerciar.</summary>
    public class ShopZone : MonoBehaviour
    {
        public static ShopZone Active { get; private set; }

        [SerializeField] float radius = 4.5f;
        [SerializeField] Transform visual;

        Transform _player;

        public bool PlayerInRange { get; private set; }
        public float Radius => radius;

        void Awake()
        {
            Active = this;
        }

        void OnDestroy()
        {
            if (Active == this) Active = null;
        }

        void Update()
        {
            if (_player == null)
            {
                var pc = FindFirstObjectByType<Jenga.Player.PlayerController>();
                if (pc != null) _player = pc.transform;
                if (_player == null) return;
            }

            PlayerInRange = Vector3.Distance(_player.position, transform.position) <= radius;

            if (visual != null)
                visual.Rotate(Vector3.up, 25f * Time.deltaTime, Space.World);
        }

        void OnDrawGizmosSelected()
        {
            Gizmos.color = new Color(0.3f, 0.9f, 1f, 0.4f);
            Gizmos.DrawWireSphere(transform.position, radius);
        }
    }
}
