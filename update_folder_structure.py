#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate or update `27_리펙토링 브랜치 폴더구조.md` with the current repository structure.

Usage:
  python update_folder_structure.py [OUTPUT_MD_FILE]

Defaults:
  OUTPUT_MD_FILE = 27_리펙토링 브랜치 폴더구조.md
"""

from __future__ import annotations

import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime, timezone


ROOT = Path(__file__).resolve().parent


def get_current_branch() -> str:
    try:
        out = subprocess.check_output(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=str(ROOT)
        ).decode("utf-8", errors="ignore").strip()
        return out or "unknown"
    except Exception:
        return "unknown"


def list_names(path: Path) -> list[str]:
    if not path.exists():
        return []
    items = []
    for p in sorted(path.iterdir(), key=lambda x: (x.is_file(), x.name.lower())):
        if p.name.startswith("."):
            continue
        if p.is_dir():
            items.append(f"{p.name}/")
        else:
            items.append(p.name)
    return items


def list_files_only(path: Path) -> list[str]:
    if not path.exists():
        return []
    items = []
    for p in sorted(path.iterdir(), key=lambda x: x.name.lower()):
        if p.is_file() and not p.name.startswith("."):
            items.append(p.name)
    return items


def render_code_block(lines: list[str]) -> str:
    return "\n".join(["```text", *lines, "```"])


def now_kst_string() -> str:
    # Use local timezone offset (assumes system is set to KST). If not, still shows correct offset.
    now = datetime.now().astimezone()
    # Format like: 2025-08-09 20:45:00 +09:00
    return now.strftime("%Y-%m-%d %H:%M:%S %z")[:-2] + ":" + now.strftime("%z")[-2:]


def main(output_file: str) -> int:
    branch = get_current_branch()

    # Sections
    top_level = list_names(ROOT)
    modules_files = list_files_only(ROOT / "modules")
    data_files = list_files_only(ROOT / "data")
    routes_files = list_files_only(ROOT / "routes")
    services_files = list_files_only(ROOT / "services")
    static_css = list_files_only(ROOT / "static" / "css")
    static_js = list_files_only(ROOT / "static" / "js")
    templates_files = list_files_only(ROOT / "templates")
    tests_files = list_files_only(ROOT / "tests")

    content_lines: list[str] = []
    content_lines.append("# 27_리펙토링 브랜치 폴더구조")
    content_lines.append("")
    content_lines.append(f"- 현재 브랜치: {branch}")
    content_lines.append(f"- 생성 시각: {now_kst_string()}")
    content_lines.append("")

    content_lines.append("## 최상위 항목")
    content_lines.append(render_code_block(top_level))
    content_lines.append("")

    content_lines.append("## modules")
    content_lines.append(render_code_block(modules_files))
    content_lines.append("")

    content_lines.append("## data")
    content_lines.append(render_code_block(data_files))
    content_lines.append("")

    content_lines.append("## routes")
    content_lines.append(render_code_block(routes_files))
    content_lines.append("")

    content_lines.append("## services")
    content_lines.append(render_code_block(services_files))
    content_lines.append("")

    content_lines.append("## static")
    static_section = []
    if static_css:
        static_section.extend(["css/"] + [f"  - {n}" for n in static_css])
    if static_js:
        static_section.extend(["js/"] + [f"  - {n}" for n in static_js])
    if not static_section:
        static_section.append("(empty)")
    content_lines.append(render_code_block(static_section))
    content_lines.append("")

    content_lines.append("## templates")
    content_lines.append(render_code_block(templates_files))
    content_lines.append("")

    content_lines.append("## tests")
    content_lines.append(render_code_block(tests_files))
    content_lines.append("")

    # App files summary (v1.x)
    app_files = [n for n in top_level if n.startswith("app_v1.")]
    content_lines.append("## 앱 파일 (app_v1.x)")
    content_lines.append(render_code_block(app_files))
    content_lines.append("")

    # 상태 메모 (자동 감지 일부)
    memos: list[str] = []
    if "stats_routes.py" in routes_files:
        memos.append("routes: stats_routes.py 존재")
    if "init.py" in services_files:
        memos.append("services: init.py 존재 (패키지 초기화)")
    if "quiz_service.py" in services_files:
        memos.append("services: quiz_service.py 적용 완료")
    if memos:
        content_lines.append("## 상태 메모")
        for m in memos:
            content_lines.append(f"- {m}")

    out_path = ROOT / output_file
    out_path.write_text("\n".join(content_lines), encoding="utf-8")
    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "27_리펙토링 브랜치 폴더구조.md"
    raise SystemExit(main(target))


