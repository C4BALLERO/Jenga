using UnityEngine;

public class TowerManager : MonoBehaviour
{
    [Header("Referencias")]
    [SerializeField] private Transform blocksRoot;

    public int GetTopLevel()
    {
        if (blocksRoot == null)
            return 0;

        BlockController[] blocks =
            blocksRoot.GetComponentsInChildren<BlockController>();

        int topLevel = 0;

        foreach (BlockController block in blocks)
        {
            if (block.Level > topLevel)
            {
                topLevel = block.Level;
            }
        }

        return topLevel;
    }

    public int CountBlocksAtLevel(int level)
    {
        if (blocksRoot == null)
            return 0;

        BlockController[] blocks =
            blocksRoot.GetComponentsInChildren<BlockController>();

        int count = 0;

        foreach (BlockController block in blocks)
        {
            if (block.Level == level)
            {
                count++;
            }
        }

        return count;
    }

    public bool CanSelectBlock(BlockController block)
    {
        if (block == null)
            return false;

        if (block.IsExtracted)
            return false;

        int topLevel = GetTopLevel();

        return block.Level < topLevel;
    }
}