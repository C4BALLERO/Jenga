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

    [Header("Extraccion")]
    [SerializeField] private float extractionDistance = 0.055f;
    [SerializeField] private float maxDragDistance = 0.09f;

    private BlockController selectedBlock;
    private Rigidbody selectedRigidbody;

    private bool isDragging = false;

    private Plane dragPlane;

    private Vector3 dragAxis;

    private Vector3 dragStartPosition;
    private Vector3 pointerStartPoint;

    private Vector3 desiredPosition;

    public BlockController ExtractedBlock
    {
        get
        {
            if (selectedBlock != null &&
                selectedBlock.IsExtracted)
            {
                return selectedBlock;
            }

            return null;
        }
    }

    public bool HasExtractedBlock => ExtractedBlock != null;

    private void Awake()
    {
        if (arCamera == null)
        {
            arCamera = GetComponent<Camera>();
        }
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
            HandleTrackingUnavailable();
            return;
        }

        HandleTouchInput();

#if UNITY_EDITOR
                HandleMouseInput();
#endif
    }

    private void FixedUpdate()
    {
        if (!isDragging)
            return;

        if (selectedRigidbody == null)
            return;

        selectedRigidbody.MovePosition(
            desiredPosition
        );
    }

    private void HandleTouchInput()
    {
        var touches = Touch.activeTouches;

        if (touches.Count == 0)
            return;

        Touch touch = touches[0];

        switch (touch.phase)
        {
            case TouchPhase.Began:
                HandlePointerBegan(touch.screenPosition);
                break;
            case TouchPhase.Moved:
                HandlePointerMoved(touch.screenPosition);
                break;
            case TouchPhase.Stationary:
                HandlePointerMoved(touch.screenPosition);
                break;
            case TouchPhase.Ended:
                HandlePointerEnded();
                break;
            case TouchPhase.Canceled:
                CancelDragAndRestore();
                break;
        }
    }

    private void HandleMouseInput()
    {
        if (Mouse.current == null)
            return;

        Vector2 position =
            Mouse.current.position.ReadValue();

        if (Mouse.current.leftButton
            .wasPressedThisFrame)
        {
            HandlePointerBegan(position);
        }

        if (Mouse.current.leftButton.isPressed)
        {
            HandlePointerMoved(position);
        }

        if (Mouse.current.leftButton
            .wasReleasedThisFrame)
        {
            HandlePointerEnded();
        }
    }

    private void HandlePointerBegan(
        Vector2 screenPosition)
    {
        if (isDragging)
            return;

        if (HasExtractedBlock)
        {
            Debug.Log("Primero debes colocar el " + "bloque retirado sobre la torre.");

            return;
        }

        Ray ray = arCamera.ScreenPointToRay(screenPosition);

        bool hitSomething =
            Physics.Raycast(
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
            Debug.Log($"Movimiento invalido: " + $"{block.name} no puede retirarse.");

            ClearSelection();
            return;
        }

        SelectBlock(block);

        BeginDrag(screenPosition);
    }

    private void BeginDrag(
        Vector2 screenPosition)
    {
        if (selectedBlock == null)
            return;

        selectedRigidbody = selectedBlock.Rigidbody;

        if (selectedRigidbody == null)
        {
            ClearSelection();
            return;
        }

        dragStartPosition = selectedRigidbody.position;

        desiredPosition = dragStartPosition;

        dragAxis = selectedBlock.transform.right;

        dragAxis.y = 0f;

        if (dragAxis.sqrMagnitude < 0.001f)
        {
            ClearSelection();
            return;
        }

        dragAxis.Normalize();

        dragPlane = new Plane(Vector3.up, dragStartPosition);

        if (!TryGetPointOnDragPlane(screenPosition, out pointerStartPoint))
        {
            ClearSelection();
            return;
        }

        if (!selectedRigidbody.isKinematic)
        {
            selectedRigidbody.linearVelocity = Vector3.zero;

            selectedRigidbody.angularVelocity = Vector3.zero;
        }

        selectedRigidbody.useGravity = false;

        selectedRigidbody.isKinematic = true;

        selectedRigidbody.constraints = RigidbodyConstraints.FreezeRotation;

        selectedRigidbody.collisionDetectionMode = CollisionDetectionMode.ContinuousSpeculative;

        isDragging = true;

        Debug.Log($"Extrayendo: {selectedBlock.name}");
    }

    private void HandlePointerMoved(
        Vector2 screenPosition)
    {
        if (!isDragging)
            return;

        if (selectedRigidbody == null)
            return;

        if (!TryGetPointOnDragPlane(screenPosition, out Vector3 currentPoint))
        {
            return;
        }

        Vector3 pointerMovement = currentPoint - pointerStartPoint;

        float distance =
            Vector3.Dot(
                pointerMovement,
                dragAxis
            );

        distance = Mathf.Clamp(
            distance,
            -maxDragDistance,
            maxDragDistance
        );

        desiredPosition =
            dragStartPosition +
            dragAxis * distance;
    }

    private void HandlePointerEnded()
    {
        if (!isDragging)
            return;

        isDragging = false;

        if (selectedBlock == null ||
            selectedRigidbody == null)
        {
            return;
        }

        selectedRigidbody.position =
            desiredPosition;

        float distance =
            GetDraggedDistance();

        Debug.Log(
            $"Extraccion: {distance:F3} m"
        );

        if (distance >= extractionDistance)
        {
            CompleteExtraction();
        }
        else
        {
            CancelDragAndRestore();
        }
    }

    private float GetDraggedDistance()
    {
        if (selectedRigidbody == null)
            return 0f;

        Vector3 movement =
            selectedRigidbody.position -
            dragStartPosition;

        return Mathf.Abs(
            Vector3.Dot(
                movement,
                dragAxis
            )
        );
    }

    private bool TryGetPointOnDragPlane(
        Vector2 screenPosition,
        out Vector3 point)
    {
        Ray ray =
            arCamera.ScreenPointToRay(
                screenPosition
            );

        if (dragPlane.Raycast(
            ray,
            out float distance))
        {
            point = ray.GetPoint(distance);

            return true;
        }

        point = Vector3.zero;

        return false;
    }


    private void CompleteExtraction()
    {
        selectedBlock.SetExtracted(true);

        selectedRigidbody.position =
            desiredPosition;

        selectedRigidbody.linearVelocity =
            Vector3.zero;

        selectedRigidbody.angularVelocity =
            Vector3.zero;

        selectedRigidbody.useGravity = false;

        selectedRigidbody.isKinematic = true;

        selectedRigidbody.constraints =
            RigidbodyConstraints.FreezeRotation;

        selectedRigidbody.collisionDetectionMode =
            CollisionDetectionMode.Discrete;

        selectedBlock.SetSelected(true);

        Debug.Log(
            $"Bloque retirado correctamente: " +
            $"{selectedBlock.name}"
        );

        Debug.Log(
            "Ahora debe colocarse " +
            "sobre la torre."
        );
    }

    private void CancelDragAndRestore()
    {
        if (selectedBlock == null ||
            selectedRigidbody == null)
        {
            isDragging = false;
            ClearSelection();

            return;
        }

        isDragging = false;

        selectedRigidbody.position =
            dragStartPosition;

        selectedRigidbody.collisionDetectionMode =
            CollisionDetectionMode.Discrete;

        selectedRigidbody.isKinematic = false;

        selectedRigidbody.useGravity = true;

        selectedRigidbody.constraints =
            RigidbodyConstraints.FreezeRotation;

        selectedRigidbody.linearVelocity =
            Vector3.zero;

        selectedRigidbody.angularVelocity =
            Vector3.zero;

        selectedRigidbody.WakeUp();

        selectedBlock.SetSelected(false);

        Debug.Log(
            "Extraccion invalida. " +
            "El bloque vuelve a su posicion."
        );

        selectedBlock = null;
        selectedRigidbody = null;
    }

    private void SelectBlock(
        BlockController block)
    {
        if (selectedBlock == block)
            return;

        ClearSelection();

        selectedBlock = block;

        selectedBlock.SetSelected(true);

        Debug.Log(
            $"Seleccionado: " +
            $"{selectedBlock.name} | " +
            $"Nivel {selectedBlock.Level}"
        );
    }


    private void ClearSelection()
    {
        if (selectedBlock == null)
            return;

        if (selectedBlock.IsExtracted)
            return;

        selectedBlock.SetSelected(false);

        selectedBlock = null;
        selectedRigidbody = null;
    }

    private void HandleTrackingUnavailable()
    {
        if (isDragging)
        {
            CancelDragAndRestore();
            return;
        }

        if (selectedBlock != null &&
            !selectedBlock.IsExtracted)
        {
            ClearSelection();
        }
    }
}