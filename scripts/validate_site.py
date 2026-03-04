#!/usr/bin/env python3
"""Static validation checks for the Oracle Learn website.

Run from repository root:
  python3 scripts/validate_site.py
"""

from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

EXPECTED_PAGES = {
    "index.html",
    "modules.html",
    "architecture.html",
    "dataflow.html",
    "commands.html",
    "dba-life.html",
    "roadmap.html",
    "labs.html",
    "security.html",
    "resources.html",
    "blog.html",
    "404.html",
}


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def fail(message: str) -> None:
    print(f"[FAIL] {message}")
    raise SystemExit(1)


def ok(message: str) -> None:
    print(f"[OK] {message}")


def check_pages_exist() -> None:
    found = {path.name for path in ROOT.glob("*.html")}
    missing = sorted(EXPECTED_PAGES - found)
    extras = sorted(found - EXPECTED_PAGES)
    if missing:
        fail(f"Missing required pages: {', '.join(missing)}")
    ok(f"All required pages exist ({len(EXPECTED_PAGES)} files).")
    if extras:
        print(f"[WARN] Additional HTML pages found: {', '.join(extras)}")


def check_nav_footer_and_main() -> None:
    for page in sorted(EXPECTED_PAGES):
        html = read_text(ROOT / page)
        if 'data-site-nav' not in html:
            fail(f"{page} is missing nav mount: data-site-nav")
        if 'data-site-footer' not in html:
            fail(f"{page} is missing footer mount: data-site-footer")
        if "assets/js/main.js" not in html:
            fail(f"{page} is missing shared script: assets/js/main.js")
    ok("All pages mount shared nav/footer and load main.js.")


def check_local_references() -> None:
    missing_refs: list[tuple[str, str]] = []
    html_pages = sorted(ROOT.glob("*.html"))
    for page in html_pages:
        html = read_text(page)
        refs = re.findall(r'\b(?:href|src)="([^"]+)"', html)
        for ref in refs:
            if ref.startswith(("http://", "https://", "mailto:", "tel:", "#", "javascript:")):
                continue
            local = ref.split("?")[0].split("#")[0].strip()
            if not local:
                continue
            if not (ROOT / local).exists():
                missing_refs.append((page.name, ref))

    if missing_refs:
        lines = ", ".join([f"{page}->{ref}" for page, ref in missing_refs[:12]])
        fail(f"Missing local file references detected: {lines}")
    ok("All local href/src references resolve to existing files.")


def count_matches(path: Path, pattern: str) -> int:
    return len(re.findall(pattern, read_text(path), flags=re.MULTILINE | re.DOTALL))


def check_content_volume() -> None:
    data_dir = ROOT / "assets/js/data"

    commands_file = data_dir / "commands-data.js"
    command_categories = re.findall(
        r'createCommand\(\s*"[^"]+"\s*,\s*"([^"]+)"\s*,',
        read_text(commands_file),
        flags=re.DOTALL,
    )
    if len(command_categories) < 56:
        fail(f"Command entries below target: {len(command_categories)} < 56")
    by_category = Counter(command_categories)
    low_categories = sorted([name for name, count in by_category.items() if count < 8])
    if low_categories:
        fail(f"Command category volume below 8 entries for: {', '.join(low_categories)}")
    ok(f"Command entries validated: {len(command_categories)} total across {len(by_category)} categories.")

    architecture_nodes = count_matches(data_dir / "architecture-data.js", r"\bnode\(")
    if architecture_nodes < 12:
        fail(f"Architecture nodes below target: {architecture_nodes} < 12")
    ok(f"Architecture nodes validated: {architecture_nodes}.")

    dba_tasks = count_matches(data_dir / "dba-tasks-data.js", r'id:\s*"')
    if dba_tasks < 7:
        fail(f"DBA task workflows below target: {dba_tasks} < 7")
    ok(f"DBA tasks validated: {dba_tasks}.")

    labs = count_matches(data_dir / "labs-data.js", r'id:\s*"lab-')
    if labs < 24:
        fail(f"Labs below target: {labs} < 24")
    ok(f"Labs validated: {labs}.")

    flashcards = count_matches(data_dir / "flashcards-data.js", r'^\s*\["')
    if flashcards < 40:
        fail(f"Flashcards below target: {flashcards} < 40")
    ok(f"Flashcards validated: {flashcards}.")

    quiz = count_matches(data_dir / "quiz-data.js", r'id:\s*"q-')
    if quiz < 30:
        fail(f"Quiz questions below target: {quiz} < 30")
    ok(f"Quiz questions validated: {quiz}.")

    blog_posts = count_matches(data_dir / "blog-data.js", r'id:\s*"post-')
    if blog_posts < 6:
        fail(f"Blog posts below target: {blog_posts} < 6")
    ok(f"Blog posts validated: {blog_posts}.")

    pdf_files = sorted((ROOT / "assets/pdf").glob("*.pdf"))
    if len(pdf_files) < 3:
        fail(f"Cheat sheet PDFs below target: {len(pdf_files)} < 3")
    ok(f"PDF cheat sheets validated: {len(pdf_files)}.")


def main() -> int:
    check_pages_exist()
    check_nav_footer_and_main()
    check_local_references()
    check_content_volume()
    print("[OK] Site validation completed successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
