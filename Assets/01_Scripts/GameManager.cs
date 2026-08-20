using System.Collections;
using TMPro;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    [Header("Juego")]
    [SerializeField]
    private int totalPlayers = 4;

    [SerializeField]
    private float turnEndDelay = 1.0f;

    [Header("Referencias del juego")]
    [SerializeField]
    private TopPlacementManager topPlacementManager;

    [SerializeField]
    private TowerCollapseDetector collapseDetector;

    [Header("UI")]
    [SerializeField]
    private TMP_Text currentPlayerText;

    [SerializeField]
    private GameObject gameOverPanel;

    [SerializeField]
    private TMP_Text gameOverText;

    private int currentPlayer = 1;

    private bool gameOver = false;
    private bool resolvingTurn = false;

    private Coroutine turnCoroutine;

    public int CurrentPlayer => currentPlayer;

    public bool IsGameOver => gameOver;

    public bool IsResolvingTurn =>
        resolvingTurn;

    public bool CanPlayerInteract =>
        !gameOver &&
        !resolvingTurn;

    private void OnEnable()
    {
        if (topPlacementManager != null)
        {
            topPlacementManager.OnBlockPlaced +=
                HandleBlockPlaced;
        }

        if (collapseDetector != null)
        {
            collapseDetector.OnTowerCollapsed +=
                HandleTowerCollapsed;
        }
    }

    private void OnDisable()
    {
        if (topPlacementManager != null)
        {
            topPlacementManager.OnBlockPlaced -=
                HandleBlockPlaced;
        }

        if (collapseDetector != null)
        {
            collapseDetector.OnTowerCollapsed -=
                HandleTowerCollapsed;
        }
    }

    private void Start()
    {
        currentPlayer = 1;
        gameOver = false;
        resolvingTurn = false;

        if (gameOverPanel != null)
        {
            gameOverPanel.SetActive(false);
        }

        UpdateTurnUI();

        Debug.Log(
            "Partida iniciada. Jugador 1."
        );
    }

    private void HandleBlockPlaced(
        BlockController block)
    {
        if (gameOver)
            return;

        if (resolvingTurn)
            return;

        resolvingTurn = true;

        Debug.Log(
            $"Jugador {currentPlayer} " +
            $"completo su movimiento."
        );

        if (turnCoroutine != null)
        {
            StopCoroutine(turnCoroutine);
        }

        turnCoroutine =
            StartCoroutine(
                FinishTurnAfterDelay()
            );
    }

    private IEnumerator
        FinishTurnAfterDelay()
    {
        yield return new WaitForSeconds(
            turnEndDelay
        );

        if (gameOver)
            yield break;

        NextTurn();

        turnCoroutine = null;
    }

    private void NextTurn()
    {
        currentPlayer++;

        if (currentPlayer > totalPlayers)
        {
            currentPlayer = 1;
        }

        resolvingTurn = false;

        UpdateTurnUI();

        Debug.Log(
            $"Turno del Jugador " +
            $"{currentPlayer}"
        );
    }

    private void HandleTowerCollapsed()
    {
        if (gameOver)
            return;

        gameOver = true;
        resolvingTurn = false;

        if (turnCoroutine != null)
        {
            StopCoroutine(turnCoroutine);
            turnCoroutine = null;
        }

        if (topPlacementManager != null)
        {
            topPlacementManager.HideSlots();
        }

        if (currentPlayerText != null)
        {
            currentPlayerText.text =
                "PARTIDA TERMINADA";
        }

        if (gameOverText != null)
        {
            gameOverText.text =
                $"TORRE DERRIBADA\n\n" +
                $"JUGADOR {currentPlayer} " +
                $"PIERDE";
        }

        if (gameOverPanel != null)
        {
            gameOverPanel.SetActive(true);
        }

        Debug.Log(
            $"Jugador {currentPlayer} pierde."
        );
    }

    private void UpdateTurnUI()
    {
        if (currentPlayerText == null)
            return;

        currentPlayerText.text =
            $"Turno: Jugador {currentPlayer}";
    }
}