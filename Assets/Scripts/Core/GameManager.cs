using System;
using UnityEngine;
using Jenga.Inventory;
using Jenga.Player;

namespace Jenga.Core
{
    /// <summary>
    /// Punto de acceso a los sistemas del jugador y control del estado global
    /// (pausa por UI abierta, bloqueo del cursor y fin de partida).
    /// </summary>
    [DefaultExecutionOrder(-100)]
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [SerializeField] GameDatabase database;
        [SerializeField] PlayerController player;

        /// <summary>Se dispara cuando se abre o cierra una ventana que bloquea el juego.</summary>
        public event Action<bool> UiModeChanged;
        public event Action GameOver;

        int _uiBlockers;

        public GameDatabase Database => database != null ? database : GameDatabase.Instance;
        public PlayerController Player => player;
        public PlayerInventory Inventory { get; private set; }
        public Wallet Wallet { get; private set; }
        public bool IsUiOpen => _uiBlockers > 0;
        public bool IsGameOver { get; private set; }

        void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            if (database != null) GameDatabase.SetInstance(database);
            if (player == null) player = FindFirstObjectByType<PlayerController>();
            if (player != null)
            {
                Inventory = player.GetComponent<PlayerInventory>();
                Wallet = player.GetComponent<Wallet>();
            }
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        /// <summary>Cada ventana modal abierta suma un bloqueo; el juego se pausa mientras haya alguno.</summary>
        public void PushUiBlocker()
        {
            _uiBlockers++;
            if (_uiBlockers == 1) ApplyUiMode(true);
        }

        public void PopUiBlocker()
        {
            _uiBlockers = Mathf.Max(0, _uiBlockers - 1);
            if (_uiBlockers == 0) ApplyUiMode(false);
        }

        void ApplyUiMode(bool open)
        {
            Cursor.lockState = open ? CursorLockMode.None : CursorLockMode.Locked;
            Cursor.visible = open;
            Time.timeScale = open ? 0f : 1f;
            UiModeChanged?.Invoke(open);
        }

        public void NotifyPlayerDied()
        {
            if (IsGameOver) return;
            IsGameOver = true;
            Cursor.lockState = CursorLockMode.None;
            Cursor.visible = true;
            Time.timeScale = 0f;
            GameOver?.Invoke();
        }

        public void RestartGame()
        {
            Time.timeScale = 1f;
            var scene = UnityEngine.SceneManagement.SceneManager.GetActiveScene();
            UnityEngine.SceneManagement.SceneManager.LoadScene(scene.buildIndex);
        }
    }
}
