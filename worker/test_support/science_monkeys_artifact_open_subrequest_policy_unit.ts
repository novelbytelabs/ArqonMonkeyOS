import { handleWorkerFetch } from "../src/index.js";
import type { Env, ProjectConfig } from "../src/types.js";
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

const STATUS_LABELS = ["REQUIRES_HUMAN_REVIEW", "development diagnostic only", "NOT SEALED-TEST CERTIFIED", "not promotable"];

class CountingRepoStore implements RepoStore {
  writes = 0;
  reads = 0;
  files = new Map<string, RepoFileRef>();

  constructor() {
    const flows = [
      flowEntry("FLOW-2026-0053", "newer-empty", "2026-05-17T00:00:00.000Z"),
      flowEntry("FLOW-2026-0052", "bounded-smoke-flow", "2026-05-16T00:00:00.000Z"),
      flowEntry("FLOW-2026-0051", "duplicate-a", "2026-05-15T00:00:00.000Z"),
      flowEntry("FLOW-2026-0050", "duplicate-b", "2026-05-14T00:00:00.000Z"),
      flowEntry("FLOW-2026-0049", "older-empty", "2026-05-13T00:00:00.000Z"),
      flowEntry("FLOW-2026-0048", "older-empty-2", "2026-05-12T00:00:00.000Z"),
      flowEntry("FLOW-2026-0047", "older-empty-3", "2026-05-11T00:00:00.000Z"),
      flowEntry("FLOW-2026-0046", "older-empty-4", "2026-05-10T00:00:00.000Z"),
      flowEntry("FLOW-2026-0045", "older-empty-5", "2026-05-09T00:00:00.000Z"),
      flowEntry("FLOW-2026-0044", "older-empty-6", "2026-05-08T00:00:00.000Z"),
      flowEntry("FLOW-2026-0002", "older-artifact", "2026-05-07T00:00:00.000Z")
    ];

    this.files.set("governance/flows/flow_index.json", {
      path: "governance/flows/flow_index.json",
      sha: "sha-index",
      content: JSON.stringify({ schema_version: "flow_index.v0.3", project: "ArqonZero", updated_at: "2026-05-17T00:00:00.000Z", flows })
    });

    for (const entry of flows) {
      this.files.set(`governance/flows/${entry.flow_id}/flow_manifest.json`, manifestFile(entry.flow_id, entry.name, []));
    }

    const targetPath = "governance/flows/FLOW-2026-0052/artifacts/ART-2026-05-16-6dd49724.md";
    this.files.set("governance/flows/FLOW-2026-0052/flow_manifest.json", manifestFile("FLOW-2026-0052", "bounded-smoke-flow", [{
      artifact_id: "ART-2026-05-16-6dd49724",
      artifact_type: "research_dossier",
      title: "Bounded Live Smoke Artifact",
      role: "EXPLORER_AI",
      created_at: "2026-05-16T00:00:00.000Z",
      source_path: targetPath,
      source_sha: "sha-target"
    }]));
    this.files.set(targetPath, { path: targetPath, sha: "sha-target", content: "Safe governed artifact body. No secret-like marker." });

    const dupA = "governance/flows/FLOW-2026-0051/artifacts/ART-2026-05-17-duplicate-A.md";
    const dupB = "governance/flows/FLOW-2026-0050/artifacts/ART-2026-05-17-duplicate-B.md";
    this.files.set("governance/flows/FLOW-2026-0051/flow_manifest.json", manifestFile("FLOW-2026-0051", "duplicate-a", [{
      artifact_id: "ART-2026-05-17-duplicate",
      artifact_type: "research_dossier",
      title: "Duplicate A",
      role: "EXPLORER_AI",
      created_at: "2026-05-15T00:00:00.000Z",
      source_path: dupA,
      source_sha: "sha-dup-a"
    }]));
    this.files.set("governance/flows/FLOW-2026-0050/flow_manifest.json", manifestFile("FLOW-2026-0050", "duplicate-b", [{
      artifact_id: "ART-2026-05-17-duplicate",
      artifact_type: "research_dossier",
      title: "Duplicate B",
      role: "EXPLORER_AI",
      created_at: "2026-05-14T00:00:00.000Z",
      source_path: dupB,
      source_sha: "sha-dup-b"
    }]));
    this.files.set(dupA, { path: dupA, sha: "sha-dup-a", content: "Duplicate A body" });
    this.files.set(dupB, { path: dupB, sha: "sha-dup-b", content: "Duplicate B body" });
  }

  resetReads(): void {
    this.reads = 0;
  }

  async fetchFile(_env: Env, _project: ProjectConfig, path: string): Promise<RepoFileRef> {
    this.reads += 1;
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

function flowEntry(flowId: string, name: string, updatedAt: string): Record<string, string> {
  return {
    flow_id: flowId,
    name,
    type: "science_flow",
    title: name,
    status: "active",
    current_gate: "DRAFT",
    created_at: updatedAt,
    updated_at: updatedAt,
    source_path: `governance/flows/${flowId}/flow_manifest.json`
  };
}

function manifestFile(flowId: string, name: string, artifacts: Record<string, unknown>[]): RepoFileRef {
  return {
    path: `governance/flows/${flowId}/flow_manifest.json`,
    sha: `sha-${flowId}`,
    content: JSON.stringify({
      schema_version: "flow_manifest.v0.3",
      official_artifact: true,
      project: "ArqonZero",
      flow_id: flowId,
      name,
      type: "science_flow",
      title: name,
      summary: "Artifact open subrequest test flow.",
      status: "active",
      current_gate: "DRAFT",
      created_at: "2026-05-17T00:00:00.000Z",
      created_by_role: "EXPLORER_AI",
      updated_at: "2026-05-17T00:00:00.000Z",
      updated_by_role: "EXPLORER_AI",
      required_status_labels: STATUS_LABELS,
      artifacts,
      history: []
    })
  };
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function request(path: string): Request {
  return new Request(`https://contextbus.test${path}`, { method: "GET", headers: { authorization: `Bearer ${env.BROKER_KEY_EXPLORER}` } });
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  return JSON.parse(text) as Record<string, unknown>;
}

async function main(): Promise<void> {
  const store = new CountingRepoStore();

  store.resetReads();
  const scoped = await handleWorkerFetch(request("/v1/artifacts/ART-2026-05-16-6dd49724?flow_ref=FLOW-2026-0052"), env, { flowRepoStore: store });
  const scopedJson = await readJson(scoped);
  assert(scoped.status === 200, `flow-scoped artifact open should pass, got ${scoped.status}: ${JSON.stringify(scopedJson)}`);
  assert(scopedJson["artifact_id"] === "ART-2026-05-16-6dd49724", "flow-scoped artifact id mismatch");
  assert(JSON.stringify(scopedJson).includes("FLOW_SCOPED_LOOKUP"), "flow-scoped lookup metadata missing");
  assert(store.reads <= 3, `flow-scoped artifact open should use a small bounded read count, reads=${store.reads}`);

  store.resetReads();
  const unscoped = await handleWorkerFetch(request("/v1/artifacts/ART-2026-05-16-6dd49724"), env, { flowRepoStore: store });
  const unscopedJson = await readJson(unscoped);
  assert(unscoped.status === 200, `unscoped bounded artifact open should pass for recent artifacts, got ${unscoped.status}: ${JSON.stringify(unscopedJson)}`);
  assert(JSON.stringify(unscopedJson).includes("BOUNDED_RECENT_FLOW_SCAN"), "bounded scan lookup metadata missing");
  assert(store.reads <= 6, `unscoped bounded artifact open should avoid full-index scan, reads=${store.reads}`);

  store.resetReads();
  const duplicate = await handleWorkerFetch(request("/v1/artifacts/ART-2026-05-17-duplicate"), env, { flowRepoStore: store });
  assert(duplicate.status === 409, `duplicate artifact should still fail closed with 409, got ${duplicate.status}`);
  assert(store.reads <= 5, `duplicate detection should stay bounded, reads=${store.reads}`);

  assert(store.writes === 0, `artifact open subrequest remediation must not mutate repo state, writes=${store.writes}`);
  console.log(JSON.stringify({ ok: true, artifact_open_subrequest_checks: 3, final_write_count: store.writes }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
