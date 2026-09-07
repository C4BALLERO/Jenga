using UnityEngine;
using Jenga.Core;

namespace Jenga.Player
{
    /// <summary>Movimiento y cámara en primera persona con el nuevo Input System.</summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Movimiento")]
        [SerializeField] float walkSpeed = 5.5f;
        [SerializeField] float sprintMultiplier = 1.6f;
        [SerializeField] float jumpHeight = 1.3f;
        [SerializeField] float gravity = -22f;
        [SerializeField] float acceleration = 14f;

        [Header("Cámara")]
        [SerializeField] Transform cameraPivot;
        [SerializeField] float mouseSensitivity = 0.12f;
        [SerializeField] float minPitch = -85f;
        [SerializeField] float maxPitch = 85f;

        CharacterController _cc;
        Vector3 _velocity;
        Vector3 _planarVelocity;
        float _pitch;
        bool _controlsEnabled = true;

        public Transform CameraPivot => cameraPivot;
        public bool ControlsEnabled => _controlsEnabled && !(GameManager.Instance != null && GameManager.Instance.IsUiOpen);

        void Awake()
        {
            _cc = GetComponent<CharacterController>();
            if (cameraPivot == null)
            {
                var cam = GetComponentInChildren<Camera>();
                if (cam != null) cameraPivot = cam.transform;
            }
        }

        void Start()
        {
            LockCursor(true);
        }

        void Update()
        {
            if (!ControlsEnabled) return;
            Look();
            Move();
        }

        void Look()
        {
            Vector2 delta = InputHelper.LookDelta * mouseSensitivity;
            if (delta.sqrMagnitude <= 0f) return;

            transform.Rotate(Vector3.up, delta.x, Space.Self);
            _pitch = Mathf.Clamp(_pitch - delta.y, minPitch, maxPitch);
            if (cameraPivot != null)
                cameraPivot.localRotation = Quaternion.Euler(_pitch, 0f, 0f);
        }

        void Move()
        {
            Vector2 axis = InputHelper.MoveAxis;
            float speed = walkSpeed * (InputHelper.Sprint ? sprintMultiplier : 1f);
            Vector3 wish = (transform.right * axis.x + transform.forward * axis.y) * speed;

            _planarVelocity = Vector3.Lerp(_planarVelocity, wish, acceleration * Time.deltaTime);

            if (_cc.isGrounded)
            {
                if (_velocity.y < 0f) _velocity.y = -2f;
                if (InputHelper.JumpPressed)
                    _velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);
            }
            _velocity.y += gravity * Time.deltaTime;

            Vector3 motion = _planarVelocity + Vector3.up * _velocity.y;
            _cc.Move(motion * Time.deltaTime);
        }

        public void SetControlsEnabled(bool enabled)
        {
            _controlsEnabled = enabled;
        }

        public static void LockCursor(bool locked)
        {
            Cursor.lockState = locked ? CursorLockMode.Locked : CursorLockMode.None;
            Cursor.visible = !locked;
        }
    }
}
