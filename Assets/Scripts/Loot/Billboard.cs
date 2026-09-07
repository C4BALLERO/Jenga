using UnityEngine;

namespace Jenga.Loot
{
    /// <summary>Hace que un sprite 2D mire siempre a la cámara dentro del mundo 3D.</summary>
    public class Billboard : MonoBehaviour
    {
        Camera _camera;

        void LateUpdate()
        {
            if (_camera == null)
            {
                _camera = Camera.main;
                if (_camera == null) return;
            }
            transform.rotation = Quaternion.LookRotation(transform.position - _camera.transform.position, Vector3.up);
        }
    }
}
