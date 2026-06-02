#!/usr/bin/env python3
"""Batch background removal for wardrobe product PNGs (rembg / U²-Net)."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image
from rembg import remove

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "Images"
PUBLIC = ROOT / "public" / "seed-products"

# Full-body model shots — keep background for try-on heroes.
SKIP_FILES = {
    "model.png",
    "model-alt.png",
    "female-model.png",
    "Female Model.png",
}

# (source relative to Images/, destination relative to public/seed-products/)
JOBS: list[tuple[str, str]] = [
    ("Out Fit 1 F/top.png", "outfits/f1-f/top.png"),
    ("Out Fit 1 F/skirt.png", "outfits/f1-f/skirt.png"),
    ("Out Fit 2 F/top.png", "outfits/f2-f/top.png"),
    ("Out Fit 2 F/jeans.png", "outfits/f2-f/jeans.png"),
    ("Out Fit 3 F/top.png", "outfits/f3-f/top.png"),
    ("Out Fit 3 F/jeans.png", "outfits/f3-f/jeans.png"),
    ("Out FIt 1 M/shirt.png", "outfits/m1-m/shirt.png"),
    ("Out FIt 1 M/pants.png", "outfits/m1-m/pants.png"),
    ("Out FIt 1 M/shoes.png", "outfits/m1-m/shoes.png"),
    ("green-top-female.png", "green-top-female.png"),
    ("white-bottom-female.png", "white-bottom-female.png"),
    ("purple-footwear-female.png", "purple-footwear-female.png"),
]


def resolve_src(rel: str) -> Path | None:
    path = IMAGES / rel
    if path.exists():
        return path
    # Fall back to JPEG originals if PNG not generated yet
    parent = path.parent
    stem = path.stem
    for ext in (".jpeg", ".jpg", ".png", ".PNG"):
        for candidate in parent.glob(f"*{ext}"):
            if stem.lower() in candidate.stem.lower().replace("_", "-").replace(" ", "-"):
                return candidate
            if ext == ".jpeg" and candidate.name.lower().startswith("flat") and stem in ("top", "skirt", "jeans", "shirt", "pants", "shoes"):
                return candidate
    # Explicit JPEG fallbacks by folder
    fallbacks = {
        "Out Fit 1 F/top.png": "Flat_lay_of_her_Top,_202606011759.jpeg",
        "Out Fit 1 F/skirt.png": "Flat_lay_of_her_Skirt,_202606011759.jpeg",
        "Out Fit 2 F/top.png": "Flat_lay_of_her_top,_202606011800.jpeg",
        "Out Fit 2 F/jeans.png": "Flat_lay_of_her_jeans,_202606011801.jpeg",
        "Out Fit 3 F/top.png": "Flat_lay_of_this_top,_202606011808.jpeg",
        "Out Fit 3 F/jeans.png": "Flat_lay_of_this_Jeans,_202606011809.jpeg",
        "Out FIt 1 M/shirt.png": "Flat_lay_of_His_Shirt,_202606011817.jpeg",
        "Out FIt 1 M/pants.png": "Flat_lay_of_His_Pants,_202606011817.jpeg",
        "Out FIt 1 M/shoes.png": "Flat_lay_of_His_Shoes,_202606011817.jpeg",
        "green-top-female.png": "Green Top Female.png",
        "white-bottom-female.png": "White Bottom Female.png",
        "purple-footwear-female.png": "Purple Footware Female.png",
    }
    fb = fallbacks.get(rel)
    if fb and (IMAGES / Path(rel).parent / fb).exists():
        return IMAGES / Path(rel).parent / fb if "/" in rel else IMAGES / fb
    if fb and (IMAGES / fb).exists():
        return IMAGES / fb
    return None


def process(src: Path, dest: Path, mirror: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    mirror.parent.mkdir(parents=True, exist_ok=True)
    print(f"  {src.relative_to(ROOT)}")
    print(f"    -> {dest.relative_to(ROOT)}")
    with Image.open(src) as img:
        rgba = img.convert("RGBA")
        cutout = remove(rgba)
    cutout.save(dest, format="PNG", optimize=True)
    cutout.save(mirror, format="PNG", optimize=True)


def main() -> int:
    tasks: list[tuple[Path, Path, Path]] = []
    for src_rel, dest_rel in JOBS:
        src = resolve_src(src_rel)
        if not src:
            print(f"Missing source for {src_rel}", file=sys.stderr)
            return 1
        if src.name in SKIP_FILES:
            continue
        dest = PUBLIC / dest_rel
        mirror = IMAGES / src_rel
        tasks.append((src, dest, mirror))

    print(f"Removing backgrounds from {len(tasks)} product images…")
    for i, (src, dest, mirror) in enumerate(tasks, 1):
        print(f"[{i}/{len(tasks)}]")
        try:
            process(src, dest, mirror)
        except Exception as exc:  # noqa: BLE001
            print(f"  FAILED: {exc}", file=sys.stderr)
            return 1

    print("Done — transparent PNGs written to Images/ and public/seed-products/.")
    print("Skipped model photos (background kept for outfit / try-on heroes).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
