import { handleWorkerFetch } from "../src/index.js";
import type { Env, ProjectConfig, Role } from "../src/types.js";
import type { RepoFileRef, RepoStore, RepoWriteResult } from "../src/repo_store.js";

declare const process: { exitCode?: number };

const env: Env = {
  BROKER_VERSION: "test",
  DEFAULT_BRANCH: "main",
  GITHUB_APP_ID: "TEST_ONLY",
  GITHUB_APP_INSTALLATION_ID: "TEST_ONLY",
  GITHUB_APP_PRIVATE_KEY: "TEST_ONLY",
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

const roleTokens: Record<Role, string> = {
  PM_AI: env.BROKER_KEY_PM,
  CODER_AI: env.BROKER_KEY_CODER,
  AUDITOR_AI: env.BROKER_KEY_AUDITOR,
  HELPER_AI: env.BROKER_KEY_HELPER,
  HELPER_CODEX: "NO_TOKEN_IN_BROKER",
  EXPLORER_AI: env.BROKER_KEY_EXPLORER,
  HYPOTHESIZER_AI: env.BROKER_KEY_HYPOTHESIZER,
  DESIGNER_AI: env.BROKER_KEY_DESIGNER,
  SCIENCE_AUDITOR_AI: env.BROKER_KEY_SCIENCE_AUDITOR,
  SCIENCE_EXECUTOR_AI: env.BROKER_KEY_SCIENCE_EXECUTOR,
  HUMAN: env.BROKER_KEY_HUMAN
};

class MemoryRepoStore implements RepoStore {
  writes = 0;
  files = new Map<string, RepoFileRef>();

  constructor() {
    this.files.set("governance/flows/flow_index.json", {
      path: "governance/flows/flow_index.json",
      sha: "sha-index",
      content: JSON.stringify({
        schema_version: "flow_index.v0.3",
        project: "ArqonZero",
        updated_at: "2026-05-17T00:00:00.000Z",
        flows: [
          {
            flow_id: "FLOW-2026-0001",
            name: "read-resume-policy-unit",
            type: "science_flow",
            title: "Read Resume Policy Unit",
            status: "active",
            current_gate: "DRAFT",
            created_at: "2026-05-17T00:00:00.000Z",
            updated_at: "2026-05-17T00:00:00.000Z",
            source_path: "governance/flows/FLOW-2026-0001/flow_manifest.json"
          }
        ]
      })
    });
    this.files.set("governance/flows/FLOW-2026-0001/flow_manifest.json", {
      path: "governance/flows/FLOW-2026-0001/flow_manifest.json",
      sha: "sha-manifest",
      content: JSON.stringify({
        schema_version: "flow_manifest.v0.3",
        official_artifact: true,
        project: "ArqonZero",
        flow_id: "FLOW-2026-0001",
        name: "read-resume-policy-unit",
        type: "science_flow",
        title: "Read Resume Policy Unit",
        summary: "Test flow.",
        status: "active",
        current_gate: "DRAFT",
        created_at: "2026-05-17T00:00:00.000Z",
        created_by_role: "EXPLORER_AI",
        updated_at: "2026-05-17T00:00:00.000Z",
        updated_by_role: "EXPLORER_AI",
        required_status_labels: ["REQUIRES_HUMAN_REVIEW", "development diagnostic only", "NOT SEALED-TEST CERTIFIED", "not promotable"],
        artifacts: [],
        history: []
      })
    });
  }

  async fetchFile(_env: Env, _project: ProjectConfig, path: string): Promise<RepoFileRef> {
    const file = this.files.get(path);
    if (!file) throw new Error(`GitHub file fetch failed for ${path}: 404 TEST_NOT_FOUND`);
    return file;
  }

  async writeFile(_env: Env, _project: ProjectConfig, path: string, content: string, _message: string): Promise<RepoWriteResult> {
    this.writes += 1;
    this.files.set(path, { path, content, sha: `sha-write-${this.writes}` });
    return { path, sha: `sha-write-${this.writes}` };
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function request(path: string, token: string): Request {
  return new Request(`https://contextbus.test${path}`, { method: "GET", headers: { authorization: `Bearer ${token}` } });
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  return JSON.parse(text) as Record<string, unknown>;
}

async function expectNoMutation(store: MemoryRepoStore, route: string, token: string): Promise<Record<string, unknown>> {
  const before = store.writes;
  const response = await handleWorkerFetch(request(route, token), env, { flowRepoStore: store });
  const body = await readJson(response);
  assert(response.status === 200, `${route} expected 200, got ${response.status}: ${JSON.stringify(body)}`);
  assert(store.writes === before, `${route} mutated repo state`);
  return body;
}

async function main(): Promise<void> {
  const store = new MemoryRepoStore();
  const routes = [
    "/v1/whoami",
    "/v1/capabilities",
    "/v1/show",
    "/v1/resume?flow_ref=read-resume-policy-unit",
    "/v1/flows/read-resume-policy-unit/resume",
    "/v1/flows/read-resume-policy-unit/history",
    "/v1/flows/read-resume-policy-unit/artifacts",
    "/v1/flows/read-resume-policy-unit/latest",
    "/v1/flows/read-resume-policy-unit/next",
    "/v1/flows/read-resume-policy-unit/stop-conditions"
  ];

  for (const route of routes) {
    await expectNoMutation(store, route, env.BROKER_KEY_EXPLORER);
  }

  const roles: Role[] = ["PM_AI", "CODER_AI", "AUDITOR_AI", "HELPER_AI", "EXPLORER_AI", "HYPOTHESIZER_AI", "DESIGNER_AI", "SCIENCE_AUDITOR_AI", "SCIENCE_EXECUTOR_AI", "HUMAN"];
  for (const role of roles) {
    const whoami = await expectNoMutation(store, "/v1/whoami", roleTokens[role]);
    assert(whoami.authenticated_role === role, `whoami role mismatch for ${role}`);
    assert(whoami.can_share_science === (role === "HUMAN"), `can_share_science mismatch for ${role}`);
    assert(whoami.can_advance_flow === (role === "HUMAN"), `can_advance_flow mismatch for ${role}`);
    assert(whoami.can_execute_science === (role === "SCIENCE_EXECUTOR_AI"), `can_execute_science mismatch for ${role}`);
    if (role !== "HUMAN") {
      assert(JSON.stringify(whoami.forbidden_routes).includes("/v1/science/share"), `${role} should forbid share`);
    }
    if (role !== "SCIENCE_EXECUTOR_AI") {
      assert(whoami.can_execute_science === false, `${role} must not execute science`);
    }
  }

  const nonHumanShare = await handleWorkerFetch(new Request("https://contextbus.test/v1/science/share", { method: "POST", headers: { authorization: `Bearer ${env.BROKER_KEY_EXPLORER}`, "content-type": "application/json" }, body: JSON.stringify({ project: "ArqonZero", flow_ref: "FLOW-2026-0001", title: "Forbidden", body: "no" }) }), env, { flowRepoStore: store });
  assert(nonHumanShare.status === 403, "non-HUMAN /v1/science/share must remain denied");

  const gptExecute = await handleWorkerFetch(new Request("https://contextbus.test/v1/science/execute-experiment", { method: "POST", headers: { authorization: `Bearer ${env.BROKER_KEY_DESIGNER}`, "content-type": "application/json" }, body: JSON.stringify({ project: "ArqonZero", flow_ref: "FLOW-2026-0001", body: "no" }) }), env, { flowRepoStore: store });
  assert(gptExecute.status === 403, "GPT role must not execute Science");

  const nonHumanAdvance = await handleWorkerFetch(new Request("https://contextbus.test/v1/flows/read-resume-policy-unit/advance", { method: "POST", headers: { authorization: `Bearer ${env.BROKER_KEY_EXPLORER}`, "content-type": "application/json" }, body: JSON.stringify({ project: "ArqonZero", gate_state: "PLAN_READY" }) }), env, { flowRepoStore: store });
  assert(nonHumanAdvance.status === 403, "non-HUMAN advance must remain denied");

  console.log(JSON.stringify({ ok: true, tested_routes: routes.length, tested_roles: roles.length, final_write_count: store.writes }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
