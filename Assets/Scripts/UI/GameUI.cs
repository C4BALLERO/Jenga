using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using Jenga.Core;
using Jenga.Inventory;
using Jenga.Items;
using Jenga.Player;
using Jenga.Shop;
using Jenga.Waves;

namespace Jenga.UI
{
    /// <summary>
    /// Construye toda la interfaz por código y la mantiene sincronizada:
    /// HUD (vida, munición, dinero, oleada), inventario, tienda y fin de partida.
    /// </summary>
    [DefaultExecutionOrder(50)]
    public class GameUI : MonoBehaviour
    {
        [SerializeField] PlayerController player;

        Canvas _canvas;
        InventoryPanel _inventoryPanel;
        ShopPanel _shopPanel;
        NotificationFeed _feed;

        Image _healthFill;
        Text _healthText;
        Text _moneyText;
        Text _waveText;
        Text _waveSubText;
        Text _ammoText;
        Text _weaponName;
        Image _weaponIcon;
        Image _reloadFill;
        RectTransform _reloadBar;
        RectTransform _crosshair;
        CanvasGroup _hitmarker;
        Text _prompt;
        GameObject _gameOverPanel;
        Text _gameOverText;

        PlayerHealth _health;
        PlayerEquipment _equipment;
        WeaponController _weapon;
        PlayerInventory _inventory;
        Wallet _wallet;
        WaveManager _waves;
        ShopController _shop;

        float _hitmarkerTime;

        void Awake()
        {
            ResolveReferences();
            BuildCanvas();
            BuildHud();
            BuildPanels();
            BuildGameOver();
            HookEvents();
        }

        void ResolveReferences()
        {
            if (player == null) player = FindFirstObjectByType<PlayerController>();
            if (player != null)
            {
                _health = player.GetComponent<PlayerHealth>();
                _equipment = player.GetComponent<PlayerEquipment>();
                _weapon = player.GetComponent<WeaponController>();
                _inventory = player.GetComponent<PlayerInventory>();
                _wallet = player.GetComponent<Wallet>();
            }
            _waves = FindFirstObjectByType<WaveManager>();
            _shop = FindFirstObjectByType<ShopController>();
        }

        void BuildCanvas()
        {
            var canvasGo = new GameObject("GameCanvas", typeof(RectTransform));
            canvasGo.transform.SetParent(transform, false);
            canvasGo.layer = LayerMask.NameToLayer("UI");

            _canvas = canvasGo.AddComponent<Canvas>();
            _canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            _canvas.sortingOrder = 100;

            var scaler = canvasGo.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920f, 1080f);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 0.5f;

            canvasGo.AddComponent<GraphicRaycaster>();
            EnsureEventSystem();
        }

        static void EnsureEventSystem()
        {
            var existing = FindFirstObjectByType<EventSystem>();
            if (existing != null)
            {
                if (existing.GetComponent<UnityEngine.InputSystem.UI.InputSystemUIInputModule>() == null)
                {
                    var old = existing.GetComponent<BaseInputModule>();
                    if (old != null) Destroy(old);
                    var module = existing.gameObject.AddComponent<UnityEngine.InputSystem.UI.InputSystemUIInputModule>();
                    module.AssignDefaultActions();
                }
                return;
            }

            var go = new GameObject("EventSystem");
            go.AddComponent<EventSystem>();
            var newModule = go.AddComponent<UnityEngine.InputSystem.UI.InputSystemUIInputModule>();
            newModule.AssignDefaultActions();
        }

        void BuildHud()
        {
            var hud = UIFactory.NewRect("HUD", _canvas.transform);
            UIFactory.Stretch(hud);

            // Punto de mira.
            _crosshair = UIFactory.NewRect("Crosshair", hud);
            UIFactory.Anchor(_crosshair, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                Vector2.zero, new Vector2(34f, 34f));
            CreateCrosshairArm(_crosshair, new Vector2(0f, 11f), new Vector2(3f, 11f));
            CreateCrosshairArm(_crosshair, new Vector2(0f, -11f), new Vector2(3f, 11f));
            CreateCrosshairArm(_crosshair, new Vector2(11f, 0f), new Vector2(11f, 3f));
            CreateCrosshairArm(_crosshair, new Vector2(-11f, 0f), new Vector2(11f, 3f));
            CreateCrosshairArm(_crosshair, Vector2.zero, new Vector2(3f, 3f));

            // Marca de acierto.
            var hitRoot = UIFactory.NewRect("Hitmarker", hud);
            UIFactory.Anchor(hitRoot, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                Vector2.zero, new Vector2(40f, 40f));
            _hitmarker = hitRoot.gameObject.AddComponent<CanvasGroup>();
            _hitmarker.alpha = 0f;
            _hitmarker.blocksRaycasts = false;
            var d1 = UIFactory.Panel("D1", hitRoot, new Color(1f, 0.35f, 0.3f, 1f), false);
            UIFactory.Anchor(d1.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), Vector2.zero, new Vector2(26f, 3f));
            d1.rectTransform.localRotation = Quaternion.Euler(0f, 0f, 45f);
            var d2 = UIFactory.Panel("D2", hitRoot, new Color(1f, 0.35f, 0.3f, 1f), false);
            UIFactory.Anchor(d2.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), Vector2.zero, new Vector2(26f, 3f));
            d2.rectTransform.localRotation = Quaternion.Euler(0f, 0f, -45f);

            // Vida.
            var healthBar = UIFactory.Bar("HealthBar", hud, new Color(0.05f, 0.05f, 0.07f, 0.85f), new Color(0.85f, 0.25f, 0.28f), out _healthFill);
            UIFactory.Anchor(healthBar.rectTransform, new Vector2(0f, 0f), new Vector2(0f, 0f), new Vector2(0f, 0f),
                new Vector2(30f, 30f), new Vector2(380f, 34f));
            _healthText = UIFactory.Label("HealthText", healthBar.transform, "100 / 100", 18, TextAnchor.MiddleCenter, Color.white, FontStyle.Bold);
            UIFactory.Stretch(_healthText.rectTransform);

            var healthLabel = UIFactory.Label("HealthLabel", hud, "VIDA", 15, TextAnchor.LowerLeft, UIFactory.InkDim, FontStyle.Bold);
            UIFactory.Anchor(healthLabel.rectTransform, new Vector2(0f, 0f), new Vector2(0f, 0f), new Vector2(0f, 0f),
                new Vector2(30f, 66f), new Vector2(200f, 20f));

            // Arma equipada.
            var weaponBox = UIFactory.Panel("WeaponBox", hud, new Color(0.05f, 0.06f, 0.09f, 0.78f));
            UIFactory.Anchor(weaponBox.rectTransform, new Vector2(1f, 0f), new Vector2(1f, 0f), new Vector2(1f, 0f),
                new Vector2(-30f, 30f), new Vector2(330f, 96f));

            _weaponIcon = UIFactory.Icon("WeaponIcon", weaponBox.transform, null, Color.white);
            UIFactory.Anchor(_weaponIcon.rectTransform, new Vector2(0f, 0.5f), new Vector2(0f, 0.5f), new Vector2(0f, 0.5f),
                new Vector2(12f, 0f), new Vector2(64f, 64f));

            _weaponName = UIFactory.Label("WeaponName", weaponBox.transform, "Sin arma", 20, TextAnchor.UpperLeft, Color.white, FontStyle.Bold);
            UIFactory.Anchor(_weaponName.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f),
                new Vector2(86f, -10f), new Vector2(-96f, 26f));
            _weaponName.rectTransform.anchoredPosition = new Vector2(86f, -10f);

            _ammoText = UIFactory.Label("Ammo", weaponBox.transform, "-- / --", 30, TextAnchor.LowerRight, UIFactory.Gold, FontStyle.Bold);
            UIFactory.Stretch(_ammoText.rectTransform, 86, 22, 14, 36);

            _reloadBar = UIFactory.Bar("ReloadBar", weaponBox.transform, new Color(0f, 0f, 0f, 0.6f), UIFactory.Accent, out _reloadFill).rectTransform;
            UIFactory.Anchor(_reloadBar, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(0.5f, 0f),
                new Vector2(0f, 10f), new Vector2(-24f, 10f));
            _reloadBar.gameObject.SetActive(false);

            // Dinero.
            var moneyBox = UIFactory.Panel("MoneyBox", hud, new Color(0.05f, 0.06f, 0.09f, 0.78f));
            UIFactory.Anchor(moneyBox.rectTransform, new Vector2(1f, 1f), new Vector2(1f, 1f), new Vector2(1f, 1f),
                new Vector2(-30f, -26f), new Vector2(240f, 48f));
            _moneyText = UIFactory.Label("Money", moneyBox.transform, "0 $", 26, TextAnchor.MiddleCenter, UIFactory.Gold, FontStyle.Bold);
            UIFactory.Stretch(_moneyText.rectTransform, 10, 0, 10, 0);

            // Oleada.
            var waveBox = UIFactory.Panel("WaveBox", hud, new Color(0.05f, 0.06f, 0.09f, 0.7f));
            UIFactory.Anchor(waveBox.rectTransform, new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(0.5f, 1f),
                new Vector2(0f, -20f), new Vector2(520f, 70f));
            _waveText = UIFactory.Label("Wave", waveBox.transform, "Oleada 1", 26, TextAnchor.UpperCenter, Color.white, FontStyle.Bold);
            UIFactory.Stretch(_waveText.rectTransform, 8, 26, 8, 6);
            _waveSubText = UIFactory.Label("WaveSub", waveBox.transform, "", 18, TextAnchor.LowerCenter, UIFactory.InkDim);
            UIFactory.Stretch(_waveSubText.rectTransform, 8, 8, 8, 34);

            // Aviso de interacción.
            _prompt = UIFactory.Label("Prompt", hud, "", 22, TextAnchor.MiddleCenter, UIFactory.Accent, FontStyle.Bold);
            UIFactory.Anchor(_prompt.rectTransform, new Vector2(0.5f, 0f), new Vector2(0.5f, 0f), new Vector2(0.5f, 0f),
                new Vector2(0f, 150f), new Vector2(700f, 30f));

            var controls = UIFactory.Label("Controls", hud,
                "WASD mover · Ratón apuntar · Click disparar · R recargar · TAB inventario · E tienda · ENTER siguiente oleada",
                15, TextAnchor.LowerCenter, new Color(0.7f, 0.74f, 0.8f, 0.65f));
            UIFactory.Anchor(controls.rectTransform, new Vector2(0.5f, 0f), new Vector2(0.5f, 0f), new Vector2(0.5f, 0f),
                new Vector2(0f, 8f), new Vector2(1400f, 20f));

            _feed = NotificationFeed.Create(hud);
        }

        static void CreateCrosshairArm(RectTransform parent, Vector2 pos, Vector2 size)
        {
            var img = UIFactory.Panel("Arm", parent, new Color(1f, 1f, 1f, 0.85f), false);
            UIFactory.Anchor(img.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), pos, size);
            img.raycastTarget = false;
        }

        void BuildPanels()
        {
            _inventoryPanel = InventoryPanel.Create(_canvas.transform);
            _inventoryPanel.Bind(_inventory, _wallet, _equipment);

            _shopPanel = ShopPanel.Create(_canvas.transform);
            _shopPanel.Bind(_shop, _inventory, _wallet, _equipment);
        }

        void BuildGameOver()
        {
            var dim = UIFactory.Panel("GameOver", _canvas.transform, new Color(0.05f, 0f, 0f, 0.85f), false);
            UIFactory.Stretch(dim.rectTransform);
            _gameOverPanel = dim.gameObject;

            var title = UIFactory.Label("Title", dim.transform, "HAS CAÍDO", 72, TextAnchor.MiddleCenter, UIFactory.Danger, FontStyle.Bold);
            UIFactory.Anchor(title.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                new Vector2(0f, 120f), new Vector2(900f, 90f));

            _gameOverText = UIFactory.Label("Summary", dim.transform, "", 28, TextAnchor.MiddleCenter, Color.white);
            UIFactory.Anchor(_gameOverText.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                new Vector2(0f, 30f), new Vector2(900f, 60f));

            var restart = UIFactory.TextButton("Restart", dim.transform, "REINTENTAR", UIFactory.Accent, Color.black, 26,
                () => { if (GameManager.Instance != null) GameManager.Instance.RestartGame(); });
            UIFactory.Anchor(restart.GetComponent<RectTransform>(), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                new Vector2(0f, -70f), new Vector2(300f, 60f));

            dim.gameObject.SetActive(false);
        }

        void HookEvents()
        {
            Notifications.Posted += OnNotification;

            if (_health != null) _health.HealthChanged += OnHealthChanged;
            if (_wallet != null) _wallet.Changed += OnMoneyChanged;
            if (_equipment != null)
            {
                _equipment.WeaponChanged += OnWeaponChanged;
                _equipment.AmmoChanged += RefreshAmmo;
            }
            if (_weapon != null)
            {
                _weapon.AmmoChanged += RefreshAmmo;
                _weapon.Hitmarker += OnHitmarker;
            }
            if (GameManager.Instance != null) GameManager.Instance.GameOver += OnGameOver;

            if (_health != null) OnHealthChanged(_health.Health, _health.MaxHealth);
            if (_wallet != null) OnMoneyChanged(_wallet.Money);
            OnWeaponChanged(_equipment != null ? _equipment.EquippedWeapon : null);
        }

        void OnDestroy()
        {
            Notifications.Posted -= OnNotification;
            if (_health != null) _health.HealthChanged -= OnHealthChanged;
            if (_wallet != null) _wallet.Changed -= OnMoneyChanged;
            if (_equipment != null)
            {
                _equipment.WeaponChanged -= OnWeaponChanged;
                _equipment.AmmoChanged -= RefreshAmmo;
            }
            if (_weapon != null)
            {
                _weapon.AmmoChanged -= RefreshAmmo;
                _weapon.Hitmarker -= OnHitmarker;
            }
            if (GameManager.Instance != null) GameManager.Instance.GameOver -= OnGameOver;
        }

        void Update()
        {
            HandleInput();
            RefreshWave();
            RefreshReload();

            if (_hitmarkerTime > 0f)
            {
                _hitmarkerTime -= Time.unscaledDeltaTime;
                if (_hitmarker != null) _hitmarker.alpha = Mathf.Clamp01(_hitmarkerTime / 0.15f);
            }

            if (_prompt != null)
            {
                bool nearShop = ShopZone.Active != null && ShopZone.Active.PlayerInRange;
                bool anyPanelOpen = (_shopPanel != null && _shopPanel.IsOpen) || (_inventoryPanel != null && _inventoryPanel.IsOpen);
                _prompt.text = nearShop && !anyPanelOpen ? "[E]  Abrir tienda" : "";
            }
        }

        void HandleInput()
        {
            if (GameManager.Instance != null && GameManager.Instance.IsGameOver) return;

            if (InputHelper.InventoryPressed)
            {
                if (_shopPanel != null && _shopPanel.IsOpen) _shopPanel.Close();
                _inventoryPanel.Toggle();
            }

            if (InputHelper.InteractPressed || InputHelper.ShopPressed)
            {
                bool nearShop = ShopZone.Active == null || ShopZone.Active.PlayerInRange;
                if (_shopPanel.IsOpen) _shopPanel.Close();
                else if (nearShop)
                {
                    if (_inventoryPanel.IsOpen) _inventoryPanel.Close();
                    _shopPanel.Open();
                }
                else Notifications.Post("Acércate al kiosco de la tienda.", null, UIFactory.InkDim);
            }

            if (InputHelper.CancelPressed)
            {
                if (_shopPanel.IsOpen) _shopPanel.Close();
                else if (_inventoryPanel.IsOpen) _inventoryPanel.Close();
            }

            // Equipar armas del inventario con las teclas numéricas.
            int number = InputHelper.NumberPressed();
            if (number > 0 && _inventory != null && _equipment != null)
            {
                int found = 0;
                foreach (var (item, _) in _inventory.GetAggregated())
                {
                    if (item is WeaponData weapon)
                    {
                        found++;
                        if (found == number) { _equipment.Equip(weapon); break; }
                    }
                }
            }
        }

        void RefreshWave()
        {
            if (_waves == null || _waveText == null) return;

            int wave = Mathf.Max(1, _waves.CurrentWave);
            switch (_waves.CurrentState)
            {
                case WaveManager.State.Preparing:
                    _waveText.text = $"Preparación · próxima oleada {wave + (_waves.CurrentWave == 0 ? 0 : 1)}";
                    _waveSubText.text = $"Empieza en {_waves.PrepTimeLeft:0}s  ·  ENTER para empezar ya  ·  E para comprar";
                    break;
                case WaveManager.State.Spawning:
                case WaveManager.State.Clearing:
                    _waveText.text = $"Oleada {_waves.CurrentWave}";
                    _waveSubText.text = $"Enemigos restantes: {_waves.RemainingInWave}";
                    break;
                default:
                    _waveText.text = "Preparados";
                    _waveSubText.text = "";
                    break;
            }
        }

        void RefreshReload()
        {
            if (_weapon == null || _reloadBar == null) return;
            bool reloading = _weapon.IsReloading;
            if (_reloadBar.gameObject.activeSelf != reloading) _reloadBar.gameObject.SetActive(reloading);
            if (reloading && _reloadFill != null) _reloadFill.fillAmount = _weapon.ReloadProgress;
        }

        void OnNotification(string message, Sprite icon, Color color)
        {
            if (_feed != null) _feed.Push(message, icon, color);
        }

        void OnHealthChanged(float current, float max)
        {
            if (_healthFill != null) _healthFill.fillAmount = max > 0f ? current / max : 0f;
            if (_healthText != null) _healthText.text = $"{Mathf.CeilToInt(current)} / {Mathf.CeilToInt(max)}";
        }

        void OnMoneyChanged(int money)
        {
            if (_moneyText != null) _moneyText.text = UIFactory.Money(money);
        }

        void OnWeaponChanged(WeaponData weapon)
        {
            if (_weaponName != null) _weaponName.text = weapon != null ? weapon.displayName : "Sin arma";
            if (_weaponIcon != null)
            {
                _weaponIcon.sprite = weapon != null ? weapon.icon : null;
                _weaponIcon.enabled = weapon != null && weapon.icon != null;
            }
            RefreshAmmo();
        }

        void RefreshAmmo()
        {
            if (_ammoText == null) return;
            if (_weapon == null || _equipment == null || _equipment.EquippedWeapon == null)
            {
                _ammoText.text = "-- / --";
                return;
            }
            _ammoText.text = $"{_weapon.Magazine} / {_weapon.Reserve}";
            _ammoText.color = _weapon.Magazine > 0 ? UIFactory.Gold : UIFactory.Danger;
        }

        void OnHitmarker()
        {
            _hitmarkerTime = 0.15f;
            if (_hitmarker != null) _hitmarker.alpha = 1f;
        }

        void OnGameOver()
        {
            if (_gameOverPanel != null) _gameOverPanel.SetActive(true);
            if (_gameOverText != null && _waves != null)
                _gameOverText.text = $"Llegaste a la oleada {Mathf.Max(1, _waves.CurrentWave)}\nDinero acumulado: {(_wallet != null ? UIFactory.Money(_wallet.Money) : "0 $")}";
        }
    }
}
