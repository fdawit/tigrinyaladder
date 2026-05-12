"""Validate the generated Tigrinya Thinking Path curriculum file.

Run from project root:
    python3 python/validate_curriculum.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CURRICULUM = ROOT / "js" / "curriculum.js"


def load_data():
    text = CURRICULUM.read_text(encoding="utf-8")
    match = re.match(r"window\.TTP_CURRICULUM\s*=\s*(.*);\s*$", text, re.S)
    if not match:
        raise ValueError("curriculum.js does not expose window.TTP_CURRICULUM correctly")
    return json.loads(match.group(1))


def main() -> None:
    data = load_data()
    errors: list[str] = []
    phase_ids = {p["id"] for p in data.get("phases", [])}
    core_phase_ids = set(data.get("corePathPhaseIds", []))
    explore_phase_ids = set(data.get("explorePhaseIds", []))
    valid_support_stages = {"beginner", "guided", "fidel"}
    lesson_ids = set()

    if not core_phase_ids:
        errors.append("corePathPhaseIds is missing or empty")
    if core_phase_ids - phase_ids:
        errors.append(f"Unknown core phase ids: {sorted(core_phase_ids - phase_ids)}")
    if explore_phase_ids - phase_ids:
        errors.append(f"Unknown explore phase ids: {sorted(explore_phase_ids - phase_ids)}")
    if core_phase_ids & explore_phase_ids:
        errors.append(f"Phases cannot be both core and explore: {sorted(core_phase_ids & explore_phase_ids)}")
    if (core_phase_ids | explore_phase_ids) != phase_ids:
        missing = phase_ids - (core_phase_ids | explore_phase_ids)
        extra = (core_phase_ids | explore_phase_ids) - phase_ids
        if missing:
            errors.append(f"Phases missing from core/explore tracks: {sorted(missing)}")
        if extra:
            errors.append(f"Track ids not found as phases: {sorted(extra)}")
    lesson_ids = set()

    for lesson in data.get("lessons", []):
        lid = lesson.get("id")
        if not lid:
            errors.append("Lesson missing id")
            continue
        if lid in lesson_ids:
            errors.append(f"Duplicate lesson id: {lid}")
        lesson_ids.add(lid)
        if lesson.get("phase") not in phase_ids:
            errors.append(f"Lesson {lid} has unknown phase {lesson.get('phase')}")
        if lesson.get("supportStage") not in valid_support_stages:
            errors.append(f"Lesson {lid} has invalid supportStage {lesson.get('supportStage')}")
        if not lesson.get("steps"):
            errors.append(f"Lesson {lid} has no steps")
        for i, step in enumerate(lesson.get("steps", []), start=1):
            stype = step.get("type")
            if stype == "choice":
                if step.get("answer") not in step.get("choices", []):
                    errors.append(f"{lid} step {i}: answer is not in choices")
            elif stype in {"build", "sort"}:
                bank = set(step.get("bank", []))
                for token in step.get("answer", []):
                    if token not in bank:
                        errors.append(f"{lid} step {i}: answer token {token!r} not in bank")
            elif stype == "match":
                if not step.get("pairs") or not all(len(pair) == 2 for pair in step.get("pairs", [])):
                    errors.append(f"{lid} step {i}: invalid match pairs")
            elif stype == "table":
                cols = len(step.get("columns", []))
                for row in step.get("rows", []):
                    if len(row) != cols:
                        errors.append(f"{lid} step {i}: table row does not match column count")
            elif stype == "type-in":
                if not step.get("answer"):
                    errors.append(f"{lid} step {i}: type-in step missing answer")
            elif stype not in {"concept", "reflection"}:
                errors.append(f"{lid} step {i}: unknown step type {stype!r}")


    checkpoint_banks = data.get("checkpointBanks", {})
    if checkpoint_banks:
        for phase_id, bank in checkpoint_banks.items():
            if phase_id not in phase_ids:
                errors.append(f"Checkpoint bank has unknown phase id {phase_id}")
            blueprint = {"recognition": 2, "meaning": 2, "production": 2, "repair": 1, "transfer": 1}
            if len(bank) != 8:
                errors.append(f"Checkpoint bank {phase_id} must have exactly 8 items; found {len(bank)}")
            type_counts = {key: 0 for key in blueprint}
            for item in bank:
                ctype = item.get("checkpointType")
                if ctype in type_counts:
                    type_counts[ctype] += 1
            for required, expected_count in blueprint.items():
                if type_counts.get(required, 0) != expected_count:
                    errors.append(f"Checkpoint bank {phase_id} must have {expected_count} {required} item(s); found {type_counts.get(required, 0)}")
            for i, step in enumerate(bank, start=1):
                stype = step.get("type")
                if stype == "choice":
                    if step.get("answer") not in step.get("choices", []):
                        errors.append(f"checkpoint {phase_id} item {i}: answer is not in choices")
                elif stype in {"build", "sort"}:
                    bank_tokens = set(step.get("bank", []))
                    for token in step.get("answer", []):
                        if token not in bank_tokens:
                            errors.append(f"checkpoint {phase_id} item {i}: answer token {token!r} not in bank")
                elif stype == "match":
                    if not step.get("pairs") or not all(len(pair) == 2 for pair in step.get("pairs", [])):
                        errors.append(f"checkpoint {phase_id} item {i}: invalid match pairs")
                elif stype == "type-in":
                    if not step.get("answer"):
                        errors.append(f"checkpoint {phase_id} item {i}: type-in item missing answer")
                else:
                    errors.append(f"checkpoint {phase_id} item {i}: unknown step type {stype!r}")

    for family in data.get("fidel", {}).get("families", []):
        if len(family.get("orders", [])) != 7:
            errors.append(f"Fidel family {family.get('base')} does not have seven orders")

    if errors:
        print("Validation failed:")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)

    print(f"Validation passed: {len(data['lessons'])} lessons, {len(data['phases'])} phases, {len(data['fidel']['families'])} fidel families, {len(core_phase_ids)} core phases, {len(explore_phase_ids)} explore phases.")


if __name__ == "__main__":
    main()
