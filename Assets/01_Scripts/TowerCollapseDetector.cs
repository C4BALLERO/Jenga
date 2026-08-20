using System;
using UnityEngine;

public class TowerCollapseDetector : MonoBehaviour
{
    [Header("Referencias")]
    [SerializeField]
    private Transform towerRoot;

    [SerializeField]
    private Transform blocksRoot;

    [SerializeField]
    private ARPhysicsController arPhysicsController;

    [Header("Dimensiones")]
    [SerializeField]
    private float blockHeight = 0.012f;

    [Header("Deteccion de derrumbe")]
    [SerializeField]
    private float maxHorizontalDistance = 0.050f;

    [SerializeField]
    private float maxVerticalDrop = 0.009f;

    [SerializeField]
    private float minimumY = -0.010f;

    [Header("Estabilidad")]
    [SerializeField]
    private float checkDelay = 0.5f;

    private float stableTimer = 0f;

    public bool HasCollapsed
    {
        get;
        private set;
    }

    public event Action OnTowerCollapsed;

    private void Update()
    {
        if (HasCollapsed)
            return;

        if (arPhysicsController == null)
            return;

        if (!arPhysicsController.IsTrackingStable)
        {
            stableTimer = 0f;
            return;
        }

        stableTimer += Time.deltaTime;

        if (stableTimer < checkDelay)
            return;

        CheckTower();
    }

    private void CheckTower()
    {
        if (blocksRoot == null ||
            towerRoot == null)
        {
            return;
        }

        BlockController[] blocks =
            blocksRoot.GetComponentsInChildren
            <BlockController>();

        foreach (BlockController block in blocks)
        {
            if (block == null)
                continue;

            if (block.IsExtracted)
                continue;

            Rigidbody rb =
                block.Rigidbody;

            if (rb == null)
                continue;

            if (rb.isKinematic)
                continue;

            Vector3 localPosition =
                towerRoot.InverseTransformPoint(
                    block.transform.position
                );

            float horizontalDistance =
                Mathf.Sqrt(
                    localPosition.x *
                    localPosition.x
                    +
                    localPosition.z *
                    localPosition.z
                );

            float expectedY =
                ((block.Level - 1) *
                blockHeight)
                +
                (blockHeight / 2f);

            float verticalDrop =
                expectedY -
                localPosition.y;

            bool movedTooFar =
                horizontalDistance >
                maxHorizontalDistance;

            bool droppedTooMuch =
                verticalDrop >
                maxVerticalDrop;

            bool fellBelowBase =
                localPosition.y <
                minimumY;

            if (movedTooFar ||
                droppedTooMuch ||
                fellBelowBase)
            {
                TriggerCollapse(
                    block,
                    horizontalDistance,
                    verticalDrop
                );

                return;
            }
        }
    }

    private void TriggerCollapse(
        BlockController block,
        float horizontalDistance,
        float verticalDrop)
    {
        if (HasCollapsed)
            return;

        HasCollapsed = true;

        Debug.Log(
            $"TORRE DERRIBADA por {block.name}"
        );

        Debug.Log(
            $"Distancia horizontal: " +
            $"{horizontalDistance:F3} | " +
            $"Caida vertical: " +
            $"{verticalDrop:F3}"
        );

        if (arPhysicsController != null)
        {
            arPhysicsController
                .TriggerCollapse();
        }

        OnTowerCollapsed?.Invoke();
    }
}