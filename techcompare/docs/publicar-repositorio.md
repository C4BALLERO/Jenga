# Publicar TechCompare en su propio repositorio

El código vive ahora dentro del repositorio `C4BALLERO/Jenga`, en la carpeta
`techcompare/` de la rama `claude/techcompare-platform-uk7k7c`. La carpeta es
autocontenida: tiene su propio `package.json`, su `.gitignore` y su
configuración, así que moverla a un repositorio propio son dos minutos.

No se pudo crear el repositorio automáticamente porque la sesión que generó este
código estaba limitada al repositorio `Jenga` (la API respondió
`sessions are bound to their configured repositories`). Estos son los pasos
exactos.

## Opción A: con GitHub CLI

Comprueba primero que lo tienes y que has iniciado sesión:

```bash
gh --version
gh auth status
```

Si no has iniciado sesión:

```bash
gh auth login
```

Después, desde la raíz de tu copia local de `Jenga`:

```bash
# 1. Sacar la carpeta fuera del repositorio actual
cp -r techcompare ../techcompare
cd ../techcompare

# 2. Historia propia y primer commit
git init -b main
git add .
git commit -m "Initial TechCompare platform"

# 3. Crear el repositorio y publicarlo
gh repo create techcompare \
  --private \
  --source=. \
  --remote=origin \
  --description "Plataforma de comparación de celulares, laptops, procesadores y GPUs" \
  --push
```

## Opción B: sin GitHub CLI

1. Crea el repositorio a mano en <https://github.com/new>:
   - **Nombre:** `techcompare`
   - **Descripción:** Plataforma de comparación de celulares, laptops, procesadores y GPUs
   - **Visibilidad:** Privado
   - **No marques** «Add a README», «Add .gitignore» ni «Choose a license»: el
     proyecto ya trae los suyos y marcarlos provoca un conflicto al primer push.

2. Desde la raíz de tu copia local de `Jenga`:

```bash
cp -r techcompare ../techcompare
cd ../techcompare

git init -b main
git add .
git commit -m "Initial TechCompare platform"
git remote add origin https://github.com/C4BALLERO/techcompare.git
git push -u origin main
```

## Después de publicar

```bash
cd ../techcompare
cp .env.example .env.local
npm install
npm run dev
```

Para desplegar en Vercel, importa el repositorio recién creado en
<https://vercel.com/new>. La configuración de compilación se detecta sola y
`vercel.json` ya declara los cron jobs de sincronización.

Variables mínimas para el primer despliegue:

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | La URL de producción que te asigne Vercel |
| `ADMIN_TOKEN` | `openssl rand -hex 32` |
| `CRON_SECRET` | `openssl rand -hex 32` |

Sin `DATABASE_URL` el sitio funciona igualmente con el catálogo inicial.
