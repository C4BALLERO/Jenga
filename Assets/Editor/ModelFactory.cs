using UnityEngine;

namespace Jenga.EditorTools
{
    /// <summary>
    /// Construye los modelos 3D del juego combinando primitivas de Unity.
    /// Sirve como sustituto de modelos descargados y se puede reemplazar
    /// arrastrando otros prefabs a los assets de arma o enemigo.
    /// </summary>
    public static class ModelFactory
    {
        public static GameObject Part(string name, PrimitiveType type, Transform parent, Vector3 localPos, Vector3 localScale, Material material, Vector3 euler = default)
        {
            var go = GameObject.CreatePrimitive(type);
            go.name = name;
            var col = go.GetComponent<Collider>();
            if (col != null) Object.DestroyImmediate(col);
            go.transform.SetParent(parent, false);
            go.transform.localPosition = localPos;
            go.transform.localEulerAngles = euler;
            go.transform.localScale = localScale;
            if (material != null) go.GetComponent<MeshRenderer>().sharedMaterial = material;
            return go;
        }

        public static Transform Empty(string name, Transform parent, Vector3 localPos)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            go.transform.localPosition = localPos;
            return go.transform;
        }

        /// <summary>Pistola compacta.</summary>
        public static GameObject BuildPistol(Material body, Material dark, Material accent)
        {
            var root = new GameObject("Model_Pistol");
            var t = root.transform;
            Part("Slide", PrimitiveType.Cube, t, new Vector3(0f, 0.06f, 0.10f), new Vector3(0.07f, 0.10f, 0.34f), body);
            Part("Barrel", PrimitiveType.Cylinder, t, new Vector3(0f, 0.06f, 0.28f), new Vector3(0.035f, 0.09f, 0.035f), dark, new Vector3(90f, 0f, 0f));
            Part("Grip", PrimitiveType.Cube, t, new Vector3(0f, -0.10f, -0.04f), new Vector3(0.06f, 0.20f, 0.10f), dark, new Vector3(14f, 0f, 0f));
            Part("Trigger", PrimitiveType.Cube, t, new Vector3(0f, -0.03f, 0.05f), new Vector3(0.02f, 0.05f, 0.02f), dark);
            Part("Sight", PrimitiveType.Cube, t, new Vector3(0f, 0.12f, 0.22f), new Vector3(0.015f, 0.03f, 0.02f), accent);
            Empty("Muzzle", t, new Vector3(0f, 0.06f, 0.36f));
            return root;
        }

        /// <summary>Fusil de asalto.</summary>
        public static GameObject BuildRifle(Material body, Material dark, Material accent)
        {
            var root = new GameObject("Model_Rifle");
            var t = root.transform;
            Part("Receiver", PrimitiveType.Cube, t, new Vector3(0f, 0.05f, 0.06f), new Vector3(0.08f, 0.12f, 0.52f), body);
            Part("Barrel", PrimitiveType.Cylinder, t, new Vector3(0f, 0.06f, 0.44f), new Vector3(0.032f, 0.20f, 0.032f), dark, new Vector3(90f, 0f, 0f));
            Part("Handguard", PrimitiveType.Cube, t, new Vector3(0f, 0.05f, 0.32f), new Vector3(0.07f, 0.08f, 0.24f), dark);
            Part("Magazine", PrimitiveType.Cube, t, new Vector3(0f, -0.10f, 0.08f), new Vector3(0.05f, 0.20f, 0.09f), dark, new Vector3(-10f, 0f, 0f));
            Part("Grip", PrimitiveType.Cube, t, new Vector3(0f, -0.11f, -0.06f), new Vector3(0.05f, 0.18f, 0.08f), dark, new Vector3(18f, 0f, 0f));
            Part("Stock", PrimitiveType.Cube, t, new Vector3(0f, 0.02f, -0.28f), new Vector3(0.06f, 0.13f, 0.26f), body);
            Part("Scope", PrimitiveType.Cylinder, t, new Vector3(0f, 0.15f, 0.10f), new Vector3(0.035f, 0.10f, 0.035f), dark, new Vector3(90f, 0f, 0f));
            Part("ScopeGlass", PrimitiveType.Cylinder, t, new Vector3(0f, 0.15f, 0.20f), new Vector3(0.030f, 0.01f, 0.030f), accent, new Vector3(90f, 0f, 0f));
            Empty("Muzzle", t, new Vector3(0f, 0.06f, 0.66f));
            return root;
        }

        /// <summary>Escopeta de corredera.</summary>
        public static GameObject BuildShotgun(Material body, Material dark, Material wood)
        {
            var root = new GameObject("Model_Shotgun");
            var t = root.transform;
            Part("Receiver", PrimitiveType.Cube, t, new Vector3(0f, 0.05f, 0.02f), new Vector3(0.09f, 0.13f, 0.40f), body);
            Part("Barrel", PrimitiveType.Cylinder, t, new Vector3(0f, 0.08f, 0.44f), new Vector3(0.05f, 0.26f, 0.05f), dark, new Vector3(90f, 0f, 0f));
            Part("Tube", PrimitiveType.Cylinder, t, new Vector3(0f, 0.00f, 0.40f), new Vector3(0.04f, 0.22f, 0.04f), dark, new Vector3(90f, 0f, 0f));
            Part("Pump", PrimitiveType.Cube, t, new Vector3(0f, 0.02f, 0.34f), new Vector3(0.09f, 0.09f, 0.16f), wood);
            Part("Stock", PrimitiveType.Cube, t, new Vector3(0f, -0.02f, -0.26f), new Vector3(0.07f, 0.16f, 0.30f), wood, new Vector3(-6f, 0f, 0f));
            Part("Grip", PrimitiveType.Cube, t, new Vector3(0f, -0.10f, -0.10f), new Vector3(0.05f, 0.14f, 0.09f), wood, new Vector3(20f, 0f, 0f));
            Empty("Muzzle", t, new Vector3(0f, 0.08f, 0.70f));
            return root;
        }

        /// <summary>Enemigo básico: chatarra andante con un núcleo brillante.</summary>
        public static GameObject BuildGruntBody(Transform parent, Material body, Material dark, Material accent)
        {
            var visual = Empty("Visual", parent, Vector3.zero).gameObject;
            var t = visual.transform;
            Part("Torso", PrimitiveType.Capsule, t, new Vector3(0f, 0.05f, 0f), new Vector3(0.85f, 0.55f, 0.85f), body);
            Part("Head", PrimitiveType.Cube, t, new Vector3(0f, 0.72f, 0.05f), new Vector3(0.48f, 0.42f, 0.46f), body);
            Part("Jaw", PrimitiveType.Cube, t, new Vector3(0f, 0.56f, 0.16f), new Vector3(0.34f, 0.12f, 0.24f), dark);
            Part("EyeL", PrimitiveType.Sphere, t, new Vector3(-0.12f, 0.78f, 0.24f), new Vector3(0.13f, 0.13f, 0.10f), accent);
            Part("EyeR", PrimitiveType.Sphere, t, new Vector3(0.12f, 0.78f, 0.24f), new Vector3(0.13f, 0.13f, 0.10f), accent);
            Part("Core", PrimitiveType.Sphere, t, new Vector3(0f, 0.16f, 0.30f), new Vector3(0.22f, 0.22f, 0.14f), accent);
            Part("ArmL", PrimitiveType.Capsule, t, new Vector3(-0.48f, 0.10f, 0.06f), new Vector3(0.20f, 0.40f, 0.20f), body, new Vector3(12f, 0f, -14f));
            Part("ArmR", PrimitiveType.Capsule, t, new Vector3(0.48f, 0.10f, 0.06f), new Vector3(0.20f, 0.40f, 0.20f), body, new Vector3(12f, 0f, 14f));
            Part("LegL", PrimitiveType.Capsule, t, new Vector3(-0.22f, -0.62f, 0f), new Vector3(0.24f, 0.34f, 0.24f), dark);
            Part("LegR", PrimitiveType.Capsule, t, new Vector3(0.22f, -0.62f, 0f), new Vector3(0.24f, 0.34f, 0.24f), dark);
            return visual;
        }

        /// <summary>Enemigo rápido: cuerpo bajo, cuatro patas y un ojo central.</summary>
        public static GameObject BuildRunnerBody(Transform parent, Material body, Material dark, Material accent)
        {
            var visual = Empty("Visual", parent, Vector3.zero).gameObject;
            var t = visual.transform;
            Part("Shell", PrimitiveType.Sphere, t, new Vector3(0f, 0.10f, 0f), new Vector3(0.95f, 0.55f, 1.15f), body);
            Part("Plate", PrimitiveType.Cube, t, new Vector3(0f, 0.28f, -0.08f), new Vector3(0.55f, 0.14f, 0.62f), dark, new Vector3(-12f, 0f, 0f));
            Part("Eye", PrimitiveType.Sphere, t, new Vector3(0f, 0.14f, 0.52f), new Vector3(0.30f, 0.30f, 0.18f), accent);
            Part("Fang", PrimitiveType.Cube, t, new Vector3(0f, -0.10f, 0.52f), new Vector3(0.34f, 0.10f, 0.20f), dark, new Vector3(18f, 0f, 0f));
            for (int i = 0; i < 4; i++)
            {
                float sx = i < 2 ? -1f : 1f;
                float sz = (i % 2 == 0) ? 0.30f : -0.30f;
                Part($"Leg_{i}", PrimitiveType.Capsule, t, new Vector3(sx * 0.42f, -0.34f, sz),
                    new Vector3(0.14f, 0.34f, 0.14f), dark, new Vector3(0f, 0f, sx * 26f));
            }
            return visual;
        }

        /// <summary>Kiosco de la tienda.</summary>
        public static GameObject BuildShopKiosk(Material body, Material dark, Material accent, Material wood)
        {
            var root = new GameObject("ShopKiosk");
            var t = root.transform;
            Part("Base", PrimitiveType.Cube, t, new Vector3(0f, 0.5f, 0f), new Vector3(3.2f, 1.0f, 1.6f), wood);
            Part("Counter", PrimitiveType.Cube, t, new Vector3(0f, 1.05f, 0f), new Vector3(3.6f, 0.14f, 2.0f), body);
            Part("PostL", PrimitiveType.Cube, t, new Vector3(-1.5f, 1.9f, 0f), new Vector3(0.16f, 1.6f, 0.16f), dark);
            Part("PostR", PrimitiveType.Cube, t, new Vector3(1.5f, 1.9f, 0f), new Vector3(0.16f, 1.6f, 0.16f), dark);
            Part("Roof", PrimitiveType.Cube, t, new Vector3(0f, 2.75f, 0f), new Vector3(3.8f, 0.16f, 2.4f), accent);
            Part("Sign", PrimitiveType.Cube, t, new Vector3(0f, 2.35f, -1.05f), new Vector3(2.6f, 0.6f, 0.1f), dark);
            var spin = Empty("Hologram", t, new Vector3(0f, 1.75f, 0f));
            Part("Crystal", PrimitiveType.Cube, spin, Vector3.zero, new Vector3(0.34f, 0.34f, 0.34f), accent, new Vector3(45f, 0f, 45f));
            return root;
        }
    }
}
