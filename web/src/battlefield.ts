import Phaser from "phaser";
import {
  AMMO,
  COLS,
  ENEMIES,
  isBlocked,
  MAPS,
  ROWS,
  TOWERS,
} from "./game/content";
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
      this.add.rectangle(540, 330, 1080, 660, 0x102330, 0.47);
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
      this.terrain = this.add.container(0, 0).setDepth(1);
      this.effects = this.add.container(0, 0).setDepth(9);
      this.renderMap(simulation.snapshot());
      this.hover = this.add.graphics().setDepth(2);
      this.bars = this.add.graphics().setDepth(8);
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
      this.lastElapsed = state.elapsed;
      this.renderMap(state);
      const moving = state.phase === "playing";
      this.renderEntities(state, moving);
      this.renderHover(state);
      for (const event of simulation.drainEvents()) {
        this.effect(event, state);
        options.onEvent(event);
      }
      if (options.reducedMotion())
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
      if (this.activeMap === state.map) return;
      this.activeMap = state.map;
      const map = MAPS[state.map];
      this.background.setTexture(map.background);
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
        sprite.anims.timeScale = state.speed;
        if (!moving || options.reducedMotion()) sprite.anims.pause();
        else sprite.anims.resume();
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
            sprite.play(`${sprite.getData("kind")}-die`);
            sprite.once("animationcomplete", () => sprite.destroy());
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
        sprite.setPosition(worldX(enemy.x), worldY(enemy.row) - 4);
        if (sprite.anims.currentAnim?.key !== animation) sprite.play(animation);
        sprite.anims.timeScale = state.speed;
        if (!moving || options.reducedMotion()) sprite.anims.pause();
        else sprite.anims.resume();
        this.healthBar(
          sprite.x,
          worldY(enemy.row) + 27,
          enemy.health / definition.health,
          enemy.kind === "tank" || enemy.kind === "gargantua"
            ? 0xffba7c
            : 0xee8e76,
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
          worldX(projectile.x),
          worldY(projectile.row) - 9 + projectile.offset,
        );
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
      if (event.type === "shot" && event.kind) {
        const tower = state.towers.find(
          (tower) =>
            tower.row === event.row && tower.col === Math.floor(event.x),
        );
        const key = `${TOWERS[event.kind].sprite}-fire`;
        if (tower && this.anims.exists(key) && !options.reducedMotion())
          towerSprites.get(tower.id)?.play(key, true);
      }
      if (options.reducedMotion()) return;
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
              : event.kind === "zeus"
                ? 0x9be7ef
                : 0xffc28e;
        const count = event.type === "hit" ? 5 : 8;
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
