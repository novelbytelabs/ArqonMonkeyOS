declare const process: { exitCode?: number };

import { handleWorkerFetch } from "../src/index.js";
import type { Env, ProjectConfig } from "../src/types.js";
import type { RepoStore, RepoFileRef, RepoWriteResult } from "../src/repo_store.js";

const baseUrl = "https://offline.local";

const env: Env = {
  BROKER_VERSION: "test",
  DEFAULT_BRANCH: "main",
  GITHUB_APP_ID: "test-app",
  GITHUB_APP_INSTALLATION_ID: "test-installation",
  GITHUB_APP_PRIVATE_KEY: "test-private-key",
  BROKER_KEY_PM: "pm-token",
  BROKER_KEY_CODER: "coder-token",
  BROKER_KEY_AUDITOR: "auditor-token",
  BROKER_KEY_HELPER: "helper-token",
  BROKER_KEY_EXPLORER: "explorer-token",
  BROKER_KEY_HYPOTHESIZER: "hypothesizer-token",
  BROKER_KEY_DESIGNER: "designer-token",
  BROKER_KEY_SCIENCE_AUDITOR: "science-auditor-token",
  BROKER_KEY_SCIENCE_EXECUTOR: "science-executor-token",
  BROKER_KEY_HUMAN: "human-token"
};

const files = new Map<string, string>();
let writeCount = 0;
const writes: string[] = [];

const memoryStore: RepoStore = {
  async fetchFile(_env: Env, _project: ProjectConfig, path: string): Promise<RepoFileRef> {
    const content = files.get(path);
    if (content === undefined) throw new Error(`GitHub file fetch failed for ${path}: 404 offline missing`);
    return { path, sha: `sha-${path}-${writeCount}`, content };
  },
  async writeFile(_env: Env, _project: ProjectConfig, path: string, content: string, _message: string): Promise<RepoWriteResult> {
    files.set(path, content);
    writeCount += 1;
    writes.push(path);
    return { path, sha: `sha-${path}-${writeCount}` };
  }
};

function auth(role: keyof Pick<Env,
  "BROKER_KEY_EXPLORER" | "BROKER_KEY_HYPOTHESIZER" | "BROKER_KEY_DESIGNER" | "BROKER_KEY_SCIENCE_AUDITOR" |
  "BROKER_KEY_SCIENCE_EXECUTOR" | "BROKER_KEY_HUMAN"
>): string {
  return `Bearer ${env[role]}`;
}

async function request(path: string, init: RequestInit = {}): Promise<{ status: number; body: any }> {
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await handleWorkerFetch(new Request(`${baseUrl}${path}`, { ...init, headers }), env, { flowRepoStore: memoryStore });
  const text = await response.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function seedData(): void {
  files.set("governance/flows/flow_index.json", JSON.stringify({
    schema_version: "flow_index.v0.3",
    project: "ArqonZero",
    updated_at: "2026-05-18T00:00:00.000Z",
    flows: [
      {
        flow_id: "FLOW-2026-0001",
        name: "science-read-only-smoke",
        type: "science_flow",
        title: "Science Read-only Smoke",
        status: "active",
        current_gate: "DRAFT",
        created_at: "2026-05-18T00:00:00.000Z",
        updated_at: "2026-05-18T00:00:00.000Z",
        source_path: "governance/flows/FLOW-2026-0001/flow_manifest.json"
      }
    ]
  }));

  files.set("governance/flows/FLOW-2026-0001/flow_manifest.json", JSON.stringify({
    schema_version: "flow_manifest.v0.3",
    official_artifact: true,
    project: "ArqonZero",
    flow_id: "FLOW-2026-0001",
    name: "science-read-only-smoke",
    type: "science_flow",
    title: "Science Read-only Smoke",
    summary: "offline",
    status: "active",
    current_gate: "DRAFT",
    created_at: "2026-05-18T00:00:00.000Z",
    created_by_role: "EXPLORER_AI",
    updated_at: "2026-05-18T00:00:00.000Z",
    updated_by_role: "EXPLORER_AI",
    required_status_labels: [
      "REQUIRES_HUMAN_REVIEW",
      "development diagnostic only",
      "NOT SEALED-TEST CERTIFIED",
      "not promotable"
    ],
    artifacts: [],
    history: [
      {
        event_id: "EVT-1",
        event_type: "create",
        role: "EXPLORER_AI",
        created_at: "2026-05-18T00:00:00.000Z",
        note: "created"
      }
    ]
  }));
}

async function main(): Promise<void> {
  seedData();
  const beforeWrites = writeCount;
  const results: string[] = [];
  const pass = (message: string): void => { results.push(`PASS ${message}`); };

  const queueList = await request("/v1/science/queue", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(queueList.status === 200, `queue list expected 200, got ${queueList.status}`);
  assert(Array.isArray(queueList.body.queue_items), "queue list must return queue_items array");
  assert(queueList.body.truth_boundary.queue_record_is_evidence === false, "queue list must mark non-evidence");
  pass("GET /v1/science/queue succeeds without mutation");

  const queueItem = await request("/v1/science/queue/Q-FLOW-2026-0001", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(queueItem.status === 200, `queue item expected 200, got ${queueItem.status}`);
  pass("GET /v1/science/queue/{queue_item_id} reads only");

  const queueByFlow = await request("/v1/science/queue/by-flow/science-read-only-smoke", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(queueByFlow.status === 200, `queue by-flow expected 200, got ${queueByFlow.status}`);
  pass("GET /v1/science/queue/by-flow/{flow_ref} reads only");

  const queueNext = await request("/v1/science/queue/next", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(queueNext.status === 200, `queue next expected 200, got ${queueNext.status}`);
  pass("GET /v1/science/queue/next recommends without mutation");

  const blocked = await request("/v1/science/queue/blocked", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(blocked.status === 200, `queue blocked expected 200, got ${blocked.status}`);
  pass("GET /v1/science/queue/blocked reads only");

  const quarantined = await request("/v1/science/queue/quarantined", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(quarantined.status === 200, `queue quarantined expected 200, got ${quarantined.status}`);
  pass("GET /v1/science/queue/quarantined reads only");

  const handoffs = await request("/v1/science/queue/handoffs", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(handoffs.status === 200, `queue handoffs expected 200, got ${handoffs.status}`);
  pass("GET /v1/science/queue/handoffs reads only");

  const history = await request("/v1/science/queue/history/Q-FLOW-2026-0001", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(history.status === 200, `queue history expected 200, got ${history.status}`);
  pass("GET /v1/science/queue/history/{queue_item_id} reads only");

  files.set("governance/queues/mutations/state/Q-FLOW-2026-0001.json", "{ invalid-state-json");
  files.set("governance/flows/FLOW-2026-0999/flow_manifest.json", "{ invalid-manifest-json");
  files.set("governance/flows/flow_index.json", JSON.stringify({
    schema_version: "flow_index.v0.3",
    project: "ArqonZero",
    updated_at: "2026-05-18T00:00:00.000Z",
    flows: [
      {
        flow_id: "FLOW-2026-0001",
        name: "science-read-only-smoke",
        type: "science_flow",
        title: "Science Read-only Smoke",
        status: "active",
        current_gate: "DRAFT",
        created_at: "2026-05-18T00:00:00.000Z",
        updated_at: "2026-05-18T00:00:00.000Z",
        source_path: "governance/flows/FLOW-2026-0001/flow_manifest.json"
      },
      {
        flow_id: "FLOW-2026-0999",
        name: "science-broken-smoke",
        type: "science_flow",
        title: "Science Broken Smoke",
        status: "active",
        current_gate: "DRAFT",
        created_at: "2026-05-18T00:00:00.000Z",
        updated_at: "2026-05-18T00:00:00.000Z",
        source_path: "governance/flows/FLOW-2026-0999/flow_manifest.json"
      }
    ]
  }));
  const failSoft = await request("/v1/science/queue?scan_limit=20", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(failSoft.status === 200, `queue fail-soft list expected 200, got ${failSoft.status}`);
  assert(failSoft.body.ok === true, "queue fail-soft list must return ok=true JSON");
  assert(Array.isArray(failSoft.body.queue_read_errors), "queue fail-soft list must include queue_read_errors array");
  assert(failSoft.body.queue_read_errors.length >= 1, "queue fail-soft list must report at least one queue_read_error");
  pass("malformed manifest/state fail soft to JSON with queue_read_errors");

  const boundedLargeScan = await request("/v1/science/queue?scan_limit=999", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(boundedLargeScan.status === 200, `large queue scan expected 200, got ${boundedLargeScan.status}`);
  assert(typeof boundedLargeScan.body === "object" && boundedLargeScan.body !== null, "large queue scan must return JSON object body");
  assert(boundedLargeScan.body.ok === true, "large queue scan must return ok=true JSON");
  assert(
    boundedLargeScan.body.bounded_scan?.max_flows === 20,
    `large queue scan must clamp max_flows to 20, got ${String(boundedLargeScan.body.bounded_scan?.max_flows)}`
  );
  pass("large queue scan is bounded and returns JSON");

  const unknownItem = await request("/v1/science/queue/Q-UNKNOWN", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(unknownItem.status === 404, `unknown queue item expected 404, got ${unknownItem.status}`);
  pass("unknown queue item fails closed");

  const roleSpoofHuman = await request("/v1/science/queue?role=HUMAN", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(roleSpoofHuman.status === 403, `role=HUMAN spoof expected 403, got ${roleSpoofHuman.status}`);
  pass("role=HUMAN spoofing fails");

  const roleSpoofExecutor = await request("/v1/science/queue?role=SCIENCE_EXECUTOR_AI", { headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
  assert(roleSpoofExecutor.status === 403, `role=SCIENCE_EXECUTOR_AI spoof expected 403, got ${roleSpoofExecutor.status}`);
  pass("role=SCIENCE_EXECUTOR_AI spoofing fails");

  for (const method of ["POST", "PUT", "DELETE"]) {
    const response = await request("/v1/science/queue", { method, headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
    assert(response.status >= 400, `${method} /v1/science/queue should fail closed; got ${response.status}`);
  }
  pass("POST/PUT/DELETE fail closed on read-only route");

  for (const forbiddenPath of [
    "/v1/science/queue/Q-FLOW-2026-0001/claim",
    "/v1/science/queue/Q-FLOW-2026-0001/complete",
    "/v1/science/queue/Q-FLOW-2026-0001/block",
    "/v1/science/queue/Q-FLOW-2026-0001/quarantine",
    "/v1/science/queue/Q-FLOW-2026-0001/handoff"
  ]) {
    const response = await request(forbiddenPath, { method: "POST", headers: { authorization: auth("BROKER_KEY_EXPLORER") } });
    assert(response.status >= 400, `forbidden route ${forbiddenPath} should fail closed; got ${response.status}`);
  }
  pass("forbidden mutation routes are absent or fail closed");

  const afterWrites = writeCount;
  assert(afterWrites - beforeWrites === 0, `write count delta must be zero, got ${afterWrites - beforeWrites}`);
  assert(writes.length === 0, `no writes expected, saw: ${writes.join(",")}`);
  pass("no-mutation proof write delta is zero");

  console.log(JSON.stringify({ ok: true, write_count_before: beforeWrites, write_count_after: afterWrites, write_delta: afterWrites - beforeWrites, results }, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
