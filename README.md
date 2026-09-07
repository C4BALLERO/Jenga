# Jenga — Arena de oleadas con tienda

Juego 3D en primera persona hecho con Unity 6 (URP). El jugador dispara a
autómatas que aparecen en oleadas, recoge el botín que sueltan, lo vende en la
tienda del campamento y con ese dinero compra armas y consumibles mejores.

## Cómo abrirlo

1. Abre el proyecto con **Unity 6000.5.6f1** o superior.
2. La primera vez que se abre, el proyecto **genera solo todo el contenido**
   (sprites, materiales, modelos, prefabs, ScriptableObjects y la escena).
   Si no ocurriese, usa el menú **Jenga → Generar contenido del juego**.
3. Abre `Assets/Scenes/Game.unity` (menú **Jenga → Abrir escena de juego**) y pulsa Play.

No hace falta descargar ningún asset: los sprites 2D se dibujan por código y se
guardan como PNG importados como Sprite, y los modelos 3D se montan combinando
primitivas. Cualquiera de los dos se puede sustituir por assets descargados
arrastrándolos al campo correspondiente del ScriptableObject o del prefab.

## Controles

| Acción | Tecla |
| --- | --- |
| Moverse | `WASD` |
| Correr | `Shift` |
| Saltar | `Espacio` |
| Apuntar | Ratón |
| Disparar | Click izquierdo |
| Recargar | `R` |
| Inventario | `TAB` o `I` |
| Tienda (junto al kiosco) | `E` o `B` |
| Equipar arma 1..5 | `1` – `5` |
| Empezar la oleada ya | `Enter` |
| Cerrar ventana | `Esc` |

## Qué hay implementado

### Compra y venta
`ShopController` resuelve las dos operaciones contra el inventario y la cartera
del jugador, validando dinero, existencias y espacio libre. El catálogo vive en
`ShopStock` (un ScriptableObject) donde cada entrada define precio, existencias
y a partir de qué oleada se desbloquea. La tienda recompra cualquier objeto del
inventario al porcentaje definido en cada objeto (`sellRatio`).

### Interfaz
Toda la UI se construye por código (uGUI) desde `GameUI`:

- **HUD**: vida, munición del cargador y reserva, dinero, oleada actual,
  enemigos restantes, punto de mira, marca de acierto y avisos.
- **Inventario**: rejilla de 24 casillas con el **sprite del objeto y la cantidad**
  apilada; al seleccionar una casilla la ficha lateral muestra icono grande,
  nombre, categoría, descripción, estadísticas, valor de venta y cuántos tienes.
  Desde ahí se equipan armas, se usan consumibles y se tiran objetos.
- **Tienda**: pestañas de comprar y vender, selector de cantidad, botón de
  "máximo"/"vender todo" y la misma ficha de información con el precio.

### Disparo y armas equipables
`PlayerEquipment` instancia el **modelo 3D del arma** en el soporte de la mano
(visible en primera persona) y guarda la munición de reserva de cada arma.
`WeaponController` aplica las estadísticas del arma: daño, cadencia, alcance,
perdigones, dispersión, retroceso, cargador y recarga. Cambiar de arma cambia el
modelo que se ve y cómo se juega.

Armas incluidas: **Pistola PX-9**, **Fusil VK-7** y **Escopeta Trueno**.

### Enemigos
`EnemyData` es el ScriptableObject con las estadísticas base del enemigo (vida,
velocidad, daño, cadencia de ataque, alcance, color, escala, tabla de botín, peso
de aparición y a partir de qué oleada aparece). El prefab lleva el componente
`Enemy`, que persigue al jugador, le golpea de cerca y al morir tira su botín.

Hay dos tipos incluidos:

| Enemigo | Vida | Velocidad | Daño | Aparece desde |
| --- | --- | --- | --- | --- |
| Autómata de chatarra | 55 | 3.0 | 9 | oleada 1 |
| Corredor de chatarra | 32 | 5.4 | 6 | oleada 3 |

### Botín
`LootTable` define el dinero y los objetos que suelta cada enemigo con su
probabilidad y cantidad. El botín aparece en el suelo como un sprite 2D flotante
que se recoge al acercarse; el dinero va a la cartera y los objetos al
inventario, listos para venderse.

### Oleadas
`WaveManager` genera las oleadas y `WaveConfig` define la progresión. Las
estadísticas base del enemigo **no se modifican**: se leen del ScriptableObject y
se escalan para cada enemigo generado.

| Estadística | Escalado por oleada |
| --- | --- |
| Vida | x1.18 compuesto |
| Daño | x1.12 compuesto |
| Velocidad | +0.12, hasta 2.2x la base |
| Intervalo de ataque | x0.97 compuesto (atacan más rápido) |
| Botín | x1.10 compuesto |
| Tamaño y color | +1.5% y tinte más rojizo |

Cada 5 oleadas aparece un **élite** con 3.5x vida, 1.8x daño, 3x botín, mayor
tamaño y color morado. El número de enemigos crece de 4 en la primera oleada
sumando 2 por cada oleada superada.

## Estructura

```
Assets/Scripts/
  Core/       GameManager, GameDatabase, InputHelper, Notifications, IDamageable
  Items/      ItemData, WeaponData, ConsumableData
  Inventory/  PlayerInventory, InventorySlot, Wallet
  Shop/       ShopController, ShopStock, ShopZone
  Player/     PlayerController, PlayerHealth, PlayerEquipment, WeaponController, ShotEffects
  Enemies/    EnemyData, Enemy, EnemyStats
  Waves/      WaveConfig, WaveManager
  Loot/       LootTable, LootDrop, LootSpawner, Billboard
  UI/         GameUI, InventoryPanel, ShopPanel, ItemSlotView, ItemInfoView, UIFactory
Assets/Editor/
  JengaContentGenerator, IconPainter, ModelFactory, EditorFieldUtil
Assets/Generated/   (creado por el generador: iconos, materiales, prefabs, objetos, enemigos, config)
Assets/Resources/GameDatabase.asset
```

## Cómo ampliarlo

- **Nuevo objeto**: `Assets > Create > Jenga > Items > Item` y añádelo a
  `Assets/Generated/Config/ShopStock.asset` o a una tabla de botín.
- **Nueva arma**: `Assets > Create > Jenga > Items > Weapon`, asigna un prefab en
  `weaponModel` (puede ser un modelo descargado) y ajusta las estadísticas.
- **Nuevo enemigo**: `Assets > Create > Jenga > Enemy Data`, asigna su prefab con
  el componente `Enemy` y añádelo al `enemyPool` del `WaveConfig`.
- **Dificultad**: todo el escalado está en `Assets/Generated/Config/WaveConfig.asset`.
