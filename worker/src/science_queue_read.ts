import { requireRole } from "./auth";
import { getProject } from "./projects";
import { githubRepoStore, type RepoStore } from "./repo_store";
import { assertSafeReadPath, STATUS_LABELS } from "./policy";
import { errorResponse, jsonResponse } from "./response";
import type { Env, Role } from "./types";

interface FlowIndexEntry {
  flow_id: string;
  name: string;
  type: string;
  status: string;
  current_gate: string;
  title: string;
  updated_at: string;
}

interface FlowIndex {
  schema_version: string;
  project: string;
  flows: FlowIndexEntry[];
}

interface FlowArtifactSummary {
  artifact_id?: string;
  artifact_type?: string;
  title?: string;
  role?: string;
  created_at?: string;
  source_path?: string;
  source_sha?: string;
}

interface FlowHistoryEvent {
  event_id?: string;
  event_type?: string;
  role?: string;
  created_at?: string;
  note?: string;
}

interface FlowManifest {
  flow_id: string;
  name: string;
  type: string;
  status: string;
  current_gate: string;
  title: string;
  artifacts?: FlowArtifactSummary[];
  history?: FlowHistoryEvent[];
}

export interface QueueTruthBoundary {
  queue_record_is_truth: false;
  queue_record_is_evidence: false;
  raw_gpt_output_is_evidence: false;
  contextbus_notes_messages_are_evidence: false;
  requires_harness: true;
}

export interface QueueItem {
  queue_item_id: string;
  project: string;
  flow_id: string;
  flow_ref: string;
  queue_lane: "diagnostic";
  current_state: string;
  current_role_owner: string;
  allowed_next_role: string;
  allowed_next_action: string;
  blocked_reason: string | null;
  stop_condition: string | null;
  related_artifacts: Record<string, unknown>[];
  evidence_requirements: unknown[];
  audit_status: "UNKNOWN";
  human_decision_status: "UNKNOWN";
  truth_boundary: QueueTruthBoundary;
}

export const TRUTH_BOUNDARY: QueueTruthBoundary = {
  queue_record_is_truth: false,
  queue_record_is_evidence: false,
  raw_gpt_output_is_evidence: false,
  contextbus_notes_messages_are_evidence: false,
  requires_harness: true
};

export const SCIENCE_QUEUE_ROLES: Role[] = [
  "EXPLORER_AI",
  "HYPOTHESIZER_AI",
  "DESIGNER_AI",
  "SCIENCE_AUDITOR_AI",
  "SCIENCE_EXECUTOR_AI",
  "HUMAN"
];

export function getParam(url: URL, name: string): string | null {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}

export function requiredStatusLabels(): string[] {
  return [...STATUS_LABELS];
}

function flowIndexPath(): string {
  return "governance/flows/flow_index.json";
}

function flowManifestPath(flowId: string): string {
  return `governance/flows/${flowId}/flow_manifest.json`;
}

function emptyFlowIndex(project: string): FlowIndex {
  return { schema_version: "flow_index.v0.3", project, flows: [] };
}

function safePath(path: string | undefined): string {
  if (!path) return "UNKNOWN";
  try {
    assertSafeReadPath(path);
    return path;
  } catch {
    return "UNKNOWN_UNSAFE_PATH";
  }
}

function readState(status: string, gate: string): string {
  const normalizedStatus = (status || "").toLowerCase();
  const normalizedGate = (gate || "").toUpperCase();
  if (normalizedStatus === "blocked") return "BLOCKED";
  if (normalizedStatus === "completed") return "COMPLETED_STEP";
  if (normalizedGate.includes("QUARANTINE")) return "QUARANTINED";
  if (normalizedGate.includes("EXECUTOR")) return "WAITING_FOR_EXECUTOR";
  if (normalizedGate.includes("HUMAN")) return "WAITING_FOR_HUMAN";
  if (normalizedGate.includes("BLOCK")) return "BLOCKED";
  if (normalizedStatus === "active") return "READY";
  return "UNKNOWN";
}

function roleFromGate(gate: string): string {
  const normalized = (gate || "").toUpperCase();
  if (normalized.includes("EXPLORER")) return "EXPLORER_AI";
  if (normalized.includes("HYPOTHESIZER")) return "HYPOTHESIZER_AI";
  if (normalized.includes("DESIGNER")) return "DESIGNER_AI";
  if (normalized.includes("AUDITOR")) return "SCIENCE_AUDITOR_AI";
  if (normalized.includes("EXECUTOR")) return "SCIENCE_EXECUTOR_AI";
  if (normalized.includes("HUMAN")) return "HUMAN";
  return "UNKNOWN";
}

function isScienceQueueMutatingRole(role: Role): boolean {
  return ["EXPLORER_AI", "HYPOTHESIZER_AI", "DESIGNER_AI", "SCIENCE_AUDITOR_AI"].includes(role);
}

function allowedNextActionForQueueItem(role: Role, state: string, currentRoleOwner: string, allowedNextRole: string): string {
  if (!isScienceQueueMutatingRole(role)) return "READ_ONLY_RECOMMENDATION_ONLY";

  if (state === "READY") {
    if (currentRoleOwner === "UNKNOWN" || currentRoleOwner === role || allowedNextRole === role) {
      return "CLAIM_ELIGIBLE";
    }
    return "CLAIM_POLICY_CHECK_REQUIRED";
  }

  if (state === "CLAIMED") return "CLAIMED_ITEM_REQUIRES_STATE_RECORD_CHECK";
  if (state === "BLOCKED") return "BLOCKED_ITEM_POLICY_CHECK_REQUIRED";
  if (state === "QUARANTINED") return "READ_ONLY_RECOMMENDATION_ONLY";
  if (state === "COMPLETED_STEP") return "READ_ONLY_RECOMMENDATION_ONLY";

  return "READ_ONLY_RECOMMENDATION_ONLY";
}

function safeArtifacts(artifacts: FlowArtifactSummary[] | undefined): Record<string, unknown>[] {
  return (artifacts || []).map(artifact => ({
    artifact_id: artifact.artifact_id || "UNKNOWN",
    artifact_type: artifact.artifact_type || "UNKNOWN",
    title: artifact.title || "UNKNOWN",
    role: artifact.role || "UNKNOWN",
    created_at: artifact.created_at || "UNKNOWN",
    source_path: safePath(artifact.source_path),
    source_sha: artifact.source_sha || "UNKNOWN"
  }));
}

function visibilityFilter(role: Role, item: QueueItem): boolean {
  if (role === "HUMAN") return true;
  if (role === "SCIENCE_EXECUTOR_AI") {
    return item.current_state === "WAITING_FOR_EXECUTOR" || item.allowed_next_role === "SCIENCE_EXECUTOR_AI";
  }
  if (item.current_role_owner === role || item.allowed_next_role === role) return true;
  if (["READY", "UNKNOWN", "BLOCKED", "QUARANTINED", "WAITING_FOR_HUMAN"].includes(item.current_state)) return true;
  return false;
}

async function loadFlowIndex(env: Env, projectName: string, store: RepoStore): Promise<FlowIndex> {
  const project = getProject(projectName);
  if (!project) throw new Error(`Unknown project: ${projectName}`);
  try {
    const file = await store.fetchFile(env, project, flowIndexPath());
    const parsed = JSON.parse(file.content) as FlowIndex;
    if (!Array.isArray(parsed.flows)) return emptyFlowIndex(projectName);
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("404")) return emptyFlowIndex(projectName);
    throw error;
  }
}

export async function loadManifest(env: Env, projectName: string, flowId: string, store: RepoStore): Promise<FlowManifest | null> {
  const project = getProject(projectName);
  if (!project) throw new Error(`Unknown project: ${projectName}`);
  try {
    const file = await store.fetchFile(env, project, flowManifestPath(flowId));
    return JSON.parse(file.content) as FlowManifest;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("404")) return null;
    throw error;
  }
}

export async function buildQueueItems(env: Env, projectName: string, role: Role, store: RepoStore): Promise<QueueItem[]> {
  const flowIndex = await loadFlowIndex(env, projectName, store);
  const scienceFlows = flowIndex.flows.filter(entry => entry.type === "science_flow");
  const items: QueueItem[] = [];

  for (const entry of scienceFlows) {
    const manifest = await loadManifest(env, projectName, entry.flow_id, store);
    const currentGate = manifest?.current_gate || entry.current_gate || "UNKNOWN";
    const state = readState(manifest?.status || entry.status || "UNKNOWN", currentGate);
    const nextRole = roleFromGate(currentGate);
    const item: QueueItem = {
      queue_item_id: `Q-${entry.flow_id}`,
      project: projectName,
      flow_id: entry.flow_id,
      flow_ref: manifest?.name || entry.name || entry.flow_id,
      queue_lane: "diagnostic",
      current_state: state,
      current_role_owner: nextRole,
      allowed_next_role: nextRole,
      allowed_next_action: allowedNextActionForQueueItem(role, state, nextRole, nextRole),
      blocked_reason: state === "BLOCKED" ? "UNKNOWN" : null,
      stop_condition: state === "QUARANTINED" ? "QUARANTINE_CONDITION_PRESENT" : null,
      related_artifacts: safeArtifacts(manifest?.artifacts),
      evidence_requirements: [],
      audit_status: "UNKNOWN",
      human_decision_status: "UNKNOWN",
      truth_boundary: TRUTH_BOUNDARY
    };
    if (visibilityFilter(role, item)) items.push(item);
  }

  return items.sort((a, b) => a.flow_id.localeCompare(b.flow_id));
}

function queueResponseBase(projectName: string, role: Role): Record<string, unknown> {
  return {
    ok: true,
    project: projectName,
    authenticated_role: role,
    required_status_labels: requiredStatusLabels(),
    truth_boundary: TRUTH_BOUNDARY,
    no_mutation: true,
    warning: "Queue records are governance coordination records, not evidence or scientific truth."
  };
}

function methodGuard(request: Request): Response | null {
  if (request.method !== "GET") {
    return errorResponse("METHOD_NOT_ALLOWED", `Only GET is allowed for ${new URL(request.url).pathname}`, 405);
  }
  return null;
}

function enforceRoleQuery(url: URL, authenticatedRole: Role): Response | null {
  const requestedRole = getParam(url, "role");
  if (!requestedRole) return null;
  if (authenticatedRole !== "HUMAN" && requestedRole !== authenticatedRole) {
    return errorResponse("ROLE_MISMATCH", `Authenticated role ${authenticatedRole} cannot request ${requestedRole}`, 403);
  }
  return null;
}

function assertScienceQueueRole(role: Role): Response | null {
  if (!SCIENCE_QUEUE_ROLES.includes(role)) {
    return errorResponse("SCIENCE_QUEUE_ROLE_FORBIDDEN", `Role ${role} cannot access read-only science queue`, 403);
  }
  return null;
}

export type ScienceQueueRoute =
  | "list"
  | "item"
  | "by_flow"
  | "next"
  | "blocked"
  | "quarantined"
  | "handoffs"
  | "history";

export async function handleScienceQueueReadRequest(
  request: Request,
  env: Env,
  route: ScienceQueueRoute,
  args: { queueItemId?: string; flowRef?: string } = {},
  repoStore?: RepoStore
): Promise<Response> {
  const methodError = methodGuard(request);
  if (methodError) return methodError;

  const role = requireRole(request, env);
  const roleError = assertScienceQueueRole(role);
  if (roleError) return roleError;

  const url = new URL(request.url);
  const roleQueryError = enforceRoleQuery(url, role);
  if (roleQueryError) return roleQueryError;

  const projectName = getParam(url, "project") || "ArqonZero";
  if (!getProject(projectName)) return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName}`, 404);

  const store = repoStore || githubRepoStore;
  const items = await buildQueueItems(env, projectName, role, store);
  const base = queueResponseBase(projectName, role);

  if (route === "list") return jsonResponse({ ...base, queue_items: items });

  if (route === "next") {
    const nextItem = items.find(item => item.allowed_next_role === role) || items[0] || null;
    return jsonResponse({ ...base, queue_item: nextItem });
  }

  if (route === "blocked") return jsonResponse({ ...base, queue_items: items.filter(item => item.current_state === "BLOCKED") });
  if (route === "quarantined") return jsonResponse({ ...base, queue_items: items.filter(item => item.current_state === "QUARANTINED") });
  if (route === "handoffs") {
    const handoffs = items.filter(item => item.allowed_next_role !== "UNKNOWN").map(item => ({
      queue_item_id: item.queue_item_id,
      flow_id: item.flow_id,
      from_role: item.current_role_owner,
      to_role: item.allowed_next_role,
      handoff_note: "READ_ONLY_HANDOFF_VISIBILITY_ONLY"
    }));
    return jsonResponse({ ...base, handoffs });
  }

  if (route === "by_flow") {
    const flowRef = args.flowRef || "";
    const matches = items.filter(item => item.flow_id === flowRef || item.flow_ref === flowRef);
    if (matches.length === 0) return errorResponse("QUEUE_FLOW_NOT_FOUND", `No queue items for flow ref: ${flowRef}`, 404);
    return jsonResponse({ ...base, queue_items: matches });
  }

  if (route === "item" || route === "history") {
    const queueItemId = args.queueItemId || "";
    const match = items.find(item => item.queue_item_id === queueItemId || item.flow_id === queueItemId || item.flow_ref === queueItemId);
    if (!match) return errorResponse("QUEUE_ITEM_NOT_FOUND", `Unknown queue item: ${queueItemId}`, 404);
    if (route === "item") return jsonResponse({ ...base, queue_item: match });

    const manifest = await loadManifest(env, projectName, match.flow_id, store);
    const history = (manifest?.history || []).map(event => ({
      event_id: event.event_id || "UNKNOWN",
      event_type: event.event_type || "UNKNOWN",
      role: event.role || "UNKNOWN",
      created_at: event.created_at || "UNKNOWN",
      note: event.note || ""
    }));
    return jsonResponse({ ...base, queue_item: match, history });
  }

  return errorResponse("QUEUE_ROUTE_NOT_IMPLEMENTED", `Unsupported queue route: ${route}`, 404);
}
