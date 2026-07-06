"""Static-site generator for William Klett's personal site.

Reads markdown content + the Landian glyph generator, renders static HTML
into dist/. No server at runtime — dist/ is a plain static site you can
host on GitHub Pages, Netlify, or anywhere.

    python build.py            # -> dist/

Edit content/site.md (config + intro) and content/projects/*.md (one file
per project). A project with body text below its front-matter gets its own
page; a project with only front-matter becomes a link-only row.
"""
from __future__ import annotations

import datetime
import shutil
from pathlib import Path

import markdown as md
import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape

import glyph

HERE = Path(__file__).resolve().parent
CONTENT = HERE / "content"
DIST = HERE / "dist"

LAVENDER = "#6f5fa5"
INK = "#0a0a09"

CAT = (
    "⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣶⣿⣶⡾⠁\n"
    "⠠⣿⡀⠀⠀⠀⢀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀\n"
    "⠀⠙⢿⣶⣶⣾⣿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠿⠃⠀\n"
    "⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡃⠀⠀⠀⠀\n"
    "⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⢿⣿⣿⠟⠁⠀⠀⠀⠈⢿⣿⠛⠻⢿⣦⡀⠀⠀\n"
    "⠀⠀⠀⠀⠀⠀⠀⣿⠟⠁⠘⢿⣿⠀⠀⠀⠀⠀⠀⠸⣿⡀⠀⠀⠹⠷⠀⠀\n"
    "⠀⠀⠀⠀⠀⠀⠀⣿⣤⠀⠀⠀⠙⠷⠶⠀⠀⠀⠀⠀⠙⠛⠁⠀⠀⠀⠀⠀"
)

_MD = md.Markdown(extensions=["fenced_code", "tables", "smarty"])


def _md_html(text: str) -> str:
    _MD.reset()
    return _MD.convert(text.strip())


def parse_front_matter(raw: str):
    """Return (meta_dict, body_str). Front matter is a leading --- ... --- block."""
    raw = raw.lstrip("﻿").lstrip()
    if raw.startswith("---"):
        end = raw.find("\n---", 3)
        if end != -1:
            fm = raw[3:end].strip()
            body = raw[end + 4:].lstrip("\n")
            return (yaml.safe_load(fm) or {}), body
    return {}, raw


def load_site():
    meta, body = parse_front_matter((CONTENT / "site.md").read_text())
    meta["intro_html"] = _md_html(body) if body.strip() else ""
    meta.setdefault("brand_first", meta.get("name", "").split(" ")[0] if meta.get("name") else "Name")
    meta.setdefault("brand_second", meta.get("name", "").split(" ")[-1] if meta.get("name") else "")
    meta.setdefault("links", [])
    return meta


def load_projects():
    out = []
    for f in sorted((CONTENT / "projects").glob("*.md")):
        meta, body = parse_front_matter(f.read_text())
        slug = f.stem
        has_body = bool(body.strip())
        out.append({
            "slug": slug,
            "title": meta.get("title", slug),
            "year": meta.get("year"),
            "status": meta.get("status"),
            "order": meta.get("order", 999),
            "blurb": meta.get("blurb", ""),
            "tags": meta.get("tags", []) or [],
            "links": meta.get("links", []) or [],
            "url": meta.get("url"),
            "has_page": has_body,
            "body_html": _md_html(body) if has_body else "",
        })
    # sort: explicit order asc, then year desc
    out.sort(key=lambda p: (p["order"], -(p["year"] or 0)))
    return out


def write(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)


def main():
    env = Environment(loader=FileSystemLoader(str(HERE / "templates")),
                      autoescape=select_autoescape(["html"]))
    site = load_site()
    projects = load_projects()
    year = datetime.date.today().year

    # fresh dist
    if DIST.exists():
        shutil.rmtree(DIST)
    (DIST / "static").mkdir(parents=True)

    # copy stylesheet
    shutil.copy(HERE / "static" / "style.css", DIST / "static" / "style.css")

    # GitHub Pages: skip Jekyll processing of the static output
    (DIST / ".nojekyll").write_text("")

    # pre-render the Landian art to static SVG files
    (DIST / "static" / "glyph-hero.svg").write_text(
        glyph.glyph_block("william-klett-hero", rows=6, cols=4, cell=58, color=LAVENDER))
    (DIST / "static" / "texture.svg").write_text(
        glyph.glyph_texture("william-klett-stone", tile=900, n=24,
                            size_lo=80, size_hi=180, color="#6c5d9c", opacity=0.085))
    halftone = glyph.halftone_strip(width=1600, height=40, grid=5, color=INK)

    common = dict(site=site, cat=CAT, halftone=halftone, year=year)

    # index
    html = env.get_template("index.html").render(root="", projects=projects, **common)
    write(DIST / "index.html", html)

    # per-project pages
    n_pages = 0
    for p in projects:
        if not p["has_page"]:
            continue
        sigil = glyph.glyph_row("project-" + p["slug"], n=28, cell=22, color=LAVENDER)
        html = env.get_template("project.html").render(
            root="../../", p=p, sigil=sigil, **common)
        write(DIST / "projects" / p["slug"] / "index.html", html)
        n_pages += 1

    print(f"built dist/ — index + {n_pages} project page(s), {len(projects)} project(s) listed")


if __name__ == "__main__":
    main()
