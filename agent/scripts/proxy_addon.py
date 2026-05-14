"""mitmproxy addon — engagement-aware proxy.

Behavior:
- Tags every flow with the active engagement name.
- Stores raw flows under agent/engagements/<engagement>/artifacts/proxy/.
- Refuses to proxy requests to hosts outside scope.json.authorized_targets.

The addon reads scope from agent/engagements/<engagement>/scope.json on each request,
so scope updates apply without restarting the proxy.
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import List

from mitmproxy import ctx, http

ROOT = Path(__file__).resolve().parents[2]
ENG = os.environ.get("ENGAGEMENT", "")


def _scope() -> tuple[List[str], List[str]]:
    if not ENG:
        return [], []
    scope_path = ROOT / "engagements" / ENG / "scope.json"
    if not scope_path.exists():
        return [], []
    try:
        data = json.loads(scope_path.read_text())
    except Exception:
        return [], []
    return data.get("authorized_targets", []), data.get("out_of_scope", [])


def _matches(host: str, patterns: List[str]) -> bool:
    for p in patterns:
        if p.startswith("*."):
            if host.endswith(p[1:]):
                return True
        elif host == p:
            return True
        elif p in host:
            return True
    return False


def request(flow: http.HTTPFlow) -> None:
    allow, deny = _scope()
    host = flow.request.pretty_host
    if _matches(host, deny):
        flow.response = http.Response.make(
            451, b"out of scope per scope.json", {"Content-Type": "text/plain"}
        )
        ctx.log.warn(f"BLOCKED out-of-scope: {host}")
        return
    if allow and not _matches(host, allow):
        flow.response = http.Response.make(
            451, b"not in authorized_targets per scope.json", {"Content-Type": "text/plain"}
        )
        ctx.log.warn(f"BLOCKED unauthorized: {host}")
        return


def response(flow: http.HTTPFlow) -> None:
    if not ENG:
        return
    out = ROOT / "engagements" / ENG / "artifacts" / "proxy"
    out.mkdir(parents=True, exist_ok=True)
    safe = re.sub(r"[^A-Za-z0-9._-]+", "_", flow.request.pretty_host)
    fname = out / f"{flow.id}-{safe}.log"
    try:
        fname.write_text(
            f"# {flow.request.method} {flow.request.pretty_url}\n"
            f"# -> {flow.response.status_code if flow.response else '???'}\n\n"
            f"{flow.request.headers}\n\n"
            f"{flow.response.headers if flow.response else ''}\n"
        )
    except Exception as e:
        ctx.log.warn(f"failed to persist flow: {e}")
