using UnityEngine;
using UnityEngine.InputSystem;

public class BlockInteraction : MonoBehaviour
{
    private Block block;
    private Camera mainCamera;
    private Rigidbody rb;
    private Collider blockCollider;

    private bool isDragging = false;

    private float distanceFromCamera;
    private Vector3 offset;

    private void Awake()
    {
        block = GetComponent<Block>();
        mainCamera = Camera.main;
        rb = GetComponent<Rigidbody>();
        blockCollider = GetComponent<Collider>();
    }

    private void OnMouseDown()
    {
        if (block == null)
        {
            Debug.LogError("❌ No se encontró el componente Block.");
            return;
        }

        // No permitir retirar bloques del nivel superior
        if (block.IsTopLevel())
        {
            Debug.Log(
                "❌ Movimiento inválido: no se puede retirar un bloque del nivel superior."
            );

            return;
        }

        GameManager gameManager =
            FindFirstObjectByType<GameManager>();

        if (gameManager == null)
        {
            Debug.LogError("❌ No se encontró GameManager.");
            return;
        }

        if (!gameManager.IsGameStarted())
        {
            Debug.Log("❌ La partida ha terminado.");
            return;
        }

        Debug.Log(
            "👤 Jugador "
            + gameManager.GetCurrentPlayer()
            + " seleccionó un bloque."
        );

        isDragging = true;

        distanceFromCamera =
            Vector3.Distance(
                mainCamera.transform.position,
                transform.position
            );

        Vector3 mouseWorldPosition =
            GetMouseWorldPosition();

        offset =
            transform.position -
            mouseWorldPosition;

        // Mientras arrastramos:
        // no dejamos que la física lo controle.
        if (rb != null)
        {
            rb.isKinematic = true;
            rb.useGravity = false;

            rb.linearVelocity = Vector3.zero;
            rb.angularVelocity = Vector3.zero;
        }
    }

    private void OnMouseDrag()
    {
        if (!isDragging)
            return;

        Vector3 mouseWorldPosition =
            GetMouseWorldPosition();

        Vector3 targetPosition =
            mouseWorldPosition + offset;

        // Comprobar si el bloque chocaría con otro bloque
        if (CanMoveToPosition(targetPosition))
        {
            transform.position = targetPosition;
        }
        else
        {
            Debug.Log("🧱 Movimiento bloqueado por otro bloque.");
        }
    }

    private bool CanMoveToPosition(Vector3 targetPosition)
    {
        if (blockCollider == null)
            return true;

        Vector3 halfExtents =
            blockCollider.bounds.extents;

        Collider[] hits =
            Physics.OverlapBox(
                targetPosition,
                halfExtents * 0.95f,
                transform.rotation
            );

        foreach (Collider hit in hits)
        {
            // Ignorar nuestro propio collider
            if (hit == blockCollider)
                continue;

            // Si encontramos otro bloque
            Block otherBlock =
                hit.GetComponent<Block>();

            if (otherBlock != null)
            {
                return false;
            }
        }

        return true;
    }

    private void OnMouseUp()
{
    if (!isDragging)
        return;

    isDragging = false;

    Debug.Log("📦 Bloque retirado.");

    Tower tower =
        FindFirstObjectByType<Tower>();

    if (tower == null)
    {
        Debug.LogError("❌ No se encontró Tower.");
        return;
    }

    // Colocar automáticamente el bloque arriba
    tower.PlaceBlockAutomatically(block);

    Debug.Log("📦 Bloque colocado automáticamente.");

    // Activar física
    tower.EnableTowerPhysics();

    Debug.Log("⚙️ Física de la torre activada.");

    // Buscar detector
    TowerFallDetector detector =
        FindFirstObjectByType<TowerFallDetector>();

    if (detector != null)
    {
        Debug.Log("🔎 Comprobando estabilidad de la torre...");
        detector.CheckTower();
    }
    else
    {
        Debug.LogWarning(
            "⚠️ No se encontró TowerFallDetector."
        );
    }

    // IMPORTANTE:
    // NO cambiamos de jugador aquí.
    // El TowerFallDetector lo hará solamente
    // si la torre sigue estable.

    // Reactivar física del bloque
    if (rb != null)
    {
        rb.isKinematic = false;
        rb.useGravity = true;

        rb.linearVelocity = Vector3.zero;
        rb.angularVelocity = Vector3.zero;
    }
}

    private Vector3 GetMouseWorldPosition()
    {
        if (Mouse.current == null)
        {
            return transform.position;
        }

        Vector2 mousePosition =
            Mouse.current.position.ReadValue();

        Ray ray =
            mainCamera.ScreenPointToRay(
                mousePosition
            );

        return ray.GetPoint(
            distanceFromCamera
        );
    }
}