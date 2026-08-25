using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    [Header("Juego")]
    [SerializeField] private int totalPlayers = 4;
    [SerializeField] private float turnEndDelay = 1.0f;

    [Header("Referencias del juego")]
    [SerializeField] private TopPlacementManager topPlacementManager;
    [SerializeField] private AudioManager audioManager;

    [SerializeField] private TowerCollapseDetector collapseDetector;

    [Header("UI")]
    [SerializeField] private TMP_Text currentPlayerText;
    [SerializeField] private TMP_Text turnLabelText;
    [SerializeField] private GameObject gameOverPanel;
    [SerializeField] private TMP_Text gameOverText;

    private int currentPlayer = 1;

    private bool gameOver = false;
    private bool resolvingTurn = false;

    private Coroutine turnCoroutine;

    public int CurrentPlayer => currentPlayer;

    public bool IsGameOver => gameOver;

    public bool IsResolvingTurn => resolvingTurn;

    public bool CanPlayerInteract => !gameOver && !resolvingTurn;

    private void OnEnable()
    {
        if (topPlacementManager != null) topPlacementManager.OnBlockPlaced += HandleBlockPlaced;

        if (collapseDetector != null) collapseDetector.OnTowerCollapsed += HandleTowerCollapsed;
    }

    private void OnDisable()
    {
        if (topPlacementManager != null) topPlacementManager.OnBlockPlaced -= HandleBlockPlaced;

        if (collapseDetector != null) collapseDetector.OnTowerCollapsed -= HandleTowerCollapsed;
    }

    private void Start()
    {
        currentPlayer = 1;
        gameOver = false;
        resolvingTurn = false;

        if (gameOverPanel != null) gameOverPanel.SetActive(false);

        UpdateTurnUI();
    }

    private void HandleBlockPlaced(BlockController block)
    {
        if (gameOver) return;

        if (resolvingTurn) return;

        resolvingTurn = true;

        if (turnCoroutine != null) StopCoroutine(turnCoroutine);

        turnCoroutine = StartCoroutine(FinishTurnAfterDelay());
    }

    private IEnumerator FinishTurnAfterDelay()
    {
        yield return new WaitForSeconds(turnEndDelay);

        if (gameOver) yield break;

        NextTurn();

        turnCoroutine = null;
    }

    private void NextTurn()
    {
        currentPlayer++;

        if (currentPlayer > totalPlayers) currentPlayer = 1;

        if (audioManager != null) audioManager.PlayTurnChange();

        resolvingTurn = false;

        UpdateTurnUI();
    }

    private void HandleTowerCollapsed()
    {
        if (gameOver) return;

        gameOver = true;

        if (audioManager != null) audioManager.PlayTowerCollapse();

        resolvingTurn = false;

        if (turnCoroutine != null)
        {
            StopCoroutine(turnCoroutine);
            turnCoroutine = null;
        }

        if (topPlacementManager != null) topPlacementManager.HideSlots();
        if (turnLabelText != null) turnLabelText.text = "Estado de Juego";

        if (currentPlayerText != null) currentPlayerText.text = "Partida Terminada";

        if (gameOverText != null) gameOverText.text = $"JUGADOR {currentPlayer} " + $"PIERDE";

        if (gameOverPanel != null) gameOverPanel.SetActive(true);
    }

    private void UpdateTurnUI()
    {
        if (currentPlayerText == null) return;

        currentPlayerText.text = $"Jugador {currentPlayer}";
    }

    public void RestartGame()
    {
        Scene currentScene = SceneManager.GetActiveScene();

        SceneManager.LoadScene(currentScene.buildIndex);
    }
}