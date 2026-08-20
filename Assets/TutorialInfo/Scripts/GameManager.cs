using UnityEngine;
using TMPro;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("Jugadores")]
    public int totalPlayers = 3;
    public TMP_Text turnText;

    private int currentPlayer = 1;

    private bool gameStarted = true;

   private void Awake()
{
    Instance = this;

    Debug.Log("🔥 GAME MANAGER SE INICIÓ");
}

   private void Start()
{
    currentPlayer = 1;

    Debug.Log("🎮 Comienza la partida.");
    Debug.Log("👤 Turno del Jugador " + currentPlayer);

    UpdateTurnText();
}

    public int GetCurrentPlayer()
    {
        return currentPlayer;
    }

    public bool IsGameStarted()
    {
        return gameStarted;
    }

    public void NextTurn()
{
    currentPlayer++;

    if (currentPlayer > totalPlayers)
    {
        currentPlayer = 1;
    }

    Debug.Log("🔄 Turno del Jugador " + currentPlayer);

    UpdateTurnText();
}

private void UpdateTurnText()
{
    if (turnText != null)
    {
        turnText.text =
            "TURNO: JUGADOR " + currentPlayer;
    }
}

    public void EndGame(int losingPlayer)
{
    gameStarted = false;

    Debug.Log(
        "💥 La torre cayó. El Jugador "
        + losingPlayer
        + " pierde."
    );

    if (turnText != null)
    {
        turnText.text =
            "💥 ¡TORRE CAÍDA!\n\n" +
            "JUGADOR " +
            losingPlayer +
            " PIERDE";
    }
}
public void NewGame()
{
    Debug.Log("🔄 Iniciando nueva partida...");

    gameStarted = true;
    currentPlayer = 1;

    UpdateTurnText();

    Tower tower =
        FindFirstObjectByType<Tower>();

    if (tower != null)
    {
        tower.ResetTower();
    }
}
}