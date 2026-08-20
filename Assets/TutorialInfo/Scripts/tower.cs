using UnityEngine;
using System.Collections.Generic;


public class Tower : MonoBehaviour
{
    [Header("Prefab del bloque")]
    public GameObject blockPrefab;

    [Header("Configuración")]
    public int numberOfLevels = 9;
    public int blocksPerLevel = 3;

    [Header("Dimensiones del bloque")]
    public float blockLength = 0.75f;
    public float blockWidth = 2.5f;
    public float blockHeight = 0.25f;

    [Header("Separación")]
    public float spacing = 0.02f;
    [Header("Colores de los niveles")]
public Color[] levelColors =
{
    Color.red,
    new Color(1f, 0.5f, 0f),
    Color.yellow,
    Color.green,
    Color.cyan,
    Color.blue,
    new Color(0.5f, 0f, 1f),
    Color.magenta,
    new Color(1f, 0.3f, 0.6f)
};

    private List<Block> blocks = new List<Block>();

    // El primer nivel nuevo será el 10
    private int currentTopLevel;

    public static Tower Instance { get; private set; }

    private void Awake()
    {
        Instance = this;
    }

    private void Start()
    {
        BuildTower();

        currentTopLevel = numberOfLevels + 1;
    }

    // =========================================================
    // CREAR TORRE INICIAL
    // =========================================================

    public void BuildTower()
    {
        for (int level = 0; level < numberOfLevels; level++)
        {
            bool rotated = level % 2 == 1;

            for (int block = 0; block < blocksPerLevel; block++)
            {
                CreateBlock(level, block, rotated);
            }
        }
    }

    private void CreateBlock(int level, int blockIndex, bool rotated)
    {
        float y = level * (blockHeight + spacing);

        Vector3 localPosition;

        if (!rotated)
        {
            float startX = -blockLength;

            localPosition = new Vector3(
                startX + blockIndex * blockLength,
                y,
                0
            );
        }
        else
        {
            float startZ = -blockLength;

            localPosition = new Vector3(
                0,
                y,
                startZ + blockIndex * blockLength
            );
        }

        Quaternion rotation = rotated
            ? Quaternion.Euler(0, 90, 0)
            : Quaternion.identity;

        // Crear el bloque como hijo de Tower
        GameObject newBlock = Instantiate(
            blockPrefab,
            transform
        );

Renderer blockRenderer =
    newBlock.GetComponent<Renderer>();

if (blockRenderer != null &&
    level < levelColors.Length)
{
    blockRenderer.material.color =
        levelColors[level];
}
        // IMPORTANTE:
        // usamos coordenadas locales
        newBlock.transform.localPosition = localPosition;
        newBlock.transform.localRotation = rotation;

        Block blockScript = newBlock.GetComponent<Block>();

        if (blockScript != null)
        {
            blockScript.SetLevel(level + 1);

            bool isTop = level == numberOfLevels - 1;

            blockScript.SetTopLevel(isTop);

            blocks.Add(blockScript);
        }
    }

    // =========================================================
    // OBTENER POSICIÓN DEL NUEVO BLOQUE
    // =========================================================

    public Vector3 GetNextBlockPosition()
    {
        int levelIndex = currentTopLevel - 1;

        bool rotated = levelIndex % 2 == 1;

        float y = levelIndex * (blockHeight + spacing);

        int blockIndex = GetNextBlockIndex(currentTopLevel);

        Vector3 localPosition;

        if (!rotated)
        {
            float startX = -blockLength;

            localPosition = new Vector3(
                startX + blockIndex * blockLength,
                y,
                0
            );
        }
        else
        {
            float startZ = -blockLength;

            localPosition = new Vector3(
                0,
                y,
                startZ + blockIndex * blockLength
            );
        }

        return localPosition;
    }

    // =========================================================
    // CONTAR BLOQUES DEL NIVEL
    // =========================================================

    private int GetNextBlockIndex(int level)
    {
        int count = 0;

        foreach (Block block in blocks)
        {
            if (block != null && block.GetLevel() == level)
            {
                count++;
            }
        }

        return count;
    }

    // =========================================================
    // COLOCACIÓN AUTOMÁTICA
    // =========================================================

    public void PlaceBlockAutomatically(Block block)
    {
        if (block == null)
            return;

        // Obtener posición LOCAL
        Vector3 localPosition = GetNextBlockPosition();

        int levelIndex = currentTopLevel - 1;

        bool rotated = levelIndex % 2 == 1;

        Quaternion rotation = rotated
            ? Quaternion.Euler(0, 90, 0)
            : Quaternion.identity;

        block.transform.SetParent(transform);

block.transform.localPosition = localPosition;
block.transform.localRotation = rotation;

block.SetLevel(currentTopLevel);
block.SetTopLevel(false);

if (!blocks.Contains(block))
{
    blocks.Add(block);
}

        Debug.Log(
            "✅ Bloque colocado automáticamente en nivel "
            + currentTopLevel
            + " - posición "
            + (GetNextBlockIndex(currentTopLevel) + 1)
        );

        // Si ya tenemos 3 bloques en este nivel,
        // pasamos al siguiente
        if (GetNextBlockIndex(currentTopLevel) >= blocksPerLevel)
        {
            currentTopLevel++;

            Debug.Log(
                "🏗️ Nuevo nivel: "
                + currentTopLevel
            );
        }
    }
    public void EnableTowerPhysics()
{
    foreach (Block block in blocks)
    {
        if (block == null)
            continue;

        Rigidbody rb =
            block.GetComponent<Rigidbody>();

        if (rb != null)
        {
            rb.isKinematic = false;
            rb.useGravity = true;
        }
    }

    Debug.Log("⚙️ Física de la torre activada.");
}
public void ResetTower()
{
    Debug.Log("🧱 Reiniciando torre...");

    // Eliminar bloques actuales
    foreach (Transform child in transform)
    {
        Destroy(child.gameObject);
    }

    // Reiniciar lista de bloques si existe
    blocks.Clear();

    // Reiniciar la torre
    BuildTower();

    Debug.Log("✅ Nueva torre creada.");
}
}