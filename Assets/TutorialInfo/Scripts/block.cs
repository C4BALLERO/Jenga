using UnityEngine;

public class Block : MonoBehaviour
{
    public int level;
    public bool isTopLevel;

    private Rigidbody rb;

   private void Awake()
{
    rb = GetComponent<Rigidbody>();

    // La torre comienza estable
    rb.isKinematic = true;
    rb.useGravity = false;

    rb.linearVelocity = Vector3.zero;
    rb.angularVelocity = Vector3.zero;
}

    public void SetLevel(int newLevel)
    {
        level = newLevel;
    }

    public void SetTopLevel(bool value)
    {
        isTopLevel = value;
    }

    public bool IsTopLevel()
    {
        return isTopLevel;
    }

    public int GetLevel()
    {
        return level;
    }

    public void FreezeBlock()
    {
        rb.isKinematic = true;
        rb.useGravity = false;
        rb.linearVelocity = Vector3.zero;
        rb.angularVelocity = Vector3.zero;
    }

    public void EnablePhysics()
    {
        rb.isKinematic = false;
        rb.useGravity = true;
    }
}