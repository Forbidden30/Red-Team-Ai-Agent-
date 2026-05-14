#!/usr/bin/env bash
# Self-contained test runner for bin/rt-agent.
#
# Runs each test in an isolated copy of the repo so tests don't trample real
# engagement data. Reports pass/fail counts and exits non-zero on failure.

set -u   # NB: not -e — we want to inspect command failures inside tests.

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RT_AGENT="$ROOT/bin/rt-agent"
PASS=0
FAIL=0
FAILED_TESTS=()

# --- harness ---------------------------------------------------------------

setup_workspace() {
  # Use a path under the repo root (some sandboxed envs block jq/etc. from /tmp).
  # Falls back to mktemp -d if TESTS_TMPDIR is set explicitly.
  local base="${TESTS_TMPDIR:-$ROOT/.test-tmp}"
  mkdir -p "$base"
  local tmp; tmp=$(mktemp -d "$base/rt-XXXXXX")
  mkdir -p "$tmp/agent/engagements" "$tmp/bin"
  cp -r "$ROOT/agent/scripts" "$tmp/agent/scripts"
  cp -r "$ROOT/agent/.opencode" "$tmp/agent/.opencode"
  chmod +x "$tmp/agent/scripts"/*.sh "$tmp/agent/scripts/hooks"/*.sh 2>/dev/null
  cp "$ROOT/bin/rt-agent" "$tmp/bin/rt-agent"
  chmod +x "$tmp/bin/rt-agent"
  echo "$tmp"
}

assert_eq() {
  local got="$1" want="$2" name="$3"
  if [[ "$got" == "$want" ]]; then
    return 0
  fi
  echo "    FAIL: $name"
  echo "      got:  $got"
  echo "      want: $want"
  return 1
}

assert_match() {
  local got="$1" pattern="$2" name="$3"
  if [[ "$got" =~ $pattern ]]; then
    return 0
  fi
  echo "    FAIL: $name"
  echo "      got:     $got"
  echo "      pattern: $pattern"
  return 1
}

assert_file() {
  local path="$1" name="$2"
  if [[ -f "$path" ]]; then
    return 0
  fi
  echo "    FAIL: $name — missing file: $path"
  return 1
}

run_test() {
  local name="$1"
  local fn="$2"
  echo "  TEST: $name"
  local tmp; tmp=$(setup_workspace)
  if (cd "$tmp" && "$fn") then
    PASS=$((PASS + 1))
    echo "    PASS"
  else
    FAIL=$((FAIL + 1))
    FAILED_TESTS+=("$name")
  fi
  rm -rf "$tmp"
}

# --- tests ----------------------------------------------------------------

test_version() {
  local out; out=$(bin/rt-agent version)
  assert_match "$out" "^rt-agent v" "version output"
}

test_engage_creates_workspace() {
  bin/rt-agent engage acme-test > /dev/null || return 1
  assert_file "agent/engagements/acme-test/scope.json" "scope.json created" || return 1
  assert_file "agent/engagements/acme-test/intel.md" "intel.md created" || return 1
  assert_file "agent/engagements/acme-test/notes.md" "notes.md created" || return 1
  assert_file "agent/engagements/acme-test/events.jsonl" "events.jsonl created" || return 1
  [[ -d "agent/engagements/acme-test/findings" ]] || { echo "FAIL: findings dir"; return 1; }
  [[ -d "agent/engagements/acme-test/artifacts" ]] || { echo "FAIL: artifacts dir"; return 1; }
  [[ -d "agent/engagements/acme-test/reports" ]] || { echo "FAIL: reports dir"; return 1; }

  # Active marker should be set
  local active; active=$(cat .rt-agent-active)
  assert_eq "$active" "acme-test" ".rt-agent-active points at new engagement"
}

test_engage_rejects_duplicate() {
  bin/rt-agent engage foo > /dev/null
  local out; out=$(bin/rt-agent engage foo 2>&1) && {
    echo "FAIL: expected non-zero exit on duplicate engage"; return 1;
  }
  assert_match "$out" "already exists" "duplicate engage rejected"
}

test_engage_rejects_bad_name() {
  local out; out=$(bin/rt-agent engage "../etc/passwd" 2>&1) && {
    echo "FAIL: expected non-zero exit on path-traversal name"; return 1;
  }
  assert_match "$out" "must match" "bad name rejected"
}

test_status_shows_engagement() {
  bin/rt-agent engage test1 > /dev/null
  local out; out=$(bin/rt-agent status)
  assert_match "$out" "Engagement: test1" "status shows engagement name" || return 1
  assert_match "$out" "Findings:" "status shows findings count"
}

test_list_shows_engagements() {
  bin/rt-agent engage e1 > /dev/null
  bin/rt-agent engage e2 > /dev/null
  bin/rt-agent use e2 > /dev/null
  local out; out=$(bin/rt-agent list)
  assert_match "$out" "e1" "list includes e1" || return 1
  assert_match "$out" "e2" "list includes e2" || return 1
  # Active marker should be on e2.
  assert_match "$out" "\* e2" "active marker on e2"
}

test_use_changes_active() {
  bin/rt-agent engage one > /dev/null
  bin/rt-agent engage two > /dev/null
  bin/rt-agent use one > /dev/null
  local active; active=$(cat .rt-agent-active)
  assert_eq "$active" "one" "use changed active engagement"
}

test_use_rejects_missing() {
  local out; out=$(bin/rt-agent use nope 2>&1) && {
    echo "FAIL: expected non-zero on missing engagement"; return 1;
  }
  assert_match "$out" "no such engagement" "missing engagement rejected"
}

test_finding_creates_markdown() {
  bin/rt-agent engage demo > /dev/null
  local path; path=$(bin/rt-agent finding "Reflected XSS" High XSS)
  assert_file "$path" "finding markdown created" || return 1
  assert_match "$path" "F-01-reflected-xss" "F-01 + slug in filename" || return 1
  grep -q "Severity: High" "$path" || { echo "FAIL: severity not in finding"; return 1; }
  grep -q "Class: XSS" "$path" || { echo "FAIL: class not in finding"; return 1; }
  return 0
}

test_finding_increments_id() {
  bin/rt-agent engage demo > /dev/null
  bin/rt-agent finding "First" Low > /dev/null
  local p2; p2=$(bin/rt-agent finding "Second" Low)
  assert_match "$p2" "F-02-" "second finding gets F-02"
}

test_intel_add_appends_to_heading() {
  bin/rt-agent engage demo > /dev/null
  bin/rt-agent intel-add Hosts "api.example.com" > /dev/null
  grep -q "^- api.example.com$" agent/engagements/demo/intel.md || {
    echo "FAIL: intel bullet not appended"; return 1;
  }
}

test_note_appends_with_timestamp() {
  bin/rt-agent engage demo > /dev/null
  bin/rt-agent note "checked DNS" > /dev/null
  local last; last=$(tail -1 agent/engagements/demo/notes.md)
  assert_match "$last" "^- \[20[0-9]{2}-[01][0-9]-[0-3][0-9]T" "note has ISO timestamp"
}

test_event_appends_jsonl() {
  bin/rt-agent engage demo > /dev/null
  bin/rt-agent event recon.start "host=api.example.com" > /dev/null
  local line; line=$(tail -1 agent/engagements/demo/events.jsonl)
  assert_match "$line" "\"type\":\"recon.start\"" "event type recorded" || return 1
  assert_match "$line" "\"host\":\"api.example.com\"" "event payload recorded"
}

test_scope_check_passes_inscope() {
  bin/rt-agent engage demo > /dev/null
  # Write a scope manually since `auth` is interactive
  cat > agent/engagements/demo/scope.json <<'EOF'
{
  "engagement": "demo",
  "authorized_by": "tester",
  "accepted_at": "2026-05-14T00:00:00Z",
  "authorized_targets": ["example.com"],
  "out_of_scope": []
}
EOF
  bin/rt-agent scope-check "nmap example.com" 2>&1 | grep -q "would be allowed" || {
    echo "FAIL: in-scope command blocked"; return 1;
  }
}

test_scope_check_blocks_outscope() {
  bin/rt-agent engage demo > /dev/null
  cat > agent/engagements/demo/scope.json <<'EOF'
{
  "engagement": "demo",
  "authorized_by": "tester",
  "accepted_at": "2026-05-14T00:00:00Z",
  "authorized_targets": ["example.com"],
  "out_of_scope": ["secret.example.com"]
}
EOF
  local out; out=$(bin/rt-agent scope-check "curl secret.example.com/admin" 2>&1) && {
    echo "FAIL: out-of-scope command allowed"; return 1;
  }
  assert_match "$out" "out-of-scope" "scope-check refuses out-of-scope command"
}

test_prompt_returns_agent_text() {
  local out; out=$(bin/rt-agent prompt operator)
  assert_match "$out" "OPERATOR" "operator prompt text returned" || return 1
  out=$(bin/rt-agent prompt vulnerability-analyst)
  assert_match "$out" "VULNERABILITY-ANALYST" "specialist prompt returned"
}

test_prompt_rejects_unknown() {
  local out; out=$(bin/rt-agent prompt bogus 2>&1) && {
    echo "FAIL: unknown agent should fail"; return 1;
  }
  assert_match "$out" "no prompt" "unknown agent rejected"
}

# --- runner ----------------------------------------------------------------

echo "==> bin/rt-agent test suite"
echo "    Repo: $ROOT"
echo

run_test "version prints"                   test_version
run_test "engage creates workspace"         test_engage_creates_workspace
run_test "engage rejects duplicate"         test_engage_rejects_duplicate
run_test "engage rejects bad name"          test_engage_rejects_bad_name
run_test "status shows engagement"          test_status_shows_engagement
run_test "list shows engagements"           test_list_shows_engagements
run_test "use changes active engagement"    test_use_changes_active
run_test "use rejects missing"              test_use_rejects_missing
run_test "finding creates markdown"         test_finding_creates_markdown
run_test "finding IDs increment"            test_finding_increments_id
run_test "intel-add appends"                test_intel_add_appends_to_heading
run_test "note appends with timestamp"      test_note_appends_with_timestamp
run_test "event appends jsonl"              test_event_appends_jsonl
run_test "scope-check passes in-scope"      test_scope_check_passes_inscope
run_test "scope-check blocks out-of-scope"  test_scope_check_blocks_outscope
run_test "prompt returns agent text"        test_prompt_returns_agent_text
run_test "prompt rejects unknown"           test_prompt_rejects_unknown

echo
echo "==> Results: $PASS passed, $FAIL failed"
if [[ "$FAIL" -gt 0 ]]; then
  echo "    Failed tests:"
  for t in "${FAILED_TESTS[@]}"; do
    echo "      - $t"
  done
  exit 1
fi
exit 0
