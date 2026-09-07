using UnityEngine;
using UnityEngine.InputSystem;

namespace Jenga.Core
{
    /// <summary>
    /// Acceso directo y seguro a teclado y ratón del nuevo Input System.
    /// Evita depender de un asset de acciones y funciona aunque falte algún dispositivo.
    /// </summary>
    public static class InputHelper
    {
        public static Vector2 MoveAxis
        {
            get
            {
                var k = Keyboard.current;
                if (k == null) return Vector2.zero;
                float x = 0f, y = 0f;
                if (k.aKey.isPressed || k.leftArrowKey.isPressed) x -= 1f;
                if (k.dKey.isPressed || k.rightArrowKey.isPressed) x += 1f;
                if (k.sKey.isPressed || k.downArrowKey.isPressed) y -= 1f;
                if (k.wKey.isPressed || k.upArrowKey.isPressed) y += 1f;
                var v = new Vector2(x, y);
                return v.sqrMagnitude > 1f ? v.normalized : v;
            }
        }

        public static Vector2 LookDelta => Mouse.current != null ? Mouse.current.delta.ReadValue() : Vector2.zero;
        public static bool Sprint => Keyboard.current != null && Keyboard.current.leftShiftKey.isPressed;
        public static bool JumpPressed => Keyboard.current != null && Keyboard.current.spaceKey.wasPressedThisFrame;
        public static bool FireHeld => Mouse.current != null && Mouse.current.leftButton.isPressed;
        public static bool FirePressed => Mouse.current != null && Mouse.current.leftButton.wasPressedThisFrame;
        public static bool ReloadPressed => Keyboard.current != null && Keyboard.current.rKey.wasPressedThisFrame;
        public static bool InteractPressed => Keyboard.current != null && Keyboard.current.eKey.wasPressedThisFrame;
        public static bool InventoryPressed => Keyboard.current != null &&
            (Keyboard.current.tabKey.wasPressedThisFrame || Keyboard.current.iKey.wasPressedThisFrame);
        public static bool ShopPressed => Keyboard.current != null && Keyboard.current.bKey.wasPressedThisFrame;
        public static bool CancelPressed => Keyboard.current != null && Keyboard.current.escapeKey.wasPressedThisFrame;
        public static bool StartWavePressed => Keyboard.current != null && Keyboard.current.enterKey.wasPressedThisFrame;

        /// <summary>Devuelve 0..9 si se pulsó una tecla numérica este frame, si no -1.</summary>
        public static int NumberPressed()
        {
            var k = Keyboard.current;
            if (k == null) return -1;
            if (k.digit1Key.wasPressedThisFrame) return 1;
            if (k.digit2Key.wasPressedThisFrame) return 2;
            if (k.digit3Key.wasPressedThisFrame) return 3;
            if (k.digit4Key.wasPressedThisFrame) return 4;
            if (k.digit5Key.wasPressedThisFrame) return 5;
            return -1;
        }

        public static float ScrollDelta => Mouse.current != null ? Mouse.current.scroll.ReadValue().y : 0f;
    }
}
