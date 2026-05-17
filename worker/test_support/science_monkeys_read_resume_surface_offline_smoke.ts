import { handleWorkerFetch } from "../src/index.js";
import type { Env, ProjectConfig } from "../src/types.js";
import type { RepoFileRef, RepoStore, RepoWriteResult } from "../src/repo_store.js";

declare const process: { exitCode?: number };

class MemoryRepoStore implements RepoStore {
  files = new Map<string, RepoFileRef>();
  writes = 0;

  constructor() {
    const artifactPath = "governance/flows/FLOW-2026-0001/artifacts/ART-2026-05-17-abcd1234-Research.md";
    this.files.set("governance/flows/flow_index.json", {
      path: "governance/flows/flow_index.json",
      sha: "sha-index",
      content: JSON.stringify({
        schema_version: "flow_index.v0.3",
        project: "ArqonZero",
        updated_at: "2026-05-17T00:00:00.000Z",
        flows: [{
          flow_id: "FLOW-2026-0001",
          name: "read-resume-smoke",
          type: "science_flow",
          title: "Read Resume Smoke",
          status: "active",
          current_gate: "DRAFT",
          created_at: "2026-05-17T00:00:00.000Z",
          updated_at: "2026-05-17T00:00:00.000Z",
          source_path: "governance/flows/FLOW-2026-0001/flow_manifest.json"
        }]
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
        name: "read-resume-smoke",
        type: "science_flow",
        title: "Read Resume Smoke",
        summary: "Offline smoke for read/resume routes.",
        status: "active",
        current_gate: "DRAFT",
        created_at: "2026-05-17T00:00:00.000Z",
        created_by_role: "EXPLORER_AI",
        updated_at: "2026-05-17T00:00:00.000Z",
        updated_by_role: "EXPLORER_AI",
        required_status_labels: ["REQUIRES_HUMAN_REVIEW", "development diagnostic only", "NOT SEALED-TEST CERTIFIED", "not promotable"],
        artifacts: [{
          artifact_id: "ART-2026-05-17-abcd1234",
          artifact_type: "research_dossier",
          title: "Research",
          role: "EXPLORER_AI",
          created_at: "2026-05-17T00:00:00.000Z",
          source_path: artifactPath,
          source_sha: "sha-artifact"
        }],
        history: [{
          event_id: "EVT-2026-05-17-test",
          event_type: "write_artifact",
          role: "EXPLORER_AI",
          created_at: "2026-05-17T00:00:00.000Z",
          note: "Wrote research_dossier: ART-2026-05-17-abcd1234"
        }]
      })
    });
    this.files.set(artifactPath, {
      path: artifactPath,
      sha: "sha-artifact",
      content: "---\nartifact_id: ART-2026-05-17-abcd1234\n---\n\nResearch body.\n"
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

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function request(path: string, method = "GET", token = env.BROKER_KEY_EXPLORER): Request {
  return new Request(`https://contextbus.test${path}`, { method, headers: { authorization: `Bearer ${token}` } });
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  return JSON.parse(text) as Record<string, unknown>;
}

async function main(): Promise<void> {
  const store = new MemoryRepoStore();
  const routes = [
    "/v1/whoami",
    "/v1/capabilities",
    "/v1/show",
    "/v1/resume?flow_ref=read-resume-smoke",
    "/v1/flows/read-resume-smoke/resume",
    "/v1/flows/read-resume-smoke/history",
    "/v1/flows/read-resume-smoke/artifacts",
    "/v1/flows/read-resume-smoke/latest",
    "/v1/flows/read-resume-smoke/next",
    "/v1/flows/read-resume-smoke/stop-conditions",
    "/v1/artifacts/ART-2026-05-17-abcd1234"
  ];

  for (const route of routes) {
    const before = store.writes;
    const res = await handleWorkerFetch(request(route), env, { flowRepoStore: store });
    const body = await readJson(res);
    assert(res.status === 200, `${route} expected 200, got ${res.status}: ${JSON.stringify(body)}`);
    assert(body.ok === true, `${route} expected ok true`);
    assert(JSON.stringify(body).includes("REQUIRES_HUMAN_REVIEW"), `${route} missing status labels`);
    assert(store.writes === before, `${route} should be read-only`);
  }

  const traversal = await handleWorkerFetch(request("/v1/artifacts/..%2Fsecret"), env, { flowRepoStore: store });
  assert(traversal.status === 400 || traversal.status === 404, `traversal should fail closed, got ${traversal.status}`);

  const missing = await handleWorkerFetch(request("/v1/artifacts/ART-2026-05-17-missing"), env, { flowRepoStore: store });
  assert(missing.status === 404, `missing artifact should 404, got ${missing.status}`);

  const postReadRoute = await handleWorkerFetch(request("/v1/show", "POST"), env, { flowRepoStore: store });
  assert(postReadRoute.status === 405, `POST /v1/show should 405, got ${postReadRoute.status}`);

  console.log(JSON.stringify({ ok: true, routes_tested: routes.length, final_write_count: store.writes }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
