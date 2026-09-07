using System.Collections.Generic;
using UnityEngine;
using Jenga.Core;

namespace Jenga.Player
{
    /// <summary>Trazadores e impactos de bala. Reutiliza objetos para no generar basura.</summary>
    public static class ShotEffects
    {
        const int PoolSize = 24;
        static readonly List<LineRenderer> Tracers = new List<LineRenderer>();
        static readonly List<Transform> Impacts = new List<Transform>();
        static int _tracerIndex;
        static int _impactIndex;
        static Transform _root;
        static Material _tracerMaterial;
        static Material _impactMaterial;

        static void EnsureRoot()
        {
            if (_root != null) return;
            var go = new GameObject("~ShotEffects");
            _root = go.transform;
            Object.DontDestroyOnLoad(go);

            var db = GameDatabase.Instance;
            _tracerMaterial = db != null ? db.tracerMaterial : null;
            _impactMaterial = db != null ? db.impactMaterial : null;
            if (_tracerMaterial == null)
            {
                var shader = Shader.Find("Universal Render Pipeline/Unlit") ?? Shader.Find("Sprites/Default");
                if (shader != null) _tracerMaterial = new Material(shader);
            }
            if (_impactMaterial == null) _impactMaterial = _tracerMaterial;
        }

        public static void SpawnTracer(Vector3 from, Vector3 to, Color color)
        {
            EnsureRoot();
            if (Tracers.Count < PoolSize)
            {
                var go = new GameObject("Tracer");
                go.transform.SetParent(_root, false);
                var lr = go.AddComponent<LineRenderer>();
                lr.material = _tracerMaterial;
                lr.widthMultiplier = 0.035f;
                lr.numCapVertices = 2;
                lr.useWorldSpace = true;
                lr.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
                lr.receiveShadows = false;
                lr.positionCount = 2;
                Tracers.Add(lr);
            }

            var tracer = Tracers[_tracerIndex % Tracers.Count];
            _tracerIndex++;
            tracer.SetPosition(0, from);
            tracer.SetPosition(1, to);
            tracer.startColor = color;
            tracer.endColor = new Color(color.r, color.g, color.b, 0.15f);
            var fade = tracer.GetComponent<TracerFade>();
            if (fade == null) fade = tracer.gameObject.AddComponent<TracerFade>();
            fade.Play(color);
        }

        public static void SpawnImpact(Vector3 point, Vector3 normal)
        {
            EnsureRoot();
            if (Impacts.Count < PoolSize)
            {
                var go = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                go.name = "Impact";
                Object.Destroy(go.GetComponent<Collider>());
                go.transform.SetParent(_root, false);
                var r = go.GetComponent<Renderer>();
                if (_impactMaterial != null) r.sharedMaterial = _impactMaterial;
                r.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
                go.AddComponent<ImpactFade>();
                Impacts.Add(go.transform);
            }

            var impact = Impacts[_impactIndex % Impacts.Count];
            _impactIndex++;
            impact.position = point + normal * 0.02f;
            impact.localScale = Vector3.one * 0.16f;
            var f = impact.GetComponent<ImpactFade>();
            if (f != null) f.Play();
        }
    }

    /// <summary>Desvanece un trazador tras dibujarse.</summary>
    public class TracerFade : MonoBehaviour
    {
        LineRenderer _lr;
        float _life;
        Color _color;

        void Awake() { _lr = GetComponent<LineRenderer>(); }

        public void Play(Color color)
        {
            _color = color;
            _life = 0.06f;
            if (_lr == null) _lr = GetComponent<LineRenderer>();
            if (_lr != null) _lr.enabled = true;
            enabled = true;
        }

        void Update()
        {
            if (_lr == null) return;
            _life -= Time.unscaledDeltaTime;
            float a = Mathf.Clamp01(_life / 0.06f);
            var c = _color; c.a = a;
            _lr.startColor = c;
            _lr.endColor = new Color(c.r, c.g, c.b, a * 0.2f);
            if (_life <= 0f)
            {
                _lr.enabled = false;
                enabled = false;
            }
        }
    }

    /// <summary>Encoge la marca de impacto hasta desaparecer.</summary>
    public class ImpactFade : MonoBehaviour
    {
        float _life;
        Renderer _renderer;

        void Awake() { _renderer = GetComponent<Renderer>(); }

        public void Play()
        {
            _life = 0.25f;
            if (_renderer != null) _renderer.enabled = true;
            enabled = true;
        }

        void Update()
        {
            _life -= Time.unscaledDeltaTime;
            float t = Mathf.Clamp01(_life / 0.25f);
            transform.localScale = Vector3.one * (0.16f * t);
            if (_life <= 0f)
            {
                if (_renderer != null) _renderer.enabled = false;
                enabled = false;
            }
        }
    }
}
