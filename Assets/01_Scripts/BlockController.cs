using UnityEngine;

public class BlockController : MonoBehaviour
{
    [Header("Datos del bloque")]
    [SerializeField] private int level = 1;

    [Header("Visual")]
    [SerializeField] private Renderer blockRenderer;
    [SerializeField] private Material selectedMaterial;

    [Header("Fisica")]
    [SerializeField] private PhysicsMaterial draggingPhysicsMaterial;

    private Collider blockCollider;
    private PhysicsMaterial normalPhysicsMaterial;

    private Material normalMaterial;
    private Rigidbody blockRigidbody;

    public int Level => level;

    public bool IsSelected { get; private set; }

    public bool IsExtracted { get; private set; }

    public Rigidbody Rigidbody => blockRigidbody;

    private void Awake()
    {
        if (blockRenderer == null) blockRenderer = GetComponent<Renderer>();

        blockRigidbody = GetComponent<Rigidbody>();

        blockCollider = GetComponent<Collider>();

        if (blockRenderer != null) normalMaterial = blockRenderer.sharedMaterial;

        if (blockCollider != null) normalPhysicsMaterial = blockCollider.sharedMaterial;
    }

    public void SetSelected(bool selected)
    {
        IsSelected = selected;

        if (blockRenderer == null) return;

        if (selected && selectedMaterial != null) blockRenderer.sharedMaterial = selectedMaterial;
        else blockRenderer.sharedMaterial = normalMaterial;
    }

    public void SetLevel(int newLevel) => level = Mathf.Max(1, newLevel);

    public void SetExtracted(bool extracted) => IsExtracted = extracted;

    public void BeginDraggingPhysics()
    {
        if (blockCollider == null) return;

        if (draggingPhysicsMaterial == null) return;

        blockCollider.sharedMaterial = draggingPhysicsMaterial;
    }

    public void EndDraggingPhysics()
    {
        if (blockCollider == null) return;

        blockCollider.sharedMaterial = normalPhysicsMaterial;
    }
}