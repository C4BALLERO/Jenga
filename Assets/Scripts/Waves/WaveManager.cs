using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Jenga.Core;
using Jenga.Enemies;

namespace Jenga.Waves
{
    /// <summary>Genera las oleadas, escala a los enemigos y avisa a la UI del progreso.</summary>
    public class WaveManager : MonoBehaviour
    {
        public enum State { Idle, Preparing, Spawning, Clearing }

        [SerializeField] WaveConfig config;
        [SerializeField] List<Transform> spawnPoints = new List<Transform>();
        [SerializeField] Transform arenaCenter;
        [SerializeField] float fallbackSpawnRadius = 24f;

        readonly List<Enemy> _alive = new List<Enemy>();
        int _wave;
        int _pendingToSpawn;
        float _prepEndTime;
        State _state = State.Idle;
        Coroutine _routine;

        public static WaveManager Instance { get; private set; }

        public event Action<int> WaveStarted;
        public event Action<int> WaveCompleted;
        public event Action<State> StateChanged;
        public event Action EnemyCountChanged;

        public int CurrentWave => _wave;
        public int AliveCount => _alive.Count;
        public int RemainingInWave => _alive.Count + _pendingToSpawn;
        public State CurrentState => _state;
        public float PrepTimeLeft => Mathf.Max(0f, _prepEndTime - Time.time);
        public WaveConfig Config => config;

        void Awake()
        {
            Instance = this;
            if (config == null)
            {
                var db = GameDatabase.Instance;
                if (db != null) config = db.waveConfig;
            }
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        void Start()
        {
            if (config == null)
            {
                Debug.LogError("[WaveManager] Falta el WaveConfig. Ejecuta Jenga > Generar contenido del juego.");
                enabled = false;
                return;
            }
            BeginPrep(config.prepTime);
        }

        void Update()
        {
            if (_state == State.Preparing)
            {
                if (InputHelper.StartWavePressed) { StartNextWave(); return; }
                if (config.autoStartWaves && Time.time >= _prepEndTime) StartNextWave();
            }
        }

        void SetState(State s)
        {
            if (_state == s) return;
            _state = s;
            StateChanged?.Invoke(s);
        }

        void BeginPrep(float seconds)
        {
            _prepEndTime = Time.time + Mathf.Max(0f, seconds);
            SetState(State.Preparing);
        }

        /// <summary>Arranca la siguiente oleada de inmediato (botón de la UI o tecla Enter).</summary>
        public void StartNextWave()
        {
            if (_state == State.Spawning || _state == State.Clearing) return;
            _wave++;
            _pendingToSpawn = config.EnemiesInWave(_wave);
            SetState(State.Spawning);
            WaveStarted?.Invoke(_wave);
            Notifications.Post($"¡Oleada {_wave}!", null, new Color(1f, 0.5f, 0.35f));
            if (_routine != null) StopCoroutine(_routine);
            _routine = StartCoroutine(SpawnRoutine());
        }

        IEnumerator SpawnRoutine()
        {
            bool eliteWave = config.IsEliteWave(_wave);
            bool eliteSpawned = false;

            while (_pendingToSpawn > 0)
            {
                if (_alive.Count >= config.maxEnemiesAlive)
                {
                    yield return null;
                    continue;
                }

                bool makeElite = eliteWave && !eliteSpawned && _pendingToSpawn <= 1;
                if (SpawnOne(makeElite)) 
                {
                    if (makeElite) eliteSpawned = true;
                    _pendingToSpawn--;
                    EnemyCountChanged?.Invoke();
                }
                else
                {
                    Debug.LogWarning("[WaveManager] No se pudo generar el enemigo; revisa el pool del WaveConfig.");
                    _pendingToSpawn = 0;
                    break;
                }

                yield return new WaitForSeconds(config.spawnInterval);
            }

            SetState(State.Clearing);

            while (_alive.Count > 0) yield return null;

            int completed = _wave;
            WaveCompleted?.Invoke(completed);
            Notifications.Post($"Oleada {completed} superada", null, new Color(0.5f, 1f, 0.6f));
            BeginPrep(config.prepTime);
        }

        bool SpawnOne(bool elite)
        {
            var data = config.PickEnemy(_wave);
            if (data == null || data.prefab == null) return false;

            Vector3 pos = PickSpawnPosition();
            var go = Instantiate(data.prefab, pos, Quaternion.identity);
            var enemy = go.GetComponent<Enemy>();
            if (enemy == null) enemy = go.AddComponent<Enemy>();

            var stats = config.BuildStats(data, _wave, elite);
            enemy.Initialize(data, stats);
            enemy.Died += OnEnemyDied;
            _alive.Add(enemy);
            return true;
        }

        Vector3 PickSpawnPosition()
        {
            if (spawnPoints != null && spawnPoints.Count > 0)
            {
                var valid = new List<Transform>();
                foreach (var t in spawnPoints) if (t != null) valid.Add(t);
                if (valid.Count > 0)
                {
                    var point = valid[UnityEngine.Random.Range(0, valid.Count)];
                    Vector2 jitter = UnityEngine.Random.insideUnitCircle * 1.5f;
                    return point.position + new Vector3(jitter.x, 0f, jitter.y);
                }
            }

            Vector3 center = arenaCenter != null ? arenaCenter.position : Vector3.zero;
            float angle = UnityEngine.Random.value * Mathf.PI * 2f;
            return center + new Vector3(Mathf.Cos(angle), 0f, Mathf.Sin(angle)) * fallbackSpawnRadius + Vector3.up;
        }

        void OnEnemyDied(Enemy enemy)
        {
            enemy.Died -= OnEnemyDied;
            _alive.Remove(enemy);
            EnemyCountChanged?.Invoke();
        }

        public void RegisterSpawnPoints(IEnumerable<Transform> points)
        {
            spawnPoints.Clear();
            foreach (var p in points) if (p != null) spawnPoints.Add(p);
        }
    }
}
