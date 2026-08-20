using System;
using UnityEngine;

public class TopPlacementManager : MonoBehaviour
{
    public event Action<BlockController> OnBlockPlaced;

    [Header("Referencias")]
    [SerializeField] private TowerManager towerManager;
    [SerializeField] private Transform towerRoot;

    [SerializeField]
    private Transform[] placementSlots;

    [Header("Dimensiones de la torre")]
    [SerializeField] private float blockHeight = 0.012f;
    [SerializeField] private float slotSpacing = 0.020f;

    [Header("Ajustes")]
    [SerializeField] private float placementClearance = 0.0003f;

    private int currentPlacementLevel;
    private int activeSlotIndex = -1;

    public bool HasActiveSlot =>
        activeSlotIndex >= 0;

    public Transform ActiveSlot
    {
        get
        {
            if (placementSlots == null)
                return null;

            if (activeSlotIndex < 0 ||
                activeSlotIndex >= placementSlots.Length)
            {
                return null;
            }

            return placementSlots[activeSlotIndex];
        }
    }

    private void Start()
    {
        HideSlots();
    }

    public void ShowNextPlacementSlot()
    {
        if (towerManager == null ||
            towerRoot == null ||
            placementSlots == null ||
            placementSlots.Length < 3)
        {
            Debug.LogWarning(
                "TopPlacementManager no esta configurado correctamente."
            );

            return;
        }

        int topLevel =
            towerManager.GetTopLevel();

        int blocksAtTop =
            towerManager.CountBlocksAtLevel(
                topLevel
            );

        if (blocksAtTop >= 3)
        {
            currentPlacementLevel =
                topLevel + 1;

            activeSlotIndex = 0;
        }
        else
        {
            currentPlacementLevel =
                topLevel;

            activeSlotIndex =
                blocksAtTop;
        }

        ConfigureSlots();

        for (int i = 0;
             i < placementSlots.Length;
             i++)
        {
            placementSlots[i]
                .gameObject
                .SetActive(
                    i == activeSlotIndex
                );
        }

        Debug.Log(
            $"Colocacion preparada: " +
            $"nivel {currentPlacementLevel}, " +
            $"slot {activeSlotIndex + 1}"
        );
    }

    private void ConfigureSlots()
    {
        bool horizontal =
            currentPlacementLevel % 2 == 1;

        float rotationY =
            horizontal ? 0f : 90f;

        float centerY =
            ((currentPlacementLevel - 1)
            * blockHeight)
            + (blockHeight / 2f)
            + placementClearance;

        for (int i = 0;
             i < placementSlots.Length;
             i++)
        {
            float offset =
                (i - 1) * slotSpacing;

            Vector3 localPosition;

            if (horizontal)
            {
                localPosition =
                    new Vector3(
                        0f,
                        centerY,
                        offset
                    );
            }
            else
            {
                localPosition =
                    new Vector3(
                        offset,
                        centerY,
                        0f
                    );
            }

            placementSlots[i].position =
                towerRoot.TransformPoint(
                    localPosition
                );

            placementSlots[i].rotation =
                towerRoot.rotation *
                Quaternion.Euler(
                    0f,
                    rotationY,
                    0f
                );
        }
    }

    public bool TryPlaceBlock(
        BlockController block)
    {
        if (block == null)
            return false;

        if (!block.IsExtracted)
            return false;

        if (activeSlotIndex < 0)
            return false;

        Transform activeSlot =
            placementSlots[activeSlotIndex];

        if (activeSlot == null)
            return false;

        Rigidbody rb =
            block.Rigidbody;

        if (rb == null)
            return false;

        rb.linearVelocity =
            Vector3.zero;

        rb.angularVelocity =
            Vector3.zero;

        rb.useGravity = false;
        rb.isKinematic = true;

        rb.position =
            activeSlot.position;

        rb.rotation =
            activeSlot.rotation;

        block.SetLevel(
            currentPlacementLevel
        );

        block.SetExtracted(false);
        block.SetSelected(false);

        rb.constraints =
            RigidbodyConstraints
                .FreezeRotation;

        rb.collisionDetectionMode =
            CollisionDetectionMode.Discrete;

        rb.isKinematic = false;
        rb.useGravity = true;

        rb.WakeUp();

        Debug.Log(
            $"Bloque colocado: {block.name} " +
            $"→ Nivel {currentPlacementLevel} " +
            $"Slot {activeSlotIndex + 1}"
        );

        HideSlots();

        OnBlockPlaced?.Invoke(block);

        return true;
    }

    public void HideSlots()
    {
        if (placementSlots == null)
            return;

        foreach (Transform slot
                 in placementSlots)
        {
            if (slot != null)
            {
                slot.gameObject
                    .SetActive(false);
            }
        }

        activeSlotIndex = -1;
    }
}