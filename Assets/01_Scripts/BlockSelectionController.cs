using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.EnhancedTouch;

using Touch = UnityEngine.InputSystem.EnhancedTouch.Touch;

using TouchPhase = UnityEngine.InputSystem.TouchPhase;

public class BlockSelectionController : MonoBehaviour
{
    [Header("Referencias")]
    [SerializeField] private Camera arCamera;
    [SerializeField] private ARPhysicsController arPhysicsController;
    [SerializeField] private TowerManager towerManager;

    [Header("Raycast")]
    [SerializeField] private LayerMask blockLayerMask;
    [SerializeField] private float maxRayDistance = 5f;

    private BlockController selectedBlock;

    private void Awake()
    {
        if (arCamera == null) arCamera = GetComponent<Camera>();
    }

    private void OnEnable()
    {
        EnhancedTouchSupport.Enable();
    }

    private void OnDisable()
    {
        EnhancedTouchSupport.Disable();
    }

    private void Update()
    {
        if (arPhysicsController == null || !arPhysicsController.IsTrackingStable)
        {
            ClearSelection();
            return;
        }

        HandleTouchInput();

#if UNITY_EDITOR
                HandleMouseInput();
#endif
    }

    private void HandleTouchInput()
    {
        var touches = Touch.activeTouches;

        if (touches.Count == 0) return;

        Touch touch = touches[0];

        if (touch.phase == TouchPhase.Began) TrySelectBlock(touch.screenPosition);
    }

    private void HandleMouseInput()
    {
        if (Mouse.current == null) return;

        if (Mouse.current.leftButton.wasPressedThisFrame)
        {
            Vector2 mousePosition = Mouse.current.position.ReadValue();

            TrySelectBlock(mousePosition);
        }
    }

    private void TrySelectBlock(Vector2 screenPosition)
    {
        if (arCamera == null) return;

        Ray ray = arCamera.ScreenPointToRay(screenPosition);

        bool hitSomething = Physics.Raycast(
            ray,
            out RaycastHit hit,
            maxRayDistance,
            blockLayerMask,
            QueryTriggerInteraction.Ignore
        );

        if (!hitSomething)
        {
            ClearSelection();
            return;
        }

        BlockController block = hit.collider.GetComponentInParent<BlockController>();

        if (block == null)
        {
            ClearSelection();
            return;
        }

        if (!towerManager.CanSelectBlock(block))
        {
            Debug.Log($"Movimiento invalido: " + $"{block.name} pertenece al nivel superior.");

            ClearSelection();
            return;
        }

        SelectBlock(block);
    }

    private void SelectBlock(BlockController block)
    {
        if (selectedBlock == block) return;

        ClearSelection();

        selectedBlock = block;
        selectedBlock.SetSelected(true);

        Debug.Log($"Bloque seleccionado: {selectedBlock.name} " + $"| Nivel: {selectedBlock.Level}");
    }

    private void ClearSelection()
    {
        if (selectedBlock == null) return;

        selectedBlock.SetSelected(false);
        selectedBlock = null;
    }
}