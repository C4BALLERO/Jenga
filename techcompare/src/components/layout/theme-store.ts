export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "techcompare-theme";

const listeners = new Set<() => void>();

function readStored(): Theme {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" || value === "system" ? value : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(theme: Theme): void {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
}

/**
 * Store externo mínimo para el tema.
 *
 * Se usa `useSyncExternalStore` en lugar de un efecto con `setState`: el
 * servidor renderiza siempre "system" y el cliente se sincroniza en el primer
 * commit, sin renders en cascada ni aviso de hidratación.
 */
export function subscribeTheme(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readStored() === "system") applyTheme("system");
    callback();
  };
  media.addEventListener("change", onSystemChange);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
    media.removeEventListener("change", onSystemChange);
  };
}

export function getThemeSnapshot(): Theme {
  return readStored();
}

export function getThemeServerSnapshot(): Theme {
  return "system";
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Almacenamiento no disponible (modo privado): el tema solo dura la sesión.
  }
  applyTheme(theme);
  for (const listener of listeners) listener();
}

/** Script que aplica el tema antes del primer pintado, para evitar parpadeo. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
