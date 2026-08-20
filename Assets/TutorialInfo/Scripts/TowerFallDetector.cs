using UnityEngine;

public class TowerFallDetector : MonoBehaviour
{
    [Header("Detección")]
    public float maxBlockTilt = 30f;
    public float maxDistanceFromTower = 2f;

    [Header("Tiempo de comprobación")]
    public float checkDuration = 5f;
    public float checkInterval = 0.1f;

    private bool checking = false;
    private bool gameOver = false;

    private Vector3 towerCenter;

    private void Start()
    {
        towerCenter = transform.position;

        Debug.Log("🔎 TowerFallDetector iniciado.");
    }

    public void CheckTower()
    {
        if (checking || gameOver)
            return;

        checking = true;

        Debug.Log(
            "🔎 Vigilando la estabilidad de la torre..."
        );

        StartCoroutine(
            MonitorTower()
        );
    }

    private System.Collections.IEnumerator MonitorTower()
    {
        float elapsedTime = 0f;

        while (elapsedTime < checkDuration)
        {
            if (gameOver)
                yield break;

            Block[] blocks =
                GetComponentsInChildren<Block>();

            foreach (Block block in blocks)
            {
                if (block == null)
                    continue;

                if (HasBlockFallen(block))
                {
                    TowerHasFallen();
                    yield break;
                }
            }

            elapsedTime += checkInterval;

            yield return new WaitForSeconds(
                checkInterval
            );
        }

        // Si llegamos aquí, la torre sobrevivió
        checking = false;

        Debug.Log("✅ TORRE ESTABLE.");

        GameManager gameManager =
            FindFirstObjectByType<GameManager>();

        if (gameManager != null)
        {
            gameManager.NextTurn();
        }
        else
        {
            Debug.LogError(
                "❌ No se encontró GameManager."
            );
        }
    }

    private bool HasBlockFallen(Block block)
    {
        Transform blockTransform =
            block.transform;

        // =========================================
        // INCLINACIÓN
        // =========================================

        float angleX =
            Mathf.Abs(
                Mathf.DeltaAngle(
                    0,
                    blockTransform.eulerAngles.x
                )
            );

        float angleZ =
            Mathf.Abs(
                Mathf.DeltaAngle(
                    0,
                    blockTransform.eulerAngles.z
                )
            );

        if (angleX > maxBlockTilt ||
            angleZ > maxBlockTilt)
        {
            Debug.Log(
                "⚠️ Bloque demasiado inclinado: "
                + block.name
            );

            return true;
        }

        // =========================================
        // DISTANCIA
        // =========================================

        Vector3 position =
            blockTransform.position;

        Vector2 blockXZ =
            new Vector2(
                position.x,
                position.z
            );

        Vector2 towerXZ =
            new Vector2(
                towerCenter.x,
                towerCenter.z
            );

        float distance =
            Vector2.Distance(
                blockXZ,
                towerXZ
            );

        if (distance > maxDistanceFromTower)
        {
            Debug.Log(
                "⚠️ Bloque demasiado alejado: "
                + block.name
            );

            return true;
        }

        return false;
    }

    private void TowerHasFallen()
    {
        if (gameOver)
            return;

        gameOver = true;
        checking = false;

        Debug.Log(
            "💥💥💥 ¡TORRE CAÍDA! 💥💥💥"
        );

        GameManager gameManager =
            FindFirstObjectByType<GameManager>();

        if (gameManager != null)
        {
            int losingPlayer =
                gameManager.GetCurrentPlayer();

            Debug.Log(
                "❌ EL JUGADOR "
                + losingPlayer +
                " PIERDE."
            );

            gameManager.EndGame(
                losingPlayer
            );
        }
        else
        {
            Debug.LogError(
                "❌ No se encontró GameManager."
            );
        }
    }
}