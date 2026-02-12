#!/usr/bin/env python3
import hashlib
import json
import math
from pathlib import Path

SIZE = 16
TRANSPARENT = -1

PALETTES = {
    "fire": ["#2a0900", "#8a1a00", "#ff6b00", "#ffd166"],
    "water": ["#041a33", "#0a4d8c", "#35a7ff", "#c7f2ff"],
    "electric": ["#1b1730", "#4a3b8f", "#9f7aea", "#ffe066"],
    "nature": ["#0c2b12", "#1d6b35", "#62c46a", "#d7f7c8"],
    "dark": ["#120914", "#3b1c4f", "#7a3fb0", "#f18fff"],
    "poison": ["#1a0822", "#4b1c6d", "#8a35b5", "#d78cff"],
    "holy": ["#1f1a08", "#6f5315", "#e7b93f", "#fff4bf"],
    "metal": ["#151921", "#36404f", "#8ea4bc", "#e4ecf4"],
    "earth": ["#22160c", "#6b4520", "#b07a3b", "#f2c98a"],
    "wind": ["#0b1f1f", "#1f5757", "#67b8b8", "#d1f6f6"],
    "neutral": ["#202020", "#4b4b4b", "#9a9a9a", "#f0f0f0"],
}

PALETTE_KEYWORDS = {
    "fire": ["fire", "flame", "burn", "blaze", "heat", "inferno", "volcano", "sol", "sun", "flare", "magma", "explosion"],
    "water": ["water", "aqua", "hydro", "sea", "ocean", "wave", "bubble", "flood", "ice", "frost", "blizzard", "snow"],
    "electric": ["thunder", "bolt", "spark", "lightning", "elect", "volt", "plasma"],
    "nature": ["leaf", "flower", "vine", "seed", "wood", "forest", "plant", "petal", "grass"],
    "poison": ["poison", "venom", "toxin", "acid", "toxic", "smog"],
    "dark": ["dark", "death", "night", "shadow", "evil", "doom", "hell", "abyss", "black"],
    "holy": ["holy", "heaven", "divine", "angel", "saint", "light", "paradise"],
    "metal": ["cannon", "missile", "laser", "beam", "gun", "blaster", "rocket", "bullet", "gear", "metal", "machine"],
    "earth": ["rock", "stone", "quake", "drill", "sand", "mount", "terra"],
    "wind": ["wind", "tornado", "hurricane", "cyclone", "gust", "air", "storm", "sweep"],
}

MOTIF_KEYWORDS = {
    "bolt": ["thunder", "bolt", "lightning", "elect", "volt", "plasma"],
    "arrow": ["arrow", "dart", "needle", "shot", "pierce", "stinger", "spear", "harpoon"],
    "blade": ["claw", "fang", "slash", "blade", "sword", "cut", "edge", "nail"],
    "wave": ["wave", "howl", "song", "melody", "serenade", "cry", "sound", "scream"],
    "seed": ["seed", "leaf", "flower", "vine", "petal", "spore", "pollen"],
    "star": ["star", "nova", "comet", "meteor", "cosmo", "galaxy"],
    "rocket": ["cannon", "missile", "laser", "beam", "gun", "blaster", "rocket", "bullet"],
    "skull": ["death", "poison", "toxin", "venom", "doom", "nightmare"],
    "burst": ["bomb", "blast", "explosion", "burst", "flare", "shot"],
}


def blank():
    return [[TRANSPARENT for _ in range(SIZE)] for _ in range(SIZE)]


def set_px(grid, x, y, color):
    if 0 <= x < SIZE and 0 <= y < SIZE:
        grid[y][x] = color


def draw_circle(grid, cx, cy, r_outer, r_inner, color_outer, color_inner):
    for y in range(SIZE):
        for x in range(SIZE):
            d = math.dist((x, y), (cx, cy))
            if d <= r_outer:
                set_px(grid, x, y, color_outer)
            if d <= r_inner:
                set_px(grid, x, y, color_inner)


def draw_line(grid, x0, y0, x1, y1, color):
    dx = abs(x1 - x0)
    dy = -abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx + dy
    while True:
        set_px(grid, x0, y0, color)
        if x0 == x1 and y0 == y1:
            break
        e2 = 2 * err
        if e2 >= dy:
            err += dy
            x0 += sx
        if e2 <= dx:
            err += dx
            y0 += sy


def draw_orb(grid, pal):
    draw_circle(grid, 8, 8, 5.5, 3.5, pal[1], pal[2])
    draw_circle(grid, 6, 6, 1.8, 0.7, pal[3], pal[3])


def draw_bolt(grid, pal):
    points = [(5, 2), (9, 2), (7, 6), (11, 6), (6, 13), (7, 8), (4, 8)]
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        draw_line(grid, x0, y0, x1, y1, pal[2])
    for x in range(SIZE):
        for y in range(SIZE):
            if grid[y][x] == pal[2]:
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    if 0 <= x + dx < SIZE and 0 <= y + dy < SIZE and grid[y + dy][x + dx] == TRANSPARENT:
                        grid[y + dy][x + dx] = pal[1]


def draw_arrow(grid, pal):
    for x in range(2, 12):
        set_px(grid, x, 8, pal[2])
    for y in range(6, 11):
        set_px(grid, 11, y, pal[2])
    for i in range(4):
        set_px(grid, 11 + i, 8 - i, pal[2])
        set_px(grid, 11 + i, 8 + i, pal[2])
    for x in range(2, 6):
        set_px(grid, x, 7, pal[1])
        set_px(grid, x, 9, pal[1])


def draw_blade(grid, pal):
    for y in range(3, 13):
        x = 5 + (y - 3) // 2
        set_px(grid, x, y, pal[2])
        set_px(grid, x + 1, y, pal[2])
        if y % 2 == 0:
            set_px(grid, x + 2, y, pal[1])
    for x in range(3, 8):
        set_px(grid, x, 13, pal[1])
    set_px(grid, 7, 2, pal[3])


def draw_wave(grid, pal):
    for x in range(2, 14):
        y = 8 + int(2 * math.sin((x - 2) * 0.7))
        set_px(grid, x, y, pal[2])
        set_px(grid, x, y + 1, pal[1])
    for x in range(3, 13):
        set_px(grid, x, 6, pal[1])


def draw_seed(grid, pal):
    for y in range(3, 13):
        w = 1 + (5 - abs(8 - y)) // 2
        for x in range(8 - w, 8 + w + 1):
            set_px(grid, x, y, pal[2])
    draw_line(grid, 8, 4, 8, 12, pal[1])
    set_px(grid, 6, 6, pal[3])


def draw_star(grid, pal):
    points = [(8, 1), (9, 6), (14, 8), (9, 10), (8, 15), (7, 10), (2, 8), (7, 6)]
    for (x0, y0), (x1, y1) in zip(points, points[1:] + [points[0]]):
        draw_line(grid, x0, y0, x1, y1, pal[2])
    draw_circle(grid, 8, 8, 2.2, 1.2, pal[1], pal[3])


def draw_rocket(grid, pal):
    for y in range(2, 12):
        set_px(grid, 8, y, pal[2])
        set_px(grid, 7, y, pal[1])
        set_px(grid, 9, y, pal[1])
    set_px(grid, 8, 1, pal[3])
    set_px(grid, 7, 12, pal[2])
    set_px(grid, 9, 12, pal[2])
    for y in range(12, 16):
        set_px(grid, 8, y, pal[3 if y % 2 == 0 else 2])


def draw_skull(grid, pal):
    draw_circle(grid, 8, 6, 4.5, 3.5, pal[1], pal[2])
    set_px(grid, 6, 6, pal[0])
    set_px(grid, 10, 6, pal[0])
    for x in range(6, 11):
        set_px(grid, x, 10, pal[1])
    for x in [7, 8, 9]:
        set_px(grid, x, 11, pal[1])


def draw_burst(grid, pal):
    for i in range(2, 7):
        draw_line(grid, 8, 8, 8 + i, 8, pal[2])
        draw_line(grid, 8, 8, 8 - i, 8, pal[2])
        draw_line(grid, 8, 8, 8, 8 + i, pal[2])
        draw_line(grid, 8, 8, 8, 8 - i, pal[2])
    draw_circle(grid, 8, 8, 2.8, 1.5, pal[1], pal[3])


def choose_palette(name, element):
    s = (name or "").lower()
    for key, words in PALETTE_KEYWORDS.items():
        if any(w in s for w in words):
            return PALETTES[key]
    e = (element or "").lower()
    if e == "virus":
        return PALETTES["dark"]
    if e == "vaccine":
        return PALETTES["holy"]
    if e == "data":
        return PALETTES["electric"]
    return PALETTES["neutral"]


def choose_motif(name):
    s = (name or "").lower()
    for motif, words in MOTIF_KEYWORDS.items():
        if any(w in s for w in words):
            return motif
    if "special attack" in s:
        return "orb"
    return "orb"


def render_svg(grid, path):
    rects = []
    for y in range(SIZE):
        for x in range(SIZE):
            color = grid[y][x]
            if color == TRANSPARENT:
                continue
            rects.append(f'<rect x="{x}" y="{y}" width="1" height="1" fill="{color}"/>')
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges">'
        + "".join(rects)
        + "</svg>"
    )
    path.write_text(svg, encoding="utf8")


def generate_for_character(char):
    attack = (char.get("specialAttackName") or "Special Attack").strip()
    element = char.get("element") or ""
    sprite_path = Path(char.get("specialAttackSprite") or f"data/ui/special_attacks/{char['id']}.svg")
    char["specialAttackSprite"] = str(sprite_path)

    palette = choose_palette(attack, element)
    motif = choose_motif(attack)
    grid = blank()

    if motif == "bolt":
        draw_bolt(grid, palette)
    elif motif == "arrow":
        draw_arrow(grid, palette)
    elif motif == "blade":
        draw_blade(grid, palette)
    elif motif == "wave":
        draw_wave(grid, palette)
    elif motif == "seed":
        draw_seed(grid, palette)
    elif motif == "star":
        draw_star(grid, palette)
    elif motif == "rocket":
        draw_rocket(grid, palette)
    elif motif == "skull":
        draw_skull(grid, palette)
    elif motif == "burst":
        draw_burst(grid, palette)
    else:
        draw_orb(grid, palette)

    # deterministic variation per character+attack
    h = int(hashlib.md5(f"{char.get('id','')}::{attack}".encode("utf8")).hexdigest(), 16)
    if h % 3 == 0:
        grid = [row[::-1] for row in grid]
    if h % 5 == 0:
        grid = grid[::-1]
    if h % 7 == 0:
        # small sparkle accent
        x = 2 + (h % 12)
        y = 1 + ((h >> 4) % 5)
        set_px(grid, x, y, palette[3])

    sprite_path.parent.mkdir(parents=True, exist_ok=True)
    render_svg(grid, sprite_path)


def main():
    chars_path = Path("data/characters.json")
    chars = json.loads(chars_path.read_text(encoding="utf8"))
    for c in chars:
        generate_for_character(c)
    chars_path.write_text(json.dumps(chars, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(f"generated {len(chars)} special attack sprites")


if __name__ == "__main__":
    main()
