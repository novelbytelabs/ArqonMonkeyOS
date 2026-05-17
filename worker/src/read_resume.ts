import { requireRole } from "./auth";
import { getProject } from "./projects";
import { assertSafeReadPath, STATUS_LABELS } from "./policy";
import { githubRepoStore, type RepoStore } from "./repo_store";
import { errorResponse, jsonResponse } from "./response";
import type { Env, Role } from "./types";
import type { FlowStatus, FlowType, GateState } from "./flow_policy";
import { FLOW_ARTIFACT_SLOTS, ROLE_FLOW_ARTIFACTS } from "./flow_policy";

interface FlowArtifactSummary {
  artifact_id: string;
  artifact_type: string;
  title: string;
  role: Role;
  created_at: string;
  source_path: string;
  source_sha?: string;
}

interface FlowHistoryEvent {
  event_id: string;
  event_type: string;
  role: Role;
  created_at: string;
  note: string;
}

interface FlowManifest {
  schema_version: "flow_manifest.v0.3";
  official_artifact: true;
  project: string;
  flow_id: string;
  name: string;
  type: FlowType;
  title: string;
  summary: string;
  status: FlowStatus;
  current_gate: GateState;
  created_at: string;
  created_by_role: Role;
  updated_at: string;
  updated_by_role: Role;
  required_status_labels: string[];
  artifacts: FlowArtifactSummary[];
  history: FlowHistoryEvent[];
}

interface FlowIndexEntry {
  flow_id: string;
  name: string;
  type: FlowType;
  title: string;
  status: FlowStatus;
  current_gate: GateState;
  created_at: string;
  updated_at: string;
  source_path: string;
}

interface FlowIndex {
  schema_version: "flow_index.v0.3";
  project: string;
  updated_at: string;
  flows: FlowIndexEntry[];
}

interface SecretLikePattern {
  name: string;
  pattern: RegExp;
}

const ARTIFACT_OPEN_DEFAULT_SCAN_LIMIT = 4;
const ARTIFACT_OPEN_MAX_SCAN_LIMIT = 8;

const SECRET_LIKE_PATTERNS: SecretLikePattern[] = [
  { name: "PRIVATE_KEY_BLOCK", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "GITHUB_TOKEN", pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { name: "OPENAI_STYLE_API_KEY", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: "BEARER_TOKEN", pattern: /\bBearer\s+[A-Za-z0-9._~+\/=:-]{20,}/i },
  { name: "SECRET_ASSIGNMENT", pattern: /\b(?:api[_-]?key|secret|token|password|private[_-]?key)\s*[:=]\s*[\"']?[A-Za-z0-9._~+\/=:-]{12,}/i }
];

type ReadResumeAction =
  | "whoami"
  | "capabilities"
  | "show"
  | "resume"
  | "flow_resume"
  | "flow_history"
  | "flow_artifacts"
  | "flow_latest"
  | "flow_next"
  | "flow_stop_conditions"
  | "artifact_open";

const UNIVERSAL_READ_ROUTES = [
  "GET /v1/whoami",
  "GET /v1/capabilities",
  "GET /v1/context",
  "GET /v1/constitution",
  "GET /v1/manifest",
  "GET /v1/show",
  "GET /v1/resume",
  "GET /v1/flows",
  "GET /v1/flows/{flow_ref}",
  "GET /v1/flows/{flow_ref}/status",
  "GET /v1/flows/{flow_ref}/resume",
  "GET /v1/flows/{flow_ref}/history",
  "GET /v1/flows/{flow_ref}/artifacts",
  "GET /v1/flows/{flow_ref}/latest",
  "GET /v1/flows/{flow_ref}/next",
  "GET /v1/flows/{flow_ref}/stop-conditions",
  "GET /v1/artifacts/{artifact_id}",
  "GET /v1/messages/inbox",
  "GET /v1/messages/{message_id}"
];

const FORBIDDEN_CLAIMS = [
  "certification",
  "promotion",
  "deployment approval",
  "production readiness",
  "autonomous Science operation",
  "scientific truth without harness evidence",
  "sealed-test certification"
];

const TRUTH_BOUNDARY = "Routed artifacts are governed records, not scientific truth. Raw GPT output is not evidence. No harness = No truth.";

function requiredStatusLabels(): string[] {
  return [...STATUS_LABELS];
}

function getParam(url: URL, name: string): string | null {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}

function projectNameFrom(url: URL): string {
  return getParam(url, "project") || "ArqonZero";
}

function flowIndexPath(): string {
  return "governance/flows/flow_index.json";
}

function flowManifestPath(flowId: string): string {
  return `governance/flows/${flowId}/flow_manifest.json`;
}

function looksLikeFlowId(flowRef: string): boolean {
  return /^FLOW-\d{4}-\d{4}$/.test(flowRef);
}

function roleFamily(role: Role): string {
  if (role === "HUMAN") return "human";
  if (role === "SCIENCE_EXECUTOR_AI") return "science_executor";
  if (["EXPLORER_AI", "HYPOTHESIZER_AI", "DESIGNER_AI", "SCIENCE_AUDITOR_AI"].includes(role)) return "science_gpt";
  if (["PM_AI", "CODER_AI", "HELPER_AI", "HELPER_CODEX", "AUDITOR_AI"].includes(role)) return "code_governance_gpt";
  return "unknown";
}

function isGptRole(role: Role): boolean {
  return role !== "HUMAN" && role !== "SCIENCE_EXECUTOR_AI";
}

function allowedWriteRoutes(role: Role): string[] {
  const routes: string[] = [];
  if (role === "HUMAN") {
    routes.push("POST /v1/flows/{flow_ref}/advance", "POST /v1/science/share", "POST /v1/human/advancement-decision");
  }
  if (role === "PM_AI") routes.push("POST /v1/flows", "POST /v1/pm/intake", "POST /v1/pm/specify", "POST /v1/pm/plan", "POST /v1/pm/tasking", "POST /v1/pm/handoff");
  if (role === "CODER_AI") routes.push("POST /v1/coder/work-plan", "POST /v1/coder/tasks", "POST /v1/coder/implementation-bundle", "POST /v1/coder/handoff");
  if (role === "HELPER_AI") routes.push("POST /v1/helper/execution-intake", "POST /v1/helper/execution-report");
  if (role === "AUDITOR_AI") routes.push("POST /v1/auditor/helper-execution-review");
  if (role === "EXPLORER_AI") routes.push("POST /v1/flows", "POST /v1/science/research");
  if (role === "HYPOTHESIZER_AI") routes.push("POST /v1/science/hypothesize", "POST /v1/science/interpret", "POST /v1/science/iterate");
  if (role === "DESIGNER_AI") routes.push("POST /v1/science/design-experiment", "POST /v1/science/iterate");
  if (role === "SCIENCE_EXECUTOR_AI") routes.push("POST /v1/science/execute-experiment");
  if (role === "SCIENCE_AUDITOR_AI") routes.push("POST /v1/science/audit-experiment", "POST /v1/science/record-finding");
  return routes;
}

function forbiddenRoutes(role: Role): string[] {
  const common = [
    "POST /v1/queue/{queue_id}/claim",
    "POST /v1/queue/{queue_id}/complete",
    "POST /v1/queue/{queue_id}/block",
    "POST /v1/queue/{queue_id}/quarantine",
    "POST /v1/queue/{queue_id}/handoff"
  ];
  if (role !== "HUMAN") common.push("POST /v1/flows/{flow_ref}/advance", "POST /v1/science/share");
  if (isGptRole(role)) common.push("POST /v1/science/execute-experiment");
  if (role === "SCIENCE_EXECUTOR_AI") common.push("POST /v1/science/hypothesize", "POST /v1/science/design-experiment", "POST /v1/science/audit-experiment", "POST /v1/science/share");
  return common;
}

function jsonUnknown(note: string): string[] {
  return [note];
}

async function loadFlowIndex(env: Env, projectName: string, store: RepoStore): Promise<FlowIndex> {
  const project = getProject(projectName);
  if (!project) throw new Error(`Unknown project: ${projectName}`);
  try {
    const file = await store.fetchFile(env, project, flowIndexPath());
    const parsed = JSON.parse(file.content) as FlowIndex;
    if (parsed.schema_version !== "flow_index.v0.3" || !Array.isArray(parsed.flows)) {
      throw new Error("Invalid flow index schema");
    }
    return parsed;
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) {
      return { schema_version: "flow_index.v0.3", project: projectName, updated_at: "UNKNOWN", flows: [] };
    }
    throw err;
  }
}

async function loadFlowManifest(env: Env, projectName: string, flowId: string, store: RepoStore): Promise<FlowManifest> {
  const project = getProject(projectName);
  if (!project) throw new Error(`Unknown project: ${projectName}`);
  const file = await store.fetchFile(env, project, flowManifestPath(flowId));
  const parsed = JSON.parse(file.content) as FlowManifest;
  if (parsed.schema_version !== "flow_manifest.v0.3" || parsed.flow_id !== flowId) {
    throw new Error(`Invalid flow manifest schema for ${flowId}`);
  }
  return parsed;
}

async function resolveFlow(env: Env, projectName: string, flowRef: string, store: RepoStore): Promise<{ index: FlowIndex; flowId: string } | Response> {
  const index = await loadFlowIndex(env, projectName, store);
  const direct = index.flows.find(entry => entry.flow_id === flowRef);
  if (direct) return { index, flowId: direct.flow_id };
  const byName = index.flows.filter(entry => entry.name === flowRef);
  if (byName.length === 1) return { index, flowId: byName[0].flow_id };
  if (byName.length > 1) {
    return errorResponse("FLOW_REF_AMBIGUOUS", `Multiple flows match ref: ${flowRef}`, 409);
  }
  if (looksLikeFlowId(flowRef)) {
    try {
      await loadFlowManifest(env, projectName, flowRef, store);
      return { index, flowId: flowRef };
    } catch {
      // fall through to not found
    }
  }
  return errorResponse("FLOW_NOT_FOUND", `No flow found for ref: ${flowRef}`, 404);
}

function artifactSortDescending(a: FlowArtifactSummary, b: FlowArtifactSummary): number {
  return Date.parse(b.created_at) - Date.parse(a.created_at) || a.artifact_id.localeCompare(b.artifact_id);
}

function safeArtifactMetadata(artifact: FlowArtifactSummary): Record<string, unknown> {
  const base = {
    artifact_id: artifact.artifact_id || "UNKNOWN",
    artifact_type: artifact.artifact_type || "UNKNOWN",
    title: artifact.title || "UNKNOWN",
    created_by_role: artifact.role || "UNKNOWN",
    created_at_if_known: artifact.created_at || "UNKNOWN",
    source_sha: artifact.source_sha || "UNKNOWN"
  };
  try {
    assertSafeArtifactId(artifact.artifact_id);
    assertSafeArtifactPath(artifact.source_path);
    return {
      ...base,
      path_or_ref_if_safe: artifact.source_path,
      path_safety: "SAFE",
      body_available: true,
      unknowns: []
    };
  } catch {
    return {
      ...base,
      path_or_ref_if_safe: "UNKNOWN_UNSAFE_PATH",
      path_safety: "UNSAFE",
      body_available: false,
      unknowns: ["UNSAFE_ARTIFACT_SOURCE_PATH"]
    };
  }
}

function latestArtifacts(manifest: FlowManifest): Record<string, Record<string, unknown>> {
  const latest: Record<string, Record<string, unknown>> = {};
  for (const artifact of [...manifest.artifacts].sort(artifactSortDescending)) {
    if (!latest[artifact.artifact_type]) latest[artifact.artifact_type] = safeArtifactMetadata(artifact);
  }
  return latest;
}

function latestByRole(manifest: FlowManifest): Record<string, Record<string, unknown>> {
  const latest: Record<string, Record<string, unknown>> = {};
  for (const artifact of [...manifest.artifacts].sort(artifactSortDescending)) {
    if (!latest[artifact.role]) latest[artifact.role] = safeArtifactMetadata(artifact);
  }
  return latest;
}

function countUnsafeArtifacts(artifacts: FlowArtifactSummary[]): number {
  return artifacts.map(safeArtifactMetadata).filter(artifact => artifact.path_safety === "UNSAFE").length;
}

function findSecretLikeMarkers(content: string): string[] {
  return SECRET_LIKE_PATTERNS.filter(rule => rule.pattern.test(content)).map(rule => rule.name);
}

function summarizeFlow(entry: FlowIndexEntry, manifest?: FlowManifest): Record<string, unknown> {
  const artifacts = manifest ? [...manifest.artifacts].sort(artifactSortDescending) : [];
  return {
    flow_id: entry.flow_id,
    name: entry.name,
    type: entry.type,
    title: entry.title,
    status: entry.status,
    current_gate: entry.current_gate,
    updated_at: entry.updated_at,
    latest_artifact: artifacts[0] ? safeArtifactMetadata(artifacts[0]) : "UNKNOWN",
    next_allowed_action: manifest ? deriveNext(manifest).next_allowed_action : "UNKNOWN"
  };
}

function hasArtifact(manifest: FlowManifest, artifactType: string): boolean {
  return manifest.artifacts.some(artifact => artifact.artifact_type === artifactType);
}

function hasAnyArtifact(manifest: FlowManifest, artifactTypes: string[]): boolean {
  return artifactTypes.some(type => hasArtifact(manifest, type));
}

function deriveNext(manifest: FlowManifest): Record<string, unknown> {
  if (manifest.status === "completed" || manifest.status === "archived") {
    return {
      next_allowed_action: "NONE",
      next_allowed_route: "NONE",
      next_allowed_role: "NONE",
      requires_human_gate: false,
      unknowns: []
    };
  }
  if (manifest.type === "science_flow") {
    if (!hasAnyArtifact(manifest, ["research_dossier", "source_map", "contradiction_map", "open_questions"])) {
      return { next_allowed_action: "create research artifact", next_allowed_route: "POST /v1/science/research", next_allowed_role: "EXPLORER_AI", next_allowed_artifact_type_if_any: "research_dossier", requires_human_gate: false, unknowns: [] };
    }
    if (!hasAnyArtifact(manifest, ["hypothesis_card", "null_hypothesis", "prediction_record"])) {
      return { next_allowed_action: "create hypothesis artifact", next_allowed_route: "POST /v1/science/hypothesize", next_allowed_role: "HYPOTHESIZER_AI", next_allowed_artifact_type_if_any: "hypothesis_card", requires_human_gate: false, unknowns: [] };
    }
    if (!hasAnyArtifact(manifest, ["experiment_protocol", "metric_plan", "control_plan", "execution_packet", "sealed_boundary_plan"])) {
      return { next_allowed_action: "create experiment design artifact", next_allowed_route: "POST /v1/science/design-experiment", next_allowed_role: "DESIGNER_AI", next_allowed_artifact_type_if_any: "experiment_protocol", requires_human_gate: false, unknowns: [] };
    }
    if (!hasAnyArtifact(manifest, ["execution_report", "evidence_manifest", "command_log", "raw_result_index", "deviation_report"])) {
      return { next_allowed_action: "local Science Executor evidence required", next_allowed_route: "POST /v1/science/execute-experiment", next_allowed_role: "SCIENCE_EXECUTOR_AI", next_allowed_artifact_type_if_any: "execution_report", requires_human_gate: false, unknowns: [] };
    }
    if (!hasAnyArtifact(manifest, ["audit_report", "evidence_audit", "claim_scope_audit", "protocol_audit"])) {
      return { next_allowed_action: "audit experiment evidence", next_allowed_route: "POST /v1/science/audit-experiment", next_allowed_role: "SCIENCE_AUDITOR_AI", next_allowed_artifact_type_if_any: "audit_report", requires_human_gate: false, unknowns: [] };
    }
    if (!hasAnyArtifact(manifest, ["finding_record", "negative_finding_record", "inconclusive_finding_record", "finding_boundary_record"])) {
      return { next_allowed_action: "record bounded finding", next_allowed_route: "POST /v1/science/record-finding", next_allowed_role: "SCIENCE_AUDITOR_AI", next_allowed_artifact_type_if_any: "finding_record", requires_human_gate: false, unknowns: [] };
    }
    if (!hasArtifact(manifest, "share_packet")) {
      return { next_allowed_action: "Human share decision if warranted", next_allowed_route: "POST /v1/science/share", next_allowed_role: "HUMAN", next_allowed_artifact_type_if_any: "share_packet", requires_human_gate: true, unknowns: [] };
    }
  }
  return {
    next_allowed_action: "UNKNOWN",
    next_allowed_route: "UNKNOWN",
    next_allowed_role: "UNKNOWN",
    next_allowed_artifact_type_if_any: "UNKNOWN",
    requires_human_gate: "UNKNOWN",
    unknowns: ["NEXT_ACTION_DERIVATION_NOT_IMPLEMENTED_FOR_THIS_FLOW_STATE"]
  };
}

function globalStopConditions(): string[] {
  return [
    "missing evidence",
    "missing Human gate",
    "ambiguous flow reference",
    "unsupported claim",
    "secret exposure risk",
    "role-boundary violation",
    "attempted queue mutation in read/resume slice",
    "attempted Human authority assignment to GPT",
    "attempted Science Executor authority assignment to GPT"
  ];
}

function roleStopConditions(role: Role): string[] {
  const stops = ["raw GPT output presented as evidence", "routed artifact presented as scientific truth"];
  if (role !== "HUMAN") stops.push("attempt to advance flow", "attempt to use /v1/science/share");
  if (isGptRole(role)) stops.push("attempt to execute Science experiment");
  if (role === "SCIENCE_EXECUTOR_AI") stops.push("attempt to hypothesize/design/audit/share/advance");
  return stops;
}

function flowSpecificStopConditions(manifest: FlowManifest): string[] {
  const conditions: string[] = [];
  if (manifest.status === "blocked") conditions.push("flow status is blocked");
  if (manifest.type === "science_flow" && hasAnyArtifact(manifest, ["execution_report", "evidence_manifest", "command_log"]) && !hasAnyArtifact(manifest, ["audit_report", "evidence_audit", "claim_scope_audit", "protocol_audit"])) {
    conditions.push("execution evidence exists but audit evidence is missing");
  }
  if (manifest.type === "science_flow" && hasAnyArtifact(manifest, ["finding_record", "negative_finding_record", "inconclusive_finding_record", "finding_boundary_record"]) && !hasArtifact(manifest, "share_packet")) {
    conditions.push("finding exists but official Human share has not occurred");
  }
  return conditions;
}

function whoamiBody(projectName: string, role: Role): Record<string, unknown> {
  return {
    ok: true,
    project: projectName,
    authenticated_role: role,
    role_family: roleFamily(role),
    is_human: role === "HUMAN",
    is_gpt_role: isGptRole(role),
    is_science_executor: role === "SCIENCE_EXECUTOR_AI",
    status_labels: requiredStatusLabels(),
    allowed_read_routes: UNIVERSAL_READ_ROUTES,
    allowed_write_routes: allowedWriteRoutes(role),
    forbidden_routes: forbiddenRoutes(role),
    can_advance_flow: role === "HUMAN",
    can_share_science: role === "HUMAN",
    can_execute_science: role === "SCIENCE_EXECUTOR_AI",
    forbidden_claims: FORBIDDEN_CLAIMS,
    truth_boundary: TRUTH_BOUNDARY
  };
}

function capabilitiesBody(projectName: string, role: Role): Record<string, unknown> {
  return {
    ok: true,
    project: projectName,
    authenticated_role: role,
    read_capabilities: UNIVERSAL_READ_ROUTES,
    write_capabilities: allowedWriteRoutes(role),
    human_only_capabilities: ["POST /v1/flows/{flow_ref}/advance", "POST /v1/science/share", "promotion/certification/deployment decisions remain outside this slice"],
    executor_only_capabilities: ["POST /v1/science/execute-experiment"],
    forbidden_capabilities: forbiddenRoutes(role),
    artifact_read_scope: "governed flow artifacts only; /v1/artifacts/{artifact_id} resolves only known artifact IDs from flow manifests",
    artifact_write_scope: ROLE_FLOW_ARTIFACTS,
    flow_artifact_slots: FLOW_ARTIFACT_SLOTS,
    status_labels: requiredStatusLabels(),
    truth_boundary: TRUTH_BOUNDARY
  };
}

async function handleShow(request: Request, env: Env, store: RepoStore): Promise<Response> {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName = projectNameFrom(url);
  const index = await loadFlowIndex(env, projectName, store);
  const limit = Number.parseInt(getParam(url, "limit") || "10", 10);
  const boundedLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 10;
  const recentEntries = [...index.flows].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)).slice(0, boundedLimit);
  const manifests = new Map<string, FlowManifest>();
  for (const entry of recentEntries) {
    try {
      manifests.set(entry.flow_id, await loadFlowManifest(env, projectName, entry.flow_id, store));
    } catch {
      // Summary can still proceed from the index; missing manifest is reflected as UNKNOWN latest/next fields.
    }
  }
  const summarize = (entry: FlowIndexEntry) => summarizeFlow(entry, manifests.get(entry.flow_id));
  return jsonResponse({
    ok: true,
    project: projectName,
    active_flows: index.flows.filter(flow => flow.status === "active").slice(0, boundedLimit).map(summarize),
    blocked_flows: index.flows.filter(flow => flow.status === "blocked").slice(0, boundedLimit).map(summarize),
    waiting_for_human_review: index.flows.filter(flow => ["INTEGRITY_GATE_PASSED", "CLAIM_OR_PROMOTION_CANDIDATE"].includes(flow.current_gate)).slice(0, boundedLimit).map(summarize),
    recent_flows: recentEntries.map(summarize),
    status_labels: requiredStatusLabels(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: index.flows.length === 0 ? jsonUnknown("NO_FLOWS_FOUND") : []
  });
}

async function buildFlowResume(env: Env, projectName: string, role: Role, flowRef: string, store: RepoStore): Promise<Response> {
  const resolved = await resolveFlow(env, projectName, flowRef, store);
  if (resolved instanceof Response) return resolved;
  const manifest = await loadFlowManifest(env, projectName, resolved.flowId, store);
  const next = deriveNext(manifest);
  const latestHumanDecisionRaw = [...manifest.artifacts].sort(artifactSortDescending).find(artifact => artifact.role === "HUMAN");
  const latestHumanDecision = latestHumanDecisionRaw ? safeArtifactMetadata(latestHumanDecisionRaw) : "UNKNOWN";
  return jsonResponse({
    ok: true,
    project: projectName,
    authenticated_role: role,
    flow_id: manifest.flow_id,
    flow_name: manifest.name,
    flow_title: manifest.title,
    flow_type: manifest.type,
    current_phase_or_status: manifest.status,
    current_gate: manifest.current_gate,
    latest_human_decision: latestHumanDecision,
    latest_artifacts: latestArtifacts(manifest),
    next_allowed_role: next.next_allowed_role || "UNKNOWN",
    next_allowed_command: next.next_allowed_route || "UNKNOWN",
    next_allowed_action: next.next_allowed_action || "UNKNOWN",
    forbidden_actions: forbiddenRoutes(role),
    stop_conditions: {
      global: globalStopConditions(),
      role: roleStopConditions(role),
      flow_specific: flowSpecificStopConditions(manifest)
    },
    status_labels: requiredStatusLabels(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: []
  });
}

async function handleDefaultResume(request: Request, env: Env, role: Role, store: RepoStore): Promise<Response> {
  const url = new URL(request.url);
  const projectName = projectNameFrom(url);
  const requestedFlow = getParam(url, "flow_ref") || getParam(url, "flow") || getParam(url, "name");
  if (requestedFlow) return buildFlowResume(env, projectName, role, requestedFlow, store);
  const index = await loadFlowIndex(env, projectName, store);
  const candidates = index.flows
    .filter(flow => flow.status === "active" || flow.status === "blocked")
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
  if (candidates.length === 1) return buildFlowResume(env, projectName, role, candidates[0].flow_id, store);
  return jsonResponse({
    ok: true,
    project: projectName,
    authenticated_role: role,
    selected_flow: "UNKNOWN",
    candidates,
    message: candidates.length === 0 ? "No active or blocked flows found." : "Multiple candidate flows found; provide flow_ref/name to resume safely.",
    status_labels: requiredStatusLabels(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: ["SAFE_SINGLE_FLOW_SELECTION_UNKNOWN"]
  });
}

async function handleFlowHistory(request: Request, env: Env, flowRef: string, store: RepoStore): Promise<Response> {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName = projectNameFrom(url);
  const resolved = await resolveFlow(env, projectName, flowRef, store);
  if (resolved instanceof Response) return resolved;
  const manifest = await loadFlowManifest(env, projectName, resolved.flowId, store);
  return jsonResponse({
    ok: true,
    project: projectName,
    flow_id: manifest.flow_id,
    flow_name: manifest.name,
    events: manifest.history || [],
    human_decisions: (manifest.artifacts || []).filter(artifact => artifact.role === "HUMAN").map(safeArtifactMetadata),
    artifact_events: (manifest.history || []).filter(event => event.event_type === "write_artifact"),
    gate_events: (manifest.history || []).filter(event => event.event_type === "advance_flow"),
    audit_events: (manifest.artifacts || []).filter(artifact => artifact.role === "AUDITOR_AI" || artifact.role === "SCIENCE_AUDITOR_AI").map(safeArtifactMetadata),
    status_labels: requiredStatusLabels(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: (manifest.history || []).length === 0 ? ["NO_HISTORY_EVENTS_RECORDED"] : []
  });
}

async function handleFlowArtifacts(request: Request, env: Env, flowRef: string, store: RepoStore): Promise<Response> {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName = projectNameFrom(url);
  const resolved = await resolveFlow(env, projectName, flowRef, store);
  if (resolved instanceof Response) return resolved;
  const manifest = await loadFlowManifest(env, projectName, resolved.flowId, store);
  return jsonResponse({
    ok: true,
    project: projectName,
    flow_id: manifest.flow_id,
    flow_name: manifest.name,
    artifacts: manifest.artifacts.map(safeArtifactMetadata),
    status_labels: requiredStatusLabels(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: [
      ...(manifest.artifacts.length === 0 ? ["NO_ARTIFACTS_RECORDED"] : []),
      ...(countUnsafeArtifacts(manifest.artifacts) > 0 ? ["UNSAFE_ARTIFACT_SOURCE_PATH_PRESENT"] : [])
    ]
  });
}

async function handleFlowLatest(request: Request, env: Env, flowRef: string, store: RepoStore): Promise<Response> {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName = projectNameFrom(url);
  const resolved = await resolveFlow(env, projectName, flowRef, store);
  if (resolved instanceof Response) return resolved;
  const manifest = await loadFlowManifest(env, projectName, resolved.flowId, store);
  return jsonResponse({
    ok: true,
    project: projectName,
    flow_id: manifest.flow_id,
    flow_name: manifest.name,
    latest_by_artifact_type: latestArtifacts(manifest),
    latest_by_role: latestByRole(manifest),
    status_labels: requiredStatusLabels(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: manifest.artifacts.length === 0 ? ["NO_ARTIFACTS_RECORDED"] : []
  });
}

async function handleFlowNext(request: Request, env: Env, flowRef: string, store: RepoStore): Promise<Response> {
  const role = requireRole(request, env);
  const url = new URL(request.url);
  const projectName = projectNameFrom(url);
  const resolved = await resolveFlow(env, projectName, flowRef, store);
  if (resolved instanceof Response) return resolved;
  const manifest = await loadFlowManifest(env, projectName, resolved.flowId, store);
  const next = deriveNext(manifest);
  return jsonResponse({
    ok: true,
    project: projectName,
    flow_id: manifest.flow_id,
    flow_name: manifest.name,
    authenticated_role: role,
    ...next,
    forbidden_actions: forbiddenRoutes(role),
    status_labels: requiredStatusLabels(),
    truth_boundary: TRUTH_BOUNDARY
  });
}

async function handleStopConditions(request: Request, env: Env, flowRef: string, store: RepoStore): Promise<Response> {
  const role = requireRole(request, env);
  const url = new URL(request.url);
  const projectName = projectNameFrom(url);
  const resolved = await resolveFlow(env, projectName, flowRef, store);
  if (resolved instanceof Response) return resolved;
  const manifest = await loadFlowManifest(env, projectName, resolved.flowId, store);
  return jsonResponse({
    ok: true,
    project: projectName,
    flow_id: manifest.flow_id,
    flow_name: manifest.name,
    global_stop_conditions: globalStopConditions(),
    role_stop_conditions: roleStopConditions(role),
    flow_specific_stop_conditions: flowSpecificStopConditions(manifest),
    quarantine_triggers: ["secret exposure", "evidence fabrication", "role-boundary violation", "unsupported claim", "Human gate bypass attempt"],
    status_labels: requiredStatusLabels(),
    truth_boundary: TRUTH_BOUNDARY
  });
}

function assertSafeArtifactId(artifactId: string): void {
  if (!artifactId || artifactId.length > 120) throw new Error("Invalid artifact_id");
  const lower = artifactId.toLowerCase();
  if (artifactId.includes("/") || artifactId.includes("\\") || lower.includes("..") || lower.includes("%2e") || lower.includes("%2f") || lower.includes("%5c") || artifactId.startsWith(".")) {
    throw new Error("Unsafe artifact_id");
  }
  if (!/^ART-[A-Za-z0-9._-]+$/.test(artifactId)) throw new Error("Invalid artifact_id");
}

function assertSafeArtifactPath(path: string): void {
  if (!path || path.length > 512) throw new Error("Invalid artifact source path");
  if (path.startsWith("/") || path.includes("\\") || path.includes("../") || path.includes("/..") || path.includes("%2e") || path.includes("%2f") || path.includes("%5c")) {
    throw new Error("Unsafe artifact source path");
  }
  if (!/^governance\/flows\/FLOW-\d{4}-\d{4}\/artifacts\/[A-Za-z0-9._-]+\.md$/.test(path)) {
    throw new Error("Artifact source path is outside governed flow artifacts");
  }
  assertSafeReadPath(path);
}

function artifactsMatchingId(manifest: FlowManifest, artifactId: string): { manifest: FlowManifest; artifact: FlowArtifactSummary }[] {
  return manifest.artifacts
    .filter(candidate => candidate.artifact_id === artifactId)
    .map(artifact => ({ manifest, artifact }));
}

function artifactScanLimitFrom(url: URL): number {
  const requested = Number.parseInt(getParam(url, "scan_limit") || "", 10);
  if (!Number.isFinite(requested)) return ARTIFACT_OPEN_DEFAULT_SCAN_LIMIT;
  return Math.min(Math.max(requested, 1), ARTIFACT_OPEN_MAX_SCAN_LIMIT);
}

async function artifactOpenResponse(
  env: Env,
  projectName: string,
  manifest: FlowManifest,
  artifact: FlowArtifactSummary,
  store: RepoStore,
  lookupMetadata: Record<string, unknown>
): Promise<Response> {
  const project = getProject(projectName);
  if (!project) return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName}`, 404);
  assertSafeArtifactPath(artifact.source_path);
  const file = await store.fetchFile(env, project, artifact.source_path);
  assertSafeArtifactPath(file.path);
  const secretMarkers = findSecretLikeMarkers(file.content);
  if (secretMarkers.length > 0) {
    return errorResponse("ARTIFACT_CONTENT_POLICY_DENIED", "Artifact body contains secret-like content and is not returned by this read/resume route.", 403);
  }
  return jsonResponse({
    ok: true,
    project: projectName,
    artifact_id: artifact.artifact_id,
    artifact_type: artifact.artifact_type,
    flow_id: manifest.flow_id,
    flow_name: manifest.name,
    created_by_role: artifact.role,
    created_at: artifact.created_at,
    path_or_ref_if_safe: file.path,
    source_sha: file.sha,
    body: file.content,
    body_truncated: false,
    lookup: lookupMetadata,
    status_labels: requiredStatusLabels(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: []
  });
}

async function handleArtifactOpen(request: Request, env: Env, artifactId: string, store: RepoStore): Promise<Response> {
  requireRole(request, env);
  assertSafeArtifactId(artifactId);
  const url = new URL(request.url);
  const projectName = projectNameFrom(url);
  if (!getProject(projectName)) return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName}`, 404);

  const requestedFlow = getParam(url, "flow_ref") || getParam(url, "flow") || getParam(url, "name");
  if (requestedFlow) {
    const resolved = await resolveFlow(env, projectName, requestedFlow, store);
    if (resolved instanceof Response) return resolved;
    const manifest = await loadFlowManifest(env, projectName, resolved.flowId, store);
    const matches = artifactsMatchingId(manifest, artifactId);
    if (matches.length === 0) return errorResponse("ARTIFACT_NOT_FOUND", `No governed artifact found for id ${artifactId} in flow ${resolved.flowId}`, 404);
    if (matches.length > 1) return errorResponse("ARTIFACT_ID_AMBIGUOUS", `Multiple governed artifacts found for id ${artifactId} in flow ${resolved.flowId}`, 409);
    return artifactOpenResponse(env, projectName, matches[0].manifest, matches[0].artifact, store, {
      mode: "FLOW_SCOPED_LOOKUP",
      flow_ref: requestedFlow,
      scanned_flow_count: 1,
      strict_duplicate_scope: "single_flow_manifest"
    });
  }

  const index = await loadFlowIndex(env, projectName, store);
  const scanLimit = artifactScanLimitFrom(url);
  const scannedFlowIds: string[] = [];
  const matches: { manifest: FlowManifest; artifact: FlowArtifactSummary }[] = [];
  const candidates = [...index.flows]
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
    .slice(0, scanLimit);

  for (const entry of candidates) {
    try {
      const manifest = await loadFlowManifest(env, projectName, entry.flow_id, store);
      scannedFlowIds.push(entry.flow_id);
      matches.push(...artifactsMatchingId(manifest, artifactId));
      if (matches.length > 1) break;
    } catch {
      scannedFlowIds.push(entry.flow_id);
      // Ignore malformed/missing manifests; this route fails closed if a governed artifact cannot be proven within the bounded scan.
    }
  }

  if (matches.length === 0) {
    return errorResponse(
      "ARTIFACT_FLOW_REF_REQUIRED",
      `Artifact id ${artifactId} was not found within the bounded recent-flow scan. Retry with flow_ref to avoid Worker subrequest limits.`,
      404
    );
  }
  if (matches.length > 1) return errorResponse("ARTIFACT_ID_AMBIGUOUS", `Multiple governed artifacts found for id: ${artifactId}`, 409);

  return artifactOpenResponse(env, projectName, matches[0].manifest, matches[0].artifact, store, {
    mode: "BOUNDED_RECENT_FLOW_SCAN",
    scan_limit: scanLimit,
    scanned_flow_count: scannedFlowIds.length,
    scanned_flow_ids: scannedFlowIds,
    strict_duplicate_scope: scannedFlowIds.length === index.flows.length ? "all_indexed_flows" : "bounded_recent_flows",
    recommendation: "Pass flow_ref for deterministic low-subrequest artifact body reads."
  });
}

export async function handleReadResumeRequest(
  request: Request,
  env: Env,
  action: ReadResumeAction,
  options: { flowRef?: string; artifactId?: string; repoStore?: RepoStore } = {}
): Promise<Response> {
  try {
    if (request.method !== "GET") return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const role = requireRole(request, env);
    const url = new URL(request.url);
    const projectName = projectNameFrom(url);
    if (!getProject(projectName)) return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName}`, 404);
    const store = options.repoStore || githubRepoStore;

    if (action === "whoami") return jsonResponse(whoamiBody(projectName, role));
    if (action === "capabilities") return jsonResponse(capabilitiesBody(projectName, role));
    if (action === "show") return await handleShow(request, env, store);
    if (action === "resume") return await handleDefaultResume(request, env, role, store);
    if (action === "artifact_open") {
      if (!options.artifactId) return errorResponse("INVALID_REQUEST", "Missing artifact_id", 400);
      return await handleArtifactOpen(request, env, options.artifactId, store);
    }
    if (!options.flowRef) return errorResponse("INVALID_REQUEST", "Missing flow_ref", 400);
    if (action === "flow_resume") return await buildFlowResume(env, projectName, role, options.flowRef, store);
    if (action === "flow_history") return await handleFlowHistory(request, env, options.flowRef, store);
    if (action === "flow_artifacts") return await handleFlowArtifacts(request, env, options.flowRef, store);
    if (action === "flow_latest") return await handleFlowLatest(request, env, options.flowRef, store);
    if (action === "flow_next") return await handleFlowNext(request, env, options.flowRef, store);
    if (action === "flow_stop_conditions") return await handleStopConditions(request, env, options.flowRef, store);
    return errorResponse("NOT_FOUND", "Unknown read/resume action", 404);
  } catch (err) {
    if (err instanceof Response) return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Unsafe") || message.includes("must be")) return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project")) return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("Forbidden path") || message.includes("outside governed flow artifacts") || message.includes("Artifact source path")) return errorResponse("POLICY_DENIED", message, 403);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
