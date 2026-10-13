#!/usr/bin/env python3
"""CI-only checkout guard. Never reads environment-file contents."""
import argparse
import json
import os
from pathlib import Path
import subprocess


ENV_EXCLUDES = [".env", ".env.*", "**/.env", "**/.env.*", ".sentryclirc", "**/.sentryclirc"]


def prepare(root: Path, dockerfile: str) -> dict:
    if dockerfile not in {"Dockerfile", "Dockerfile.frankenphp"}:
        raise ValueError("UNREVIEWED_DOCKERFILE")
    source = root / dockerfile
    if source.is_symlink() or not source.is_file():
        raise ValueError("UNSAFE_DOCKERFILE")
    tracked = subprocess.run(
        ["git", "ls-files", "-z"], cwd=root, check=True, capture_output=True
    ).stdout.split(b"\0")
    forbidden = [
        name for raw in tracked if raw
        if (name := os.fsdecode(raw).rsplit("/", 1)[-1]).startswith(".env")
        and not name.endswith(".example")
    ]
    if forbidden:
        # Even names may contain untrusted bytes; print neither names nor values.
        raise ValueError("TRACKED_RUNTIME_ENV_PRESENT")
    base = root / ".dockerignore"
    specific = root / (dockerfile + ".dockerignore")
    for candidate in (base, specific):
        if candidate.is_symlink() or (candidate.exists() and not candidate.is_file()):
            raise ValueError("UNSAFE_DOCKERIGNORE")
    original = specific if specific.exists() else base
    if not original.exists():
        raise ValueError("DOCKERIGNORE_MISSING")
    rules = original.read_text(encoding="utf-8")
    # Dockerfile-specific policy takes precedence over the root .dockerignore.
    # Append exclusions LAST to override any earlier !.env.example exception.
    policy = rules.rstrip("\n") + "\n\n# Jaco CI: runtime env must never enter an image\n"
    policy += "\n".join(ENV_EXCLUDES) + "\n"
    specific.write_text(policy, encoding="utf-8")
    os.chmod(specific, 0o600)
    return {"status": "passed", "dockerfile": dockerfile, "runtime_env_excluded": True}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dockerfile", required=True)
    args = parser.parse_args()
    try:
        result = prepare(Path.cwd(), args.dockerfile)
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        code = str(error) if isinstance(error, ValueError) else "CONTEXT_GUARD_FAILED"
        print(json.dumps({"status": "failed", "error_code": code}))
        raise SystemExit(1)
    print(json.dumps(result, sort_keys=True))


if __name__ == "__main__":
    main()
