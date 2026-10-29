#!/usr/bin/env python3
"""Rebuild compact web sprites from the untouched school project's assets.

Run from the repository root: python3 web/scripts/prepare-assets.py
Requires Pillow. Outputs are written only to web/public/art.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageSequence


REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE = REPO_ROOT / "assets"
OUTPUT = REPO_ROOT / "web" / "public" / "art"
TILE_SIZE = 128
PADDING = 4


def union_bounds(frames: list[Image.Image]) -> tuple[int, int, int, int]:
    bounds = [frame.getbbox() for frame in frames]
    visible = [bound for bound in bounds if bound is not None]
    if not visible:
        raise ValueError("Sprite contains no visible pixels")
    return (
        min(bound[0] for bound in visible),
        min(bound[1] for bound in visible),
        max(bound[2] for bound in visible),
        max(bound[3] for bound in visible),
    )


def write_strip(
    key: str,
    frames: list[Image.Image],
    fps: float,
    bounds: tuple[int, int, int, int],
    resampling: Image.Resampling,
    sources: list[str],
) -> dict:
    """Use one crop/scale per animation so individual frames never jitter."""
    # Keep sheets within a 4096px texture limit on older mobile GPUs. Phaser's
    # spritesheet loader reads multi-row frames without special atlas handling.
    columns = 17 if len(frames) > 32 else len(frames)
    rows = (len(frames) + columns - 1) // columns
    strip = Image.new("RGBA", (TILE_SIZE * columns, TILE_SIZE * rows))
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    scale = min((TILE_SIZE - PADDING * 2) / width, (TILE_SIZE - PADDING * 2) / height)
    size = (max(1, round(width * scale)), max(1, round(height * scale)))
    left = (TILE_SIZE - size[0]) // 2
    top = TILE_SIZE - PADDING - size[1]
    for index, frame in enumerate(frames):
        rendered = frame.crop(bounds).resize(size, resampling)
        # Original GIFs use invisible yellow palette entries. Normalize their RGB
        # to transparent black so image viewers and texture sampling stay clean.
        normalized = Image.new("RGBA", size)
        normalized.alpha_composite(rendered)
        # Preserve RGBA directly; using an alpha mask here would multiply alpha.
        strip.paste(normalized, (
            (index % columns) * TILE_SIZE + left,
            (index // columns) * TILE_SIZE + top,
        ))
    filename = f"{key}.png"
    strip.save(OUTPUT / filename, optimize=True)
    entry = {
        "key": key,
        "file": filename,
        "frameWidth": TILE_SIZE,
        "frameHeight": TILE_SIZE,
        "frames": len(frames),
        "fps": round(fps, 6),
        "bytes": (OUTPUT / filename).stat().st_size,
        "sources": sources,
    }
    if rows > 1:
        entry.update({"columns": columns, "rows": rows})
    return entry


def read_gif(relative: str) -> tuple[list[Image.Image], float]:
    with Image.open(SOURCE / relative) as source:
        # Pillow coalesces GIF disposal before conversion to independent RGBA frames.
        frames = []
        durations = []
        for frame in ImageSequence.Iterator(source):
            frames.append(frame.convert("RGBA"))
            durations.append(frame.info.get("duration", 100))
    if not durations or any(duration <= 0 for duration in durations):
        raise ValueError(f"Invalid animation timing: {relative}")
    if len(set(durations)) != 1:
        raise ValueError(f"Variable frame timing requires explicit support: {relative}")
    return frames, 1000 / durations[0]


def prepare_defender(name: str, animations: dict[str, str]) -> list[dict]:
    decoded = {state: read_gif(relative) for state, relative in animations.items()}
    # Startrell's original idle/firing GIFs have different canvas resolutions.
    # Normalize their logical canvas before sharing placement bounds.
    canvas = (
        max(frame.width for frames, _ in decoded.values() for frame in frames),
        max(frame.height for frames, _ in decoded.values() for frame in frames),
    )
    decoded = {
        state: ([frame if frame.size == canvas else frame.resize(canvas, Image.Resampling.NEAREST)
                 for frame in frames], fps)
        for state, (frames, fps) in decoded.items()
    }
    # Idle/firing share crop and scale, keeping the character stationary on switch.
    bounds = union_bounds([frame for frames, _ in decoded.values() for frame in frames])
    return [
        write_strip(
            f"{name}-{state}", frames, fps, bounds, Image.Resampling.NEAREST,
            [animations[state]],
        )
        for state, (frames, fps) in decoded.items()
    ]


def prepare_enemy(
    name: str,
    source_name: str,
    specs: list[tuple[str, int, int, int, int]],
    duplicate_final_state: str | None = None,
) -> list[dict]:
    entries = []
    for state, count, width, height, cycle_ms in specs:
        relative = f"aliens/{source_name}-{state}-spritesheet.png"
        with Image.open(SOURCE / relative) as source:
            rgba = source.convert("RGBA")
            has_duplicate = state == duplicate_final_state
            expected_width = (count + int(has_duplicate)) * width
            if source.size != (expected_width, height):
                raise ValueError(f"Sheet dimensions do not match verified Java metadata: {relative}")
            frames = [rgba.crop((index * width, 0, (index + 1) * width, height)) for index in range(count)]
            if has_duplicate:
                trailing = rgba.crop((count * width, 0, (count + 1) * width, height))
                if trailing.tobytes() != frames[-1].tobytes():
                    raise ValueError(f"Expected redundant trailing frame has changed: {relative}")
        entry = write_strip(
            f"{name}-{state}", frames, count * 1000 / cycle_ms,
            union_bounds(frames), Image.Resampling.LANCZOS, [relative],
        )
        if has_duplicate:
            entry["sourceFrames"] = count + 1
            entry["sourceNote"] = "Original Java uses 21 of 22 frames; final source frame duplicates the preceding frame."
        entries.append(entry)
    return entries


def prepare_background(key: str, relative: str, width: int, height: int) -> dict:
    with Image.open(SOURCE / relative) as source:
        background = source.convert("RGB").resize((width, height), Image.Resampling.LANCZOS)
        filename = f"{key}.webp"
        background.save(OUTPUT / filename, quality=82, method=6)
    return {
        "key": key, "file": filename, "width": width, "height": height,
        "bytes": (OUTPUT / filename).stat().st_size, "source": relative,
    }


def prepare_image(key: str, relative: str, max_size: int) -> dict:
    with Image.open(SOURCE / relative) as source:
        image = source.convert("RGBA")
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        # Transparent RGB entries in legacy images may contain palette colors.
        normalized = Image.new("RGBA", image.size)
        normalized.alpha_composite(image)
        filename = f"{key}.png"
        normalized.save(OUTPUT / filename, optimize=True)
    return {
        "key": key, "file": filename, "width": image.width, "height": image.height,
        "bytes": (OUTPUT / filename).stat().st_size, "source": relative,
    }


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    sprites = []
    for name, animations in [
        ("astro-joe", {"idle": "defenders/astro-joe.gif", "fire": "defenders/astro-joe-firing.gif"}),
        ("money-bush", {"idle": "defenders/money-bush.gif"}),
        ("asteroid", {"idle": "defenders/asteroid.gif"}),
        ("moon-zeus", {"idle": "defenders/moon-zeus.gif", "fire": "defenders/moon-zeus-firing.gif"}),
        ("explosive-astro-joe", {"idle": "defenders/explosive-astro-joe.gif"}),
        ("startrell-cluggins", {"idle": "defenders/startrell-cluggins.gif", "fire": "defenders/startrell-cluggins-firing.gif"}),
        ("tars", {"idle": "defenders/tars.gif", "fire": "defenders/tars-firing.gif"}),
        ("money-tree", {"idle": "defenders/money-tree.gif"}),
        ("millennium-falcon", {"idle": "defenders/spaceship.gif", "fire": "defenders/spaceship-firing.gif"}),
        ("astro-joe-alt", {"idle": "defenders/astro-joe-gif.gif"}),
        ("space-ambient", {"idle": "general/space-gif.gif"}),
    ]:
        sprites.extend(prepare_defender(name, animations))
    sprites.extend(prepare_enemy("little-green-man", "littlegreenman", [
        ("walk", 17, 428, 298, 1500),
        ("attack", 13, 637, 336, 1000),
        ("die", 15, 727, 387, 1700),
    ]))
    sprites.extend(prepare_enemy("grunt", "grunt", [
        ("walk", 13, 734, 386, 1000),
        ("attack", 9, 756, 523, 1000),
        ("die", 13, 771, 390, 1000),
    ]))
    sprites.extend(prepare_enemy("sprinter", "sprinter", [
        ("walk", 17, 985, 743, 750),
        ("attack", 13, 1008, 773, 1000),
        ("die", 21, 1544, 849, 1500),
    ]))
    sprites.extend(prepare_enemy("tank", "tank", [
        ("walk", 17, 885, 686, 1700),
        ("attack", 17, 788, 1135, 1800),
        ("die", 23, 1332, 1173, 2000),
    ]))
    sprites.extend(prepare_enemy("manhunter", "manhunter", [
        ("walk", 33, 687, 632, 1300),
        ("attack", 33, 1117, 1040, 1500),
        ("die", 21, 1141, 729, 1500),
    ], duplicate_final_state="die"))
    sprites.extend(prepare_enemy("gargantua", "gargantua", [
        ("walk", 17, 939, 712, 1500),
        ("attack", 13, 1249, 767, 1500),
        ("die", 13, 1181, 703, 1500),
    ]))
    backgrounds = [
        prepare_background(f"stage-{number}", f"general/stage-{number}-background.png", 1440, 810)
        for number in ["one", "two", "three"]
    ]
    for key, filename in [
        ("moon-menu", "moon-background.png"),
        ("pause-menu", "pause-background.png"),
        ("game-over-menu", "game-over-background.png"),
        ("winning-menu", "winning-background.png"),
    ]:
        with Image.open(SOURCE / "general" / filename) as source:
            width = min(1200, source.width)
            height = round(source.height * width / source.width)
        backgrounds.append(prepare_background(key, f"general/{filename}", width, height))
    images = []
    for folder, prefix, max_size in [("defenders", "portrait", 256), ("ammo", "projectile", 96)]:
        for source in sorted((SOURCE / folder).glob("*.png")):
            images.append(prepare_image(f"{prefix}-{source.stem}", f"{folder}/{source.name}", max_size))
    for filename, max_size in [
        ("game-title.png", 875), ("winning-title.png", 640), ("game-over-title.png", 640),
        ("spacebucks-image.png", 256), ("alien-sample.png", 256), ("acid-pool.png", 512),
        ("placement-square.png", 256), ("placement-square copy.png", 256),
        ("green-circle.png", 256), ("removeX.jpg", 70),
    ]:
        key = Path(filename).stem.replace(" ", "-").replace("removeX", "remove-x")
        images.append(prepare_image(key, f"general/{filename}", max_size))
    manifest = {
        "provenance": {
            "collection": "Original Astronauts VS Aliens school project",
            "sourceRoot": "assets",
            "originalRepository": "https://github.com/tr3ylbry/TowerDefense",
            "assetCopyright": "Authorship and licenses of individual graphics are not documented in the original repository.",
            "derivation": "Resized and repacked from the original collection; no external assets added.",
        },
        # Retain the original singleton for the first encounter's existing loader.
        "background": backgrounds[0],
        "backgrounds": backgrounds,
        "sprites": sprites,
        "images": images,
    }
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    for entry in sprites:
        print(f"{entry['key']}: {entry['frames']} frames at {entry['fps']} FPS, {entry['bytes']:,} bytes")
    total = sum(entry["bytes"] for group in [sprites, backgrounds, images] for entry in group)
    print(f"{len(sprites)} animations, {len(backgrounds)} backgrounds, {len(images)} static images; total art: {total:,} bytes")


if __name__ == "__main__":
    main()
