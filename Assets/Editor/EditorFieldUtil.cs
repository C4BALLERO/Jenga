using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

namespace Jenga.EditorTools
{
    /// <summary>
    /// Ayuda a rellenar campos privados marcados con [SerializeField] desde el
    /// generador de contenido, sin necesidad de hacerlos públicos.
    /// </summary>
    public class FieldWriter
    {
        readonly SerializedObject _so;
        readonly Object _target;

        public FieldWriter(Object target)
        {
            _target = target;
            _so = new SerializedObject(target);
        }

        public static FieldWriter On(Object target) => new FieldWriter(target);

        SerializedProperty Find(string name)
        {
            var p = _so.FindProperty(name);
            if (p == null)
                Debug.LogWarning($"[Jenga] No existe el campo serializado '{name}' en {_target}");
            return p;
        }

        public FieldWriter Ref(string name, Object value)
        {
            var p = Find(name);
            if (p != null) p.objectReferenceValue = value;
            return this;
        }

        public FieldWriter Int(string name, int value)
        {
            var p = Find(name);
            if (p != null) p.intValue = value;
            return this;
        }

        public FieldWriter Float(string name, float value)
        {
            var p = Find(name);
            if (p != null) p.floatValue = value;
            return this;
        }

        public FieldWriter Bool(string name, bool value)
        {
            var p = Find(name);
            if (p != null) p.boolValue = value;
            return this;
        }

        public FieldWriter Str(string name, string value)
        {
            var p = Find(name);
            if (p != null) p.stringValue = value;
            return this;
        }

        public FieldWriter Color(string name, Color value)
        {
            var p = Find(name);
            if (p != null) p.colorValue = value;
            return this;
        }

        public FieldWriter Vec3(string name, Vector3 value)
        {
            var p = Find(name);
            if (p != null) p.vector3Value = value;
            return this;
        }

        public FieldWriter Mask(string name, int mask)
        {
            var p = Find(name);
            if (p != null) p.intValue = mask;
            return this;
        }

        public FieldWriter RefList<T>(string name, IList<T> values) where T : Object
        {
            var p = Find(name);
            if (p == null) return this;
            p.arraySize = values.Count;
            for (int i = 0; i < values.Count; i++)
                p.GetArrayElementAtIndex(i).objectReferenceValue = values[i];
            return this;
        }

        public void Apply()
        {
            _so.ApplyModifiedPropertiesWithoutUndo();
            EditorUtility.SetDirty(_target);
        }
    }
}
