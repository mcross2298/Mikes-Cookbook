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
"""
import argparse
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SW = os.path.join(ROOT, "sw.js")

# Assets that should be precached, in a stable, readable order.
EXTS = (".html", ".css", ".js", ".json", ".svg")
SKIP = {"sw.js"}  # the SW never caches itself


def discover():
    files = []
    for name in sorted(os.listdir(ROOT)):
        if name in SKIP:
            continue
        if name.startswith("."):
            continue
        path = os.path.join(ROOT, name)
        if os.path.isfile(path) and name.endswith(EXTS):
            files.append(name)
    # './' (the app root) first, then index, then the rest alphabetically.
    ordered = ["./"]
    for pref in ("index.html",):
        if pref in files:
            ordered.append("./" + pref)
            files.remove(pref)
    ordered += ["./" + f for f in files]
    return ordered


def render(urls):
    body = "\n".join("  '%s'," % u for u in urls)
    return "/* AUTOGEN:URLS START */\n%s\n  /* AUTOGEN:URLS END */" % body


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", help="override the CACHE_NAME suffix")
    ap.add_argument("--check", action="store_true",
                    help="exit non-zero if sw.js would change")
    args = ap.parse_args()

    with open(SW, encoding="utf-8") as f:
        src = f.read()

    block = render(discover())
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
        with open(SW, "w", encoding="utf-8") as f:
            f.write(new)
        print("sw.js updated.")
    else:
        print("sw.js already current.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
