#!/usr/bin/env python3
"""Isolated PR image checks. No publication, real configuration or raw logs."""
import argparse
import base64
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import time


IMAGE = "jaco-security-ci:local"
CONTAINER = "jaco-security-image-check"
SCANNER_CONTAINER = "jaco-security-trivy-check"
TRIVY = "aquasec/trivy:0.74.0@sha256:ee940acbf1f58ebadb42d01434ce4609530bf1b52536afbd1eee66cd7123c5c9"
VERSIONS = {
    "backend": {"perl-base": "5.36.0-7+deb12u4", "libpcre2-8-0": "10.42-1+deb12u2", "league/commonmark": "2.10.2"},
    "frontend": {"zlib": "1.3.2-r1"},
}
TARGETS = {
    "backend": {
        "perl-base": {"CVE-2026-13221", "CVE-2026-42496", "CVE-2026-8376", "CVE-2026-42497", "CVE-2026-48962", "CVE-2026-57432", "CVE-2026-57433"},
        "libpcre2-8-0": {"CVE-2026-103111"},
        "league/commonmark": {"GHSA-3q6v-r5mr-hxv8"},
        "github.com/getkin/kin-openapi": {"GHSA-r277-6w6q-xmqw", "CVE-2026-100349", "CVE-2026-100352", "CVE-2026-100353", "CVE-2026-100354", "CVE-2026-76905", "CVE-2026-77354", "CVE-2026-97394"},
        "stdlib": {"CVE-2026-78667", "CVE-2026-78669", "CVE-2026-97031"},
        "golang.org/x/net": {"CVE-2026-78669"},
        "golang.org/x/crypto": {"CVE-2026-56854"},
        "golang.org/x/text": {"CVE-2026-56851"},
        "google.golang.org/grpc": {"CVE-2026-84304", "CVE-2026-84445", "GHSA-hrxh-6v49-42gf"},
    },
    "frontend": {"zlib": {"CVE-2026-85091"}},
}
TOKEN = re.compile(r"(?:@[A-Za-z0-9][A-Za-z0-9._-]*/)?[A-Za-z0-9][A-Za-z0-9._+/-]*(?::[A-Za-z0-9][A-Za-z0-9._+-]*)?")
VERSION = re.compile(r"(?:[vV]?\d[A-Za-z0-9.+_:~*-]*(?:, *[vV]?\d[A-Za-z0-9.+_:~*-]*)*|unknown|\(devel\))")
ADVISORY = re.compile(r"(?:CVE-\d{4}-\d{4,}|GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}|(?:RUSTSEC|GO)-\d{4}-\d{4,}|(?:DLA|DSA)-\d+-\d+|TEMP-[A-F0-9]+-[A-F0-9]+)")


class Stop(Exception):
    pass


def need(condition, code):
    if not condition:
        raise Stop(code)


def command(args, timeout=30, required=True):
    result = subprocess.run(args, capture_output=True, timeout=timeout, check=False)
    need(len(result.stdout) <= 1024 * 1024 and len(result.stderr) <= 1024 * 1024, "COMMAND_OUTPUT_LIMIT")
    if required:
        need(result.returncode == 0, "COMMAND_FAILED")
    return result.stdout.decode("utf-8", errors="strict").strip()


def docker(*args, **kwargs):
    return command(["docker", *args], **kwargs)


def scalar(value, pattern, nullable=False):
    if nullable and value in (None, ""):
        return None
    need(type(value) is str and 0 < len(value) <= 500 and pattern.fullmatch(value), "SCAN_FIELD_INVALID")
    return value


def scan_projection(payload):
    """Keep typed package/advisory data, never ImageConfig, env, URLs or titles."""
    need(type(payload) is dict and payload.get("SchemaVersion") == 2, "SCAN_SCHEMA_INVALID")
    results = payload.get("Results")
    need(type(results) is list and bool(results), "SCAN_RESULTS_MISSING")
    packages = set()
    findings = []
    for result in results:
        need(type(result) is dict, "SCAN_RESULT_INVALID")
        for package in result.get("Packages") or []:
            need(type(package) is dict, "SCAN_PACKAGE_INVALID")
            packages.add((scalar(package.get("Name"), TOKEN), scalar(package.get("Version"), VERSION)))
        for item in result.get("Vulnerabilities") or []:
            need(type(item) is dict and item.get("Severity") in {"UNKNOWN", "LOW", "MEDIUM", "HIGH", "CRITICAL"}, "SCAN_FINDING_INVALID")
            findings.append({
                "id": scalar(item.get("VulnerabilityID"), ADVISORY),
                "package": scalar(item.get("PkgName"), TOKEN),
                "installed_version": scalar(item.get("InstalledVersion"), VERSION),
                "fixed_version": scalar(item.get("FixedVersion"), VERSION, nullable=True),
                "severity": item["Severity"],
            })
    return {
        "schema": "jaco-ci-image-scan/v1",
        "packages": [{"name": name, "version": version} for name, version in sorted(packages)],
        "findings": sorted(findings, key=lambda row: json.dumps(row, sort_keys=True)),
    }


def target_failures(component, projection):
    available = {row["name"] for row in projection["packages"]}
    need(set(TARGETS[component]) <= available, "TARGET_PACKAGE_INVENTORY_INCOMPLETE")
    return [row for row in projection["findings"] if row["id"] in TARGETS[component].get(row["package"], set())]


def runtime_env():
    # All values are public synthetic fixtures; never consume .env or host credentials.
    return {
        "APP_ENV": "production", "APP_NAME": "CourierCISynthetic", "APP_DEBUG": "false",
        "APP_KEY": "base64:" + base64.b64encode(bytes(range(32))).decode(),
        "APP_URL": "http://127.0.0.1:8000", "LOG_CHANNEL": "stderr",
        "CACHE_STORE": "array", "SESSION_DRIVER": "array", "QUEUE_CONNECTION": "sync",
        "DRIVER_STATIC_CACHE_STORE": "array", "DRIVER_STATISTICS_CACHE_STORE": "array",
        "DB_CONNECTION": "sqlite", "DB_DATABASE": ":memory:", "DB_URL": "",
        "MAIN_DB_DRIVER": "sqlite", "MAIN_DB_DATABASE": ":memory:", "MAIN_DB_URL": "",
        "SYSTEM_DB_DRIVER": "sqlite", "SYSTEM_DB_DATABASE": ":memory:", "SYSTEM_DB_URL": "",
        "REDIS_TLS": "false", "NIGHTWATCH_ENABLED": "false", "OIDC_ENABLED": "false",
        "SMARTCAPTCHA_ENABLED": "false", "MAIL_MAILER": "array", "BROADCAST_CONNECTION": "null",
    }


PHP_PROBE = r'''
$out = [];
foreach (["/api/v1/health", "/api/v1/health", "/api/v1/auth/me"] as $path) {
    $ctx = stream_context_create(["http" => ["ignore_errors" => true, "timeout" => 3, "header" => "Accept: application/json\r\n"]]);
    $body = @file_get_contents("http://127.0.0.1:8000".$path, false, $ctx);
    preg_match('/HTTP\/\S+ (\d{3})/', $http_response_header[0] ?? '', $match);
    $out[] = ["status" => (int) ($match[1] ?? 0), "health_ok" => $path !== "/api/v1/health" || ((json_decode($body ?: '', true)["status"] ?? '') === "ok")];
}
echo json_encode($out);
'''
NODE_PROBE = r'''
const http = require('http');
const request = () => new Promise((resolve, reject) => {
  const req = http.get('http://127.0.0.1:3225/auth', res => { res.resume(); resolve({status: res.statusCode}); });
  req.setTimeout(3000, () => { req.destroy(); reject(new Error('timeout')); }); req.on('error', reject);
});
(async () => console.log(JSON.stringify([await request(), await request()])))().catch(() => process.exit(1));
'''


def runtime(component, summary):
    uid = "10001" if component == "backend" else "1001"
    user = json.loads(docker("image", "inspect", "--format", "{{json .Config.User}}", IMAGE))
    need(user == ("10001:10001" if component == "backend" else "nextjs"), "IMAGE_USER_MISMATCH")
    image_id = docker("image", "inspect", "--format", "{{.Id}}", IMAGE)
    need(re.fullmatch(r"sha256:[a-f0-9]{64}", image_id), "IMAGE_ID_INVALID")
    summary["image_id"] = image_id
    args = ["run", "--detach", "--pull", "never", "--name", CONTAINER, "--network", "none",
            "--read-only", "--user", uid + ":" + uid, "--cap-drop", "ALL",
            "--security-opt", "no-new-privileges:true", "--pids-limit", "256", "--memory", "2g",
            "--cpus", "2", "--log-driver", "none"]
    paths = ["/tmp"]
    if component == "backend":
        paths += ["/var/www/html/bootstrap/cache", "/var/www/html/storage/logs"]
        paths += ["/var/www/html/storage/framework/" + name for name in ("cache", "sessions", "testing", "views")]
        for key, value in runtime_env().items():
            args += ["--env", key + "=" + value]
    else:
        paths += ["/app/.next/cache"]
    for path in paths:
        args += ["--tmpfs", path + ":rw,noexec,nosuid,nodev,size=64m,uid=" + uid + ",gid=" + uid + ",mode=1770"]
    docker(*args, IMAGE)
    need(docker("exec", CONTAINER, "id", "-u") == uid, "RUNTIME_USER_MISMATCH")
    for _ in range(60):
        health = docker("inspect", "--format", "{{.State.Health.Status}}", CONTAINER)
        if health == "healthy":
            break
        need(health != "unhealthy", "IMAGE_HEALTHCHECK_FAILED")
        time.sleep(2)
    else:
        raise Stop("IMAGE_HEALTHCHECK_TIMEOUT")
    if component == "backend":
        version = docker("exec", CONTAINER, "php", "-r", "echo PHP_VERSION;")
        need(re.fullmatch(r"8\.4\.\d+", version), "PHP_VERSION_MISMATCH")
        rows = docker("exec", CONTAINER, "dpkg-query", "-W", "-f=${Package}\t${Version}\n", "perl-base", "libpcre2-8-0")
        inventory = dict(line.split("\t") for line in rows.splitlines())
        inventory["league/commonmark"] = docker("exec", CONTAINER, "php", "-r", 'require "vendor/autoload.php"; echo Composer\\InstalledVersions::getPrettyVersion("league/commonmark");')
        probes = json.loads(docker("exec", CONTAINER, "php", "-r", PHP_PROBE))
        need([row["status"] for row in probes] == [200, 200, 401] and all(row["health_ok"] for row in probes), "API_WORKER_SMOKE_FAILED")
    else:
        version = docker("exec", CONTAINER, "node", "--version")
        need(version == "v24.22.0", "NODE_VERSION_MISMATCH")
        package = docker("exec", CONTAINER, "apk", "info", "-v", "zlib")
        need(package == "zlib-1.3.2-r1", "ZLIB_VERSION_MISMATCH")
        inventory = {"zlib": "1.3.2-r1"}
        probes = json.loads(docker("exec", CONTAINER, "node", "-e", NODE_PROBE))
        need([row["status"] for row in probes] == [200, 200], "FRONTEND_AUTH_PAGE_SMOKE_FAILED")
    need(inventory == VERSIONS[component], "TARGET_RUNTIME_VERSION_MISMATCH")
    summary.update(runtime_version=version, package_versions=inventory, smoke_statuses=[row["status"] for row in probes], runtime="passed", network="none")


def scan(component, summary, private, artifacts):
    docker("save", "--output", str(private / "image.tar"), IMAGE, timeout=180)
    os.chmod(private / "image.tar", 0o600)
    docker("pull", TRIVY, timeout=180)
    uid, gid = str(os.getuid()), str(os.getgid())
    (private / "cache").mkdir(mode=0o700, exist_ok=True)
    (private / "output").mkdir(mode=0o700, exist_ok=True)
    docker("run", "--rm", "--name", SCANNER_CONTAINER, "--pull", "never", "--read-only",
           "--user", uid + ":" + gid, "--env", "HOME=/tmp", "--env", "DOCKER_CONFIG=/tmp/docker",
           "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true",
           "--pids-limit", "256", "--memory", "2g", "--cpus", "2", "--log-driver", "none",
           "--tmpfs", "/tmp:rw,noexec,nosuid,nodev,size=256m,uid=" + uid + ",gid=" + gid,
           "--mount", "type=bind,src=" + str(private) + ",dst=/scan,readonly",
           "--mount", "type=bind,src=" + str(private / "cache") + ",dst=/cache",
           "--mount", "type=bind,src=" + str(private / "output") + ",dst=/out",
           "--workdir", "/scan", TRIVY, "image", "--input", "/scan/image.tar", "--cache-dir", "/cache",
           "--scanners", "vuln", "--list-all-pkgs", "--ignorefile", "/dev/null", "--exit-code", "0",
           "--format", "json", "--output", "/out/trivy-private.json", "--timeout", "10m", timeout=720)
    report = private / "output/trivy-private.json"
    need(report.stat().st_size <= 32 * 1024 * 1024, "SCAN_REPORT_SIZE_LIMIT")
    projection = scan_projection(json.loads(report.read_text()))
    (artifacts / "trivy.json").write_text(json.dumps(projection, sort_keys=True, indent=2) + "\n")
    failures = target_failures(component, projection)
    summary["target_findings_remaining"] = len(failures)
    summary["finding_counts"] = {severity: sum(row["severity"] == severity for row in projection["findings"]) for severity in ("CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN")}
    need(not failures, "TARGET_ADVISORY_STILL_REPORTED")
    summary["scan"] = "targeted_fixes_passed"


def cleanup(private):
    for name in (CONTAINER, SCANNER_CONTAINER):
        docker("rm", "--force", name, required=False)
    docker("image", "rm", "--force", IMAGE, required=False)
    if private.exists():
        shutil.rmtree(private)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("component", choices=("backend", "frontend"))
    parser.add_argument("phase", choices=("runtime", "scan", "cleanup"))
    args = parser.parse_args()
    summary = {"component": args.component, "scope": "synthetic_no_db_no_redis", "not_a_deployment": True, "all_cves_fixed": False}
    artifacts = None
    try:
        repo = "Jaco-Team/laravel-api-driver" if args.component == "backend" else "Jaco-Team/jaco_driver_site"
        branch = "main" if args.component == "backend" else "api-laravel"
        need(os.environ.get("GITHUB_ACTIONS") == "true" and os.environ.get("GITHUB_EVENT_NAME") == "pull_request", "PR_CI_ONLY")
        need(os.environ.get("GITHUB_REPOSITORY") == repo and os.environ.get("GITHUB_BASE_REF") == branch, "CI_TARGET_MISMATCH")
        need(os.environ.get("RUNNER_OS") == "Linux" and os.environ.get("RUNNER_ARCH") == "X64", "CI_PLATFORM_MISMATCH")
        temporary = Path(os.environ["RUNNER_TEMP"])
        need(temporary.is_absolute() and temporary.is_dir(), "CI_TEMP_INVALID")
        private, artifacts = temporary / "security-image-private", temporary / "security-image-artifacts"
        for path in (private, artifacts):
            path.mkdir(mode=0o700, exist_ok=True)
        previous = artifacts / "summary.json"
        if previous.exists():
            summary = json.loads(previous.read_text())
        if args.phase == "runtime":
            runtime(args.component, summary)
        elif args.phase == "scan":
            need(summary.get("runtime") == "passed", "RUNTIME_CHECK_REQUIRED")
            scan(args.component, summary, private, artifacts)
        else:
            cleanup(private)
        summary[args.phase + "_completed"] = True
    except Exception as error:
        summary["status"] = "failed"
        summary["failed_phase"] = args.phase
        summary["error_code"] = str(error) if isinstance(error, Stop) else "IMAGE_CHECK_FAILED"
        if artifacts:
            (artifacts / "summary.json").write_text(json.dumps(summary, sort_keys=True, indent=2) + "\n")
        print(json.dumps({"status": "failed", "code": summary["error_code"]}))
        raise SystemExit(1)
    summary["status"] = "failed" if summary.get("error_code") else (
        "passed" if summary.get("runtime") == "passed" and summary.get("scan") == "targeted_fixes_passed" else "incomplete"
    )
    (artifacts / "summary.json").write_text(json.dumps(summary, sort_keys=True, indent=2) + "\n")
    print(json.dumps({"status": "passed", "phase": args.phase}))


if __name__ == "__main__":
    main()
