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

class MemoryRepoStore implements RepoStore {
  writes = 0;
  files = new Map<string, RepoFileRef>();

  constructor() {
    const duplicatePathA = "governance/flows/FLOW-2026-0003/artifacts/ART-2026-05-17-duplicate-A.md";
    const duplicatePathB = "governance/flows/FLOW-2026-0004/artifacts/ART-2026-05-17-duplicate-B.md";
    const secretPath = "governance/flows/FLOW-2026-0005/artifacts/ART-2026-05-17-secret.md";
    this.files.set("governance/flows/flow_index.json", {
      path: "governance/flows/flow_index.json",
      sha: "sha-index",
      content: JSON.stringify({
        schema_version: "flow_index.v0.3",
        project: "ArqonZero",
        updated_at: "2026-05-17T00:00:00.000Z",
        flows: [
          flowEntry("FLOW-2026-0002", "unsafe-artifact-path"),
          flowEntry("FLOW-2026-0003", "duplicate-artifact-a"),
          flowEntry("FLOW-2026-0004", "duplicate-artifact-b"),
          flowEntry("FLOW-2026-0005", "secret-artifact-content")
        ]
      })
    });
    this.files.set("governance/flows/FLOW-2026-0002/flow_manifest.json", manifestFile("FLOW-2026-0002", "unsafe-artifact-path", [{
      artifact_id: "ART-2026-05-17-unsafe",
      artifact_type: "research_dossier",
      title: "Unsafe Path Artifact",
      role: "EXPLORER_AI",
      created_at: "2026-05-17T00:00:00.000Z",
      source_path: "governance/flows/FLOW-2026-0002/artifacts/../secrets.md",
      source_sha: "sha-unsafe"
    }]));
    this.files.set("governance/flows/FLOW-2026-0003/flow_manifest.json", manifestFile("FLOW-2026-0003", "duplicate-artifact-a", [{
      artifact_id: "ART-2026-05-17-duplicate",
      artifact_type: "research_dossier",
      title: "Duplicate A",
      role: "EXPLORER_AI",
      created_at: "2026-05-17T00:00:00.000Z",
      source_path: duplicatePathA,
      source_sha: "sha-dup-a"
    }]));
    this.files.set("governance/flows/FLOW-2026-0004/flow_manifest.json", manifestFile("FLOW-2026-0004", "duplicate-artifact-b", [{
      artifact_id: "ART-2026-05-17-duplicate",
      artifact_type: "research_dossier",
      title: "Duplicate B",
      role: "EXPLORER_AI",
      created_at: "2026-05-17T00:00:00.000Z",
      source_path: duplicatePathB,
      source_sha: "sha-dup-b"
    }]));
    this.files.set("governance/flows/FLOW-2026-0005/flow_manifest.json", manifestFile("FLOW-2026-0005", "secret-artifact-content", [{
      artifact_id: "ART-2026-05-17-secret",
      artifact_type: "research_dossier",
      title: "Secret Marker Artifact",
      role: "EXPLORER_AI",
      created_at: "2026-05-17T00:00:00.000Z",
      source_path: secretPath,
      source_sha: "sha-secret"
    }]));
    this.files.set(duplicatePathA, { path: duplicatePathA, sha: "sha-dup-a", content: "Duplicate A body" });
    this.files.set(duplicatePathB, { path: duplicatePathB, sha: "sha-dup-b", content: "Duplicate B body" });
    this.files.set(secretPath, { path: secretPath, sha: "sha-secret", content: "api_key = sk-test-secret-marker-000000000000" });
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

function flowEntry(flowId: string, name: string): Record<string, string> {
  return {
    flow_id: flowId,
    name,
    type: "science_flow",
    title: name,
    status: "active",
    current_gate: "DRAFT",
    created_at: "2026-05-17T00:00:00.000Z",
    updated_at: "2026-05-17T00:00:00.000Z",
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
      summary: "Hardening test flow.",
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
  const store = new MemoryRepoStore();

  const artifactListResponse = await handleWorkerFetch(request("/v1/flows/unsafe-artifact-path/artifacts"), env, { flowRepoStore: store });
  const artifactList = await readJson(artifactListResponse);
  assert(artifactListResponse.status === 200, `unsafe artifact list should still return metadata, got ${artifactListResponse.status}`);
  assert(JSON.stringify(artifactList).includes("UNKNOWN_UNSAFE_PATH"), "unsafe source_path must be hidden as UNKNOWN_UNSAFE_PATH");
  assert(JSON.stringify(artifactList).includes("UNSAFE_ARTIFACT_SOURCE_PATH_PRESENT"), "unsafe source_path must add unknown marker");

  const unsafeOpenResponse = await handleWorkerFetch(request("/v1/artifacts/ART-2026-05-17-unsafe"), env, { flowRepoStore: store });
  assert(unsafeOpenResponse.status === 400 || unsafeOpenResponse.status === 403, `unsafe artifact body read must fail closed, got ${unsafeOpenResponse.status}`);

  const duplicateOpenResponse = await handleWorkerFetch(request("/v1/artifacts/ART-2026-05-17-duplicate"), env, { flowRepoStore: store });
  assert(duplicateOpenResponse.status === 409, `duplicate artifact_id must fail with 409, got ${duplicateOpenResponse.status}`);

  const secretOpenResponse = await handleWorkerFetch(request("/v1/artifacts/ART-2026-05-17-secret"), env, { flowRepoStore: store });
  const secretBodyText = await secretOpenResponse.text();
  assert(secretOpenResponse.status === 403, `secret-like artifact body must be refused with 403, got ${secretOpenResponse.status}: ${secretBodyText}`);
  assert(!secretBodyText.includes("sk-test-secret-marker"), "secret-like marker must not be echoed in response body");
  assert(store.writes === 0, `hardening read routes must not mutate repo state, writes=${store.writes}`);

  console.log(JSON.stringify({ ok: true, hardening_checks: 4, final_write_count: store.writes }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
