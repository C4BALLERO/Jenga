using System.IO;
using System.Text;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using Jenga.Core;

namespace Jenga.EditorTools
{
    /// <summary>
    /// Informe de estado del proyecto. Menú: Jenga > Diagnóstico.
    /// Imprime en la consola todo lo que hace falta para saber si el juego está
    /// listo para jugarse, para poder pegarlo de una sola vez al pedir ayuda.
    /// </summary>
    public static class JengaDiagnostics
    {
        [MenuItem("Jenga/Diagnóstico", priority = 20)]
        public static void Run()
        {
            var sb = new StringBuilder();
            sb.AppendLine("===== DIAGNÓSTICO JENGA =====");
            sb.AppendLine($"Unity: {Application.unityVersion}");
            sb.AppendLine($"Pipeline: {(GraphicsSettings.defaultRenderPipeline != null ? GraphicsSettings.defaultRenderPipeline.name : "ninguno (Built-in)")}");
            sb.AppendLine();

            sb.AppendLine("-- Shaders --");
            sb.AppendLine(Check("Universal Render Pipeline/Lit", Shader.Find("Universal Render Pipeline/Lit") != null));
            sb.AppendLine(Check("Universal Render Pipeline/Unlit", Shader.Find("Universal Render Pipeline/Unlit") != null));
            sb.AppendLine();

            sb.AppendLine("-- Capas --");
            sb.AppendLine(Check("8 = Player", LayerMask.LayerToName(8) == "Player"));
            sb.AppendLine(Check("9 = Enemy", LayerMask.LayerToName(9) == "Enemy"));
            sb.AppendLine(Check("10 = Loot", LayerMask.LayerToName(10) == "Loot"));
            sb.AppendLine();

            sb.AppendLine("-- Carpetas generadas --");
            foreach (var folder in new[]
                     {
                         "Assets/Generated", "Assets/Generated/Icons", "Assets/Generated/Materials",
                         "Assets/Generated/Prefabs", "Assets/Generated/Items", "Assets/Generated/Enemies",
                         "Assets/Generated/Config", "Assets/Resources"
                     })
                sb.AppendLine(Check(folder, AssetDatabase.IsValidFolder(folder)));
            sb.AppendLine();

            sb.AppendLine("-- Assets clave --");
            foreach (var path in new[]
                     {
                         "Assets/Resources/GameDatabase.asset",
                         "Assets/Generated/Config/WaveConfig.asset",
                         "Assets/Generated/Config/ShopStock.asset",
                         "Assets/Generated/Prefabs/Player.prefab",
                         "Assets/Generated/Prefabs/Enemy_Automata.prefab",
                         "Assets/Generated/Prefabs/Enemy_Corredor.prefab",
                         "Assets/Generated/Prefabs/LootPickup.prefab",
                         "Assets/Generated/Items/Weapon_Pistola.asset",
                         "Assets/Scenes/Game.unity"
                     })
                sb.AppendLine(Check(path, File.Exists(path)));
            sb.AppendLine();

            sb.AppendLine("-- Base de datos --");
            var db = AssetDatabase.LoadAssetAtPath<GameDatabase>("Assets/Resources/GameDatabase.asset");
            if (db == null)
            {
                sb.AppendLine("  FALTA  GameDatabase. Ejecuta Jenga > Generar contenido del juego.");
            }
            else
            {
                sb.AppendLine($"  Objetos: {db.items.Count}   Armas: {db.weapons.Count}   Enemigos: {db.enemies.Count}");
                sb.AppendLine(Check("waveConfig asignado", db.waveConfig != null));
                sb.AppendLine(Check("starterWeapon asignado", db.starterWeapon != null));
                sb.AppendLine(Check("lootPickupPrefab asignado", db.lootPickupPrefab != null));
                sb.AppendLine(Check("tracerMaterial asignado", db.tracerMaterial != null));

                int sinIcono = 0;
                foreach (var i in db.AllItems())
                    if (i == null || i.icon == null) sinIcono++;
                sb.AppendLine(Check($"todos los objetos tienen sprite ({sinIcono} sin icono)", sinIcono == 0));

                foreach (var w in db.weapons)
                    if (w != null) sb.AppendLine(Check($"modelo 3D de {w.displayName}", w.weaponModel != null));

                foreach (var e in db.enemies)
                    if (e != null) sb.AppendLine(Check($"prefab de {e.displayName}", e.prefab != null));
            }

            sb.AppendLine();
            sb.AppendLine("Si algo sale como FALTA, ejecuta Jenga > Generar contenido del juego.");
            sb.AppendLine("=============================");

            Debug.Log(sb.ToString());
        }

        static string Check(string label, bool ok) => (ok ? "  OK     " : "  FALTA  ") + label;
    }
}
