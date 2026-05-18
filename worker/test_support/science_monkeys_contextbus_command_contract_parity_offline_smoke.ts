declare const process: {
  exitCode?: number;
};

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
const writeCounts = new Map<string, number>();

const memoryStore: RepoStore = {
  async fetchFile(_env: Env, _project: ProjectConfig, path: string): Promise<RepoFileRef> {
    const content = files.get(path);
    if (content === undefined) throw new Error(`GitHub file fetch failed for ${path}: 404 offline missing`);
    return { path, sha: `sha-${path}-${writeCounts.get(path) || 0}`, content };
  },
  async writeFile(_env: Env, _project: ProjectConfig, path: string, content: string, _message: string): Promise<RepoWriteResult> {
    files.set(path, content);
    writeCounts.set(path, (writeCounts.get(path) || 0) + 1);
    return { path, sha: `sha-${path}-${writeCounts.get(path)}` };
  }
};

function auth(role: keyof Pick<Env,
  "BROKER_KEY_PM" | "BROKER_KEY_CODER" | "BROKER_KEY_AUDITOR" | "BROKER_KEY_HELPER" |
  "BROKER_KEY_EXPLORER" | "BROKER_KEY_HYPOTHESIZER" | "BROKER_KEY_DESIGNER" |
  "BROKER_KEY_SCIENCE_AUDITOR" | "BROKER_KEY_SCIENCE_EXECUTOR" | "BROKER_KEY_HUMAN"
>): string {
  return `Bearer ${env[role]}`;
}

async function requestJson(path: string, init: RequestInit = {}): Promise<{ status: number; body: any }> {
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await handleWorkerFetch(new Request(`${baseUrl}${path}`, { ...init, headers }), env, { flowRepoStore: memoryStore });
  const text = await response.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, body };
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const results: string[] = [];
  const pass = (message: string): void => { results.push(`PASS ${message}`); };

  const missingTags = await requestJson("/v1/notes", {
    method: "POST",
    headers: { authorization: auth("BROKER_KEY_EXPLORER") },
    body: JSON.stringify({
      project: "ArqonZero",
      title: "Missing tags",
      body: "This should fail without tags.",
      visibility: "team"
    })
  });
  assert(missingTags.status === 400, `missing tags expected 400, got ${missingTags.status}`);
  assert(missingTags.body.error.code === "BAD_REQUEST", "missing tags should return BAD_REQUEST");
  pass("notes fail without tags");

  const missingVisibility = await requestJson("/v1/notes", {
    method: "POST",
    headers: { authorization: auth("BROKER_KEY_EXPLORER") },
    body: JSON.stringify({
      project: "ArqonZero",
      title: "Missing visibility",
      body: "This should fail without visibility.",
      tags: ["stage2b", "contextbus-smoke", "EXPLORER_AI"]
    })
  });
  assert(missingVisibility.status === 400, `missing visibility expected 400, got ${missingVisibility.status}`);
  assert(missingVisibility.body.error.code === "BAD_REQUEST", "missing visibility should return BAD_REQUEST");
  pass("notes fail without visibility");

  const invalidVisibility = await requestJson("/v1/notes", {
    method: "POST",
    headers: { authorization: auth("BROKER_KEY_EXPLORER") },
    body: JSON.stringify({
      project: "ArqonZero",
      title: "Invalid visibility",
      body: "This should fail with invalid visibility.",
      tags: ["stage2b", "contextbus-smoke", "EXPLORER_AI"],
      visibility: "private"
    })
  });
  assert(invalidVisibility.status === 400, `invalid visibility expected 400, got ${invalidVisibility.status}`);
  assert(invalidVisibility.body.error.code === "INVALID_VISIBILITY", "invalid visibility should return INVALID_VISIBILITY");
  pass("notes fail with invalid visibility");

  const validNote = await requestJson("/v1/notes", {
    method: "POST",
    headers: { authorization: auth("BROKER_KEY_EXPLORER") },
    body: JSON.stringify({
      project: "ArqonZero",
      title: "SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ROLE_SMOKE_001_EXPLORER_AI_NOTE",
      body: "This is a non-official ContextBus smoke note created by Arqon Zero Explorer AI to verify note-write access.",
      tags: ["stage2b", "contextbus-smoke", "EXPLORER_AI"],
      visibility: "team"
    })
  });
  assert(validNote.status === 201, `valid note expected 201, got ${validNote.status}: ${JSON.stringify(validNote.body)}`);
  assert(validNote.body.ok === true, "valid note should succeed");
  pass("notes succeed with tags and visibility=team");

  const missingTo = await requestJson("/v1/messages", {
    method: "POST",
    headers: { authorization: auth("BROKER_KEY_EXPLORER") },
    body: JSON.stringify({
      project: "ArqonZero",
      subject: "Missing to",
      body: "This should fail without to."
    })
  });
  assert(missingTo.status === 400, `missing to expected 400, got ${missingTo.status}`);
  assert(missingTo.body.error.code === "BAD_REQUEST", "missing to should return BAD_REQUEST");
  pass("messages fail without to");

  const validMessage = await requestJson("/v1/messages", {
    method: "POST",
    headers: { authorization: auth("BROKER_KEY_EXPLORER") },
    body: JSON.stringify({
      project: "ArqonZero",
      to: "EXPLORER_AI",
      subject: "SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ROLE_SMOKE_001_EXPLORER_AI_MESSAGE",
      body: "This is a non-official ContextBus smoke message created by Arqon Zero Explorer AI."
    })
  });
  assert(validMessage.status === 201, `valid message expected 201, got ${validMessage.status}: ${JSON.stringify(validMessage.body)}`);
  assert(validMessage.body.ok === true, "valid message should succeed");
  pass("messages succeed with to");

  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
