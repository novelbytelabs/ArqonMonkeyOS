import { requireRole } from "./auth";
import { getProject } from "./projects";
import { githubRepoStore, type RepoStore } from "./repo_store";
import { errorResponse, jsonResponse } from "./response";
import type { Env, Role } from "./types";
import {
  SCIENCE_QUEUE_ROLES,
  TRUTH_BOUNDARY,
  buildQueueItems,
  getParam,
  requiredStatusLabels,
  type QueueTruthBoundary
} from "./science_queue_read";

type MutationRoute = "claim" | "complete" | "block" | "quarantine" | "handoff";
type QueueState =
  | "READY"
  | "CLAIMED"
  | "IN_PROGRESS"
  | "COMPLETED_STEP"
  | "BLOCKED"
  | "QUARANTINED"
  | "HANDOFF_REQUESTED"
  | "WAITING_FOR_HUMAN"
  | "WAITING_FOR_EXECUTOR"
  | "UNKNOWN";

interface MutationStateRecord {
  queue_item_id: string;
  flow_ref: string;
  flow_id: string;
  project: string;
  current_state: QueueState;
  claimed_by: Role | null;
  handoff_target_role: string | null;
  updated_at: string;
  latest_mutation_id: string;
}

interface MutationRecord {
  mutation_id: string;
  queue_item_id: string;
  project: string;
  flow_ref: string;
  authenticated_role: Role;
  mutation_type: MutationRoute;
  prior_state: QueueState;
  new_state: QueueState;
  reason: string;
  timestamp: string;
  idempotency_key: string;
  source_route: string;
  actor_authority_check: string;
  truth_boundary: MutationTruthBoundary;
  required_status_labels: string[];
  payload_signature: string;
  handoff_target_role?: string;
  completion_evidence_refs?: string[];
}

interface NormalizedRequest {
  project: string;
  idempotency_key: string;
  reason: string;
  target_role?: string;
  evidence_refs?: string[];
}

interface MutationTruthBoundary extends QueueTruthBoundary {
  mutation_record_is_truth: false;
  mutation_record_is_evidence_by_itself: false;
}

const MUTATION_TRUTH_BOUNDARY: MutationTruthBoundary = {
  ...TRUTH_BOUNDARY,
  mutation_record_is_truth: false,
  mutation_record_is_evidence_by_itself: false
};

const MUTATING_ROLES: Role[] = [
  "EXPLORER_AI",
  "HYPOTHESIZER_AI",
  "DESIGNER_AI",
  "SCIENCE_AUDITOR_AI"
];

const ALLOWED_HANDOFF_TARGETS: Record<Role, string[]> = {
  EXPLORER_AI: ["HYPOTHESIZER_AI", "DESIGNER_AI", "SCIENCE_AUDITOR_AI"],
  HYPOTHESIZER_AI: ["DESIGNER_AI", "SCIENCE_AUDITOR_AI"],
  DESIGNER_AI: ["EXPLORER_AI", "HYPOTHESIZER_AI", "SCIENCE_AUDITOR_AI"],
  SCIENCE_AUDITOR_AI: ["EXPLORER_AI", "HYPOTHESIZER_AI", "DESIGNER_AI", "HUMAN"],
  PM_AI: [],
  CODER_AI: [],
  AUDITOR_AI: [],
  HELPER_AI: [],
  HELPER_CODEX: [],
  SCIENCE_EXECUTOR_AI: [],
  HUMAN: []
};

const TRANSITIONS: Record<MutationRoute, QueueState[]> = {
  claim: ["READY", "BLOCKED"],
  complete: ["CLAIMED", "IN_PROGRESS"],
  block: ["READY", "CLAIMED", "IN_PROGRESS"],
  quarantine: ["READY", "CLAIMED", "IN_PROGRESS", "BLOCKED", "HANDOFF_REQUESTED"],
  handoff: ["COMPLETED_STEP", "BLOCKED", "READY"]
};

function isMutatingRole(role: Role): boolean {
  return MUTATING_ROLES.includes(role);
}

function mutationError(code: string, message: string, status: number): Response {
  return errorResponse(code, message, status);
}

function sanitizeSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]+/g, "_");
}

function isSafeIdentifier(value: string): boolean {
  return /^[A-Za-z0-9._:-]+$/.test(value);
}

function statePath(queueItemId: string): string {
  return `governance/queues/mutations/state/${sanitizeSegment(queueItemId)}.json`;
}

function mutationRecordPath(timestamp: string, queueItemId: string, route: MutationRoute, role: Role, idempotencyKey: string): string {
  const yearMonth = `${timestamp.slice(0, 4)}/${timestamp.slice(5, 7)}`;
  return `governance/queues/mutations/${yearMonth}/${sanitizeSegment(queueItemId)}__${route}__${sanitizeSegment(role)}__${sanitizeSegment(idempotencyKey)}.json`;
}

function payloadSignature(route: MutationRoute, payload: NormalizedRequest): string {
  return JSON.stringify({
    route,
    project: payload.project,
    reason: payload.reason,
    idempotency_key: payload.idempotency_key,
    target_role: payload.target_role || null,
    evidence_refs: payload.evidence_refs || []
  });
}

async function readJsonIfExists<T>(env: Env, projectName: string, path: string, store: RepoStore): Promise<{ value: T | null; sha: string | null }> {
  const project = getProject(projectName);
  if (!project) throw new Error(`Unknown project: ${projectName}`);
  try {
    const file = await store.fetchFile(env, project, path);
    return { value: JSON.parse(file.content) as T, sha: file.sha };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("404")) return { value: null, sha: null };
    throw error;
  }
}

async function writeJson(env: Env, projectName: string, path: string, payload: unknown, message: string, store: RepoStore): Promise<{ path: string; sha: string }> {
  const project = getProject(projectName);
  if (!project) throw new Error(`Unknown project: ${projectName}`);
  return store.writeFile(env, project, path, `${JSON.stringify(payload, null, 2)}\n`, message);
}

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (!text.trim()) return {};
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    throw mutationError("INVALID_JSON", "Request body must be valid JSON", 400);
  }
}

function denyBodyRoleSpoof(body: Record<string, unknown>, authenticatedRole: Role): Response | null {
  const roleValue = body.role;
  if (typeof roleValue !== "string" || !roleValue.trim()) return null;
  if (roleValue !== authenticatedRole) {
    return mutationError("ROLE_SPOOF_DENIED", `Body role ${roleValue} does not match authenticated role ${authenticatedRole}`, 403);
  }
  return null;
}

function normalizeRequest(route: MutationRoute, body: Record<string, unknown>): NormalizedRequest {
  const project = typeof body.project === "string" && body.project.trim() ? body.project.trim() : "ArqonZero";
  const idempotencyKey = typeof body.idempotency_key === "string" ? body.idempotency_key.trim() : "";
  if (!idempotencyKey) throw mutationError("IDEMPOTENCY_KEY_REQUIRED", "idempotency_key is required", 400);
  if (!isSafeIdentifier(idempotencyKey)) throw mutationError("INVALID_IDEMPOTENCY_KEY", "idempotency_key contains unsafe characters", 400);

  if (route === "claim") {
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    return { project, idempotency_key: idempotencyKey, reason: reason || "CLAIM_REQUEST" };
  }
  if (route === "complete") {
    const completionSummary = typeof body.completion_summary === "string" ? body.completion_summary.trim() : "";
    if (!completionSummary) throw mutationError("COMPLETION_SUMMARY_REQUIRED", "completion_summary is required", 400);
    const evidenceRefs = Array.isArray(body.evidence_refs) ? body.evidence_refs.filter((value): value is string => typeof value === "string") : [];
    return { project, idempotency_key: idempotencyKey, reason: completionSummary, evidence_refs: evidenceRefs };
  }
  if (route === "block") {
    const blockedReason = typeof body.blocked_reason === "string" ? body.blocked_reason.trim() : "";
    if (!blockedReason) throw mutationError("BLOCKED_REASON_REQUIRED", "blocked_reason is required", 400);
    return { project, idempotency_key: idempotencyKey, reason: blockedReason };
  }
  if (route === "quarantine") {
    const quarantineReason = typeof body.quarantine_reason === "string" ? body.quarantine_reason.trim() : "";
    if (!quarantineReason) throw mutationError("QUARANTINE_REASON_REQUIRED", "quarantine_reason is required", 400);
    return { project, idempotency_key: idempotencyKey, reason: quarantineReason };
  }

  const handoffReason = typeof body.handoff_reason === "string" ? body.handoff_reason.trim() : "";
  const targetRole = typeof body.target_role === "string" ? body.target_role.trim() : "";
  if (!handoffReason) throw mutationError("HANDOFF_REASON_REQUIRED", "handoff_reason is required", 400);
  if (!targetRole) throw mutationError("TARGET_ROLE_REQUIRED", "target_role is required", 400);
  return { project, idempotency_key: idempotencyKey, reason: handoffReason, target_role: targetRole };
}

function nextState(route: MutationRoute): QueueState {
  if (route === "claim") return "CLAIMED";
  if (route === "complete") return "COMPLETED_STEP";
  if (route === "block") return "BLOCKED";
  if (route === "quarantine") return "QUARANTINED";
  return "HANDOFF_REQUESTED";
}

async function resolveQueueState(
  env: Env,
  projectName: string,
  queueItemId: string,
  role: Role,
  store: RepoStore
): Promise<{ item: Awaited<ReturnType<typeof buildQueueItems>>[number]; state: MutationStateRecord }> {
  const items = await buildQueueItems(env, projectName, role, store);
  const item = items.find(candidate => candidate.queue_item_id === queueItemId || candidate.flow_id === queueItemId || candidate.flow_ref === queueItemId);
  if (!item) throw mutationError("QUEUE_ITEM_NOT_FOUND", `Unknown or invisible queue item: ${queueItemId}`, 404);

  const stateRef = await readJsonIfExists<MutationStateRecord>(env, projectName, statePath(item.queue_item_id), store);
  const state: MutationStateRecord = stateRef.value || {
    queue_item_id: item.queue_item_id,
    flow_ref: item.flow_ref,
    flow_id: item.flow_id,
    project: projectName,
    current_state: item.current_state as QueueState,
    claimed_by: null,
    handoff_target_role: null,
    updated_at: new Date().toISOString(),
    latest_mutation_id: "NONE"
  };
  return { item, state };
}

function validateRouteAuthority(route: MutationRoute, role: Role, state: MutationStateRecord, itemRoleOwner: string, payload: NormalizedRequest): string {
  if (!SCIENCE_QUEUE_ROLES.includes(role) || !isMutatingRole(role)) {
    throw mutationError("SCIENCE_QUEUE_MUTATION_FORBIDDEN", `Role ${role} cannot mutate science queue items`, 403);
  }
  if (!TRANSITIONS[route].includes(state.current_state)) {
    throw mutationError("INVALID_QUEUE_TRANSITION", `Route ${route} cannot transition from ${state.current_state}`, 409);
  }
  if (route === "claim" && !(itemRoleOwner === "UNKNOWN" || itemRoleOwner === role || state.claimed_by === null)) {
    throw mutationError("QUEUE_CLAIM_FORBIDDEN", `Role ${role} cannot claim item owned by ${itemRoleOwner}`, 403);
  }
  if (route === "complete" && state.claimed_by !== role) {
    throw mutationError("QUEUE_COMPLETE_FORBIDDEN", `Role ${role} cannot complete item claimed by ${state.claimed_by || "NONE"}`, 403);
  }
  if (route === "block" && itemRoleOwner !== "UNKNOWN" && itemRoleOwner !== role && state.claimed_by !== role) {
    throw mutationError("QUEUE_BLOCK_FORBIDDEN", `Role ${role} cannot block item owned by ${itemRoleOwner}`, 403);
  }
  if (route === "quarantine" && role !== "SCIENCE_AUDITOR_AI") {
    throw mutationError("QUEUE_QUARANTINE_FORBIDDEN", `Role ${role} lacks direct quarantine authority`, 403);
  }
  if (route === "handoff") {
    const targetRole = payload.target_role || "";
    if (!ALLOWED_HANDOFF_TARGETS[role].includes(targetRole)) {
      throw mutationError("HANDOFF_TARGET_FORBIDDEN", `Role ${role} cannot hand off to ${targetRole}`, 403);
    }
  }
  return `PASS role=${role} route=${route} state=${state.current_state}`;
}

function buildResponse(projectName: string, role: Role, record: MutationRecord, recordPath: string, recordSha: string, replay = false): Record<string, unknown> {
  return {
    ok: true,
    project: projectName,
    authenticated_role: role,
    queue_item_id: record.queue_item_id,
    flow_ref: record.flow_ref,
    mutation_type: record.mutation_type,
    prior_state: record.prior_state,
    new_state: record.new_state,
    mutation_id: record.mutation_id,
    idempotency_key: record.idempotency_key,
    required_status_labels: requiredStatusLabels(),
    truth_boundary: MUTATION_TRUTH_BOUNDARY,
    mutation_record_path: recordPath,
    mutation_record_sha: recordSha,
    idempotent_replay: replay
  };
}

async function handleScienceQueueMutationRequestUnchecked(
  request: Request,
  env: Env,
  route: MutationRoute,
  args: { queueItemId: string },
  repoStore?: RepoStore
): Promise<Response> {
  if (request.method !== "POST") {
    return mutationError("METHOD_NOT_ALLOWED", `Only POST is allowed for ${new URL(request.url).pathname}`, 405);
  }

  const authenticatedRole = requireRole(request, env);
  if (!isMutatingRole(authenticatedRole)) {
    return mutationError("SCIENCE_QUEUE_MUTATION_FORBIDDEN", `Role ${authenticatedRole} cannot mutate science queue items`, 403);
  }

  const queueItemId = (args.queueItemId || "").trim();
  if (!queueItemId || !isSafeIdentifier(queueItemId)) {
    return mutationError("UNSAFE_QUEUE_ITEM_ID", `Unsafe queue item id: ${queueItemId || "EMPTY"}`, 400);
  }

  const url = new URL(request.url);
  const body = await parseBody(request);
  const bodyRoleError = denyBodyRoleSpoof(body, authenticatedRole);
  if (bodyRoleError) return bodyRoleError;

  const queryRole = getParam(url, "role");
  if (queryRole && queryRole !== authenticatedRole) {
    return mutationError("ROLE_SPOOF_DENIED", `Query role ${queryRole} does not match authenticated role ${authenticatedRole}`, 403);
  }

  const payload = normalizeRequest(route, body);
  if (!getProject(payload.project)) return mutationError("UNKNOWN_PROJECT", `Unknown project: ${payload.project}`, 404);

  const store = repoStore || githubRepoStore;
  const { item, state } = await resolveQueueState(env, payload.project, queueItemId, authenticatedRole, store);

  const timestamp = new Date().toISOString();
  const recordPath = mutationRecordPath(timestamp, item.queue_item_id, route, authenticatedRole, payload.idempotency_key);
  const signature = payloadSignature(route, payload);
  const existing = await readJsonIfExists<MutationRecord>(env, payload.project, recordPath, store);
  if (existing.value) {
    if (existing.value.payload_signature !== signature) {
      return mutationError("IDEMPOTENCY_CONFLICT", `Existing idempotency_key ${payload.idempotency_key} conflicts with a different payload`, 409);
    }
    return jsonResponse(buildResponse(payload.project, authenticatedRole, existing.value, recordPath, existing.sha || "UNKNOWN", true));
  }

  const authorityCheck = validateRouteAuthority(route, authenticatedRole, state, item.current_role_owner, payload);

  const record: MutationRecord = {
    mutation_id: `MUT-${sanitizeSegment(item.queue_item_id)}-${Date.parse(timestamp)}`,
    queue_item_id: item.queue_item_id,
    project: payload.project,
    flow_ref: item.flow_ref,
    authenticated_role: authenticatedRole,
    mutation_type: route,
    prior_state: state.current_state,
    new_state: nextState(route),
    reason: payload.reason,
    timestamp,
    idempotency_key: payload.idempotency_key,
    source_route: `/v1/science/queue/${item.queue_item_id}/${route}`,
    actor_authority_check: authorityCheck,
    truth_boundary: MUTATION_TRUTH_BOUNDARY,
    required_status_labels: requiredStatusLabels(),
    payload_signature: signature
  };

  if (payload.target_role) record.handoff_target_role = payload.target_role;
  if (payload.evidence_refs) record.completion_evidence_refs = payload.evidence_refs;

  const writtenRecord = await writeJson(
    env,
    payload.project,
    recordPath,
    record,
    `science queue mutation ${route}: ${item.queue_item_id}`,
    store
  );

  const newState: MutationStateRecord = {
    queue_item_id: item.queue_item_id,
    flow_ref: item.flow_ref,
    flow_id: item.flow_id,
    project: payload.project,
    current_state: record.new_state,
    claimed_by: route === "claim" ? authenticatedRole : route === "complete" || route === "handoff" ? null : state.claimed_by,
    handoff_target_role: payload.target_role || null,
    updated_at: timestamp,
    latest_mutation_id: record.mutation_id
  };

  if (route === "block" || route === "quarantine") newState.claimed_by = state.claimed_by;
  await writeJson(env, payload.project, statePath(item.queue_item_id), newState, `science queue state ${route}: ${item.queue_item_id}`, store);

  return jsonResponse(buildResponse(payload.project, authenticatedRole, record, writtenRecord.path, writtenRecord.sha), 201);
}


export async function handleScienceQueueMutationRequest(
  request: Request,
  env: Env,
  route: MutationRoute,
  args: { queueItemId: string },
  repoStore?: RepoStore
): Promise<Response> {
  try {
    return await handleScienceQueueMutationRequestUnchecked(request, env, route, args, repoStore);
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : String(error);
    return mutationError("SCIENCE_QUEUE_MUTATION_INTERNAL_ERROR", message, 500);
  }
}
