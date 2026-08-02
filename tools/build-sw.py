#!/usr/bin/env python3
"""build-sw.py — regenerate the service-worker precache list.

Mirrors the 4-Weeks-to-Open- pattern: the SW's CACHE_URLS list is generated,
never hand-edited. This scans the repo for the static assets the app ships
(html / css / js / json / svg at the top level), writes them between the
AUTOGEN:URLS markers in sw.js, and optionally bumps the cache version.

Usage:
    python3 tools/build-sw.py                 # refresh the precache list
    python3 tools/build-sw.py --version v7     # also set CACHE_NAME suffix
    python3 tools/build-sw.py --check          # fail if sw.js is out of date
    python3 tools/build-sw.py --root DIR --version v1  # rewrite a copied tree
                                                # (used by 4-Weeks-to-Open-'s
                                                # build-market.py to regen the
                                                # SW for the cookbook/ mount
                                                # inside the Rolodex market
                                                # build — see that repo's
                                                # tools/build-market.py)
"""
import argparse
import os
import re
import sys

DEFAULT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Assets that should be precached, in a stable, readable order.
EXTS = (".html", ".css", ".js", ".json", ".svg")
SKIP = {
    "sw.js",            # the SW never caches itself
    # CI initiative 5: recipes-data.js is the authored SOURCE of truth, but no
    # page loads it any more — tools/build-data.js splits it into
    # recipes-index.js plus the recipes-detail-NN.js shards, and those are what
    # ship. Precaching it anyway would push 1.04 MB over the wire on every
    # install for a file nothing ever requests.
    "recipes-data.js",
}
# CI initiative 3: recipe photos live under images/, hand-off'd one at a time
# per CLAUDE.md's photo hand-off rule. Scanned separately (and recursively —
# the top-level scan above deliberately isn't) and restricted to this one
# directory, so adding a photo doesn't accidentally sweep in some unrelated
# nested file elsewhere in the repo. Empty today (no recipe has a photo yet);
# `os.walk` over a missing directory below just yields nothing.
IMAGES_DIR = "images"
IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp")


def discover_images(root):
    images_root = os.path.join(root, IMAGES_DIR)
    if not os.path.isdir(images_root):
        return []
    out = []
    for dirpath, dirnames, filenames in os.walk(images_root):
        dirnames[:] = sorted(d for d in dirnames if not d.startswith("."))
        for name in sorted(filenames):
            if name.startswith("."):
                continue
            if name.lower().endswith(IMAGE_EXTS):
                rel = os.path.relpath(os.path.join(dirpath, name), root)
                out.append("./" + rel.replace(os.sep, "/"))
    return out


def discover(root):
    files = []
    for name in sorted(os.listdir(root)):
        if name in SKIP:
            continue
        if name.startswith("."):
            continue
        path = os.path.join(root, name)
        if os.path.isfile(path) and name.endswith(EXTS):
            files.append(name)
    # './' (the app root) first, then index, then the rest alphabetically,
    # then any recipe photos.
    ordered = ["./"]
    for pref in ("index.html",):
        if pref in files:
            ordered.append("./" + pref)
            files.remove(pref)
    ordered += ["./" + f for f in files]
    ordered += discover_images(root)
    return ordered


def render(urls):
    body = "\n".join("  '%s'," % u for u in urls)
    return "/* AUTOGEN:URLS START */\n%s\n  /* AUTOGEN:URLS END */" % body


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", help="override the CACHE_NAME suffix")
    ap.add_argument("--check", action="store_true",
                    help="exit non-zero if sw.js would change")
    ap.add_argument("--root", help="tree to scan + sw.js to rewrite "
                                    "(default: this repo)")
    args = ap.parse_args()

    root = os.path.abspath(args.root) if args.root else DEFAULT_ROOT
    sw = os.path.join(root, "sw.js")

    with open(sw, encoding="utf-8") as f:
        src = f.read()

    block = render(discover(root))
    new = re.sub(
        r"/\* AUTOGEN:URLS START \*/.*?/\* AUTOGEN:URLS END \*/",
        block.replace("\\", "\\\\"),
        src,
        flags=re.S,
    )

    if args.version:
        new = re.sub(r"const CACHE_NAME = '[^']*';",
                     "const CACHE_NAME = 'mc-cookbook-%s';" % args.version, new)

    if args.check:
        if new != src:
            print("::error::sw.js precache list is stale — run tools/build-sw.py")
            return 1
        print("sw.js precache list is up to date.")
        return 0

    if new != src:
        with open(sw, "w", encoding="utf-8") as f:
            f.write(new)
        print("sw.js updated.")
    else:
        print("sw.js already current.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
