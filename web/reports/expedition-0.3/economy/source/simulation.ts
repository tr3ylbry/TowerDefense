import {
  AMMO,
  COLS,
  ENEMIES,
  makeSpawns,
  isBlocked,
  MAPS,
  ROWS,
  STEP,
  TOWERS,
} from "./content";
import type { AmmoKind, EnemyKind, MapKind, Spawn, TowerKind } from "./content";

import { EARLY_WAVE_LEAD, earlyWaveReward, spawnWarnings } from "./waves";
import type { SpawnWarning } from "./waves";

export type Phase = "ready" | "playing" | "paused" | "won" | "lost";
export interface Tower {
  id: number;
  kind: TowerKind;
  row: number;
  col: number;
  health: number;
  cooldown: number;
  incomeClock: number;
  windup: number;
  lastHitAt: number;
}
export interface Enemy {
  id: number;
  kind: EnemyKind;
  row: number;
  x: number;
  previousX: number;
  health: number;
  cooldown: number;
  attacking: boolean;
}
export interface Projectile {
  ammo: AmmoKind;
  offset: number;
  id: number;
  kind: TowerKind;
  row: number;
  x: number;
  previousX: number;
  damage: number;
}
export interface NextWave {
  number: number;
  title: string;
  startAt: number;
  enemies: EnemyKind[];
  canLaunch: boolean;
  reward: number;
  secondsSaved: number;
  reason: string;
}
export interface Snapshot {
  map: MapKind;
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
  nextWave: NextWave | null;
  incoming: SpawnWarning[];
  earlyLaunches: number;
}
export type GameEvent = {
  type:
    | "wave-called"
    | "defender-hit"
    | "defender-lost"
    | "aim"
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
  entityId?: number;
  armored?: boolean;
  resisted?: boolean;
  radius?: number;
  enemyKind?: EnemyKind;
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
  private waveStarts: number[];
  private calledWaves = new Set<number>();
  private spawnIndex = 0;
  // IDs stay unique across restarts so the renderer cannot reuse a previous unit's sprite.
  private nextId = 1;
  private bankClock = 0;
  private wave = 0;
  private events: GameEvent[] = [];

  constructor(
    private readonly seed = 3352019,
    private map: MapKind = "canyon",
  ) {
    this.spawns = makeSpawns(seed, map);
    this.waveStarts = MAPS[map].waves.map((wave) => wave.start);
  }

  snapshot(): Snapshot {
    const elapsed = this.ticks * STEP;
    const nextWave = this.nextWave();
    return {
      map: this.map,
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
      nextWaveIn: nextWave
        ? Math.max(0, Math.ceil(nextWave.startAt - elapsed - 1e-9))
        : null,
      pendingSpawns: this.spawns.length - this.spawnIndex,
      nextWave,
      incoming:
        this.phase === "playing" || this.phase === "paused"
          ? spawnWarnings(this.spawns, this.spawnIndex, elapsed)
          : [],
      earlyLaunches: this.calledWaves.size,
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

  /** Mission selection never silently discards an active deployment. */
  chooseMap(map: MapKind): ActionResult {
    if (!Object.hasOwn(MAPS, map))
      return { ok: false, message: "Choose an available destination." };
    if (this.phase !== "ready")
      return {
        ok: false,
        message: "Restart the mission before changing destination.",
      };
    this.map = map;
    this.restart();
    return {
      ok: true,
      message: `${MAPS[map].name} selected. ${MAPS[map].description}`,
    };
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
    this.spawns = makeSpawns(this.seed, this.map);
    this.waveStarts = MAPS[this.map].waves.map((wave) => wave.start);
    this.calledWaves.clear();
    this.spawnIndex = 0;
    this.bankClock = 0;
    this.wave = 0;
    this.events = [];
  }

  /** A command changes the same schedule consumed by spawning and warnings. */
  launchNextWave(): ActionResult {
    const next = this.nextWave();
    if (!next?.canLaunch)
      return { ok: false, message: next?.reason ?? "No further wave to call." };
    const delta = next.secondsSaved;
    for (let index = this.wave; index < this.waveStarts.length; index++)
      this.waveStarts[index] =
        Math.round((this.waveStarts[index] - delta) / STEP) * STEP;
    for (let index = this.spawnIndex; index < this.spawns.length; index++)
      this.spawns[index].at =
        Math.round((this.spawns[index].at - delta) / STEP) * STEP;
    this.calledWaves.add(next.number);
    this.credits += next.reward;
    this.events.push({
      type: "wave-called",
      row: 0,
      x: 0,
      amount: next.reward,
    });
    return {
      ok: true,
      message: `Wave ${next.number} called. +${next.reward} credits. Arrivals in ${EARLY_WAVE_LEAD} seconds; existing hostiles remain.`,
    };
  }

  private nextWave(): NextWave | null {
    const definition = MAPS[this.map].waves[this.wave];
    if (!definition || this.phase === "won" || this.phase === "lost")
      return null;
    const startAt = this.waveStarts[this.wave];
    const secondsSaved = Math.max(
      0,
      startAt - this.ticks * STEP - EARLY_WAVE_LEAD,
    );
    const reward = earlyWaveReward(secondsSaved);
    const currentEntering = this.spawns[this.spawnIndex]?.wave === this.wave;
    const reason =
      this.phase !== "playing"
        ? "Resume or begin the mission to call a wave."
        : this.wave === 0
          ? "First contact keeps its preparation period."
          : this.calledWaves.has(this.wave + 1)
            ? "This wave has already been called."
            : currentEntering
              ? "Wait until the current wave finishes entering."
              : reward === 0
                ? "The next wave is already arriving soon."
                : "Calling overlaps any surviving hostiles. Later waves move earlier by the same amount.";
    const canLaunch =
      this.phase === "playing" &&
      this.wave > 0 &&
      !currentEntering &&
      !this.calledWaves.has(this.wave + 1) &&
      reward > 0;
    return {
      number: this.wave + 1,
      title: definition.title,
      startAt,
      enemies: [...definition.enemies],
      canLaunch,
      reward: canLaunch ? reward : 0,
      secondsSaved,
      reason,
    };
  }

  place(kind: TowerKind, row: number, col: number): ActionResult {
    if (this.phase !== "playing")
      return { ok: false, message: "Begin or resume the mission to deploy." };
    if (!this.validCell(row, col))
      return { ok: false, message: "Choose a tile inside the battlefield." };
    if (isBlocked(this.map, row, col))
      return {
        ok: false,
        message: "Acid pool. Defenders cannot deploy on this tile.",
      };
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
      windup: 0,
      lastHitAt: -1000,
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

  /** Draw between the last two rule updates; never feed interpolated positions into combat. */
  interpolationAlpha(): number {
    return Math.min(1, Math.max(0, this.accumulator / STEP));
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
        previousX: COLS + 0.5,
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
      if (!definition.damage) continue;
      const hasTarget = this.enemies.some(
        (enemy) =>
          enemy.row === tower.row &&
          enemy.x > tower.col + 0.2 &&
          enemy.health > 0,
      );
      if (tower.windup > 0) {
        tower.windup = Math.max(0, tower.windup - STEP);
        if (tower.windup < 1e-9) tower.windup = 0;
        if (tower.windup === 0 && hasTarget) {
          definition.ammo.forEach((ammo, index) => {
            const x = tower.col + 0.85;
            this.projectiles.push({
              id: this.nextId++,
              kind: tower.kind,
              ammo,
              offset: (index - (definition.ammo.length - 1) / 2) * 10,
              row: tower.row,
              x,
              previousX: x,
              damage: definition.damage,
            });
          });
          this.events.push({
            type: "shot",
            row: tower.row,
            x: tower.col + 0.5,
            kind: tower.kind,
            entityId: tower.id,
          });
        }
      } else if (definition.damage && tower.cooldown < 1e-9 && hasTarget) {
        tower.cooldown = definition.cooldown;
        tower.windup = definition.windup;
        this.events.push({
          type: "aim",
          row: tower.row,
          x: tower.col + 0.5,
          kind: tower.kind,
          entityId: tower.id,
        });
      }
    }

    for (const projectile of this.projectiles) {
      projectile.previousX = projectile.x;
      const nextX = projectile.x + AMMO[projectile.ammo].speed * STEP;
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
        const radius = TOWERS[projectile.kind].splashRadius;
        if (radius > 0) {
          for (const enemy of this.enemies)
            if (
              enemy.row === projectile.row &&
              Math.abs(enemy.x - target.x) <= radius
            )
              enemy.health -= damageAgainstArmor(
                projectile.damage,
                ENEMIES[enemy.kind].armor,
                TOWERS[projectile.kind].armorPierce,
              );
        } else
          target.health -= damageAgainstArmor(
            projectile.damage,
            ENEMIES[target.kind].armor,
            TOWERS[projectile.kind].armorPierce,
          );
        projectile.x = COLS + 2;
        this.events.push({
          type: "hit",
          row: target.row,
          x: target.x,
          kind: projectile.kind,
          entityId: target.id,
          armored: ENEMIES[target.kind].armor > 0,
          resisted:
            ENEMIES[target.kind].armor *
              (1 - TOWERS[projectile.kind].armorPierce) >=
            0.5,
          radius,
          amount: damageAgainstArmor(
            projectile.damage,
            ENEMIES[target.kind].armor,
            TOWERS[projectile.kind].armorPierce,
          ),
        });
      } else projectile.x = nextX;
    }
    this.projectiles = this.projectiles.filter(
      (projectile) => projectile.x < COLS + 1,
    );

    for (const enemy of this.enemies) {
      enemy.previousX = enemy.x;
      if (enemy.health <= 0) {
        this.kills++;
        this.credits += ENEMIES[enemy.kind].reward;
        this.events.push({
          type: "kill",
          row: enemy.row,
          x: enemy.x,
          amount: ENEMIES[enemy.kind].reward,
          entityId: enemy.id,
          enemyKind: enemy.kind,
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
          blocker.lastHitAt = elapsed;
          this.events.push({
            type: "defender-hit",
            row: blocker.row,
            x: blocker.col + 0.5,
            entityId: blocker.id,
            kind: blocker.kind,
            amount: definition.damage,
          });
          if (blocker.health <= 0)
            this.events.push({
              type: "defender-lost",
              row: blocker.row,
              x: blocker.col + 0.5,
              entityId: blocker.id,
              kind: blocker.kind,
            });
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

/** Piercing bypasses a fraction of plating; unarmored targets take normal damage. */
export function damageAgainstArmor(
  damage: number,
  armor: number,
  piercing: number,
): number {
  return damage * (1 - armor * (1 - piercing));
}
