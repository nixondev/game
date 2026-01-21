# Phaser 3 Top‑Down RPG (POC)

A small, data‑driven top‑down RPG prototype built on Phaser 3. It demonstrates:
- Scene architecture (Boot, Preload, Main Menu, Game World, HUD, Game Over)
- Tiled JSON tilemaps (3 maps), collisions, camera follow
- NPCs with simple AI (patrol/wander) and interaction
- Dialogue system (branching) rendered via a HUD overlay
- Inventory/Quest services and HUD toasts
- Map portals (entry/exit) to travel between maps
- Runtime‑generated pixel‑art sprites and tiles (no external spritesheets required)

This is a clean, CDN‑based Phaser 3 project with plain script tags (no bundler required) and is organized to be future‑friendly for RPG features.


## Quick start

Because the game loads Tiled JSON maps via XHR, you must run it from a local HTTP server (opening the file directly won’t work in most browsers).

- Option A (Node.js):
  1) Install Node.js.
  2) From the project root, run: `npx http-server -p 8080` (or any static server).
  3) Open http://localhost:8080 in your browser.

- Option B (Python 3):
  1) From the project root, run: `python -m http.server 8080`
  2) Open http://localhost:8080 in your browser.

- Option C (any IDE/static server plugin):
  Use your editor’s built‑in static server pointing at the project root.


## Controls
- Move: WASD or Arrow keys
- Interact/Talk/Use Portal: E
- Dialogue choices: 1–5


## What you’ll see
- Main Menu: Press ENTER or click to start. Controls are displayed.
- Game World: A tilemap field with collisions, 8‑direction player movement/animations, NPCs.
- HUD: 
  - Speech bubbles appear above entities when you talk.
  - HUD toasts show guidance, quest updates, and item pickups.
- Portals: Semi‑transparent cyan rectangles representing travel zones; press E to switch maps.


## Project layout
```
assets/
  tilemaps/
    level1.json         # Fields
    level2.json         # Meadow
    level3.json         # Cave
index.html              # Script tags and Phaser 3 bootstrap
js/
  data/
    dialogues.js        # DialogueDB: branching dialogues
    items.js            # ItemDB: items and effects
    quests.js           # QuestDB: quest goals/rewards
    maps.js             # (legacy procedural map stub; not used in v3 flow)
    enemies.js          # EnemyDB: archetype stats (currently not spawned in v3)
  entities/
    Enemy.js            # (legacy Phaser 2 entity)
    Entity.js           # (legacy base)
    NPC.js              # (legacy Phaser 2 entity)
    Player.js           # (legacy Phaser 2 entity)
  services/
    DialogueService.js  # Runs dialogue graphs; emits events for HUD and effects
    InventoryService.js # Adds/removes/uses items; emits HUD/gameplay effects
    QuestManager.js     # Tracks quest progress via events
  states/
    Boot.js             # Sets camera BG; jumps to Preload
    Preload.js          # Generates textures; loads Tiled maps; jumps to MainMenu
    MainMenu.js         # Title and start prompt; starts GameWorld
    GameWorld.js        # Core gameplay: maps, player, NPCs, portals, events
    HUD.js              # Dialogue bubbles, choice list, HUD toasts
    GameOver.js         # Placeholder scene (not used by default flow)
  systems/              # (legacy Phaser 2 systems, not used)
  ui/                   # (legacy Phaser 2 UI, not used)
  utils/
    Constants.js        # Global constants (sizes, colors, player physics)
    MapBuilder.js       # (legacy procedural walls, not used in v3)
    TextureGen.js       # (legacy; replaced by Preload.js canvas generation)
js/main.js              # Phaser.Game config and scene registration
```


## Technology overview
- Phaser 3 (UMD build via CDN)
- No bundler or module system required; plain script tags in `index.html`
- Event‑driven architecture using `this.game.events` for cross‑scene communication
- Tiled maps (orthogonal, JSON), 64×64 tiles, two‑tile terrain (wall/grass)
- Arcade Physics world with collisions against a dedicated Collision layer


## Architecture

### Scenes
- BootScene
  - Minimal boot; sets background and forwards to Preload.
- PreloadScene
  - Generates an 8‑direction, 2‑frame player spritesheet via offscreen canvas.
  - Generates a simple 2‑tile terrain image (wall/grass) via offscreen canvas.
  - Loads three Tiled maps: `level1`, `level2`, `level3`.
  - Forwards to MainMenu.
- MainMenuScene
  - Displays title and control hints; starts GameWorld with `{ mapKey: 'level1' }`.
- GameWorldScene
  - Builds the map using the Tiled layers: `Ground` and `Collision`.
  - Sets world bounds, camera follow, and Arcade collisions.
  - Spawns player at a named spawn from the Objects layer (e.g., `player` or a specific `spawnId`).
  - Spawns NPCs from Objects (type = `npc`) with behaviors:
    - patrol: ping‑pong between waypoints (wp1↔wp2)
    - wander: pick a random point within a radius periodically
  - Handles interactions:
    - Press E near an NPC to talk. If the NPC has `dialogueId` (Tiled property), start a dialogue; otherwise show a simple speech bubble (dialogue text property or fallback).
  - Portals:
    - Reads objects with type `portal` from the Objects layer.
    - Displays a prompt when overlapping; press E to travel to `{ targetMap, targetSpawn }`.
  - Emits `player:moved` events (throttled) for quests.
  - Initializes singletons (services) on `game` and wires global events.
- HUDScene (overlay)
  - Renders speech bubbles near world entities using world→screen mapping.
  - Renders dialogue nodes (text + choices as `[1] … [5] …`).
  - Shows transient HUD toasts for guidance, pickups, and quest state.
  - Listens to: `talk`, `dialogue:node`, `dialogue:close`, `hud:toast`.
- GameOverScene
  - Simple placeholder; not part of the default loop.

### Services (singletons)
- DialogueService
  - Starts a dialogue by id from `DialogueDB` and emits `dialogue:node` events.
  - Applies effects on choices (e.g., `startQuest`, `giveItem`) by emitting global events.
- InventoryService
  - Manages item counts; on `use()` emits gameplay effect events like `player:heal` and HUD toasts.
- QuestManager
  - Tracks quest progress based on global events; emits HUD toasts on start/complete and rewards (e.g., EXP events).

### Data‑driven content
- DialogueDB (`js/data/dialogues.js`)
  - Simple branching graph: `start` node id, `nodes` map, and `choices` with optional `next` and `effects`.
  - Example id: `introVillager`.
- ItemDB (`js/data/items.js`)
  - Example items: `potion`, `sword` with effect fields (`heal`, `atk`).
- QuestDB (`js/data/quests.js`)
  - Example quest: `firstSteps` with a `move` goal.
- EnemyDB (`js/data/enemies.js`)
  - Archetypes for potential combat; not yet wired into v3 world spawning.


## Tiled map format (how to add content)
Each map JSON must include these layers:
- Ground (tilelayer): background tiles (currently tile id 2 = grass)
- Collision (tilelayer): mark collidable tiles either by property `{ collide: true }` on tileset tile id or by tile index (id 1 = wall)
- Objects (objectgroup): gameplay objects

Supported object types in Objects layer:
- spawn
  - Example: `{ type: "spawn", name: "player", x: 200, y: 150 }`
  - You can define named spawns (e.g., `spawn_from_level2`) and travel to them via portals.
- npc
  - Properties supported:
    - `behavior`: `patrol` | `wander` | `idle`
    - `wp1x`, `wp1y`, `wp2x`, `wp2y` (for patrol)
    - `wanderRadius` (for wander)
    - `dialogue`: fallback one‑line text if no `dialogueId`
    - `dialogueId`: id from `DialogueDB` to start full dialogue UI
- portal
  - Use a rectangle object with size and position on walkable tiles (not in wall borders).
  - Properties supported:
    - `targetMap`: map key to load (e.g., `level2`)
    - `targetSpawn`: spawn name in the target map (e.g., `spawn_from_level1`)
    - `prompt`: text shown when overlapping (e.g., `Press E to travel to …`)

Note: A few portals were moved to `y = 160` to ensure they’re fully on walkable tiles (outer border is collidable).


## Extending the game
- Enemies & Combat
  - Add an Enemy class/factory for Phaser 3 and spawn from Objects (type `enemy`) using `EnemyDB`.
  - Hook combat hit/overlap events into `QuestManager` and HUD toasts.
- Inventory UI
  - Add an inventory panel to HUDScene (e.g., open with `I`), listing items and allowing `use()`.
- Quest log
  - Add a quest list to HUDScene (e.g., open with `J`) showing active goals and progress.
- Multiple cameras, shaders, particles
  - Phaser 3 supports rich effects that can be layered into scenes as the project grows.
- Packaging
  - If/when the codebase grows, consider switching to npm + Vite/Webpack + modules/TypeScript for better DX and asset pipelines.


## Implementation notes
- Player art and terrain tiles are generated at runtime via `PreloadScene` using `<canvas>`; no external textures required.
- The display uses `pixelArt: true` and FIT scaling; camera follows the player with smoothing.
- Cross‑scene communication intentionally uses the global `game.events` EventEmitter to decouple world logic from UI services.


## Legacy files
These exist from an older Phaser 2/CE iteration and are not used by the current Phaser 3 runtime:
- `js/game.js`, `js/entities/*.js` (Phaser 2 Sprite‑based classes)
- `js/systems/*` (Phaser 2 managers)
- `js/ui/*` (Phaser 2 UI components)
- `js/utils/MapBuilder.js`, `js/utils/TextureGen.js` (procedural helpers)
- `js/data/maps.js` (procedural obstacle metadata)

They can be archived or gradually replaced by Phaser 3 equivalents (some services already are).


## Troubleshooting
- Blank screen when opening index.html directly:
  - Serve via HTTP (see Quick start); Tiled JSON won’t load from `file://`.
- Can’t enter a portal:
  - Ensure the portal rectangle sits entirely on walkable tiles (not on the outer border walls). Example working positions are at `y = 160` in the current maps.
- Dialogue doesn’t open for an NPC:
  - Add a `dialogueId` property (string) to the NPC object referencing an id in `DialogueDB`.


## License
This prototype is provided for learning and extension. Replace or update this section with your project’s actual license.
