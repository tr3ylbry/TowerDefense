import {
  COLS,
  ENEMIES,
  makeSpawns,
  ROWS,
  STEP,
  TOWERS,
  WAVES,
} from "./content";
import type { EnemyKind, Spawn, TowerKind } from "./content";

export type Phase = "ready" | "playing" | "paused" | "won" | "lost";
export interface Tower {
  id: number;
  kind: TowerKind;
  row: number;
  col: number;
  health: number;
  cooldown: number;
  incomeClock: number;
}
export interface Enemy {
  id: number;
  kind: EnemyKind;
  row: number;
  x: number;
  health: number;
  cooldown: number;
  attacking: boolean;
}
export interface Projectile {
  id: number;
  kind: TowerKind;
  row: number;
  x: number;
  damage: number;
}
export interface Snapshot {
  phase: Phase;
  elapsed: number;
  credits: number;
  integrity: number;
  kills: number;
  wave: number;
  speed: 1 | 2;
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  nextWaveIn: number | null;
  pendingSpawns: number;
}
export type GameEvent = {
  type:
    | "shot"
    | "hit"
    | "kill"
    | "income"
    | "placed"
    | "removed"
    | "breach"
    | "wave"
    | "end";
  row: number;
  x: number;
  kind?: TowerKind;
  amount?: number;
};
export interface ActionResult {
  ok: boolean;
  message: string;
}

/** One fixed-step clock owns all gameplay. Rendering and wall-clock timers never change rules. */
export class Simulation {
  private phase: Phase = "ready";
  private ticks = 0;
  private accumulator = 0;
  private credits = 230;
  private integrity = 3;
  private kills = 0;
  private speed: 1 | 2 = 1;
  private towers: Tower[] = [];
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private spawns: Spawn[];
  private spawnIndex = 0;
  private nextId = 1;
  private bankClock = 0;
  private wave = 0;
  private events: GameEvent[] = [];

  constructor(private readonly seed = 3352019) {
    this.spawns = makeSpawns(seed);
  }

  snapshot(): Snapshot {
    const elapsed = this.ticks * STEP;
    const nextWave = WAVES.find((wave) => wave.start > elapsed + 0.001);
    return {
      phase: this.phase,
      elapsed,
      credits: this.credits,
      integrity: this.integrity,
      kills: this.kills,
      wave: this.wave,
      speed: this.speed,
      towers: this.towers.map((tower) => ({ ...tower })),
      enemies: this.enemies.map((enemy) => ({ ...enemy })),
      projectiles: this.projectiles.map((projectile) => ({ ...projectile })),
      nextWaveIn: nextWave ? Math.ceil(nextWave.start - elapsed) : null,
      pendingSpawns: this.spawns.length - this.spawnIndex,
    };
  }

  start(): void {
    if (this.phase === "ready") this.phase = "playing";
  }
  pause(): void {
    if (this.phase === "playing") this.phase = "paused";
  }
  resume(): void {
    if (this.phase === "paused") this.phase = "playing";
  }
  togglePause(): void {
    if (this.phase === "playing") this.pause();
    else this.resume();
  }
  setSpeed(speed: 1 | 2): void {
    if (speed === 1 || speed === 2) this.speed = speed;
  }

  restart(): void {
    this.phase = "ready";
    this.ticks = 0;
    this.accumulator = 0;
    this.credits = 230;
    this.integrity = 3;
    this.kills = 0;
    this.speed = 1;
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.spawns = makeSpawns(this.seed);
    this.spawnIndex = 0;
    this.nextId = 1;
    this.bankClock = 0;
    this.wave = 0;
    this.events = [];
  }

  place(kind: TowerKind, row: number, col: number): ActionResult {
    if (this.phase !== "playing")
      return { ok: false, message: "Begin or resume the mission to deploy." };
    if (!this.validCell(row, col))
      return { ok: false, message: "Choose a tile inside the battlefield." };
    if (!Object.hasOwn(TOWERS, kind))
      return { ok: false, message: "Choose a crew member." };
    if (this.towers.some((tower) => tower.row === row && tower.col === col))
      return { ok: false, message: "That tile is already occupied." };
    const definition = TOWERS[kind];
    if (this.credits < definition.cost)
      return {
        ok: false,
        message: `Need ${definition.cost - this.credits} more credits for ${definition.name}.`,
      };
    this.credits -= definition.cost;
    this.towers.push({
      id: this.nextId++,
      kind,
      row,
      col,
      health: definition.health,
      cooldown: 0.1,
      incomeClock: 0,
    });
    this.events.push({ type: "placed", row, x: col + 0.5, kind });
    return {
      ok: true,
      message: `${definition.name} deployed in lane ${row + 1}.`,
    };
  }

  remove(row: number, col: number): ActionResult {
    if (this.phase !== "playing")
      return { ok: false, message: "Resume the mission to salvage." };
    if (!this.validCell(row, col))
      return { ok: false, message: "Choose a tile inside the battlefield." };
    const index = this.towers.findIndex(
      (tower) => tower.row === row && tower.col === col,
    );
    if (index < 0)
      return { ok: false, message: "Choose a deployed defender to salvage." };
    const [tower] = this.towers.splice(index, 1);
    const refund = Math.floor(TOWERS[tower.kind].cost * 0.4);
    this.credits += refund;
    this.events.push({ type: "removed", row, x: col + 0.5, amount: refund });
    return {
      ok: true,
      message: `Salvaged ${TOWERS[tower.kind].name} for ${refund} credits.`,
    };
  }

  /** Accepts elapsed time, not a frame count. The caller may clamp suspended-tab deltas. */
  advance(seconds: number): void {
    if (this.phase !== "playing" || !Number.isFinite(seconds) || seconds <= 0)
      return;
    this.accumulator += Math.min(seconds, 600) * this.speed;
    while (this.accumulator + 1e-9 >= STEP && this.phase === "playing") {
      this.accumulator = Math.max(0, this.accumulator - STEP);
      this.tick();
    }
  }

  drainEvents(): GameEvent[] {
    const events = this.events;
    this.events = [];
    return events;
  }

  private validCell(row: number, col: number): boolean {
    return (
      Number.isInteger(row) &&
      Number.isInteger(col) &&
      row >= 0 &&
      row < ROWS &&
      col >= 0 &&
      col < COLS
    );
  }

  private tick(): void {
    this.ticks++;
    const elapsed = this.ticks * STEP;
    this.bankClock += STEP;
    if (this.bankClock >= 5 - 1e-9) {
      this.bankClock -= 5;
      this.credits += 30;
    }

    while (
      this.spawnIndex < this.spawns.length &&
      this.spawns[this.spawnIndex].at <= elapsed + 1e-9
    ) {
      const spawn = this.spawns[this.spawnIndex++];
      if (spawn.wave !== this.wave) {
        this.wave = spawn.wave;
        this.events.push({ type: "wave", row: 0, x: 0, amount: this.wave });
      }
      this.enemies.push({
        id: this.nextId++,
        kind: spawn.kind,
        row: spawn.row,
        x: COLS + 0.5,
        health: ENEMIES[spawn.kind].health,
        cooldown: 0,
        attacking: false,
      });
    }

    for (const tower of this.towers) {
      const definition = TOWERS[tower.kind];
      if (definition.income) {
        tower.incomeClock += STEP;
        if (tower.incomeClock >= definition.incomeInterval - 1e-9) {
          tower.incomeClock -= definition.incomeInterval;
          this.credits += definition.income;
          this.events.push({
            type: "income",
            row: tower.row,
            x: tower.col + 0.5,
            amount: definition.income,
          });
        }
      }
      tower.cooldown = Math.max(0, tower.cooldown - STEP);
      if (
        definition.damage &&
        tower.cooldown < 1e-9 &&
        this.enemies.some(
          (enemy) =>
            enemy.row === tower.row &&
            enemy.x > tower.col + 0.2 &&
            enemy.health > 0,
        )
      ) {
        tower.cooldown = definition.cooldown;
        this.projectiles.push({
          id: this.nextId++,
          kind: tower.kind,
          row: tower.row,
          x: tower.col + 0.85,
          damage: definition.damage,
        });
        this.events.push({
          type: "shot",
          row: tower.row,
          x: tower.col + 0.5,
          kind: tower.kind,
        });
      }
    }

    for (const projectile of this.projectiles) {
      const nextX = projectile.x + 7 * STEP;
      const target = this.enemies
        .filter(
          (enemy) =>
            enemy.health > 0 &&
            enemy.row === projectile.row &&
            enemy.x >= projectile.x - 0.35 &&
            enemy.x <= nextX + 0.35,
        )
        .sort((a, b) => a.x - b.x)[0];
      if (target) {
        if (projectile.kind === "zeus") {
          for (const enemy of this.enemies)
            if (
              enemy.row === projectile.row &&
              Math.abs(enemy.x - target.x) <= 0.7
            )
              enemy.health -= projectile.damage;
        } else target.health -= projectile.damage;
        projectile.x = COLS + 2;
        this.events.push({
          type: "hit",
          row: target.row,
          x: target.x,
          kind: projectile.kind,
        });
      } else projectile.x = nextX;
    }
    this.projectiles = this.projectiles.filter(
      (projectile) => projectile.x < COLS + 1,
    );

    for (const enemy of this.enemies) {
      if (enemy.health <= 0) {
        this.kills++;
        this.credits += ENEMIES[enemy.kind].reward;
        this.events.push({
          type: "kill",
          row: enemy.row,
          x: enemy.x,
          amount: ENEMIES[enemy.kind].reward,
        });
        continue;
      }
      const definition = ENEMIES[enemy.kind];
      const blocker = this.towers
        .filter(
          (tower) =>
            tower.health > 0 &&
            tower.row === enemy.row &&
            tower.col + 0.5 <= enemy.x + 0.45 &&
            tower.col + 0.5 >= enemy.x - 0.55,
        )
        .sort((a, b) => b.col - a.col)[0];
      enemy.attacking = Boolean(blocker);
      enemy.cooldown = Math.max(0, enemy.cooldown - STEP);
      if (blocker) {
        if (enemy.cooldown < 1e-9) {
          blocker.health -= definition.damage;
          enemy.cooldown = definition.cooldown;
        }
      } else enemy.x -= definition.speed * STEP;
      if (enemy.x <= 0) {
        this.integrity--;
        enemy.health = 0;
        this.events.push({ type: "breach", row: enemy.row, x: 0 });
      }
    }
    this.enemies = this.enemies.filter((enemy) => enemy.health > 0);
    this.towers = this.towers.filter((tower) => tower.health > 0);

    if (this.integrity <= 0) {
      this.integrity = 0;
      this.phase = "lost";
      this.events.push({ type: "end", row: 0, x: 0 });
    } else if (
      this.spawnIndex === this.spawns.length &&
      this.enemies.length === 0
    ) {
      this.phase = "won";
      this.events.push({ type: "end", row: 0, x: 0 });
    }
  }
}
