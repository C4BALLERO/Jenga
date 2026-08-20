using UnityEngine;

public class BlockController : MonoBehaviour
{
    [Header("Datos del bloque")]
    [SerializeField] private int level = 1;

    [Header("Visual")]
    [SerializeField] private Renderer blockRenderer;
    [SerializeField] private Material selectedMaterial;

    private Material normalMaterial;

    public int Level => level;

    public bool IsSelected { get; private set; }

    private void Awake()
    {
        if (blockRenderer == null) blockRenderer = GetComponent<Renderer>();

        if (blockRenderer != null) normalMaterial = blockRenderer.sharedMaterial;
    }

    public void SetSelected(bool selected)
    {
        IsSelected = selected;

        if (blockRenderer == null) return;

        if (selected && selectedMaterial != null) blockRenderer.sharedMaterial = selectedMaterial;
        else blockRenderer.sharedMaterial = normalMaterial;
    }

    public void SetLevel(int newLevel)
    {
        level = Mathf.Max(1, newLevel);
    }
}