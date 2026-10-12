#!/usr/bin/env python3
"""Emit nonsecret publication evidence. The controller independently verifies it."""
import importlib.util
import json
import os
from pathlib import Path
import re


IMAGES = {
    "backend": ("main", "Jaco-Team/laravel-api-driver", "ghcr.io/jaco-team/laravel-api-driver"),
    "frontend": ("api-laravel", "Jaco-Team/jaco_driver_site", "ghcr.io/jaco-team/jaco-driver-frontend"),
}
PUBLIC_HELPER = Path(__file__).with_name("prepare-public-build.py")


def public_helper():
    if PUBLIC_HELPER.is_symlink() or not PUBLIC_HELPER.is_file():
        raise ValueError("UNSAFE_PUBLIC_BUILD_HELPER")
    spec = importlib.util.spec_from_file_location("jaco_public_build", PUBLIC_HELPER)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def metadata(values: dict[str, str]) -> dict:
    component = values.get("COMPONENT", "")
    if component not in IMAGES:
        raise ValueError("UNREVIEWED_COMPONENT")
    branch, repository, image = IMAGES[component]
    sha = values.get("GITHUB_SHA", "")
    digest = values.get("IMAGE_DIGEST", "")
    if not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise ValueError("INVALID_SOURCE_SHA")
    if not re.fullmatch(r"sha256:[0-9a-f]{64}", digest):
        raise ValueError("INVALID_IMAGE_DIGEST")
    expected_event = "push" if component == "backend" else "workflow_dispatch"
    if values.get("GITHUB_EVENT_NAME") != expected_event or values.get("GITHUB_REF") != "refs/heads/" + branch:
        raise ValueError("UNREVIEWED_EVENT_OR_BRANCH")
    if values.get("REQUIRED_CHECKS_RESULT") != "success":
        raise ValueError("REQUIRED_CHECKS_NOT_SUCCESSFUL")
    if values.get("GITHUB_REPOSITORY") != repository:
        raise ValueError("UNREVIEWED_REPOSITORY")
    run_id, attempt = values.get("GITHUB_RUN_ID", ""), values.get("GITHUB_RUN_ATTEMPT", "")
    if not re.fullmatch(r"[1-9][0-9]*", run_id) or not re.fullmatch(r"[1-9][0-9]*", attempt):
        raise ValueError("INVALID_RUN_ID")
    workflow_path = ".github/workflows/production-image.yml"
    expected_workflow = repository + "/" + workflow_path + "@refs/heads/" + branch
    if values.get("GITHUB_WORKFLOW_REF") != expected_workflow:
        raise ValueError("INVALID_WORKFLOW_REF")
    result = {
        "schema_version": 2,
        "component": component,
        "repository": repository,
        "branch": branch,
        "commit": sha,
        "image": image + "@" + digest,
        "workflow_path": workflow_path,
        "run_id": int(run_id),
        "run_attempt": int(attempt),
        "required_checks": "passed",
        "public_config_sha256": None,
        "build_configuration": None,
        "build_request_id": None,
    }
    if component == "frontend":
        helper = public_helper()
        data, proof = helper.validate_dispatch(values)
        if any(values.get(name) != value for name, value in proof.items()):
            raise ValueError("PUBLIC_BUILD_PROOF_MISMATCH")
        actual_public = {name: values.get(name, "") for name in helper.PUBLIC_KEYS}
        if helper.validate_public_config(actual_public) != data:
            raise ValueError("PUBLIC_BUILD_ENV_MISMATCH")
        result["public_config_sha256"] = proof["VALIDATED_PUBLIC_CONFIG_SHA256"]
        result["build_configuration"] = {
            "kv_path": helper.BUILD_KV_PATH,
            "version": helper.positive_version(proof["VALIDATED_PUBLIC_CONFIG_VERSION"]),
        }
        result["build_request_id"] = helper.request_id(proof["VALIDATED_BUILD_REQUEST_ID"])
    return result


def main() -> None:
    try:
        result = metadata(dict(os.environ))
    except ValueError as error:
        print(json.dumps({"status": "failed", "error_code": str(error)}))
        raise SystemExit(1)
    root = Path("jaco-release-metadata")
    if root.is_symlink() or root.exists():
        raise SystemExit("RELEASE_METADATA_PATH_ALREADY_EXISTS")
    root.mkdir(mode=0o700)
    path = root / "component.json"
    path.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    path.chmod(0o600)
    print(json.dumps({"status": "passed", "component": result["component"], "metadata_written": True}))


if __name__ == "__main__":
    main()
