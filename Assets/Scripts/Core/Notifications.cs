using System;
using UnityEngine;

namespace Jenga.Core
{
    /// <summary>Canal simple de avisos: cualquier sistema publica, la UI los muestra.</summary>
    public static class Notifications
    {
        public static event Action<string, Sprite, Color> Posted;

        public static void Post(string message, Sprite icon = null)
        {
            Posted?.Invoke(message, icon, Color.white);
        }

        public static void Post(string message, Sprite icon, Color color)
        {
            Posted?.Invoke(message, icon, color);
        }
    }
}
