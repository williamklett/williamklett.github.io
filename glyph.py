"""Procedural glyph signatures, à la Xenosystems / accelerationist cover art.

Each call returns inline SVG: a row (or block) of closed bezier blob
shapes, seeded so the same input always yields the same shape sequence.
Used as page sigils — a per-URL deterministic mark that makes browsing
feel like flipping through sealed cybernetic artifacts.

The shapes are intentionally not letters. They're not unicode hieroglyphs
either (font dependency, look too literal). They are seeded blob paths
that read as fictional script — alien, post-AGI, accelerationist.
"""
from __future__ import annotations

import hashlib
import math
import random


def _rng(seed: str) -> random.Random:
    h = hashlib.sha256(seed.encode()).digest()
    r = random.Random()
    r.seed(int.from_bytes(h[:8], "big"))
    return r


def _glyph_path(rng: random.Random, w: float, h: float, beefy: bool = False) -> str:
    """Random closed blob path inside a `w × h` cell.
    'beefy' mode uses more points and less margin to fill the cell more solidly."""
    cx, cy = w / 2, h / 2
    n_points = rng.randint(8, 12) if beefy else rng.randint(5, 9)
    margin = min(w, h) * (0.05 if beefy else 0.15)
    max_r = (min(w, h) - 2 * margin) / 2
    pts: list[tuple[float, float]] = []
    base_rot = rng.uniform(0, 2 * math.pi)
    for i in range(n_points):
        angle = base_rot + i * 2 * math.pi / n_points + rng.uniform(-0.2, 0.2)
        radius = rng.uniform(0.7 if beefy else 0.35, 1.0) * max_r
        x = cx + radius * math.cos(angle)
        y = cy + radius * math.sin(angle)
        pts.append((x, y))

    # Smooth quadratic bezier between successive anchor points.
    parts = [f"M {pts[0][0]:.1f} {pts[0][1]:.1f}"]
    for i in range(len(pts)):
        nxt = pts[(i + 1) % len(pts)]
        # control point biased away from the centroid for spikiness
        jitter = 0.1 if beefy else 0.18
        mx = (pts[i][0] + nxt[0]) / 2 + rng.uniform(-w * jitter, w * jitter)
        my = (pts[i][1] + nxt[1]) / 2 + rng.uniform(-h * jitter, h * jitter)
        parts.append(f"Q {mx:.1f} {my:.1f} {nxt[0]:.1f} {nxt[1]:.1f}")
    parts.append("Z")
    return " ".join(parts)


def glyph_row(seed: str, n: int = 14, cell: int = 30, color: str = "#7c70b8") -> str:
    """Single horizontal row of `n` seeded blob glyphs."""
    rng = _rng(seed)
    w_total = n * cell
    h_total = cell
    cells = []
    for c in range(n):
        d = _glyph_path(rng, cell, cell)
        cells.append(
            f'<g class="glyph-item" transform="translate({c * cell} 0)">'
            f'<path d="{d}" fill="{color}"/></g>'
        )
    return (
        f'<svg class="glyph-row interactive-glyphs" width="100%" height="{h_total}" '
        f'viewBox="0 0 {w_total} {h_total}" preserveAspectRatio="xMidYMid meet" '
        f'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
        f'{"".join(cells)}</svg>'
    )


def glyph_texture(
    seed: str = "stone-texture",
    tile: int = 480,
    n: int = 60,
    size_lo: float = 18,
    size_hi: float = 38,
    color: str = "#7c70b8",
    opacity: float = 0.07,
) -> str:
    """Tileable SVG of sparsely scattered blob glyphs.

    Used as the body background — adds Land-flavored noise to the
    stone-paper. Each glyph is randomly positioned, scaled, and rotated
    within the tile so the repeat is visually unobtrusive."""
    rng = _rng(seed)
    glyphs = []
    for _ in range(n):
        size = rng.uniform(size_lo, size_hi)
        x = rng.uniform(-size * 0.3, tile - size * 0.7)
        y = rng.uniform(-size * 0.3, tile - size * 0.7)
        rot = rng.uniform(0, 360)
        d = _glyph_path(rng, size, size)
        glyphs.append(
            f'<g transform="translate({x:.1f} {y:.1f}) rotate({rot:.1f} {size/2:.1f} {size/2:.1f})">'
            f'<path d="{d}" fill="{color}" fill-opacity="{opacity:.3f}"/></g>'
        )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{tile}" height="{tile}" '
        f'viewBox="0 0 {tile} {tile}">{"".join(glyphs)}</svg>'
    )


def halftone_strip(
    width: int = 1600,
    height: int = 60,
    grid: int = 5,
    color: str = "#0a0a09",
) -> str:
    """Fine vertical halftone fade: small dots, dense at the top, fading
    quickly into the stone body. Sits between the black header and the
    main page."""
    cells_x = width // grid + 2
    cells_y = height // grid + 2
    dots = []
    for j in range(cells_y):
        y = j * grid + grid / 2
        # Smooth density falloff. Quadrupled so it drops off extremely fast.
        t = (j * grid) / height
        density = max(0.0, 1.0 - t) ** 4
        for i in range(cells_x):
            x = i * grid + grid / 2
            # Per-cell jitter so the boundary isn't a hard line.
            jitter = ((i * 7919 + j * 6151) % 1000) / 1000.0
            if density > jitter:
                # Bigger dots as requested. Radius scales from grid base.
                r = max(0.4, (grid * 0.8) * density)
                dots.append(
                    f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}" '
                    f'fill="{color}"/>'
                )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'width="100%" height="{height}" '
        f'viewBox="0 0 {width} {height}" preserveAspectRatio="none">'
        f'{"".join(dots)}</svg>'
    )


def drip_sigil(
    seed: str,
    w: int = 120,
    h: int = 120,
    drips: int = 6,
    direction: str = "down",  # "down", "right", "left"
    color: str = "#0a0a09",
) -> str:
    """A primary glyph shape with a trail of smaller shapes in a given direction.
    
    Used as the floating substrate for the headerless logo and identity.
    'direction' controls where the trail falls: down, right (toward center
    from left), or left (toward center from right)."""
    rng = _rng(seed)
    
    # Calculate SVG dimensions based on direction
    if direction == "down":
        view_w = w
        view_h = int(h * (1 + drips * 0.55))
    else:
        view_w = int(w * (1 + drips * 0.55))
        view_h = h
    
    shapes = []
    for i in range(drips + 1):
        t = i / max(drips, 1)
        opacity = 1.0 if i == 0 else max(0.05, 0.7 * (1.0 - t)**1.5)
        scale = 1.0 if i == 0 else 0.8 * (1.0 - t * 0.5)
        
        # Position based on direction
        if direction == "down":
            x_off = 0 if i == 0 else rng.uniform(-w * 0.1, w * 0.1)
            y_off = i * (h * 0.5)
        elif direction == "right":
            x_off = i * (w * 0.5)
            y_off = 0 if i == 0 else rng.uniform(-h * 0.1, h * 0.1)
        else: # left
            x_off = view_w - w - i * (w * 0.5)
            y_off = 0 if i == 0 else rng.uniform(-h * 0.1, h * 0.1)
            
        rot = 0 if i == 0 else rng.uniform(-15, 15)
        
        drip_rng = _rng(f"{seed}-drip-{i}")
        # The primary shape (i=0) is beefy to provide a solid background.
        d = _glyph_path(drip_rng, w * scale, h * scale, beefy=(i == 0))
        
        # Center the shape within its slot
        margin_x = (w - (w * scale)) / 2
        margin_y = (h - (h * scale)) / 2
        shapes.append(
            f'<g transform="translate({x_off + margin_x:.1f} {y_off + margin_y:.1f}) rotate({rot:.1f} {w*scale/2:.1f} {h*scale/2:.1f})">'
            f'<path d="{d}" fill="{color}" fill-opacity="{opacity:.3f}"/></g>'
        )
        
    return (
        f'<svg class="drip-sigil" width="100%" height="100%" '
        f'viewBox="0 0 {view_w} {view_h}" preserveAspectRatio="xMidYMid meet" '
        f'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
        f'{"".join(shapes)}</svg>'
    )


def glyph_block(
    seed: str, rows: int = 5, cols: int = 4, cell: int = 56,
    color: str = "#7c70b8",
) -> str:
    """Grid of seeded blob glyphs — direct callback to the Xenosystems cover."""
    rng = _rng(seed)
    w_total = cols * cell
    h_total = rows * cell
    cells = []
    for r in range(rows):
        for c in range(cols):
            d = _glyph_path(rng, cell, cell)
            cells.append(
                f'<g class="glyph-item" transform="translate({c * cell} {r * cell})">'
                f'<path d="{d}" fill="{color}"/></g>'
            )
    return (
        f'<svg class="glyph-block interactive-glyphs" width="{w_total}" height="{h_total}" '
        f'viewBox="0 0 {w_total} {h_total}" '
        f'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
        f'{"".join(cells)}</svg>'
    )
