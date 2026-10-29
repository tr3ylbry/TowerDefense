import Phaser from "phaser";
import {
  AMMO,
  COLS,
  ENEMIES,
  isBlocked,
  MAPS,
  ROWS,
  STEP,
  TOWERS,
} from "./game/content";
import { BIOMES, EXPEDITION_ENEMIES, EXPEDITION_TOWERS } from "./game/art";
import type { TowerKind } from "./game/content";
import type { GameEvent, Simulation, Snapshot } from "./game/simulation";

export const FIELD = {
  width: 1080,
  height: 660,
  x: 96,
  y: 142,
  cellWidth: 100,
  cellHeight: 74,
};
export interface ArtManifest {
  backgrounds: { key: string; file: string }[];
  images: { key: string; file: string }[];
  sprites: {
    key: string;
    file: string;
    frameWidth: number;
    frameHeight: number;
    frames: number;
    fps: number;
  }[];
}
interface Options {
  parent: HTMLElement;
  simulation: Simulation;
  art: ArtManifest;
  selection: () => TowerKind | "salvage" | null;
  reducedMotion: () => boolean;
  artStyle: () => "expedition" | "original";
  cursor: () => { row: number; col: number } | null;
  onState: (state: Snapshot) => void;
  onEvent: (event: GameEvent) => void;
  onReady: () => void;
  onError: () => void;
}

export function mountBattlefield(options: Options): () => void {
  const { simulation, art } = options;
  const usedKeys = new Set([
    ...Object.values(TOWERS).flatMap((tower) => [
      `${tower.sprite}-idle`,
      `${tower.sprite}-fire`,
    ]),
    ...Object.values(ENEMIES).flatMap((enemy) =>
      ["walk", "attack", "die"].map((state) => `${enemy.sprite}-${state}`),
    ),
  ]);
  const sprites = art.sprites.filter((sprite) => usedKeys.has(sprite.key));
  const backgroundKeys = new Set<string>(
    Object.values(MAPS).map((map) => map.background),
  );
  const backgrounds = art.backgrounds.filter((image) =>
    backgroundKeys.has(image.key),
  );
  const imageKeys = new Set([
    "acid-pool",
    ...Object.values(AMMO).map((ammo) => ammo.sprite),
  ]);
  const images = art.images.filter((image) => imageKeys.has(image.key));
  const requiredSprites = [
    ...Object.values(TOWERS).map((tower) => `${tower.sprite}-idle`),
    ...Object.values(ENEMIES).flatMap((enemy) =>
      ["walk", "attack", "die"].map((state) => `${enemy.sprite}-${state}`),
    ),
  ];
  if (
    backgrounds.length !== backgroundKeys.size ||
    images.length !== imageKeys.size ||
    requiredSprites.some((key) => !sprites.some((sprite) => sprite.key === key))
  ) {
    options.onError();
    return () => {};
  }
  const towerSprites = new Map<number, Phaser.GameObjects.Sprite>();
  const enemySprites = new Map<number, Phaser.GameObjects.Sprite>();
  const bulletSprites = new Map<number, Phaser.GameObjects.Image>();
  const worldX = (x: number) => FIELD.x + x * FIELD.cellWidth;
  const worldY = (row: number) => FIELD.y + (row + 0.5) * FIELD.cellHeight;
  let lastUiUpdate = 0;
  let loaded = true;

  class BattleScene extends Phaser.Scene {
    private bars!: Phaser.GameObjects.Graphics;
    private hover!: Phaser.GameObjects.Graphics;
    private background!: Phaser.GameObjects.Image;
    private shade!: Phaser.GameObjects.Rectangle;
    private ghost!: Phaser.GameObjects.Image;
    private ambience!: Phaser.GameObjects.Graphics;
    private laneWarnings: Phaser.GameObjects.Text[] = [];
    private lastReducedMotion = false;
    private mapTitle!: Phaser.GameObjects.Text;
    private sector!: Phaser.GameObjects.Text;
    private terrain!: Phaser.GameObjects.Container;
    private activeMap = "";
    private lastElapsed = 0;
    private effects!: Phaser.GameObjects.Container;
    private stars: Phaser.GameObjects.Arc[] = [];

    constructor() {
      super("Battlefield");
    }

    preload(): void {
      this.load.on("loaderror", () => {
        loaded = false;
      });
      const base = `${import.meta.env.BASE_URL}art/`;
      for (const image of [...backgrounds, ...images])
        this.load.image(image.key, base + image.file);
      this.load.image("expedition-canyon", `${base}expedition/canyon.webp`);
      for (const image of [
        ...Object.values(EXPEDITION_TOWERS),
        ...Object.values(EXPEDITION_ENEMIES),
      ])
        this.load.image(image.key, base + image.file);
      for (const sprite of sprites)
        this.load.spritesheet(sprite.key, base + sprite.file, {
          frameWidth: sprite.frameWidth,
          frameHeight: sprite.frameHeight,
        });
    }

    create(): void {
      if (!loaded) {
        options.onError();
        return;
      }
      for (const sprite of sprites)
        this.anims.create({
          key: sprite.key,
          frames: this.anims.generateFrameNumbers(sprite.key, {
            start: 0,
            end: sprite.frames - 1,
          }),
          frameRate: sprite.fps,
          repeat:
            sprite.key.endsWith("-fire") || sprite.key.endsWith("-die")
              ? 0
              : -1,
        });

      this.add.rectangle(540, 330, 1080, 660, 0x101f2a);
      this.background = this.add
        .image(540, 330, MAPS[simulation.snapshot().map].background)
        .setDisplaySize(1080, 660)
        .setAlpha(0.24);
      this.shade = this.add.rectangle(540, 330, 1080, 660, 0x102330, 0.47);
      for (let i = 0; i < 32; i++) {
        const star = this.add.circle(
          (i * 137.5 + 37) % 1080,
          20 + ((i * 53) % 107),
          i % 4 === 0 ? 1.5 : 0.8,
          0xc5e0df,
          0.25 + (i % 5) * 0.08,
        );
        this.stars.push(star);
      }
      const top = this.add.graphics();
      top.lineStyle(1, 0x49616b, 0.6).lineBetween(32, 88, 1048, 88);
      this.add.text(34, 31, "OUTPOST 04", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#9cb8bd",
        letterSpacing: 3,
      });
      this.mapTitle = this.add.text(34, 54, "", {
        fontFamily: "sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#e1eae5",
        letterSpacing: 1.5,
      });
      this.add.circle(1025, 48, 4, 0x62d2b7);
      this.add
        .text(1008, 42, "SIGNAL STABLE", {
          fontFamily: "monospace",
          fontSize: "11px",
          color: "#91c6b8",
        })
        .setOrigin(1, 0);
      this.add.text(100, 112, "DEFEND THE OUTPOST", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#88a8b3",
        letterSpacing: 2,
      });
      this.add
        .text(994, 112, "HOSTILES INBOUND", {
          fontFamily: "monospace",
          fontSize: "10px",
          color: "#e5a18a",
          letterSpacing: 1.5,
        })
        .setOrigin(1, 0);

      const tiles = this.add.graphics();
      for (let row = 0; row < ROWS; row++) {
        this.add
          .text(29, worldY(row), `0${row + 1}`, {
            fontFamily: "monospace",
            fontSize: "11px",
            color: "#a2bebd",
          })
          .setOrigin(0, 0.5);
        tiles
          .fillStyle(0x153c43, 0.8)
          .fillRoundedRect(57, worldY(row) - 17, 22, 34, 5);
        tiles
          .lineStyle(2, 0x60b6a2, 0.75)
          .lineBetween(68, worldY(row) - 8, 68, worldY(row) + 8);
        for (let col = 0; col < COLS; col++) {
          const x = FIELD.x + col * FIELD.cellWidth;
          const y = FIELD.y + row * FIELD.cellHeight;
          tiles
            .fillStyle((row + col) % 2 === 0 ? 0x24424b : 0x1c3540, 0.45)
            .fillRoundedRect(
              x + 3,
              y + 3,
              FIELD.cellWidth - 6,
              FIELD.cellHeight - 6,
              5,
            );
          tiles
            .lineStyle(1, 0x638b91, 0.17)
            .strokeRoundedRect(
              x + 3,
              y + 3,
              FIELD.cellWidth - 6,
              FIELD.cellHeight - 6,
              5,
            );
        }
      }
      tiles
        .lineStyle(1, 0x56cbb0, 0.6)
        .lineBetween(86, FIELD.y, 86, FIELD.y + ROWS * FIELD.cellHeight);
      tiles
        .lineStyle(1, 0xe79872, 0.55)
        .lineBetween(1005, FIELD.y, 1005, FIELD.y + ROWS * FIELD.cellHeight);
      this.add.text(97, 617, "◈  KEEP YOUR CREW BETWEEN THE ALIENS AND HOME.", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#92afb4",
        letterSpacing: 1,
      });
      this.sector = this.add
        .text(995, 617, "", {
          fontFamily: "monospace",
          fontSize: "10px",
          color: "#718f9a",
          letterSpacing: 1,
        })
        .setOrigin(1, 0);
      this.ambience = this.add.graphics().setDepth(0.5);
      this.terrain = this.add.container(0, 0).setDepth(1);
      for (let row = 0; row < ROWS; row++)
        this.laneWarnings.push(
          this.add
            .text(worldX(9.1), worldY(row), "", {
              fontFamily: "monospace",
              fontSize: "15px",
              fontStyle: "bold",
              color: "#e8e5ce",
              backgroundColor: "#172b38",
            })
            .setOrigin(0.5)
            .setDepth(8)
            .setPadding(5, 4)
            .setVisible(false),
        );
      this.effects = this.add.container(0, 0).setDepth(9);
      this.renderMap(simulation.snapshot());
      this.hover = this.add.graphics().setDepth(2);
      this.bars = this.add.graphics().setDepth(8);
      this.ghost = this.add
        .image(0, 0, "expedition-ranger")
        .setDepth(3)
        .setAlpha(0.45)
        .setVisible(false);
      options.onReady();
    }

    update(time: number, delta: number): void {
      if (!loaded || !this.bars) return;
      simulation.advance(Math.min(delta / 1000, 0.1));
      const state = simulation.snapshot();
      if (state.elapsed < this.lastElapsed) {
        this.tweens.killAll();
        this.effects.removeAll(true);
      }
      if (options.reducedMotion() && !this.lastReducedMotion) {
        this.tweens.killAll();
        this.effects.removeAll(true);
      }
      this.lastReducedMotion = options.reducedMotion();
      this.lastElapsed = state.elapsed;
      this.renderMap(state);
      const moving = state.phase === "playing";
      this.renderEntities(state, moving);
      this.renderHover(state);
      for (const event of simulation.drainEvents()) {
        this.effect(event, state);
        options.onEvent(event);
      }
      if (options.reducedMotion() || !moving)
        this.stars.forEach((star) => star.setAlpha(0.35));
      else
        this.stars.forEach((star, i) =>
          star.setAlpha(0.3 + Math.sin(time / 1700 + i) * 0.15),
        );
      for (const child of this.effects.list) {
        if (!(child instanceof Phaser.GameObjects.Sprite)) continue;
        child.anims.timeScale = state.speed;
        if (!moving || options.reducedMotion()) child.anims.pause();
        else child.anims.resume();
      }
      this.tweens.timeScale = state.speed;
      if (state.phase === "paused") this.tweens.pauseAll();
      else this.tweens.resumeAll();
      if (time - lastUiUpdate > 90) {
        options.onState(state);
        lastUiUpdate = time;
      }
    }

    private renderMap(state: Snapshot): void {
      const style = options.artStyle();
      const mapKey = `${state.map}-${style}`;
      if (this.activeMap === mapKey) return;
      this.activeMap = mapKey;
      const map = MAPS[state.map];
      const expedition = state.map === "canyon" && style === "expedition";
      const biome = BIOMES[state.map];
      this.background
        .setTexture(expedition ? "expedition-canyon" : map.background)
        .setDisplaySize(1080, 660)
        .setAlpha(style === "expedition" ? biome.backgroundAlpha : 0.24);
      this.shade
        .setFillStyle(style === "expedition" ? biome.shadow : 0x102330)
        .setAlpha(style === "expedition" ? biome.shadeAlpha : 0.47);
      this.ambience.clear();
      if (style === "expedition") {
        this.ambience
          .lineStyle(2, biome.accent, 0.4)
          .lineBetween(86, 142, 86, 586)
          .lineBetween(1008, 142, 1008, 586);
        if (state.map === "bridge") {
          this.ambience
            .lineStyle(2, biome.accent, 0.32)
            .lineBetween(22, 132, 1058, 132)
            .lineBetween(22, 600, 1058, 600);
          for (let index = 0; index < 14; index++)
            this.ambience
              .fillStyle(biome.accent, 0.3)
              .fillRect(30 + index * 78, 125, 20, 3)
              .fillRect(30 + index * 78, 605, 20, 3);
        } else if (state.map === "nest") {
          for (let index = 0; index < 16; index++) {
            const x = 22 + (index % 2) * 1028,
              y = 145 + Math.floor(index / 2) * 60;
            this.ambience
              .fillStyle(biome.accent, 0.14)
              .fillEllipse(x, y, 35, 22);
            this.ambience
              .lineStyle(1, biome.accent, 0.32)
              .lineBetween(x, y, index % 2 ? 1020 : 60, y + 24);
          }
        }
      }
      this.mapTitle.setText(`${map.name.toUpperCase()} PERIMETER`);
      this.sector.setText(`SECTOR / 0${map.number}`);
      this.terrain.removeAll(true);
      for (let row = 0; row < ROWS; row++)
        for (let col = 0; col < COLS; col++) {
          if (!isBlocked(state.map, row, col)) continue;
          const pool = this.add
            .image(worldX(col + 0.5), worldY(row), "acid-pool")
            .setDisplaySize(FIELD.cellWidth - 10, FIELD.cellHeight - 10)
            .setAlpha(0.8);
          const mark = this.add
            .text(worldX(col + 0.5), worldY(row), "×", {
              fontFamily: "monospace",
              fontSize: "19px",
              color: "#d9edb4",
            })
            .setOrigin(0.5);
          this.terrain.add([pool, mark]);
        }
    }

    private renderEntities(state: Snapshot, moving: boolean): void {
      this.bars.clear();
      const alpha = simulation.interpolationAlpha();
      const visualTime = state.elapsed + alpha * STEP;
      const animate = !options.reducedMotion();
      const expedition = options.artStyle() === "expedition";
      const activeTowers = new Set(state.towers.map((tower) => tower.id));
      for (const [id, sprite] of towerSprites)
        if (!activeTowers.has(id)) {
          sprite.destroy();
          towerSprites.delete(id);
        }
      for (const tower of state.towers) {
        const definition = TOWERS[tower.kind];
        let sprite = towerSprites.get(tower.id);
        if (!sprite) {
          sprite = this.add
            .sprite(
              worldX(tower.col + 0.5),
              worldY(tower.row) - 4,
              `${definition.sprite}-idle`,
            )
            .setDisplaySize(84, 84)
            .setDepth(4);
          sprite.play(`${definition.sprite}-idle`);
          sprite.on("animationcomplete", () => {
            if (sprite?.active) sprite.play(`${definition.sprite}-idle`);
          });
          towerSprites.set(tower.id, sprite);
        }
        const artwork = expedition ? EXPEDITION_TOWERS[tower.kind] : undefined;
        const prototype = Boolean(artwork);
        if (sprite.getData("prototype") !== prototype) {
          sprite.setData("prototype", prototype);
          sprite.anims.stop();
          if (artwork) sprite.setTexture(artwork.key);
          else {
            sprite.play(`${definition.sprite}-idle`);
            sprite.setDisplaySize(84, 84);
          }
        }
        sprite.setOrigin(0.5, artwork?.foot ?? 1).setY(worldY(tower.row) + 29);
        const recoil = animate
          ? Math.max(0, (sprite.getData("recoilUntil") ?? 0) - visualTime) /
            0.12
          : 0;
        sprite.setX(worldX(tower.col + 0.5) - recoil * 5);
        if (artwork) {
          const breath = animate
            ? Math.sin(visualTime * 3 + tower.id) * 0.8
            : 0;
          sprite.setDisplaySize(artwork.width, artwork.height + breath);
        } else {
          const duration = sprite.anims.currentAnim?.duration ?? 0;
          sprite.anims.timeScale =
            state.speed *
            (sprite.anims.currentAnim?.key.endsWith("-fire")
              ? Math.max(1, duration / (definition.cooldown * 800))
              : 1);
        }
        if (tower.windup > 0) {
          this.bars
            .lineStyle(2, 0xa3ead7, 0.9)
            .lineBetween(
              sprite.x + 22,
              worldY(tower.row) - 16,
              sprite.x + 34,
              worldY(tower.row) - 16,
            );
          this.bars
            .fillStyle(0xa3ead7)
            .fillCircle(sprite.x + 34, worldY(tower.row) - 16, 3);
        }
        // A stopped school animation must never resume over a static cutout.
        if (!artwork) {
          if (!moving || options.reducedMotion()) sprite.anims.pause();
          else sprite.anims.resume();
        }
        const danger = tower.health / definition.health < 0.3;
        const damaged = state.elapsed - tower.lastHitAt < 0.6;
        if (state.elapsed - tower.lastHitAt < 0.12 && animate)
          sprite.setTint(0xffbd9e).setTintMode(Phaser.TintModes.FILL);
        else sprite.clearTint();
        if (danger || damaged) {
          this.bars
            .lineStyle(danger ? 3 : 2, danger ? 0xff9c79 : 0xe4ba8d, 0.95)
            .strokeRoundedRect(
              worldX(tower.col + 0.5) - 37,
              worldY(tower.row) - 31,
              74,
              63,
              6,
            );
          if (danger)
            this.bars
              .fillStyle(0xffd2a8)
              .fillTriangle(
                sprite.x - 4,
                worldY(tower.row) - 42,
                sprite.x + 4,
                worldY(tower.row) - 42,
                sprite.x,
                worldY(tower.row) - 34,
              );
        }
        if (tower.health < definition.health)
          this.healthBar(
            sprite.x,
            worldY(tower.row) + 27,
            tower.health / definition.health,
            0x64cfb2,
          );
      }
      const activeEnemies = new Set(state.enemies.map((enemy) => enemy.id));
      for (const [id, sprite] of enemySprites)
        if (!activeEnemies.has(id)) {
          enemySprites.delete(id);
          if (
            state.phase !== "ready" &&
            sprite.x > FIELD.x &&
            !options.reducedMotion()
          ) {
            this.effects.add(sprite);
            sprite.clearTint().setAngle(0);
            if (sprite.getData("prototype")) {
              this.tweens.add({
                targets: sprite,
                alpha: 0,
                y: sprite.y + 5,
                duration: 220,
                onComplete: () => sprite.destroy(),
              });
            } else {
              sprite.play(`${sprite.getData("kind")}-die`);
              sprite.once("animationcomplete", () => sprite.destroy());
            }
          } else sprite.destroy();
        }
      for (const enemy of state.enemies) {
        const definition = ENEMIES[enemy.kind];
        const animation = `${definition.sprite}-${enemy.attacking ? "attack" : "walk"}`;
        let sprite = enemySprites.get(enemy.id);
        if (!sprite) {
          sprite = this.add
            .sprite(
              worldX(enemy.x),
              worldY(enemy.row) - 4,
              `${definition.sprite}-walk`,
            )
            .setDepth(5)
            .setData("kind", definition.sprite);
          sprite.setDisplaySize(definition.size, definition.size);
          enemySprites.set(enemy.id, sprite);
        }
        const artwork = expedition ? EXPEDITION_ENEMIES[enemy.kind] : undefined;
        const prototype = Boolean(artwork);
        if (sprite.getData("prototype") !== prototype) {
          sprite.setData("prototype", prototype);
          sprite.anims.stop();
          if (artwork) sprite.setTexture(artwork.key);
          else sprite.play(animation);
        }
        const x = enemy.previousX + (enemy.x - enemy.previousX) * alpha;
        const stride =
          prototype && animate && !enemy.attacking
            ? Math.sin(visualTime * 12 + enemy.id) * 1.2
            : 0;
        const hit = animate
          ? Math.max(0, (sprite.getData("hitUntil") ?? 0) - visualTime) / 0.14
          : 0;
        sprite
          .setOrigin(0.5, artwork?.foot ?? 1)
          .setPosition(
            worldX(x) + hit * (sprite.getData("resisted") ? 1.5 : 5),
            worldY(enemy.row) + 29 + stride,
          )
          .setAngle(hit * (enemy.id % 2 ? 3 : -3));
        if (artwork)
          sprite.setDisplaySize(artwork.width, artwork.height - hit * 2);
        else {
          if (sprite.anims.currentAnim?.key !== animation)
            sprite.play(animation);
          sprite.setDisplaySize(definition.size, definition.size - hit * 2);
        }
        if (hit > 0)
          sprite
            .setTint(sprite.getData("resisted") ? 0xbed5e4 : 0xffdbaf)
            .setTintMode(Phaser.TintModes.FILL);
        else sprite.clearTint();
        if (definition.armor) {
          this.bars
            .lineStyle(2, 0xaad1e2, 0.9)
            .strokeRoundedRect(
              sprite.x - 24,
              worldY(enemy.row) + 23,
              48,
              11,
              3,
            );
        }
        sprite.anims.timeScale = state.speed;
        if (!artwork) {
          if (!moving || options.reducedMotion()) sprite.anims.pause();
          else sprite.anims.resume();
        }
        this.healthBar(
          sprite.x,
          worldY(enemy.row) + 27,
          enemy.health / definition.health,
          enemy.kind === "tank" || enemy.kind === "gargantua"
            ? 0xffba7c
            : 0xee8e76,
        );
      }
      for (let row = 0; row < ROWS; row++) {
        const warning = state.incoming.find((item) => item.row === row);
        const label = this.laneWarnings[row];
        label.setVisible(Boolean(warning));
        if (!warning) continue;
        const marker =
          warning.threat === "heavy"
            ? "!!"
            : warning.threat === "armored"
              ? "◇"
              : "›";
        const color =
          warning.threat === "heavy"
            ? 0xf5a483
            : warning.threat === "armored"
              ? 0xb8d9e8
              : 0xa9dbc9;
        label
          .setText(`${marker} ${Math.ceil(warning.in)}s`)
          .setColor(`#${color.toString(16).padStart(6, "0")}`);
        this.bars
          .lineStyle(warning.threat === "standard" ? 2 : 3, color, 0.9)
          .lineBetween(
            worldX(8.95),
            worldY(row) - 28,
            worldX(8.95),
            worldY(row) + 28,
          );
      }
      const activeBullets = new Set(
        state.projectiles.map((projectile) => projectile.id),
      );
      for (const [id, sprite] of bulletSprites)
        if (!activeBullets.has(id)) {
          sprite.destroy();
          bulletSprites.delete(id);
        }
      for (const projectile of state.projectiles) {
        let sprite = bulletSprites.get(projectile.id);
        if (!sprite) {
          sprite = this.add
            .image(0, 0, AMMO[projectile.ammo].sprite)
            .setDisplaySize(27, 27)
            .setDepth(6);
          bulletSprites.set(projectile.id, sprite);
        }
        sprite.setPosition(
          worldX(
            projectile.previousX +
              (projectile.x - projectile.previousX) * alpha,
          ),
          worldY(projectile.row) - 9 + projectile.offset,
        );
        if (animate)
          this.bars
            .lineStyle(
              projectile.ammo === "tars" ? 3 : 2,
              AMMO[projectile.ammo].color,
              0.55,
            )
            .lineBetween(sprite.x - 17, sprite.y, sprite.x - 4, sprite.y);
      }
    }

    private healthBar(
      x: number,
      y: number,
      fraction: number,
      color: number,
    ): void {
      this.bars.fillStyle(0x0c1921, 0.85).fillRoundedRect(x - 21, y, 42, 4, 2);
      this.bars
        .fillStyle(color)
        .fillRoundedRect(x - 21, y, Math.max(0, fraction) * 42, 4, 2);
    }

    private renderHover(state: Snapshot): void {
      this.hover.clear();
      this.ghost.setVisible(false);
      const cursor = options.cursor();
      const selection = options.selection();
      if (!cursor || !selection || state.phase !== "playing") return;
      const occupied = state.towers.some(
        (tower) => tower.row === cursor.row && tower.col === cursor.col,
      );
      const valid =
        selection === "salvage"
          ? occupied
          : !occupied &&
            !isBlocked(state.map, cursor.row, cursor.col) &&
            state.credits >= TOWERS[selection].cost;
      if (valid && selection !== "salvage") {
        const artwork =
          options.artStyle() === "expedition"
            ? EXPEDITION_TOWERS[selection]
            : undefined;
        const texture = artwork?.key ?? `${TOWERS[selection].sprite}-idle`;
        this.ghost
          .setTexture(texture, 0)
          .setDisplaySize(artwork?.width ?? 78, artwork?.height ?? 78)
          .setOrigin(0.5, artwork?.foot ?? 1)
          .setPosition(worldX(cursor.col + 0.5), worldY(cursor.row) + 29)
          .setVisible(true);
      }
      const color = valid ? 0x6edcc0 : 0xe78871;
      const x = FIELD.x + cursor.col * FIELD.cellWidth;
      const y = FIELD.y + cursor.row * FIELD.cellHeight;
      this.hover
        .fillStyle(color, 0.16)
        .fillRoundedRect(
          x + 3,
          y + 3,
          FIELD.cellWidth - 6,
          FIELD.cellHeight - 6,
          5,
        );
      this.hover
        .lineStyle(2, color, 0.9)
        .strokeRoundedRect(
          x + 3,
          y + 3,
          FIELD.cellWidth - 6,
          FIELD.cellHeight - 6,
          5,
        );
    }

    private effect(event: GameEvent, state: Snapshot): void {
      const x = worldX(event.x);
      const y = worldY(event.row);
      if (event.type === "hit" && event.entityId !== undefined) {
        enemySprites
          .get(event.entityId)
          ?.setData("hitUntil", state.elapsed + 0.14)
          .setData("resisted", Boolean(event.resisted));
      }
      if (event.type === "shot" && event.kind && event.entityId !== undefined) {
        const sprite = towerSprites.get(event.entityId);
        const key = `${TOWERS[event.kind].sprite}-fire`;
        sprite?.setData("recoilUntil", state.elapsed + 0.12);
        if (
          sprite &&
          !sprite.getData("prototype") &&
          this.anims.exists(key) &&
          !options.reducedMotion()
        )
          sprite.play(key); // Each real release restarts a short attack, including rapid-fire units.
      }
      if (options.reducedMotion() || this.effects.length > 96) return;
      if (event.type === "hit" && (event.armored || (event.radius ?? 0) > 0)) {
        const ring = this.add
          .ellipse(
            x,
            y - 4,
            event.radius ? 2 * event.radius * FIELD.cellWidth : 20,
            event.radius ? FIELD.cellHeight * 0.6 : 13,
          )
          .setStrokeStyle(
            event.resisted ? 3 : 2,
            event.resisted ? 0xb8d9e8 : 0xa4e4c9,
          )
          .setDepth(9);
        this.effects.add(ring);
        this.tweens.add({
          targets: ring,
          scaleX: event.radius ? 1.04 : 1.8,
          scaleY: event.radius ? 1.04 : 1.8,
          alpha: 0,
          duration: 200,
          onComplete: () => ring.destroy(),
        });
        if (event.resisted) {
          const plate = this.add
            .text(x, y - 38, "PLATED", {
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#c5dfed",
            })
            .setOrigin(0.5)
            .setDepth(9);
          this.effects.add(plate);
          this.tweens.add({
            targets: plate,
            alpha: 0,
            y: y - 48,
            duration: 350,
            onComplete: () => plate.destroy(),
          });
        }
      }
      if (event.type === "defender-lost") {
        const ring = this.add
          .circle(x, y, 13)
          .setStrokeStyle(3, 0xf2aa81)
          .setDepth(9);
        this.effects.add(ring);
        this.tweens.add({
          targets: ring,
          scale: 2.4,
          alpha: 0,
          duration: 250,
          onComplete: () => ring.destroy(),
        });
      }
      if (event.type === "shot") {
        const flash = this.add.circle(x + 35, y - 12, 7, 0xb7f2db).setDepth(9);
        this.effects.add(flash);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          scale: 0.2,
          duration: 100,
          onComplete: () => flash.destroy(),
        });
      }
      if (
        event.type === "hit" ||
        event.type === "placed" ||
        event.type === "breach"
      ) {
        const color =
          event.type === "placed"
            ? 0x8cddc6
            : event.type === "breach"
              ? 0xff8f70
              : event.resisted
                ? 0xb8d9e8
                : event.kind === "zeus"
                  ? 0x9be7ef
                  : 0xffc28e;
        const count = event.type === "hit" ? 3 : 6;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const spark = this.add
            .circle(x, y - 4, (i % 2) + 1.5, color)
            .setDepth(9);
          this.effects.add(spark);
          this.tweens.add({
            targets: spark,
            x: x + Math.cos(angle) * 25,
            y: y + Math.sin(angle) * 25 - 4,
            alpha: 0,
            duration: 280,
            onComplete: () => spark.destroy(),
          });
        }
      }
      if (
        event.type === "income" ||
        event.type === "kill" ||
        event.type === "removed"
      ) {
        const text = this.add
          .text(x, y - 30, `+${event.amount}`, {
            fontFamily: "monospace",
            fontSize: "16px",
            color: "#a9e6bd",
            fontStyle: "bold",
          })
          .setOrigin(0.5)
          .setDepth(10);
        this.effects.add(text);
        this.tweens.add({
          targets: text,
          y: y - 65,
          alpha: 0,
          duration: 850,
          onComplete: () => text.destroy(),
        });
      }
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: FIELD.width,
    height: FIELD.height,
    parent: options.parent,
    backgroundColor: "#10212b",
    pixelArt: false,
    antialias: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: BattleScene,
    audio: { noAudio: true },
    loader: { timeout: 15000, maxRetries: 1 },
    input: { keyboard: false, mouse: false, touch: false },
  });
  return () => {
    towerSprites.clear();
    enemySprites.clear();
    bulletSprites.clear();
    game.destroy(true);
  };
}
