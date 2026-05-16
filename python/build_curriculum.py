"""Normalize js/curriculum.js for Asmara Tigrinya Thinking Path.

The curriculum is authored directly in js/curriculum.js for this static prototype.
This script parses it, validates JSON shape, and rewrites it with stable formatting.

Run from project root:
    python3 python/build_curriculum.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "js" / "curriculum.js"


def load_curriculum() -> dict:
    text = OUT.read_text(encoding="utf-8")
    match = re.match(r"\s*window\.TTP_CURRICULUM\s*=\s*(\{.*\})\s*;\s*$", text, re.S)
    if not match:
        raise ValueError("curriculum.js does not expose window.TTP_CURRICULUM correctly")
    return json.loads(match.group(1))


def main() -> None:
    curriculum = load_curriculum()
    js = "window.TTP_CURRICULUM = " + json.dumps(curriculum, ensure_ascii=False, indent=2) + ";\n"
    OUT.write_text(js, encoding="utf-8")
    print(
        f"Wrote {OUT.relative_to(ROOT)} with "
        f"{len(curriculum.get('lessons', []))} lessons, "
        f"{len(curriculum.get('phases', []))} phases, and "
        f"{len(curriculum.get('checkpointBanks', {}))} checkpoint banks."
    )


if __name__ == "__main__":
    main()
