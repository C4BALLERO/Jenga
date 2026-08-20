using System.Collections;
using UnityEngine;
using Vuforia;

public class ARPhysicsController : MonoBehaviour
{
    [Header("Referencias")]
    [SerializeField] private ObserverBehaviour observer;
    [SerializeField] private Transform blocksRoot;

    [Header("Tracking")]
    [SerializeField] private float stableDelay = 1.0f;

    [Header("Estabilizacion fisica")]
    [SerializeField] private float settleDuration = 0.6f;

    [Header("Solver")]
    [SerializeField] private int solverIterations = 12;
    [SerializeField] private int solverVelocityIterations = 4;

    private Rigidbody[] blockRigidbodies;

    private Coroutine activationCoroutine;

    private bool physicsReady = false;

    public bool IsTrackingStable => physicsReady;

    private void Awake()
    {
        if (observer == null) observer = GetComponent<ObserverBehaviour>();

        if (blocksRoot != null) blockRigidbodies = blocksRoot.GetComponentsInChildren<Rigidbody>(true);

        ConfigureRigidbodies();

        FreezePhysics();
    }

    private void OnEnable()
    {
        if (observer != null) observer.OnTargetStatusChanged += OnTargetStatusChanged;
    }

    private void OnDisable()
    {
        if (observer != null) observer.OnTargetStatusChanged -= OnTargetStatusChanged;
    }

    private void ConfigureRigidbodies()
    {
        if (blockRigidbodies == null) return;

        foreach (Rigidbody rb in blockRigidbodies)
        {
            rb.solverIterations = solverIterations;
            rb.solverVelocityIterations = solverVelocityIterations;
        }
    }

    private void OnTargetStatusChanged(ObserverBehaviour behaviour, TargetStatus targetStatus)
    {
        bool isTracked = targetStatus.Status == Status.TRACKED;

        if (isTracked) BeginActivation();
        else FreezePhysics();
    }

    private void BeginActivation()
    {
        if (physicsReady) return;

        if (activationCoroutine != null) return;

        activationCoroutine = StartCoroutine(ActivatePhysicsSequence());
    }

    private IEnumerator ActivatePhysicsSequence()
    {
        yield return new WaitForSeconds(stableDelay);

        StartSettling();

        yield return new WaitForSeconds(settleDuration);

        ReleaseBlocks();

        physicsReady = true;
        activationCoroutine = null;

        Debug.Log("Torre estabilizada. Fisica completamente activa.");
    }

    private void StartSettling()
    {
        if (blockRigidbodies == null) return;

        foreach (Rigidbody rb in blockRigidbodies)
        {
            BlockController block = rb.GetComponent<BlockController>();

            if (block != null && block.IsExtracted)
            {
                rb.useGravity = false;
                rb.isKinematic = true;
                continue;
            }

            rb.isKinematic = false;
            rb.useGravity = true;

            rb.linearVelocity = Vector3.zero;
            rb.angularVelocity = Vector3.zero;

            rb.constraints =
                RigidbodyConstraints.FreezePositionX |
                RigidbodyConstraints.FreezePositionZ |
                RigidbodyConstraints.FreezeRotationX |
                RigidbodyConstraints.FreezeRotationY |
                RigidbodyConstraints.FreezeRotationZ;

            rb.WakeUp();
        }

        Debug.Log("Iniciando asentamiento de la torre.");
    }

    private void ReleaseBlocks()
    {
        if (blockRigidbodies == null)
            return;

        foreach (Rigidbody rb in blockRigidbodies)
        {
            BlockController block =
                rb.GetComponent<BlockController>();

            if (block != null && block.IsExtracted)
            {
                rb.useGravity = false;
                rb.isKinematic = true;
                continue;
            }

            rb.linearVelocity = Vector3.zero;
            rb.angularVelocity = Vector3.zero;

            rb.constraints = RigidbodyConstraints.FreezeRotation;

            rb.WakeUp();
        }
    }

    private void FreezePhysics()
    {
        physicsReady = false;

        if (activationCoroutine != null)
        {
            StopCoroutine(activationCoroutine);
            activationCoroutine = null;
        }

        if (blockRigidbodies == null) return;

        foreach (Rigidbody rb in blockRigidbodies)
        {
            if (!rb.isKinematic)
            {
                rb.linearVelocity = Vector3.zero;
                rb.angularVelocity = Vector3.zero;
            }

            rb.useGravity = false;
            rb.isKinematic = true;

            rb.constraints = RigidbodyConstraints.None;
        }

        Debug.Log("Fisica congelada.");
    }
}