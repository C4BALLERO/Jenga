using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace Jenga.EditorTools
{
    /// <summary>
    /// Dibuja los sprites 2D del juego por código y los guarda como PNG importados
    /// como Sprite. Así el proyecto no depende de descargas externas.
    /// </summary>
    public static class IconPainter
    {
        public const int Size = 96;

        class IconCanvas
        {
            public readonly int size;
            public readonly Color[] px;

            public IconCanvas(int size)
            {
                this.size = size;
                px = new Color[size * size];
            }

            public void Blend(int x, int y, Color c)
            {
                if (x < 0 || y < 0 || x >= size || y >= size || c.a <= 0f) return;
                int i = y * size + x;
                Color dst = px[i];
                float a = c.a + dst.a * (1f - c.a);
                if (a <= 0f) { px[i] = new Color(0, 0, 0, 0); return; }
                Color rgb = (c * c.a + dst * dst.a * (1f - c.a)) / a;
                px[i] = new Color(rgb.r, rgb.g, rgb.b, a);
            }

            public Color Get(int x, int y)
            {
                if (x < 0 || y < 0 || x >= size || y >= size) return new Color(0, 0, 0, 0);
                return px[y * size + x];
            }

            public void Rect(float x0, float y0, float x1, float y1, Color c)
            {
                for (int y = Mathf.FloorToInt(y0); y <= Mathf.CeilToInt(y1); y++)
                    for (int x = Mathf.FloorToInt(x0); x <= Mathf.CeilToInt(x1); x++)
                    {
                        float cov = Coverage(x, y, x0, y0, x1, y1);
                        if (cov > 0f) Blend(x, y, new Color(c.r, c.g, c.b, c.a * cov));
                    }
            }

            static float Coverage(int x, int y, float x0, float y0, float x1, float y1)
            {
                float ox = Mathf.Min(x + 1f, x1 + 0.5f) - Mathf.Max(x, x0 - 0.5f);
                float oy = Mathf.Min(y + 1f, y1 + 0.5f) - Mathf.Max(y, y0 - 0.5f);
                return Mathf.Clamp01(ox) * Mathf.Clamp01(oy);
            }

            public void Circle(float cx, float cy, float r, Color c)
            {
                for (int y = Mathf.FloorToInt(cy - r - 1); y <= Mathf.CeilToInt(cy + r + 1); y++)
                    for (int x = Mathf.FloorToInt(cx - r - 1); x <= Mathf.CeilToInt(cx + r + 1); x++)
                    {
                        float d = Mathf.Sqrt((x + 0.5f - cx) * (x + 0.5f - cx) + (y + 0.5f - cy) * (y + 0.5f - cy));
                        float a = Mathf.Clamp01(r - d + 0.5f);
                        if (a > 0f) Blend(x, y, new Color(c.r, c.g, c.b, c.a * a));
                    }
            }

            public void Polygon(Vector2[] points, Color c)
            {
                float minX = float.MaxValue, maxX = float.MinValue, minY = float.MaxValue, maxY = float.MinValue;
                foreach (var p in points)
                {
                    minX = Mathf.Min(minX, p.x); maxX = Mathf.Max(maxX, p.x);
                    minY = Mathf.Min(minY, p.y); maxY = Mathf.Max(maxY, p.y);
                }

                for (int y = Mathf.FloorToInt(minY) - 1; y <= Mathf.CeilToInt(maxY) + 1; y++)
                    for (int x = Mathf.FloorToInt(minX) - 1; x <= Mathf.CeilToInt(maxX) + 1; x++)
                    {
                        int inside = 0;
                        for (int sy = 0; sy < 2; sy++)
                            for (int sx = 0; sx < 2; sx++)
                                if (Inside(points, x + 0.25f + sx * 0.5f, y + 0.25f + sy * 0.5f)) inside++;
                        if (inside > 0) Blend(x, y, new Color(c.r, c.g, c.b, c.a * inside / 4f));
                    }
            }

            static bool Inside(Vector2[] poly, float px, float py)
            {
                bool inside = false;
                for (int i = 0, j = poly.Length - 1; i < poly.Length; j = i++)
                {
                    if ((poly[i].y > py) != (poly[j].y > py) &&
                        px < (poly[j].x - poly[i].x) * (py - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
                        inside = !inside;
                }
                return inside;
            }

            public void RotatedRect(Vector2 center, Vector2 size, float degrees, Color c)
            {
                float rad = degrees * Mathf.Deg2Rad;
                Vector2 right = new Vector2(Mathf.Cos(rad), Mathf.Sin(rad)) * size.x * 0.5f;
                Vector2 up = new Vector2(-Mathf.Sin(rad), Mathf.Cos(rad)) * size.y * 0.5f;
                Polygon(new[]
                {
                    center - right - up, center + right - up, center + right + up, center - right + up
                }, c);
            }

            /// <summary>Contorno oscuro alrededor de todo lo dibujado, para que el icono se lea sobre cualquier fondo.</summary>
            public void Outline(Color color, int thickness)
            {
                for (int pass = 0; pass < thickness; pass++)
                {
                    var copy = (Color[])px.Clone();
                    for (int y = 0; y < size; y++)
                        for (int x = 0; x < size; x++)
                        {
                            if (copy[y * size + x].a > 0.35f) continue;
                            bool near = false;
                            for (int dy = -1; dy <= 1 && !near; dy++)
                                for (int dx = -1; dx <= 1 && !near; dx++)
                                {
                                    if (dx == 0 && dy == 0) continue;
                                    int nx = x + dx, ny = y + dy;
                                    if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
                                    if (copy[ny * size + nx].a > 0.35f) near = true;
                                }
                            if (near) px[y * size + x] = color;
                        }
                }
            }
        }

        static readonly Dictionary<string, Action<IconCanvas>> Painters = new Dictionary<string, Action<IconCanvas>>
        {
            { "icon_coin", PaintCoin },
            { "icon_scrap", PaintScrap },
            { "icon_circuit", PaintCircuit },
            { "icon_core", PaintCore },
            { "icon_medkit", PaintMedkit },
            { "icon_ammo", PaintAmmo },
            { "icon_pistol", PaintPistol },
            { "icon_rifle", PaintRifle },
            { "icon_shotgun", PaintShotgun },
        };

        /// <summary>Genera todos los sprites y devuelve un diccionario nombre → Sprite.</summary>
        public static Dictionary<string, Sprite> GenerateAll(string folder)
        {
            Directory.CreateDirectory(folder);
            var result = new Dictionary<string, Sprite>();

            foreach (var kv in Painters)
            {
                string path = $"{folder}/{kv.Key}.png";
                var canvas = new IconCanvas(Size);
                kv.Value(canvas);
                canvas.Outline(new Color(0.06f, 0.07f, 0.10f, 1f), 3);
                WritePng(canvas, path);
                result[kv.Key] = AssetDatabase.LoadAssetAtPath<Sprite>(path);
            }

            return result;
        }

        static void WritePng(IconCanvas canvas, string path)
        {
            var tex = new Texture2D(canvas.size, canvas.size, TextureFormat.RGBA32, false);
            tex.SetPixels(canvas.px);
            tex.Apply();
            File.WriteAllBytes(path, tex.EncodeToPNG());
            UnityEngine.Object.DestroyImmediate(tex);

            AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceUpdate);
            var importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer != null)
            {
                importer.textureType = TextureImporterType.Sprite;
                importer.spriteImportMode = SpriteImportMode.Single;
                importer.alphaIsTransparency = true;
                importer.mipmapEnabled = false;
                importer.wrapMode = TextureWrapMode.Clamp;
                importer.filterMode = FilterMode.Bilinear;
                importer.spritePixelsPerUnit = 96f;
                importer.textureCompression = TextureImporterCompression.Uncompressed;
                importer.SaveAndReimport();
            }
        }

        // ---------------------------------------------------------------- iconos

        static readonly Color Steel = new Color(0.62f, 0.66f, 0.72f);
        static readonly Color SteelDark = new Color(0.34f, 0.38f, 0.44f);
        static readonly Color GunDark = new Color(0.22f, 0.24f, 0.28f);
        static readonly Color GunMid = new Color(0.36f, 0.39f, 0.45f);
        static readonly Color Brass = new Color(0.85f, 0.68f, 0.28f);

        static void PaintCoin(IconCanvas c)
        {
            c.Circle(48, 46, 34, new Color(0.78f, 0.58f, 0.14f));
            c.Circle(48, 49, 30, new Color(1f, 0.83f, 0.29f));
            c.Circle(48, 49, 22, new Color(0.93f, 0.72f, 0.2f));
            c.Rect(44, 33, 52, 65, new Color(1f, 0.93f, 0.6f));
            c.Rect(36, 55, 60, 61, new Color(1f, 0.93f, 0.6f));
            c.Rect(36, 39, 60, 45, new Color(1f, 0.93f, 0.6f));
        }

        static void PaintScrap(IconCanvas c)
        {
            c.Polygon(new[]
            {
                new Vector2(14, 30), new Vector2(38, 18), new Vector2(66, 26),
                new Vector2(82, 48), new Vector2(64, 74), new Vector2(30, 70)
            }, SteelDark);
            c.Polygon(new[]
            {
                new Vector2(24, 36), new Vector2(42, 28), new Vector2(62, 36),
                new Vector2(70, 52), new Vector2(56, 64), new Vector2(32, 60)
            }, Steel);
            c.Circle(38, 46, 6, SteelDark);
            c.Circle(58, 52, 5, SteelDark);
            c.RotatedRect(new Vector2(66, 66), new Vector2(26, 8), 32f, Steel);
        }

        static void PaintCircuit(IconCanvas c)
        {
            c.Rect(16, 20, 80, 76, new Color(0.10f, 0.36f, 0.24f));
            c.Rect(20, 24, 76, 72, new Color(0.16f, 0.52f, 0.34f));
            c.Rect(38, 40, 60, 60, new Color(0.10f, 0.13f, 0.16f));
            c.Rect(42, 44, 56, 56, new Color(0.22f, 0.25f, 0.30f));
            var trace = new Color(0.85f, 0.78f, 0.32f);
            c.Rect(24, 48, 38, 52, trace);
            c.Rect(60, 48, 74, 52, trace);
            c.Rect(46, 60, 50, 72, trace);
            c.Rect(46, 24, 50, 40, trace);
            c.Circle(28, 66, 4, trace);
            c.Circle(70, 32, 4, trace);
        }

        static void PaintCore(IconCanvas c)
        {
            c.Polygon(new[] { new Vector2(48, 88), new Vector2(82, 48), new Vector2(48, 8), new Vector2(14, 48) },
                new Color(0.15f, 0.55f, 0.75f));
            c.Polygon(new[] { new Vector2(48, 78), new Vector2(72, 48), new Vector2(48, 18), new Vector2(24, 48) },
                new Color(0.35f, 0.85f, 1f));
            c.Polygon(new[] { new Vector2(48, 70), new Vector2(48, 26), new Vector2(32, 48) },
                new Color(0.75f, 0.97f, 1f));
            c.Circle(56, 58, 5, new Color(1f, 1f, 1f, 0.85f));
        }

        static void PaintMedkit(IconCanvas c)
        {
            c.Rect(14, 22, 82, 74, new Color(0.85f, 0.88f, 0.92f));
            c.Rect(14, 22, 82, 34, new Color(0.62f, 0.66f, 0.72f));
            c.Rect(40, 74, 56, 82, new Color(0.62f, 0.66f, 0.72f));
            c.Rect(41, 40, 55, 68, new Color(0.87f, 0.22f, 0.24f));
            c.Rect(30, 47, 66, 61, new Color(0.87f, 0.22f, 0.24f));
        }

        static void PaintAmmo(IconCanvas c)
        {
            c.Rect(12, 18, 84, 60, new Color(0.28f, 0.33f, 0.24f));
            c.Rect(16, 22, 80, 56, new Color(0.40f, 0.47f, 0.33f));
            c.Rect(16, 46, 80, 52, new Color(0.28f, 0.33f, 0.24f));
            for (int i = 0; i < 3; i++)
            {
                float x = 28 + i * 20;
                c.Rect(x - 6, 58, x + 6, 76, Brass);
                c.Polygon(new[] { new Vector2(x - 6, 76), new Vector2(x + 6, 76), new Vector2(x, 88) },
                    new Color(0.95f, 0.83f, 0.45f));
            }
        }

        static void PaintPistol(IconCanvas c)
        {
            c.Rect(14, 54, 78, 70, GunMid);
            c.Rect(70, 58, 84, 66, GunDark);
            c.Polygon(new[] { new Vector2(24, 54), new Vector2(44, 54), new Vector2(38, 16), new Vector2(18, 18) }, GunDark);
            c.Rect(26, 22, 38, 50, new Color(0.30f, 0.24f, 0.20f));
            c.Rect(44, 44, 54, 54, GunDark);
            c.Circle(50, 44, 5, GunDark);
        }

        static void PaintRifle(IconCanvas c)
        {
            c.Rect(10, 48, 88, 62, GunMid);
            c.Rect(70, 52, 92, 58, GunDark);
            c.Polygon(new[] { new Vector2(6, 44), new Vector2(24, 48), new Vector2(24, 66), new Vector2(6, 62) }, GunDark);
            c.Rect(38, 26, 52, 50, GunDark);
            c.Polygon(new[] { new Vector2(24, 48), new Vector2(38, 48), new Vector2(34, 22), new Vector2(22, 24) }, new Color(0.30f, 0.32f, 0.36f));
            c.Rect(48, 62, 72, 70, GunDark);
            c.Circle(60, 70, 5, GunMid);
        }

        static void PaintShotgun(IconCanvas c)
        {
            c.Rect(10, 46, 86, 60, new Color(0.42f, 0.30f, 0.20f));
            c.Rect(30, 60, 92, 74, GunMid);
            c.Rect(78, 62, 94, 72, GunDark);
            c.Rect(34, 38, 66, 48, new Color(0.32f, 0.22f, 0.15f));
            c.Polygon(new[] { new Vector2(10, 42), new Vector2(30, 46), new Vector2(30, 62), new Vector2(8, 58) },
                new Color(0.34f, 0.24f, 0.16f));
            c.Rect(44, 28, 60, 40, GunDark);
        }
    }
}
