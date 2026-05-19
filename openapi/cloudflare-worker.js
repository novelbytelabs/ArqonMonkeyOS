var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/auth.ts
var BROKER_KEY_FIELDS = [
  "BROKER_KEY_PM",
  "BROKER_KEY_CODER",
  "BROKER_KEY_AUDITOR",
  "BROKER_KEY_HELPER",
  "BROKER_KEY_EXPLORER",
  "BROKER_KEY_HYPOTHESIZER",
  "BROKER_KEY_DESIGNER",
  "BROKER_KEY_SCIENCE_AUDITOR",
  "BROKER_KEY_SCIENCE_EXECUTOR",
  "BROKER_KEY_HUMAN"
];
function validateBrokerKeyUniqueness(env) {
  const missing = [];
  const byValue = /* @__PURE__ */ new Map();
  for (const field of BROKER_KEY_FIELDS) {
    const value = env[field];
    if (!value) {
      missing.push(field);
      continue;
    }
    const existing = byValue.get(value) || [];
    existing.push(field);
    byValue.set(value, existing);
  }
  const duplicate_groups = [...byValue.values()].filter((group) => group.length > 1);
  return {
    ok: missing.length === 0 && duplicate_groups.length === 0,
    missing,
    duplicate_groups
  };
}
__name(validateBrokerKeyUniqueness, "validateBrokerKeyUniqueness");
function roleFromAuth(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";
  if (!token)
    return null;
  if (token === env.BROKER_KEY_PM)
    return "PM_AI";
  if (token === env.BROKER_KEY_CODER)
    return "CODER_AI";
  if (token === env.BROKER_KEY_AUDITOR)
    return "AUDITOR_AI";
  if (token === env.BROKER_KEY_HELPER)
    return "HELPER_AI";
  if (token === env.BROKER_KEY_EXPLORER)
    return "EXPLORER_AI";
  if (token === env.BROKER_KEY_HYPOTHESIZER)
    return "HYPOTHESIZER_AI";
  if (token === env.BROKER_KEY_DESIGNER)
    return "DESIGNER_AI";
  if (token === env.BROKER_KEY_SCIENCE_AUDITOR)
    return "SCIENCE_AUDITOR_AI";
  if (token === env.BROKER_KEY_SCIENCE_EXECUTOR)
    return "SCIENCE_EXECUTOR_AI";
  if (token === env.BROKER_KEY_HUMAN)
    return "HUMAN";
  return null;
}
__name(roleFromAuth, "roleFromAuth");
function requireRole(request, env) {
  const role = roleFromAuth(request, env);
  if (!role) {
    throw new Response(JSON.stringify({ ok: false, error: { code: "UNAUTHORIZED", message: "Missing or invalid bearer token" } }), {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }
  return role;
}
__name(requireRole, "requireRole");

// src/projects.ts
var PROJECTS = {
  ArqonZero: {
    owner: "novelbytelabs",
    repo: "ArqonZero",
    branch: "main",
    manifest: "governance/context/context_manifest.json",
    context: {
      PM_AI: "governance/context/pm_gpt_context.json",
      CODER_AI: "governance/context/coder_gpt_context.json",
      AUDITOR_AI: "governance/context/auditor_gpt_context.json",
      HELPER_AI: "governance/context/current_context_snapshot.json",
      HELPER_CODEX: "governance/context/current_context_snapshot.json",
      EXPLORER_AI: "governance/context/current_context_snapshot.json",
      HYPOTHESIZER_AI: "governance/context/current_context_snapshot.json",
      DESIGNER_AI: "governance/context/current_context_snapshot.json",
      SCIENCE_AUDITOR_AI: "governance/context/current_context_snapshot.json",
      SCIENCE_EXECUTOR_AI: "governance/context/current_context_snapshot.json",
      HUMAN: "governance/context/current_context_snapshot.json"
    }
  }
};
function getProject(project) {
  return PROJECTS[project] || null;
}
__name(getProject, "getProject");
function contextPathFor(project, role) {
  return project.context[role] || null;
}
__name(contextPathFor, "contextPathFor");

// src/policy.ts
var STATUS_LABELS = [
  "REQUIRES_HUMAN_REVIEW",
  "development diagnostic only",
  "NOT SEALED-TEST CERTIFIED",
  "not promotable"
];
var FORBIDDEN_PARTS = [".env", "secrets", "sealed", "holdout", "models", "data", "private", "credentials"];
var ALLOWED_WRITE_ROOTS = [
  "governance/flows/",
  "governance/runs/",
  "governance/messages/",
  "governance/notes/",
  "governance/ledger/",
  "governance/context/",
  "governance/outbox/science_share/",
  "governance/queues/mutations/"
];
function assertSafeReadPath(path) {
  const parts = path.split("/").map((p) => p.toLowerCase());
  for (const forbidden of FORBIDDEN_PARTS) {
    if (parts.includes(forbidden))
      throw new Error(`Forbidden path component: ${forbidden}`);
  }
}
__name(assertSafeReadPath, "assertSafeReadPath");
function assertSafeWritePath(path) {
  assertSafeReadPath(path);
  if (!ALLOWED_WRITE_ROOTS.some((root) => path.startsWith(root)))
    throw new Error(`Write path is not allowlisted: ${path}`);
  if (path.startsWith("src/") || path.startsWith("tests/") || path.startsWith(".github/")) {
    throw new Error(`Source/test/workflow writes are forbidden in broker v0.1: ${path}`);
  }
}
__name(assertSafeWritePath, "assertSafeWritePath");
function isRole(value) {
  return value === "PM_AI" || value === "CODER_AI" || value === "AUDITOR_AI" || value === "HELPER_AI" || value === "HELPER_CODEX" || value === "EXPLORER_AI" || value === "HYPOTHESIZER_AI" || value === "DESIGNER_AI" || value === "SCIENCE_AUDITOR_AI" || value === "SCIENCE_EXECUTOR_AI" || value === "HUMAN";
}
__name(isRole, "isRole");
function isKnownProject(value) {
  return value === "ArqonZero";
}
__name(isKnownProject, "isKnownProject");

// src/github_app.ts
var GITHUB_USER_AGENT = "ArqonMonkeyOS/0.2";
var TOKEN_EXPIRY_SKEW_MS = 6e4;
var cachedInstallationToken = null;
function base64url(input) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const b of bytes)
    binary += String.fromCharCode(b);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
__name(base64url, "base64url");
function base64Content(input) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes)
    binary += String.fromCharCode(b);
  return btoa(binary);
}
__name(base64Content, "base64Content");
async function importPrivateKey(pem) {
  const clean = pem.replace("-----BEGIN RSA PRIVATE KEY-----", "").replace("-----END RSA PRIVATE KEY-----", "").replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace(/\s+/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++)
    bytes[i] = binary.charCodeAt(i);
  return crypto.subtle.importKey("pkcs8", bytes, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}
__name(importPrivateKey, "importPrivateKey");
async function createGithubJwt(env) {
  const now4 = Math.floor(Date.now() / 1e3);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = { iat: now4 - 60, exp: now4 + 9 * 60, iss: env.GITHUB_APP_ID };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const key = await importPrivateKey(env.GITHUB_APP_PRIVATE_KEY);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(data));
  return `${data}.${base64url(sig)}`;
}
__name(createGithubJwt, "createGithubJwt");
async function getInstallationToken(env) {
  const appId = env.GITHUB_APP_ID;
  const installationId = env.GITHUB_APP_INSTALLATION_ID;
  const cached = cachedInstallationToken;
  if (cached && cached.appId === appId && cached.installationId === installationId && cached.expiresAtMs - TOKEN_EXPIRY_SKEW_MS > Date.now()) {
    return cached.token;
  }
  const jwt = await createGithubJwt(env);
  const url = `https://api.github.com/app/installations/${installationId}/access_tokens`;
  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${jwt}`, accept: "application/vnd.github+json", "user-agent": GITHUB_USER_AGENT }
  });
  if (!res.ok)
    throw new Error(`GitHub installation token failed: ${res.status} ${await res.text()}`);
  const body = await res.json();
  const expiresAtMs = body.expires_at ? Date.parse(body.expires_at) : Date.now() + 9 * 6e4;
  cachedInstallationToken = {
    token: body.token,
    expiresAtMs: Number.isFinite(expiresAtMs) ? expiresAtMs : Date.now() + 9 * 6e4,
    appId,
    installationId
  };
  return body.token;
}
__name(getInstallationToken, "getInstallationToken");
function encodeGithubPath(path) {
  return encodeURIComponent(path).replace(/%2F/g, "/");
}
__name(encodeGithubPath, "encodeGithubPath");
async function githubContentsRequest(env, project, path, init) {
  const token = await getInstallationToken(env);
  const url = `https://api.github.com/repos/${project.owner}/${project.repo}/contents/${encodeGithubPath(path)}${init?.method === "GET" ? `?ref=${encodeURIComponent(project.branch)}` : ""}`;
  return fetch(url, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "user-agent": GITHUB_USER_AGENT,
      ...init?.headers || {}
    }
  });
}
__name(githubContentsRequest, "githubContentsRequest");
async function fetchGithubFile(env, project, path) {
  assertSafeReadPath(path);
  const res = await githubContentsRequest(env, project, path, { method: "GET" });
  if (!res.ok)
    throw new Error(`GitHub file fetch failed for ${path}: ${res.status} ${await res.text()}`);
  const body = await res.json();
  if (body.encoding !== "base64" || !body.content)
    throw new Error(`Unexpected GitHub content encoding for ${path}`);
  return { content: atob(body.content.replace(/\n/g, "")), sha: body.sha, path: body.path };
}
__name(fetchGithubFile, "fetchGithubFile");
async function fetchGithubDirectory(env, project, path) {
  assertSafeReadPath(path);
  const res = await githubContentsRequest(env, project, path, { method: "GET" });
  if (!res.ok)
    throw new Error(`GitHub directory fetch failed for ${path}: ${res.status} ${await res.text()}`);
  const body = await res.json();
  if (!Array.isArray(body)) {
    throw new Error(`Unexpected GitHub directory listing for ${path}`);
  }
  return body;
}
__name(fetchGithubDirectory, "fetchGithubDirectory");
async function fetchGithubDirectoryIfExists(env, project, path) {
  try {
    return await fetchGithubDirectory(env, project, path);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404"))
      return [];
    throw err;
  }
}
__name(fetchGithubDirectoryIfExists, "fetchGithubDirectoryIfExists");
async function writeGithubFile(env, project, path, content, message) {
  assertSafeWritePath(path);
  const existing = await githubContentsRequest(env, project, path, { method: "GET" });
  let sha2;
  if (existing.status === 200) {
    const file = await existing.json();
    sha2 = typeof file.sha === "string" ? file.sha : void 0;
  } else if (existing.status !== 404) {
    throw new Error(`GitHub preflight failed for ${path}: ${existing.status} ${await existing.text()}`);
  }
  const payload = {
    message,
    content: base64Content(content),
    branch: project.branch
  };
  if (sha2)
    payload.sha = sha2;
  const putRes = await githubContentsRequest(env, project, path, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  if (!putRes.ok)
    throw new Error(`GitHub file write failed for ${path}: ${putRes.status} ${await putRes.text()}`);
  const body = await putRes.json();
  const written = body.content;
  if (!written?.path || !written?.sha)
    throw new Error(`Unexpected GitHub write response for ${path}`);
  return { path: written.path, sha: written.sha };
}
__name(writeGithubFile, "writeGithubFile");

// src/response.ts
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
__name(jsonResponse, "jsonResponse");
function errorResponse(code, message, status = 400) {
  return jsonResponse({ ok: false, error: { code, message } }, status);
}
__name(errorResponse, "errorResponse");

// src/repo_store.ts
var githubRepoStore = {
  fetchFile: fetchGithubFile,
  writeFile: writeGithubFile
};

// src/notes.ts
function getParam(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam, "getParam");
function parseJsonish(value) {
  const trimmed = value.trim();
  if (!trimmed)
    return "";
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}
__name(parseJsonish, "parseJsonish");
function utcDateParts(date = /* @__PURE__ */ new Date()) {
  const isoDate = date.toISOString().slice(0, 10);
  return {
    isoDate,
    year: isoDate.slice(0, 4),
    month: isoDate.slice(5, 7)
  };
}
__name(utcDateParts, "utcDateParts");
function shortId(byteLength = 4) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(shortId, "shortId");
function frontMatterScalar(value) {
  if (Array.isArray(value)) {
    return value.map((item) => `  - ${JSON.stringify(item)}`).join("\n");
  }
  return JSON.stringify(value);
}
__name(frontMatterScalar, "frontMatterScalar");
function buildFrontMatter(entries) {
  const lines = ["---"];
  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${JSON.stringify(item)}`);
        }
      }
      continue;
    }
    lines.push(`${key}: ${frontMatterScalar(value)}`);
  }
  lines.push("---");
  return lines.join("\n");
}
__name(buildFrontMatter, "buildFrontMatter");
function parseFrontMatter(markdown3) {
  const match = markdown3.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Missing YAML front matter");
  }
  const frontMatter = {};
  let currentArrayKey = null;
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim())
      continue;
    const scalarMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (scalarMatch) {
      const key = scalarMatch[1];
      const value = scalarMatch[2];
      if (!value) {
        frontMatter[key] = [];
        currentArrayKey = key;
      } else {
        frontMatter[key] = parseJsonish(value);
        currentArrayKey = null;
      }
      continue;
    }
    const arrayMatch = line.match(/^\s*-\s*(.*)$/);
    if (arrayMatch && currentArrayKey) {
      const existing = frontMatter[currentArrayKey];
      if (!Array.isArray(existing)) {
        throw new Error(`Front matter key is not an array: ${currentArrayKey}`);
      }
      existing.push(parseJsonish(arrayMatch[1]));
      continue;
    }
    throw new Error(`Unrecognized front matter line: ${line}`);
  }
  return {
    frontMatter,
    body: match[2].replace(/^\n+/, "")
  };
}
__name(parseFrontMatter, "parseFrontMatter");
function requireString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid or missing field: ${field}`);
  }
  return value.trim();
}
__name(requireString, "requireString");
function requireStringArray(value, field) {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid or missing field: ${field}`);
  }
  const items = value.map((item) => {
    if (typeof item !== "string" || !item.trim()) {
      throw new Error(`Invalid array item in ${field}`);
    }
    return item.trim();
  });
  return items;
}
__name(requireStringArray, "requireStringArray");
function requireBoolean(value, field) {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid or missing field: ${field}`);
  }
  return value;
}
__name(requireBoolean, "requireBoolean");
function requiredStatusLabels() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels, "requiredStatusLabels");
function buildNotePath(dateParts, noteId) {
  return `governance/notes/${dateParts.year}/${dateParts.month}/${noteId}.md`;
}
__name(buildNotePath, "buildNotePath");
function buildNoteDocument(note) {
  const frontMatter = buildFrontMatter([
    ["note_id", note.noteId],
    ["project", note.project],
    ["source_role", note.sourceRole],
    ["title", note.title],
    ["tags", note.tags],
    ["visibility", note.visibility],
    ["official_artifact", false],
    ["created_at", note.createdAt],
    ["required_status_labels", requiredStatusLabels()]
  ]);
  return `${frontMatter}

${note.body.trimEnd()}
`;
}
__name(buildNoteDocument, "buildNoteDocument");
async function listNoteFilePaths(env, projectName7) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  const noteRoot = await fetchGithubDirectoryIfExists(env, project, "governance/notes");
  const paths = [];
  for (const yearEntry of noteRoot) {
    if (yearEntry.type !== "dir")
      continue;
    const monthEntries = await fetchGithubDirectoryIfExists(env, project, yearEntry.path);
    for (const monthEntry of monthEntries) {
      if (monthEntry.type !== "dir")
        continue;
      const fileEntries = await fetchGithubDirectoryIfExists(env, project, monthEntry.path);
      for (const fileEntry of fileEntries) {
        if (fileEntry.type === "file" && fileEntry.name.endsWith(".md")) {
          paths.push(fileEntry.path);
        }
      }
    }
  }
  return paths;
}
__name(listNoteFilePaths, "listNoteFilePaths");
async function loadNoteSummary(env, project, path) {
  if (!project)
    throw new Error("Unknown project");
  const file = await fetchGithubFile(env, project, path);
  const parsed = parseFrontMatter(file.content);
  const noteId = requireString(parsed.frontMatter.note_id, "note_id");
  const projectName7 = requireString(parsed.frontMatter.project, "project");
  const sourceRoleValue = requireString(parsed.frontMatter.source_role, "source_role");
  if (!isKnownProject(projectName7))
    throw new Error(`Unknown project in note: ${projectName7}`);
  if (!isRole(sourceRoleValue))
    throw new Error(`Unknown source role in note: ${sourceRoleValue}`);
  const sourceRole = sourceRoleValue;
  const title = requireString(parsed.frontMatter.title, "title");
  const tags = requireStringArray(parsed.frontMatter.tags, "tags");
  const visibility = requireString(parsed.frontMatter.visibility, "visibility");
  const officialArtifact = requireBoolean(parsed.frontMatter.official_artifact, "official_artifact");
  const createdAt = requireString(parsed.frontMatter.created_at, "created_at");
  const labels3 = requireStringArray(parsed.frontMatter.required_status_labels, "required_status_labels");
  return {
    note_id: noteId,
    project: projectName7,
    source_role: sourceRole,
    title,
    tags,
    visibility,
    official_artifact: officialArtifact,
    created_at: createdAt,
    required_status_labels: labels3,
    source_path: file.path,
    source_sha: file.sha
  };
}
__name(loadNoteSummary, "loadNoteSummary");
async function handleCreateNote(request, env, repoStore) {
  const authRole = requireRole(request, env);
  const body = await request.json().catch(() => null);
  if (!body)
    return errorResponse("INVALID_REQUEST", "Missing JSON body", 400);
  const projectName7 = requireString(body.project, "project");
  const project = getProject(projectName7);
  if (!project)
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  if (!isKnownProject(projectName7))
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  const title = requireString(body.title, "title");
  const noteBody = requireString(body.body, "body");
  const tags = requireStringArray(body.tags, "tags");
  const visibility = requireString(body.visibility, "visibility");
  if (visibility !== "team") {
    return errorResponse("INVALID_VISIBILITY", "Notes visibility must be team", 400);
  }
  const dateParts = utcDateParts();
  const noteId = `NOTE-${dateParts.isoDate}-${shortId()}`;
  const path = buildNotePath(dateParts, noteId);
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const document = buildNoteDocument({
    noteId,
    project: projectName7,
    sourceRole: authRole,
    title,
    tags,
    visibility,
    createdAt,
    body: noteBody
  });
  const written = await repoStore.writeFile(env, project, path, document, `Write context note ${noteId}`);
  return jsonResponse({
    ok: true,
    project: projectName7,
    note_id: noteId,
    source_role: authRole,
    source_path: written.path,
    source_sha: written.sha,
    required_status_labels: requiredStatusLabels()
  }, 201);
}
__name(handleCreateNote, "handleCreateNote");
async function handleListNotes(request, env) {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = getParam(url, "project") || "";
  const limitRaw = getParam(url, "limit") || "20";
  const limit = Number.parseInt(limitRaw, 10);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return errorResponse("INVALID_LIMIT", "limit must be an integer between 1 and 100", 400);
  }
  const project = getProject(projectName7);
  if (!project)
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  const paths = await listNoteFilePaths(env, projectName7);
  const summaries = await Promise.all(paths.map((path) => loadNoteSummary(env, project, path)));
  summaries.sort((a, b) => {
    const timeDiff = Date.parse(b.created_at) - Date.parse(a.created_at);
    if (timeDiff !== 0)
      return timeDiff;
    return b.source_path.localeCompare(a.source_path);
  });
  return jsonResponse({
    ok: true,
    project: projectName7,
    limit,
    count: summaries.length,
    notes: summaries.slice(0, limit)
  });
}
__name(handleListNotes, "handleListNotes");
async function handleNotesRequest(request, env, repoStore = githubRepoStore) {
  try {
    if (request.method === "POST")
      return await handleCreateNote(request, env, repoStore);
    if (request.method === "GET")
      return await handleListNotes(request, env);
    return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid or missing field:") || message.startsWith("Invalid array item in") || message === "Missing JSON body" || message === "Invalid visibility") {
      return errorResponse("BAD_REQUEST", message, 400);
    }
    if (message.startsWith("Unknown project")) {
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    }
    if (message.startsWith("Unknown source role")) {
      return errorResponse("UNKNOWN_ROLE", message, 400);
    }
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleNotesRequest, "handleNotesRequest");

// src/messages.ts
function getParam2(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam2, "getParam");
function requireString2(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid or missing field: ${field}`);
  }
  return value.trim();
}
__name(requireString2, "requireString");
function optionalString(value) {
  if (typeof value !== "string")
    return "";
  return value.trim();
}
__name(optionalString, "optionalString");
function requiredStatusLabels2() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels2, "requiredStatusLabels");
function buildMessageDocument(message) {
  const frontMatter = buildFrontMatter([
    ["message_id", message.messageId],
    ["project", message.project],
    ["from", message.from],
    ["to", message.to],
    ["subject", message.subject],
    ["priority", message.priority],
    ["run_id", message.runId],
    ["status", "unread"],
    ["official_artifact", false],
    ["created_at", message.createdAt],
    ["required_status_labels", requiredStatusLabels2()]
  ]);
  return `${frontMatter}

${message.body.trimEnd()}
`;
}
__name(buildMessageDocument, "buildMessageDocument");
function buildMessagePath(role, kind, messageId) {
  return `governance/messages/${role}/${kind}/${messageId}.md`;
}
__name(buildMessagePath, "buildMessagePath");
function resolveRequestedRole(authRole, requestedRole) {
  const role = requestedRole || authRole;
  if (!isRole(role)) {
    throw new Error(`Unknown role: ${role}`);
  }
  if (authRole !== "HUMAN" && role !== authRole) {
    throw new Error(`Authenticated role ${authRole} cannot request ${role}`);
  }
  return role;
}
__name(resolveRequestedRole, "resolveRequestedRole");
async function listMessageFiles(env, projectName7, role, folder) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  const entries = await fetchGithubDirectoryIfExists(env, project, `governance/messages/${role}/${folder}`);
  return entries.filter((entry) => entry.type === "file" && entry.name.endsWith(".md")).map((entry) => entry.path);
}
__name(listMessageFiles, "listMessageFiles");
async function loadMessageRecord(env, projectName7, path) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  const file = await fetchGithubFile(env, project, path);
  const parsed = parseFrontMatter(file.content);
  const messageId = requireString2(parsed.frontMatter.message_id, "message_id");
  const projectValue = requireString2(parsed.frontMatter.project, "project");
  const fromValue = requireString2(parsed.frontMatter.from, "from");
  const toValue = requireString2(parsed.frontMatter.to, "to");
  const subject = requireString2(parsed.frontMatter.subject, "subject");
  const priority = requireString2(parsed.frontMatter.priority, "priority");
  const runId = optionalString(parsed.frontMatter.run_id);
  const status = requireString2(parsed.frontMatter.status, "status");
  const officialArtifact = parsed.frontMatter.official_artifact === true;
  const createdAt = requireString2(parsed.frontMatter.created_at, "created_at");
  const labelsValue = parsed.frontMatter.required_status_labels;
  if (!isKnownProject(projectValue))
    throw new Error(`Unknown project in message: ${projectValue}`);
  if (!isRole(fromValue))
    throw new Error(`Unknown sender role in message: ${fromValue}`);
  if (!isRole(toValue))
    throw new Error(`Unknown recipient role in message: ${toValue}`);
  if (!Array.isArray(labelsValue))
    throw new Error("Invalid required_status_labels");
  const requiredLabels = labelsValue.map((item) => {
    if (typeof item !== "string" || !item.trim())
      throw new Error("Invalid required_status_labels entry");
    return item.trim();
  });
  return {
    message_id: messageId,
    project: projectValue,
    from: fromValue,
    to: toValue,
    subject,
    priority,
    run_id: runId,
    status,
    official_artifact: officialArtifact,
    created_at: createdAt,
    required_status_labels: requiredLabels,
    source_path: file.path,
    source_sha: file.sha,
    body: parsed.body
  };
}
__name(loadMessageRecord, "loadMessageRecord");
async function findAccessibleMessagePath(env, projectName7, role, messageId) {
  const inboxPaths = await listMessageFiles(env, projectName7, role, "inbox");
  const archivePaths = await listMessageFiles(env, projectName7, role, "archive");
  const allPaths = [...inboxPaths, ...archivePaths];
  return allPaths.find((path) => path.endsWith(`/${messageId}.md`)) || null;
}
__name(findAccessibleMessagePath, "findAccessibleMessagePath");
async function handleSendMessage(request, env, repoStore) {
  const fromRole = requireRole(request, env);
  const body = await request.json().catch(() => null);
  if (!body)
    return errorResponse("INVALID_REQUEST", "Missing JSON body", 400);
  const projectName7 = requireString2(body.project, "project");
  const project = getProject(projectName7);
  if (!project)
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  if (!isKnownProject(projectName7))
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  const toRoleValue = requireString2(body.to, "to");
  if (!isRole(toRoleValue))
    return errorResponse("UNKNOWN_ROLE", `Unknown role: ${toRoleValue}`, 400);
  const subject = requireString2(body.subject, "subject");
  const messageBody = requireString2(body.body, "body");
  const priority = optionalString(body.priority) || "normal";
  if (!["low", "normal", "high"].includes(priority)) {
    return errorResponse("INVALID_PRIORITY", "priority must be low, normal, or high", 400);
  }
  const runId = optionalString(body.run_id);
  const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const messageId = `MSG-${date}-${shortId()}`;
  const path = buildMessagePath(toRoleValue, "inbox", messageId);
  const document = buildMessageDocument({
    messageId,
    project: projectName7,
    from: fromRole,
    to: toRoleValue,
    subject,
    priority,
    runId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    body: messageBody
  });
  const written = await repoStore.writeFile(env, project, path, document, `Write role message ${messageId}`);
  return jsonResponse({
    ok: true,
    project: projectName7,
    message_id: messageId,
    from: fromRole,
    to: toRoleValue,
    source_path: written.path,
    source_sha: written.sha,
    required_status_labels: requiredStatusLabels2()
  }, 201);
}
__name(handleSendMessage, "handleSendMessage");
async function handleListInbox(request, env) {
  const authRole = requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = getParam2(url, "project") || "";
  const requestedRole = resolveRequestedRole(authRole, getParam2(url, "role"));
  const project = getProject(projectName7);
  if (!project)
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  const paths = await listMessageFiles(env, projectName7, requestedRole, "inbox");
  const records = await Promise.all(paths.map((path) => loadMessageRecord(env, projectName7, path)));
  records.sort((a, b) => {
    const diff = Date.parse(b.created_at) - Date.parse(a.created_at);
    if (diff !== 0)
      return diff;
    return b.source_path.localeCompare(a.source_path);
  });
  return jsonResponse({
    ok: true,
    project: projectName7,
    role: requestedRole,
    count: records.length,
    messages: records
  });
}
__name(handleListInbox, "handleListInbox");
async function handleOpenMessage(request, env, messageId) {
  const authRole = requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = getParam2(url, "project") || "";
  const requestedRole = resolveRequestedRole(authRole, getParam2(url, "role"));
  const project = getProject(projectName7);
  if (!project)
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  const path = await findAccessibleMessagePath(env, projectName7, requestedRole, messageId);
  if (!path)
    return errorResponse("MESSAGE_NOT_FOUND", `No accessible message found for ${messageId}`, 404);
  const message = await loadMessageRecord(env, projectName7, path);
  return jsonResponse({
    ok: true,
    project: projectName7,
    role: requestedRole,
    source_path: message.source_path,
    source_sha: message.source_sha,
    message
  });
}
__name(handleOpenMessage, "handleOpenMessage");
async function handleArchiveMessage(request, env, messageId) {
  const authRole = requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = getParam2(url, "project") || "";
  const requestedRole = resolveRequestedRole(authRole, getParam2(url, "role"));
  const project = getProject(projectName7);
  if (!project)
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  const sourcePath = await findAccessibleMessagePath(env, projectName7, requestedRole, messageId);
  if (!sourcePath)
    return errorResponse("MESSAGE_NOT_FOUND", `No accessible message found for ${messageId}`, 404);
  const message = await loadMessageRecord(env, projectName7, sourcePath);
  const archivePath = buildMessagePath(requestedRole, "archive", messageId);
  const archived = await writeGithubFile(env, project, archivePath, await (async () => {
    const file = await fetchGithubFile(env, project, sourcePath);
    return file.content;
  })(), `Archive role message ${messageId}`);
  return jsonResponse({
    ok: true,
    project: projectName7,
    role: requestedRole,
    message_id: messageId,
    archived_from: sourcePath,
    archived_to: archived.path,
    archive_sha: archived.sha,
    note: "Inbox deletion deferred to v0.3"
  });
}
__name(handleArchiveMessage, "handleArchiveMessage");
async function handleMessagesRequest(request, env, messageId, action = "collection", repoStore = githubRepoStore) {
  try {
    if (action === "collection") {
      if (request.method === "POST")
        return await handleSendMessage(request, env, repoStore);
      if (request.method === "GET")
        return await handleListInbox(request, env);
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    }
    if (!messageId)
      return errorResponse("INVALID_REQUEST", "Missing message id", 400);
    if (action === "item") {
      if (request.method !== "GET")
        return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
      return await handleOpenMessage(request, env, messageId);
    }
    if (action === "archive") {
      if (request.method !== "POST")
        return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
      return await handleArchiveMessage(request, env, messageId);
    }
    return errorResponse("INVALID_REQUEST", "Unknown messages action", 400);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid or missing field:") || message.startsWith("Invalid array item in") || message === "Missing JSON body") {
      return errorResponse("BAD_REQUEST", message, 400);
    }
    if (message.startsWith("Unknown project")) {
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    }
    if (message.startsWith("Unknown role")) {
      return errorResponse("UNKNOWN_ROLE", message, 400);
    }
    if (message.startsWith("Authenticated role")) {
      return errorResponse("ROLE_MISMATCH", message, 403);
    }
    if (message.startsWith("No accessible message found")) {
      return errorResponse("MESSAGE_NOT_FOUND", message, 404);
    }
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleMessagesRequest, "handleMessagesRequest");

// src/flow_policy.ts
var FLOW_TYPES = ["science_flow", "code_flow", "audit_flow", "governance_flow"];
var FLOW_STATUSES = ["active", "blocked", "completed", "archived"];
var GATE_STATES = [
  "DRAFT",
  "PLAN_READY",
  "DEV_EVIDENCE_READY",
  "INTEGRITY_GATE_PASSED",
  "CLAIM_OR_PROMOTION_CANDIDATE",
  "HUMAN_APPROVED"
];
var GATE_ORDER = [
  "DRAFT",
  "PLAN_READY",
  "DEV_EVIDENCE_READY",
  "INTEGRITY_GATE_PASSED",
  "CLAIM_OR_PROMOTION_CANDIDATE",
  "HUMAN_APPROVED"
];
var SCIENCE_ARTIFACT_SLOTS = [
  "clarification",
  "research_dossier",
  "source_map",
  "contradiction_map",
  "open_questions",
  "hypothesis_card",
  "null_hypothesis",
  "prediction_record",
  "experiment_protocol",
  "metric_plan",
  "control_plan",
  "execution_packet",
  "sealed_boundary_plan",
  "execution_report",
  "evidence_manifest",
  "command_log",
  "raw_result_index",
  "deviation_report",
  "science_checklist",
  "protocol_audit",
  "evidence_audit",
  "claim_scope_audit",
  "audit_report",
  "quarantine_recommendation",
  "interpretation_draft",
  "alternative_explanation_review",
  "claim_scope_review",
  "iteration_proposal",
  "revised_hypothesis_card",
  "revised_experiment_protocol",
  "finding_record",
  "negative_finding_record",
  "inconclusive_finding_record",
  "finding_boundary_record",
  "share_recommendation",
  "share_packet",
  "pm_context_seed",
  "share_notification",
  "human_decision",
  "advancement_approval",
  "exception_manifest"
];
var FLOW_ARTIFACT_SLOTS = {
  science_flow: [...SCIENCE_ARTIFACT_SLOTS],
  code_flow: [
    "pm_dossier",
    "constitution",
    "specification",
    "plan",
    "pm_tasking",
    "pm_spec",
    "pm_gate_definition",
    "handoff_intake",
    "dossier_seed",
    "tasks",
    "coder_work_plan",
    "coder_tasks",
    "implementation_bundle",
    "coder_patch_bundle",
    "coder_handoff",
    "helper_execution_intake",
    "execution_report",
    "evidence_manifest",
    "command_log",
    "helper_log",
    "clarification",
    "checklist",
    "analysis",
    "audit_report",
    "integrity_review",
    "claim_audit",
    "helper_execution_review",
    "human_advancement_decision",
    "human_decision",
    "advancement_approval",
    "promotion_decision",
    "exception_manifest"
  ],
  audit_flow: [
    "clarification",
    "checklist",
    "analysis",
    "audit_report",
    "integrity_review",
    "claim_audit",
    "execution_report",
    "evidence_manifest",
    "command_log",
    "human_decision",
    "advancement_approval",
    "exception_manifest"
  ],
  governance_flow: [
    "research_dossier_review",
    "pm_dossier",
    "constitution",
    "specification",
    "plan",
    "pm_tasking",
    "pm_spec",
    "pm_gate_definition",
    "share_review",
    "tasks",
    "coder_work_plan",
    "coder_tasks",
    "implementation_bundle",
    "coder_patch_bundle",
    "coder_handoff",
    "execution_report",
    "evidence_manifest",
    "command_log",
    "helper_log",
    "clarification",
    "checklist",
    "analysis",
    "audit_report",
    "integrity_review",
    "claim_audit",
    "human_decision",
    "advancement_approval",
    "promotion_decision",
    "exception_manifest"
  ]
};
var ROLE_FLOW_CREATE = {
  science_flow: ["EXPLORER_AI"],
  code_flow: ["PM_AI", "HUMAN"],
  audit_flow: ["AUDITOR_AI", "HUMAN"],
  governance_flow: ["PM_AI", "HUMAN"]
};
function validateFlowCreateRole(flowType, role) {
  const allowed = ROLE_FLOW_CREATE[flowType] || [];
  if (allowed.includes(role))
    return null;
  return `Role ${role} cannot create ${flowType}`;
}
__name(validateFlowCreateRole, "validateFlowCreateRole");
var ROLE_FLOW_ARTIFACTS = {
  science_flow: {
    EXPLORER_AI: ["research_dossier", "source_map", "contradiction_map", "open_questions"],
    HYPOTHESIZER_AI: [
      "hypothesis_card",
      "null_hypothesis",
      "prediction_record",
      "interpretation_draft",
      "alternative_explanation_review",
      "iteration_proposal",
      "revised_hypothesis_card"
    ],
    DESIGNER_AI: ["experiment_protocol", "metric_plan", "control_plan", "execution_packet", "sealed_boundary_plan", "revised_experiment_protocol"],
    SCIENCE_EXECUTOR_AI: ["execution_report", "evidence_manifest", "command_log", "raw_result_index", "deviation_report"],
    SCIENCE_AUDITOR_AI: [
      "clarification",
      "science_checklist",
      "protocol_audit",
      "evidence_audit",
      "claim_scope_audit",
      "audit_report",
      "quarantine_recommendation",
      "claim_scope_review",
      "finding_record",
      "negative_finding_record",
      "inconclusive_finding_record",
      "finding_boundary_record",
      "share_recommendation"
    ],
    HUMAN: ["human_decision", "advancement_approval", "promotion_decision", "exception_manifest", "share_packet"]
  },
  code_flow: {
    PM_AI: ["pm_dossier", "constitution", "specification", "plan", "pm_tasking", "pm_spec", "pm_gate_definition", "handoff_intake", "dossier_seed"],
    CODER_AI: ["tasks", "coder_work_plan", "coder_tasks", "implementation_bundle", "coder_patch_bundle", "coder_handoff"],
    HELPER_AI: ["helper_execution_intake", "execution_report", "evidence_manifest", "command_log", "helper_log"],
    AUDITOR_AI: ["clarification", "checklist", "analysis", "audit_report", "integrity_review", "claim_audit", "helper_execution_review"],
    HUMAN: ["human_advancement_decision", "human_decision", "advancement_approval", "promotion_decision", "exception_manifest"]
  },
  audit_flow: {
    AUDITOR_AI: ["clarification", "checklist", "analysis", "audit_report", "integrity_review", "claim_audit"],
    HELPER_AI: ["execution_report", "evidence_manifest", "command_log"],
    HUMAN: ["human_decision", "advancement_approval", "exception_manifest"]
  },
  governance_flow: {
    PM_AI: ["research_dossier_review", "pm_dossier", "constitution", "specification", "plan", "pm_tasking", "pm_spec", "pm_gate_definition", "share_review"],
    CODER_AI: ["tasks", "implementation_bundle", "coder_patch_bundle", "coder_handoff"],
    HELPER_AI: ["execution_report", "evidence_manifest", "command_log", "helper_log"],
    AUDITOR_AI: ["clarification", "checklist", "analysis", "audit_report", "integrity_review", "claim_audit"],
    HUMAN: ["human_decision", "advancement_approval", "promotion_decision", "exception_manifest"]
  }
};
var EVIDENCE_ARTIFACTS = /* @__PURE__ */ new Set(["execution_report", "evidence_manifest", "command_log", "helper_log"]);
var AUDIT_ARTIFACTS = /* @__PURE__ */ new Set(["audit_report", "integrity_review", "claim_audit"]);
var HUMAN_DECISION_ARTIFACTS = /* @__PURE__ */ new Set(["human_decision", "advancement_approval", "promotion_decision", "exception_manifest"]);
var SCIENCE_EVIDENCE_REQUIRED = ["execution_report", "evidence_manifest", "command_log", "raw_result_index"];
var SCIENCE_AUDIT_REQUIRED = ["audit_report", "evidence_audit", "claim_scope_audit", "protocol_audit"];
function assertFlowType(value) {
  if (!FLOW_TYPES.includes(value))
    throw new Error("Flow type must be science_flow, code_flow, audit_flow, or governance_flow");
}
__name(assertFlowType, "assertFlowType");
function assertFlowStatus(value) {
  if (!FLOW_STATUSES.includes(value))
    throw new Error("Flow status must be active, blocked, completed, or archived");
}
__name(assertFlowStatus, "assertFlowStatus");
function assertGateState(value) {
  if (!GATE_STATES.includes(value))
    throw new Error("Invalid gate state");
}
__name(assertGateState, "assertGateState");
function artifactAllowedForFlow(flowType, artifactType) {
  return FLOW_ARTIFACT_SLOTS[flowType].includes(artifactType);
}
__name(artifactAllowedForFlow, "artifactAllowedForFlow");
function validateArtifactSlot(flowType, artifactType) {
  if (artifactAllowedForFlow(flowType, artifactType))
    return null;
  return `Artifact type ${artifactType} is not allowed for ${flowType}`;
}
__name(validateArtifactSlot, "validateArtifactSlot");
function validateFlowArtifactRole(flowType, role, artifactType) {
  const allowed = ROLE_FLOW_ARTIFACTS[flowType]?.[role] || [];
  if (allowed.includes(artifactType))
    return null;
  return `Role ${role} cannot write artifact_type ${artifactType} for ${flowType}`;
}
__name(validateFlowArtifactRole, "validateFlowArtifactRole");
function gateIndex(gate) {
  return GATE_ORDER.indexOf(gate);
}
__name(gateIndex, "gateIndex");
function hasAnyArtifact(artifactTypes2, allowed) {
  return artifactTypes2.some((type) => allowed.has(type));
}
__name(hasAnyArtifact, "hasAnyArtifact");
function hasAllArtifacts(artifactTypes2, required) {
  return required.every((type) => artifactTypes2.includes(type));
}
__name(hasAllArtifacts, "hasAllArtifacts");
function validateGateAdvance(currentGate, targetGate, targetStatus, artifactTypes2, flowType) {
  if (targetStatus === "blocked" || targetStatus === "archived")
    return null;
  if (currentGate === targetGate)
    return null;
  const currentIndex = gateIndex(currentGate);
  const targetIndex = gateIndex(targetGate);
  if (targetIndex < currentIndex)
    return `Gate rollback is not allowed: ${currentGate} -> ${targetGate}`;
  if (targetIndex > currentIndex + 1)
    return `Gate jump is not allowed: ${currentGate} -> ${targetGate}`;
  if (flowType === "science_flow") {
    if (targetGate === "DEV_EVIDENCE_READY" && !hasAllArtifacts(artifactTypes2, SCIENCE_EVIDENCE_REQUIRED)) {
      return `DEV_EVIDENCE_READY requires science evidence artifacts: ${SCIENCE_EVIDENCE_REQUIRED.join(", ")}`;
    }
    if (targetGate === "INTEGRITY_GATE_PASSED" && !hasAllArtifacts(artifactTypes2, SCIENCE_AUDIT_REQUIRED)) {
      return `INTEGRITY_GATE_PASSED requires science audit artifacts: ${SCIENCE_AUDIT_REQUIRED.join(", ")}`;
    }
  } else {
    if (targetGate === "DEV_EVIDENCE_READY" && !hasAnyArtifact(artifactTypes2, EVIDENCE_ARTIFACTS)) {
      return "DEV_EVIDENCE_READY requires at least one execution/evidence artifact";
    }
    if (targetGate === "INTEGRITY_GATE_PASSED" && !hasAnyArtifact(artifactTypes2, AUDIT_ARTIFACTS)) {
      return "INTEGRITY_GATE_PASSED requires at least one audit/integrity artifact";
    }
  }
  if (targetGate === "CLAIM_OR_PROMOTION_CANDIDATE" && !hasAnyArtifact(artifactTypes2, AUDIT_ARTIFACTS)) {
    return "CLAIM_OR_PROMOTION_CANDIDATE requires at least one audit/integrity artifact";
  }
  if (targetGate === "HUMAN_APPROVED" && !hasAnyArtifact(artifactTypes2, HUMAN_DECISION_ARTIFACTS)) {
    return "HUMAN_APPROVED requires at least one human decision artifact";
  }
  return null;
}
__name(validateGateAdvance, "validateGateAdvance");

// src/flows.ts
function getParam3(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam3, "getParam");
function requiredStatusLabels3() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels3, "requiredStatusLabels");
function utcIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(utcIso, "utcIso");
function utcDate() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
__name(utcDate, "utcDate");
function requireString3(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid or missing field: ${field}`);
  }
  return value.trim();
}
__name(requireString3, "requireString");
function optionalString2(value) {
  return typeof value === "string" ? value.trim() : "";
}
__name(optionalString2, "optionalString");
function readJsonBody(request) {
  return request.json().catch(() => null).then((body) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Missing or invalid JSON body");
    }
    return body;
  });
}
__name(readJsonBody, "readJsonBody");
function projectNameFrom(url, body) {
  const fromBody = body ? optionalString2(body.project) : "";
  const fromQuery = getParam3(url, "project") || "";
  return fromBody || fromQuery || "ArqonZero";
}
__name(projectNameFrom, "projectNameFrom");
function assertKnownProjectName(projectName7) {
  if (!isKnownProject(projectName7) || !getProject(projectName7)) {
    throw new Error(`Unknown project: ${projectName7}`);
  }
}
__name(assertKnownProjectName, "assertKnownProjectName");
function assertFlowName(name) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(name)) {
    throw new Error("Flow name must start with a letter or number and contain only letters, numbers, dot, underscore, or dash; max length 64");
  }
}
__name(assertFlowName, "assertFlowName");
function safeFilePart(input) {
  return input.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80);
}
__name(safeFilePart, "safeFilePart");
function flowIndexPath() {
  return "governance/flows/flow_index.json";
}
__name(flowIndexPath, "flowIndexPath");
function flowManifestPath(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(flowManifestPath, "flowManifestPath");
function flowArtifactPath(flowId, artifactId, title) {
  return `governance/flows/${flowId}/artifacts/${artifactId}-${safeFilePart(title)}.md`;
}
__name(flowArtifactPath, "flowArtifactPath");
function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}
`;
}
__name(formatJson, "formatJson");
function emptyIndex(projectName7) {
  return {
    schema_version: "flow_index.v0.3",
    project: projectName7,
    updated_at: utcIso(),
    flows: []
  };
}
__name(emptyIndex, "emptyIndex");
async function loadFlowIndex(env, projectName7, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, flowIndexPath());
    const parsed = JSON.parse(file.content);
    if (parsed.schema_version !== "flow_index.v0.3" || !Array.isArray(parsed.flows)) {
      throw new Error("Invalid flow index schema");
    }
    return parsed;
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) {
      return emptyIndex(projectName7);
    }
    throw err;
  }
}
__name(loadFlowIndex, "loadFlowIndex");
async function writeFlowIndex(env, projectName7, index, message, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  index.updated_at = utcIso();
  await store.writeFile(env, project, flowIndexPath(), formatJson(index), message);
}
__name(writeFlowIndex, "writeFlowIndex");
async function loadFlowManifest(env, projectName7, flowId, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  const file = await store.fetchFile(env, project, flowManifestPath(flowId));
  const parsed = JSON.parse(file.content);
  if (parsed.schema_version !== "flow_manifest.v0.3" || parsed.flow_id !== flowId) {
    throw new Error(`Invalid flow manifest schema for ${flowId}`);
  }
  return parsed;
}
__name(loadFlowManifest, "loadFlowManifest");
async function writeFlowManifest(env, projectName7, manifest, message, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  manifest.updated_at = utcIso();
  return await store.writeFile(env, project, flowManifestPath(manifest.flow_id), formatJson(manifest), message);
}
__name(writeFlowManifest, "writeFlowManifest");
function nextFlowId(index) {
  const year = utcDate().slice(0, 4);
  let max = 0;
  for (const entry of index.flows) {
    const match = entry.flow_id.match(new RegExp(`^FLOW-${year}-(\\d{4})$`));
    if (match)
      max = Math.max(max, Number.parseInt(match[1], 10));
  }
  return `FLOW-${year}-${String(max + 1).padStart(4, "0")}`;
}
__name(nextFlowId, "nextFlowId");
function indexEntryFromManifest(manifest) {
  return {
    flow_id: manifest.flow_id,
    name: manifest.name,
    type: manifest.type,
    title: manifest.title,
    status: manifest.status,
    current_gate: manifest.current_gate,
    created_at: manifest.created_at,
    updated_at: manifest.updated_at,
    source_path: flowManifestPath(manifest.flow_id)
  };
}
__name(indexEntryFromManifest, "indexEntryFromManifest");
function upsertIndexEntry(index, manifest) {
  const next = indexEntryFromManifest(manifest);
  const existingIndex = index.flows.findIndex((entry) => entry.flow_id === manifest.flow_id);
  if (existingIndex >= 0) {
    index.flows[existingIndex] = next;
  } else {
    index.flows.push(next);
  }
  index.flows.sort((a, b) => {
    const timeDiff = Date.parse(b.updated_at) - Date.parse(a.updated_at);
    if (timeDiff !== 0)
      return timeDiff;
    return a.flow_id.localeCompare(b.flow_id);
  });
}
__name(upsertIndexEntry, "upsertIndexEntry");
function resolveFlowId(index, flowRef) {
  const direct = index.flows.find((entry) => entry.flow_id === flowRef);
  if (direct)
    return direct.flow_id;
  const byName = index.flows.find((entry) => entry.name === flowRef);
  return byName?.flow_id || null;
}
__name(resolveFlowId, "resolveFlowId");
function looksLikeFlowId(flowRef) {
  return /^FLOW-\d{4}-\d{4}$/.test(flowRef);
}
__name(looksLikeFlowId, "looksLikeFlowId");
function buildHistory(eventType, role, note) {
  return {
    event_id: `EVT-${utcDate()}-${shortId()}`,
    event_type: eventType,
    role,
    created_at: utcIso(),
    note
  };
}
__name(buildHistory, "buildHistory");
var ROUTE_ONLY_ARTIFACT_FLOWS = {
  implementation_bundle: ["code_flow", "governance_flow"],
  coder_handoff: ["code_flow", "governance_flow"],
  helper_execution_intake: ["code_flow"],
  execution_report: ["code_flow"],
  command_log: ["code_flow"],
  evidence_manifest: ["code_flow"],
  helper_execution_review: ["code_flow"],
  human_advancement_decision: ["code_flow"],
  promotion_decision: ["code_flow", "governance_flow"],
  advancement_approval: ["science_flow", "code_flow", "audit_flow", "governance_flow"],
  human_decision: ["science_flow", "code_flow", "audit_flow", "governance_flow"]
};
function isRouteOnlyArtifactForFlow(flowType, artifactType) {
  return (ROUTE_ONLY_ARTIFACT_FLOWS[artifactType] || []).includes(flowType);
}
__name(isRouteOnlyArtifactForFlow, "isRouteOnlyArtifactForFlow");
function buildArtifactDocument(artifact) {
  const frontMatter = buildFrontMatter([
    ["artifact_id", artifact.artifactId],
    ["flow_id", artifact.flowId],
    ["project", artifact.project],
    ["role", artifact.role],
    ["artifact_type", artifact.artifactType],
    ["title", artifact.title],
    ["official_artifact", true],
    ["created_at", artifact.createdAt],
    ["required_status_labels", requiredStatusLabels3()]
  ]);
  return `${frontMatter}

${artifact.body.trimEnd()}
`;
}
__name(buildArtifactDocument, "buildArtifactDocument");
async function handleCreateFlow(request, env, store) {
  const role = requireRole(request, env);
  const url = new URL(request.url);
  const body = await readJsonBody(request);
  const projectName7 = projectNameFrom(url, body);
  assertKnownProjectName(projectName7);
  const name = requireString3(body.name, "name");
  assertFlowName(name);
  const typeValue = requireString3(body.type, "type");
  assertFlowType(typeValue);
  const createRoleError = validateFlowCreateRole(typeValue, role);
  if (createRoleError) {
    return errorResponse("FLOW_CREATE_ROLE_FORBIDDEN", createRoleError, 403);
  }
  const title = requireString3(body.title, "title");
  const summary = optionalString2(body.summary);
  const initialGate = optionalString2(body.initial_gate) || "DRAFT";
  assertGateState(initialGate);
  const index = await loadFlowIndex(env, projectName7, store);
  const duplicate = index.flows.find((entry) => entry.name === name && ["active", "blocked"].includes(entry.status));
  if (duplicate) {
    return errorResponse("FLOW_NAME_CONFLICT", `Active flow name already exists: ${name}`, 409);
  }
  const now4 = utcIso();
  const flowId = nextFlowId(index);
  const manifest = {
    schema_version: "flow_manifest.v0.3",
    official_artifact: true,
    project: projectName7,
    flow_id: flowId,
    name,
    type: typeValue,
    title,
    summary,
    status: "active",
    current_gate: initialGate,
    created_at: now4,
    created_by_role: role,
    updated_at: now4,
    updated_by_role: role,
    required_status_labels: requiredStatusLabels3(),
    artifacts: [],
    history: [buildHistory("create_flow", role, "Flow created")]
  };
  const written = await writeFlowManifest(env, projectName7, manifest, `Create flow ${flowId}`, store);
  upsertIndexEntry(index, manifest);
  await writeFlowIndex(env, projectName7, index, `Update flow index for ${flowId}`, store);
  return jsonResponse({
    ok: true,
    project: projectName7,
    flow_id: flowId,
    name,
    type: typeValue,
    status: manifest.status,
    current_gate: manifest.current_gate,
    source_path: written.path,
    source_sha: written.sha,
    required_status_labels: requiredStatusLabels3()
  }, 201);
}
__name(handleCreateFlow, "handleCreateFlow");
async function handleListFlows(request, env, store) {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = projectNameFrom(url);
  assertKnownProjectName(projectName7);
  const typeFilter = getParam3(url, "type");
  const statusFilter = getParam3(url, "status");
  if (typeFilter)
    assertFlowType(typeFilter);
  if (statusFilter)
    assertFlowStatus(statusFilter);
  const index = await loadFlowIndex(env, projectName7, store);
  let flows = [...index.flows];
  if (typeFilter)
    flows = flows.filter((flow) => flow.type === typeFilter);
  if (statusFilter)
    flows = flows.filter((flow) => flow.status === statusFilter);
  return jsonResponse({
    ok: true,
    project: projectName7,
    count: flows.length,
    flows,
    required_status_labels: requiredStatusLabels3()
  });
}
__name(handleListFlows, "handleListFlows");
async function flowIdOrError(env, projectName7, flowRef, store) {
  const index = await loadFlowIndex(env, projectName7, store);
  const flowId = resolveFlowId(index, flowRef);
  if (!flowId) {
    if (looksLikeFlowId(flowRef)) {
      try {
        await loadFlowManifest(env, projectName7, flowRef, store);
        return { index, flowId: flowRef };
      } catch {
      }
    }
    return errorResponse("FLOW_NOT_FOUND", `No flow found for ref: ${flowRef}`, 404);
  }
  return { index, flowId };
}
__name(flowIdOrError, "flowIdOrError");
async function handleLoadFlow(request, env, flowRef, store) {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = projectNameFrom(url);
  assertKnownProjectName(projectName7);
  const resolved = await flowIdOrError(env, projectName7, flowRef, store);
  if (resolved instanceof Response)
    return resolved;
  const manifest = await loadFlowManifest(env, projectName7, resolved.flowId, store);
  return jsonResponse({
    ok: true,
    project: projectName7,
    flow_ref: flowRef,
    flow_id: resolved.flowId,
    manifest,
    required_status_labels: requiredStatusLabels3()
  });
}
__name(handleLoadFlow, "handleLoadFlow");
async function handleFlowStatus(request, env, flowRef, store) {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = projectNameFrom(url);
  assertKnownProjectName(projectName7);
  const resolved = await flowIdOrError(env, projectName7, flowRef, store);
  if (resolved instanceof Response)
    return resolved;
  const entry = resolved.index.flows.find((flow) => flow.flow_id === resolved.flowId);
  if (!entry)
    return errorResponse("FLOW_NOT_FOUND", `No flow found for ref: ${flowRef}`, 404);
  return jsonResponse({
    ok: true,
    project: projectName7,
    flow_ref: flowRef,
    flow_id: entry.flow_id,
    name: entry.name,
    type: entry.type,
    title: entry.title,
    status: entry.status,
    current_gate: entry.current_gate,
    updated_at: entry.updated_at,
    required_status_labels: requiredStatusLabels3()
  });
}
__name(handleFlowStatus, "handleFlowStatus");
async function handleWriteFlowArtifact(request, env, flowRef, store, options = {}) {
  const role = requireRole(request, env);
  const url = new URL(request.url);
  const body = await readJsonBody(request);
  const projectName7 = projectNameFrom(url, body);
  assertKnownProjectName(projectName7);
  const artifactType = requireString3(body.artifact_type, "artifact_type");
  const title = requireString3(body.title, "title");
  const artifactBody = requireString3(body.body, "body");
  const resolved = await flowIdOrError(env, projectName7, flowRef, store);
  if (resolved instanceof Response)
    return resolved;
  const manifest = await loadFlowManifest(env, projectName7, resolved.flowId, store);
  if (["completed", "archived"].includes(manifest.status)) {
    return errorResponse("FLOW_CLOSED", `Cannot write artifacts to ${manifest.status} flow`, 409);
  }
  const slotError = validateArtifactSlot(manifest.type, artifactType);
  if (slotError) {
    return errorResponse("ARTIFACT_SLOT_FORBIDDEN", slotError, 403);
  }
  const roleError = validateFlowArtifactRole(manifest.type, role, artifactType);
  if (roleError) {
    return errorResponse("ARTIFACT_ROLE_FORBIDDEN", roleError, 403);
  }
  if (isRouteOnlyArtifactForFlow(manifest.type, artifactType) && !options.routeScoped) {
    return errorResponse(
      "FLOW_ARTIFACT_ROUTE_REQUIRED",
      `${artifactType} must be created through its role-scoped route`,
      403
    );
  }
  if (manifest.type === "science_flow" && artifactType === "share_packet") {
    return errorResponse(
      "SCIENCE_SHARE_ROUTE_REQUIRED",
      "Official science share_packet must be created through /v1/science/share so Human approval, outbox, PM notification, and context update can be enforced",
      403
    );
  }
  const createdAt = utcIso();
  const artifactId = `ART-${utcDate()}-${shortId()}`;
  const path = flowArtifactPath(manifest.flow_id, artifactId, title);
  const document = buildArtifactDocument({
    artifactId,
    flowId: manifest.flow_id,
    project: projectName7,
    role,
    artifactType,
    title,
    createdAt,
    body: artifactBody
  });
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  const written = await store.writeFile(env, project, path, document, `Write flow artifact ${artifactId} for ${manifest.flow_id}`);
  const summary = {
    artifact_id: artifactId,
    artifact_type: artifactType,
    title,
    role,
    created_at: createdAt,
    source_path: written.path,
    source_sha: written.sha
  };
  manifest.artifacts.push(summary);
  manifest.updated_by_role = role;
  manifest.history.push(buildHistory("write_artifact", role, `Wrote ${artifactType}: ${artifactId}`));
  const manifestWrite = await writeFlowManifest(env, projectName7, manifest, `Update flow manifest for ${artifactId}`, store);
  upsertIndexEntry(resolved.index, manifest);
  await writeFlowIndex(env, projectName7, resolved.index, `Update flow index for ${manifest.flow_id}`, store);
  return jsonResponse({
    ok: true,
    project: projectName7,
    flow_id: manifest.flow_id,
    flow_ref: flowRef,
    artifact: summary,
    manifest_path: manifestWrite.path,
    manifest_sha: manifestWrite.sha,
    required_status_labels: requiredStatusLabels3()
  }, 201);
}
__name(handleWriteFlowArtifact, "handleWriteFlowArtifact");
async function writeRouteScopedFlowArtifact(request, env, flowRef, repoStore = githubRepoStore) {
  return await handleWriteFlowArtifact(request, env, flowRef, repoStore, { routeScoped: true });
}
__name(writeRouteScopedFlowArtifact, "writeRouteScopedFlowArtifact");
async function handleAdvanceFlow(request, env, flowRef, store) {
  const role = requireRole(request, env);
  if (role !== "HUMAN") {
    return errorResponse("HUMAN_ADVANCEMENT_REQUIRED", "Only HUMAN may advance flow gates or status in Flow Core v0.3", 403);
  }
  const url = new URL(request.url);
  const body = await readJsonBody(request);
  const projectName7 = projectNameFrom(url, body);
  assertKnownProjectName(projectName7);
  const gateState = requireString3(body.gate_state, "gate_state");
  assertGateState(gateState);
  const status = optionalString2(body.status) || "active";
  assertFlowStatus(status);
  const note = optionalString2(body.note) || `Advanced to ${gateState}`;
  const resolved = await flowIdOrError(env, projectName7, flowRef, store);
  if (resolved instanceof Response)
    return resolved;
  const manifest = await loadFlowManifest(env, projectName7, resolved.flowId, store);
  const advanceError = validateGateAdvance(
    manifest.current_gate,
    gateState,
    status,
    manifest.artifacts.map((artifact) => artifact.artifact_type),
    manifest.type
  );
  if (advanceError) {
    return errorResponse("FLOW_ADVANCEMENT_PRECONDITION_FAILED", advanceError, 409);
  }
  manifest.current_gate = gateState;
  manifest.status = status;
  manifest.updated_by_role = role;
  manifest.history.push(buildHistory("advance_flow", role, note));
  const written = await writeFlowManifest(env, projectName7, manifest, `Advance flow ${manifest.flow_id}`, store);
  upsertIndexEntry(resolved.index, manifest);
  await writeFlowIndex(env, projectName7, resolved.index, `Update flow index for ${manifest.flow_id}`, store);
  return jsonResponse({
    ok: true,
    project: projectName7,
    flow_ref: flowRef,
    flow_id: manifest.flow_id,
    status: manifest.status,
    current_gate: manifest.current_gate,
    source_path: written.path,
    source_sha: written.sha,
    required_status_labels: requiredStatusLabels3()
  });
}
__name(handleAdvanceFlow, "handleAdvanceFlow");
async function handleFlowsRequest(request, env, flowRef, action = "collection", repoStore = githubRepoStore) {
  try {
    if (action === "collection") {
      if (request.method === "POST")
        return await handleCreateFlow(request, env, repoStore);
      if (request.method === "GET")
        return await handleListFlows(request, env, repoStore);
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    }
    if (!flowRef)
      return errorResponse("INVALID_REQUEST", "Missing flow ref", 400);
    if (action === "item") {
      if (request.method !== "GET")
        return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
      return await handleLoadFlow(request, env, flowRef, repoStore);
    }
    if (action === "status") {
      if (request.method !== "GET")
        return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
      return await handleFlowStatus(request, env, flowRef, repoStore);
    }
    if (action === "artifacts") {
      if (request.method !== "POST")
        return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
      return await handleWriteFlowArtifact(request, env, flowRef, repoStore);
    }
    if (action === "advance") {
      if (request.method !== "POST")
        return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
      return await handleAdvanceFlow(request, env, flowRef, repoStore);
    }
    return errorResponse("NOT_FOUND", "Unknown flow action", 404);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be")) {
      return errorResponse("BAD_REQUEST", message, 400);
    }
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("not allowlisted") || message.includes("Forbidden path"))
      return errorResponse("POLICY_DENIED", message, 403);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleFlowsRequest, "handleFlowsRequest");

// src/science_share.ts
var FINDING_ARTIFACTS = /* @__PURE__ */ new Set(["finding_record", "negative_finding_record", "inconclusive_finding_record", "finding_boundary_record"]);
var SHARE_EVIDENCE_LEVELS = /* @__PURE__ */ new Set([
  "SUPPORTED_REPLICATED",
  "SUPPORTED_SINGLE_RUN",
  "SUPPORTED_DIAGNOSTIC",
  "NEGATIVE_RESULT",
  "INCONCLUSIVE"
]);
function utcIso2() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(utcIso2, "utcIso");
function utcDate2() {
  return utcIso2().slice(0, 10);
}
__name(utcDate2, "utcDate");
function requiredStatusLabels4() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels4, "requiredStatusLabels");
function requireString4(value, field) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Invalid or missing field: ${field}`);
  return value.trim();
}
__name(requireString4, "requireString");
function optionalString3(value) {
  return typeof value === "string" ? value.trim() : "";
}
__name(optionalString3, "optionalString");
function requireStringArray2(value, field) {
  if (!Array.isArray(value))
    throw new Error(`Invalid or missing field: ${field}`);
  return value.map((item) => {
    if (typeof item !== "string" || !item.trim())
      throw new Error(`Invalid array item in ${field}`);
    return item.trim();
  });
}
__name(requireStringArray2, "requireStringArray");
function getParam4(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam4, "getParam");
function projectNameFrom2(url, body) {
  const fromBody = body ? optionalString3(body.project) : "";
  const fromQuery = getParam4(url, "project") || "";
  return fromBody || fromQuery || "ArqonZero";
}
__name(projectNameFrom2, "projectNameFrom");
function safeFilePart2(value) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
}
__name(safeFilePart2, "safeFilePart");
function flowIndexPath2() {
  return "governance/flows/flow_index.json";
}
__name(flowIndexPath2, "flowIndexPath");
function flowManifestPath2(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(flowManifestPath2, "flowManifestPath");
function flowArtifactPath2(flowId, artifactId, title) {
  return `governance/flows/${flowId}/artifacts/${artifactId}-${safeFilePart2(title)}.md`;
}
__name(flowArtifactPath2, "flowArtifactPath");
function shareRoot(flowId, shareId) {
  return `governance/flows/${flowId}/share/${shareId}`;
}
__name(shareRoot, "shareRoot");
function shareRecordPath(flowId, shareId) {
  return `${shareRoot(flowId, shareId)}/share_record.json`;
}
__name(shareRecordPath, "shareRecordPath");
function outboxPath(flowId, shareId) {
  return `governance/outbox/science_share/${flowId}/${shareId}.json`;
}
__name(outboxPath, "outboxPath");
function pmContextPath(shareId) {
  return `governance/context/pm_share_context/${shareId}.json`;
}
__name(pmContextPath, "pmContextPath");
function pmContextIndexPath() {
  return "governance/context/generated_pm_share_context.json";
}
__name(pmContextIndexPath, "pmContextIndexPath");
function pmMessagePath(shareId) {
  return `governance/messages/PM_AI/inbox/MSG-SHARE-${shareId}.md`;
}
__name(pmMessagePath, "pmMessagePath");
function formatJson2(value) {
  return `${JSON.stringify(value, null, 2)}
`;
}
__name(formatJson2, "formatJson");
async function readJsonBody2(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Missing or invalid JSON body");
  return body;
}
__name(readJsonBody2, "readJsonBody");
async function fetchJsonIfExists(env, projectName7, path, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, path);
    return JSON.parse(file.content);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404"))
      return null;
    throw err;
  }
}
__name(fetchJsonIfExists, "fetchJsonIfExists");
async function loadFlowIndex2(env, projectName7, store) {
  const index = await fetchJsonIfExists(env, projectName7, flowIndexPath2(), store);
  if (!index || index.schema_version !== "flow_index.v0.3" || !Array.isArray(index.flows)) {
    throw new Error("Invalid or missing flow index schema");
  }
  return index;
}
__name(loadFlowIndex2, "loadFlowIndex");
async function loadFlowManifest2(env, projectName7, flowId, store) {
  const manifest = await fetchJsonIfExists(env, projectName7, flowManifestPath2(flowId), store);
  if (!manifest || manifest.schema_version !== "flow_manifest.v0.3" || manifest.flow_id !== flowId) {
    throw new Error(`Invalid or missing flow manifest schema for ${flowId}`);
  }
  return manifest;
}
__name(loadFlowManifest2, "loadFlowManifest");
function resolveFlowId2(index, flowRef) {
  const direct = index.flows.find((entry) => entry.flow_id === flowRef);
  if (direct)
    return direct.flow_id;
  const byName = index.flows.find((entry) => entry.name === flowRef);
  return byName?.flow_id || null;
}
__name(resolveFlowId2, "resolveFlowId");
function upsertIndexEntry2(index, manifest) {
  const entry = {
    flow_id: manifest.flow_id,
    name: manifest.name,
    type: manifest.type,
    title: manifest.title,
    status: manifest.status,
    current_gate: manifest.current_gate,
    created_at: manifest.created_at,
    updated_at: manifest.updated_at,
    source_path: flowManifestPath2(manifest.flow_id)
  };
  const existing = index.flows.findIndex((item) => item.flow_id === manifest.flow_id);
  if (existing >= 0)
    index.flows[existing] = entry;
  else
    index.flows.push(entry);
  index.updated_at = utcIso2();
}
__name(upsertIndexEntry2, "upsertIndexEntry");
function artifactTypes(manifest) {
  return new Set(manifest.artifacts.map((artifact) => artifact.artifact_type));
}
__name(artifactTypes, "artifactTypes");
function artifactForRef(manifest, ref) {
  return manifest.artifacts.find((artifact) => artifact.artifact_id === ref || artifact.source_path === ref) || null;
}
__name(artifactForRef, "artifactForRef");
function toResolvedShareSourceArtifact(artifact) {
  return {
    artifact_id: artifact.artifact_id,
    artifact_type: artifact.artifact_type,
    title: artifact.title,
    role: artifact.role,
    created_at: artifact.created_at,
    source_path: artifact.source_path,
    source_sha: artifact.source_sha
  };
}
__name(toResolvedShareSourceArtifact, "toResolvedShareSourceArtifact");
function sharePreconditionError(manifest) {
  if (manifest.type !== "science_flow")
    return errorResponse("SCIENCE_SHARE_FLOW_TYPE_REQUIRED", "Share requires a science_flow", 409);
  const types = artifactTypes(manifest);
  const missing = [];
  if (!types.has("audit_report"))
    missing.push("audit_report");
  if (!types.has("share_recommendation"))
    missing.push("share_recommendation");
  if (![...FINDING_ARTIFACTS].some((type) => types.has(type))) {
    missing.push("finding_record|negative_finding_record|inconclusive_finding_record|finding_boundary_record");
  }
  if (missing.length > 0)
    return errorResponse("SCIENCE_SHARE_PRECONDITION_FAILED", `Share preconditions missing: ${missing.join(", ")}`, 409);
  return null;
}
__name(sharePreconditionError, "sharePreconditionError");
function requireSourceEvidenceCoverage(manifest, sourceArtifacts) {
  if (sourceArtifacts.length === 0) {
    return {
      error: errorResponse(
        "SCIENCE_SHARE_SOURCE_ARTIFACTS_REQUIRED",
        "source_artifacts must include audit_report, share_recommendation, and finding record references",
        400
      ),
      resolved: []
    };
  }
  const resolvedArtifacts = [];
  const missingRefs = [];
  for (const ref of sourceArtifacts) {
    const artifact = artifactForRef(manifest, ref);
    if (!artifact) {
      missingRefs.push(ref);
      continue;
    }
    resolvedArtifacts.push(artifact);
  }
  if (missingRefs.length > 0) {
    return {
      error: errorResponse("SCIENCE_SHARE_PRECONDITION_FAILED", `Unknown source_artifacts: ${missingRefs.join(", ")}`, 409),
      resolved: []
    };
  }
  const types = new Set(resolvedArtifacts.map((artifact) => artifact.artifact_type));
  const missingTypes = [];
  if (!types.has("audit_report"))
    missingTypes.push("audit_report");
  if (!types.has("share_recommendation"))
    missingTypes.push("share_recommendation");
  if (![...FINDING_ARTIFACTS].some((type) => types.has(type))) {
    missingTypes.push("finding_record|negative_finding_record|inconclusive_finding_record|finding_boundary_record");
  }
  if (missingTypes.length > 0) {
    return {
      error: errorResponse(
        "SCIENCE_SHARE_PRECONDITION_FAILED",
        `source_artifacts missing required evidence classes: ${missingTypes.join(", ")}`,
        409
      ),
      resolved: []
    };
  }
  return { error: null, resolved: resolvedArtifacts.map(toResolvedShareSourceArtifact) };
}
__name(requireSourceEvidenceCoverage, "requireSourceEvidenceCoverage");
function requireIdempotencyKey(value) {
  const key = requireString4(value, "idempotency_key");
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(key)) {
    throw new Error("idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash");
  }
  return key;
}
__name(requireIdempotencyKey, "requireIdempotencyKey");
function stableShareId(flowId, idempotencyKey) {
  return `${safeFilePart2(flowId)}-${safeFilePart2(idempotencyKey)}`.slice(0, 140);
}
__name(stableShareId, "stableShareId");
async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
function buildShareMarkdown(input) {
  const frontMatter = buildFrontMatter([
    ["share_id", input.shareId],
    ["project", input.project],
    ["flow_id", input.flowId],
    ["role", "HUMAN"],
    ["artifact_type", "share_packet"],
    ["official_artifact", true],
    ["idempotency_key", input.idempotencyKey],
    ["human_authority", "server_authenticated_human"],
    ["evidence_level", input.evidenceLevel],
    ["uncertainty", input.uncertainty],
    ["source_artifacts", input.sourceArtifacts],
    ["allowed_claims", input.allowedClaims],
    ["forbidden_claims", input.forbiddenClaims],
    ["share_packet_hash", input.shareHash],
    ["created_at", input.createdAt],
    ["required_status_labels", requiredStatusLabels4()]
  ]);
  return `${frontMatter}

# Science Share Packet

## Evidence Level

${input.evidenceLevel}

## Uncertainty

${input.uncertainty}

## Source Artifacts

${input.sourceArtifacts.map((item) => `- ${item}`).join("\n")}

## Resolved Source Artifacts

${input.resolvedSourceArtifacts.map((item) => `- ${item.artifact_type}: ${item.artifact_id} (${item.source_path})`).join("\n")}

## Allowed Claims

${input.allowedClaims.map((item) => `- ${item}`).join("\n")}

## Forbidden Claims

${input.forbiddenClaims.map((item) => `- ${item}`).join("\n")}

## Share Body

${input.body.trimEnd()}
`;
}
__name(buildShareMarkdown, "buildShareMarkdown");
function buildPMMessage(input) {
  const frontMatter = buildFrontMatter([
    ["message_id", `MSG-SHARE-${input.shareId}`],
    ["project", input.project],
    ["from", "HUMAN"],
    ["to", "PM_AI"],
    ["subject", `Science share ready: ${input.flowId}`],
    ["priority", "high"],
    ["run_id", input.flowId],
    ["status", "unread"],
    ["official_artifact", false],
    ["created_at", input.createdAt],
    ["required_status_labels", requiredStatusLabels4()]
  ]);
  return `${frontMatter}

# Science Share Notification

A Human-approved science share packet is ready for PM review.

- flow_id: ${input.flowId}
- share_id: ${input.shareId}
- share_packet_path: ${input.sharePacketPath}
- pm_context_path: ${input.pmContextPath}
- share_packet_hash: ${input.shareHash}

${input.body.trimEnd()}
`;
}
__name(buildPMMessage, "buildPMMessage");
function buildOutbox(input) {
  return {
    schema_version: "science_share_outbox.v0.1",
    project: input.project,
    flow_id: input.flowId,
    share_id: input.shareId,
    idempotency_key: input.idempotencyKey,
    status: input.status,
    stage: input.stage,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
    share_packet_path: input.sharePacketPath || null,
    pm_message_path: input.pmMessagePath || null,
    pm_context_path: input.pmContextPath || null,
    share_record_path: input.shareRecordPath || null,
    required_status_labels: requiredStatusLabels4()
  };
}
__name(buildOutbox, "buildOutbox");
async function loadPMShareContextIndex(env, projectName7, store) {
  const existing = await fetchJsonIfExists(env, projectName7, pmContextIndexPath(), store);
  if (existing && existing.schema_version === "pm_share_context_index.v0.1" && Array.isArray(existing.entries))
    return existing;
  return {
    schema_version: "pm_share_context_index.v0.1",
    project: projectName7,
    updated_at: utcIso2(),
    entries: []
  };
}
__name(loadPMShareContextIndex, "loadPMShareContextIndex");
function upsertPMContextEntry(index, entry) {
  const existing = index.entries.findIndex((item) => item.share_id === entry.share_id);
  if (existing >= 0)
    index.entries[existing] = entry;
  else
    index.entries.push(entry);
  index.updated_at = utcIso2();
  index.entries.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}
__name(upsertPMContextEntry, "upsertPMContextEntry");
async function handleScienceShare(request, env, role, repoStore) {
  if (request.method !== "POST")
    return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
  if (role !== "HUMAN") {
    return errorResponse("SCIENCE_SHARE_HUMAN_REQUIRED", "Only authenticated HUMAN may create official science share packets", 403);
  }
  const url = new URL(request.url);
  const body = await readJsonBody2(request);
  const projectName7 = projectNameFrom2(url, body);
  const project = getProject(projectName7);
  if (!project)
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  const flowRef = optionalString3(body.flow_ref) || getParam4(url, "flow_ref") || "";
  if (!flowRef)
    return errorResponse("SCIENCE_FLOW_REF_REQUIRED", "/v1/science/share requires flow_ref", 400);
  const idempotencyKey = requireIdempotencyKey(body.idempotency_key);
  const evidenceLevel = requireString4(body.evidence_level, "evidence_level");
  if (!SHARE_EVIDENCE_LEVELS.has(evidenceLevel)) {
    return errorResponse("SCIENCE_SHARE_EVIDENCE_LEVEL_INVALID", `Invalid evidence_level: ${evidenceLevel}`, 400);
  }
  const uncertainty = requireString4(body.uncertainty, "uncertainty");
  const sourceArtifacts = requireStringArray2(body.source_artifacts, "source_artifacts");
  const allowedClaims = requireStringArray2(body.allowed_claims, "allowed_claims");
  const forbiddenClaims = requireStringArray2(body.forbidden_claims, "forbidden_claims");
  const shareBody = requireString4(body.body, "body");
  const index = await loadFlowIndex2(env, projectName7, repoStore);
  const flowId = resolveFlowId2(index, flowRef);
  if (!flowId)
    return errorResponse("FLOW_NOT_FOUND", `No flow found for ref: ${flowRef}`, 404);
  const shareId = stableShareId(flowId, idempotencyKey);
  const recordPath6 = shareRecordPath(flowId, shareId);
  const existingRecord = await fetchJsonIfExists(env, projectName7, recordPath6, repoStore);
  const manifest = await loadFlowManifest2(env, projectName7, flowId, repoStore);
  const preconditionError = sharePreconditionError(manifest);
  if (preconditionError)
    return preconditionError;
  const sourceCoverage = requireSourceEvidenceCoverage(manifest, sourceArtifacts);
  if (sourceCoverage.error)
    return sourceCoverage.error;
  const resolvedSourceArtifacts = sourceCoverage.resolved;
  const createdAt = utcIso2();
  const artifactId = `SHARE-${shareId}`;
  const sharePacketPath = flowArtifactPath2(flowId, artifactId, "Science_share_packet");
  const messagePath = pmMessagePath(shareId);
  const contextPath = pmContextPath(shareId);
  const contextIndexPath2 = pmContextIndexPath();
  const shareOutboxPath = outboxPath(flowId, shareId);
  await repoStore.writeFile(env, project, shareOutboxPath, formatJson2(buildOutbox({
    project: projectName7,
    flowId,
    shareId,
    idempotencyKey,
    status: "pending",
    stage: "share_started",
    createdAt,
    updatedAt: utcIso2(),
    sharePacketPath,
    pmMessagePath: messagePath,
    pmContextPath: contextPath,
    shareRecordPath: recordPath6
  })), `Start science share ${shareId}`);
  const hashMaterial = JSON.stringify({
    project: projectName7,
    flow_id: flowId,
    share_id: shareId,
    idempotency_key: idempotencyKey,
    evidence_level: evidenceLevel,
    uncertainty,
    source_artifacts: sourceArtifacts,
    resolved_source_artifacts: resolvedSourceArtifacts,
    allowed_claims: allowedClaims,
    forbidden_claims: forbiddenClaims,
    body: shareBody
  });
  const shareHash = await sha256Hex(hashMaterial);
  if (existingRecord && existingRecord.schema_version === "science_share_packet.v0.1") {
    const existingPayloadHash = existingRecord.submitted_payload_hash || existingRecord.share_packet_hash;
    if (existingPayloadHash !== shareHash) {
      return errorResponse(
        "SCIENCE_SHARE_IDEMPOTENCY_CONFLICT",
        "Existing science share idempotency record exists but submitted payload hash does not match",
        409
      );
    }
    return jsonResponse({
      ok: true,
      idempotent_replay: true,
      share: existingRecord,
      required_status_labels: requiredStatusLabels4()
    }, 200);
  }
  const sharePacketDocument = buildShareMarkdown({
    project: projectName7,
    flowId,
    shareId,
    idempotencyKey,
    evidenceLevel,
    uncertainty,
    sourceArtifacts,
    resolvedSourceArtifacts,
    allowedClaims,
    forbiddenClaims,
    body: shareBody,
    createdAt,
    shareHash
  });
  const shareWrite = await repoStore.writeFile(env, project, sharePacketPath, sharePacketDocument, `Write science share packet ${shareId}`);
  const artifactSummary = {
    artifact_id: artifactId,
    artifact_type: "share_packet",
    title: "Science share packet",
    role: "HUMAN",
    created_at: createdAt,
    source_path: shareWrite.path,
    source_sha: shareWrite.sha
  };
  if (!manifest.artifacts.some((artifact) => artifact.artifact_id === artifactSummary.artifact_id)) {
    manifest.artifacts.push(artifactSummary);
  }
  manifest.updated_at = utcIso2();
  manifest.updated_by_role = "HUMAN";
  manifest.history.push({
    event_id: `EVT-${utcDate2()}-${safeFilePart2(idempotencyKey).slice(0, 12)}`,
    event_type: "science_share_packet",
    role: "HUMAN",
    created_at: utcIso2(),
    note: `Created Human-approved science share packet ${shareId}`
  });
  const manifestWrite = await repoStore.writeFile(env, project, flowManifestPath2(flowId), formatJson2(manifest), `Update flow manifest for science share ${shareId}`);
  upsertIndexEntry2(index, manifest);
  const indexWrite = await repoStore.writeFile(env, project, flowIndexPath2(), formatJson2(index), `Update flow index for science share ${shareId}`);
  const pmContext = {
    share_id: shareId,
    flow_id: flowId,
    project: projectName7,
    evidence_level: evidenceLevel,
    uncertainty,
    source_artifacts: sourceArtifacts,
    resolved_source_artifacts: resolvedSourceArtifacts,
    allowed_claims: allowedClaims,
    forbidden_claims: forbiddenClaims,
    share_packet_hash: shareHash,
    submitted_payload_hash: shareHash,
    share_packet_path: shareWrite.path,
    pm_context_path: contextPath,
    created_at: createdAt
  };
  const contextWrite = await repoStore.writeFile(env, project, contextPath, formatJson2({
    schema_version: "pm_share_context_seed.v0.1",
    ...pmContext,
    required_status_labels: requiredStatusLabels4()
  }), `Write PM share context seed ${shareId}`);
  const contextIndex = await loadPMShareContextIndex(env, projectName7, repoStore);
  upsertPMContextEntry(contextIndex, pmContext);
  const contextIndexWrite = await repoStore.writeFile(env, project, contextIndexPath2, formatJson2(contextIndex), `Update generated PM share context ${shareId}`);
  const pmMessage = buildPMMessage({
    project: projectName7,
    flowId,
    shareId,
    createdAt,
    sharePacketPath: shareWrite.path,
    pmContextPath: contextWrite.path,
    shareHash,
    body: shareBody
  });
  const messageWrite = await repoStore.writeFile(env, project, messagePath, pmMessage, `Notify PM_AI of science share ${shareId}`);
  const record = {
    schema_version: "science_share_packet.v0.1",
    official_artifact: true,
    project: projectName7,
    flow_id: flowId,
    share_id: shareId,
    idempotency_key: idempotencyKey,
    created_at: createdAt,
    created_by_role: "HUMAN",
    human_authority: "server_authenticated_human",
    evidence_level: evidenceLevel,
    uncertainty,
    source_artifacts: sourceArtifacts,
    resolved_source_artifacts: resolvedSourceArtifacts,
    allowed_claims: allowedClaims,
    forbidden_claims: forbiddenClaims,
    share_packet_hash: shareHash,
    submitted_payload_hash: shareHash,
    share_packet_path: shareWrite.path,
    share_packet_sha: shareWrite.sha,
    pm_message_path: messageWrite.path,
    pm_message_sha: messageWrite.sha,
    pm_context_path: contextWrite.path,
    pm_context_sha: contextWrite.sha,
    pm_context_index_path: contextIndexPath2,
    pm_context_index_sha: contextIndexWrite.sha,
    outbox_path: shareOutboxPath,
    required_status_labels: requiredStatusLabels4()
  };
  const recordWrite = await repoStore.writeFile(env, project, recordPath6, formatJson2(record), `Finalize science share record ${shareId}`);
  const completeOutbox = buildOutbox({
    project: projectName7,
    flowId,
    shareId,
    idempotencyKey,
    status: "complete",
    stage: "share_completed",
    createdAt,
    updatedAt: utcIso2(),
    sharePacketPath: shareWrite.path,
    pmMessagePath: messageWrite.path,
    pmContextPath: contextWrite.path,
    shareRecordPath: recordWrite.path
  });
  const outboxWrite = await repoStore.writeFile(env, project, shareOutboxPath, formatJson2(completeOutbox), `Complete science share outbox ${shareId}`);
  return jsonResponse({
    ok: true,
    idempotent_replay: false,
    project: projectName7,
    flow_id: flowId,
    flow_ref: flowRef,
    share: {
      ...record,
      outbox_sha: outboxWrite.sha,
      share_record_path: recordWrite.path,
      share_record_sha: recordWrite.sha,
      flow_manifest_path: manifestWrite.path,
      flow_manifest_sha: manifestWrite.sha,
      flow_index_path: flowIndexPath2(),
      flow_index_sha: indexWrite.sha
    },
    required_status_labels: requiredStatusLabels4()
  }, 201);
}
__name(handleScienceShare, "handleScienceShare");

// src/science.ts
var SCIENCE_COMMANDS = {
  research: {
    command: "research",
    allowed_roles: ["EXPLORER_AI"],
    default_artifact_type: "research_dossier",
    allowed_artifact_types: ["research_dossier", "source_map", "contradiction_map", "open_questions"],
    requires_flow_ref: false,
    may_create_science_flow: true
  },
  hypothesize: {
    command: "hypothesize",
    allowed_roles: ["HYPOTHESIZER_AI"],
    default_artifact_type: "hypothesis_card",
    allowed_artifact_types: ["hypothesis_card", "null_hypothesis", "prediction_record"],
    requires_flow_ref: true,
    may_create_science_flow: false
  },
  "design-experiment": {
    command: "design-experiment",
    allowed_roles: ["DESIGNER_AI"],
    default_artifact_type: "experiment_protocol",
    allowed_artifact_types: ["experiment_protocol", "metric_plan", "control_plan", "execution_packet", "sealed_boundary_plan"],
    requires_flow_ref: true,
    may_create_science_flow: false
  },
  "execute-experiment": {
    command: "execute-experiment",
    allowed_roles: ["SCIENCE_EXECUTOR_AI"],
    default_artifact_type: "execution_report",
    allowed_artifact_types: ["execution_report", "evidence_manifest", "command_log", "raw_result_index", "deviation_report"],
    requires_flow_ref: true,
    may_create_science_flow: false
  },
  "audit-experiment": {
    command: "audit-experiment",
    allowed_roles: ["SCIENCE_AUDITOR_AI"],
    default_artifact_type: "audit_report",
    allowed_artifact_types: ["science_checklist", "protocol_audit", "evidence_audit", "claim_scope_audit", "audit_report", "quarantine_recommendation"],
    requires_flow_ref: true,
    may_create_science_flow: false
  },
  interpret: {
    command: "interpret",
    allowed_roles: ["HYPOTHESIZER_AI"],
    default_artifact_type: "interpretation_draft",
    allowed_artifact_types: ["interpretation_draft", "alternative_explanation_review"],
    requires_flow_ref: true,
    may_create_science_flow: false
  },
  iterate: {
    command: "iterate",
    allowed_roles: ["HYPOTHESIZER_AI", "DESIGNER_AI"],
    default_artifact_type: "iteration_proposal",
    allowed_artifact_types: ["iteration_proposal", "revised_hypothesis_card", "revised_experiment_protocol"],
    requires_flow_ref: true,
    may_create_science_flow: false
  },
  "record-finding": {
    command: "record-finding",
    allowed_roles: ["SCIENCE_AUDITOR_AI"],
    default_artifact_type: "finding_record",
    allowed_artifact_types: ["finding_record", "negative_finding_record", "inconclusive_finding_record", "finding_boundary_record"],
    requires_flow_ref: true,
    may_create_science_flow: false
  },
  share: {
    command: "share",
    allowed_roles: ["HUMAN"],
    allowed_artifact_types: ["share_packet"],
    requires_flow_ref: true,
    may_create_science_flow: false
  }
};
function getParam5(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam5, "getParam");
function optionalString4(value) {
  return typeof value === "string" ? value.trim() : "";
}
__name(optionalString4, "optionalString");
function requireString5(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid or missing field: ${field}`);
  }
  return value.trim();
}
__name(requireString5, "requireString");
function readJsonBody3(request) {
  return request.json().catch(() => null).then((body) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Missing or invalid JSON body");
    }
    return body;
  });
}
__name(readJsonBody3, "readJsonBody");
function projectNameFrom3(url, body) {
  const fromBody = body ? optionalString4(body.project) : "";
  const fromQuery = getParam5(url, "project") || "";
  return fromBody || fromQuery || "ArqonZero";
}
__name(projectNameFrom3, "projectNameFrom");
function authorizationHeader(request) {
  return request.headers.get("authorization") || "";
}
__name(authorizationHeader, "authorizationHeader");
function jsonHeaders(request) {
  const headers = new Headers();
  const auth = authorizationHeader(request);
  if (auth)
    headers.set("authorization", auth);
  headers.set("content-type", "application/json");
  return headers;
}
__name(jsonHeaders, "jsonHeaders");
function scienceRouteRoleError(command, role) {
  return errorResponse(
    "SCIENCE_ROUTE_ROLE_FORBIDDEN",
    `Role ${role} cannot run /v1/science/${command}`,
    403
  );
}
__name(scienceRouteRoleError, "scienceRouteRoleError");
function validateScienceCommandRole(command, role) {
  const policy = SCIENCE_COMMANDS[command];
  if (!policy.allowed_roles.includes(role)) {
    return `Role ${role} cannot run /v1/science/${command}`;
  }
  return null;
}
__name(validateScienceCommandRole, "validateScienceCommandRole");
function resolveArtifactType(policy, role, body) {
  const requested = optionalString4(body.artifact_type);
  const artifactType = requested || policy.default_artifact_type || "";
  if (!artifactType || !policy.allowed_artifact_types.includes(artifactType)) {
    throw new Error(`Invalid artifact_type for /v1/science/${policy.command}: ${artifactType || "(missing)"}`);
  }
  if (policy.command === "iterate") {
    if (role === "DESIGNER_AI" && artifactType !== "revised_experiment_protocol") {
      throw new Error("DESIGNER_AI may only write revised_experiment_protocol through /v1/science/iterate");
    }
    if (role === "HYPOTHESIZER_AI" && !["iteration_proposal", "revised_hypothesis_card"].includes(artifactType)) {
      throw new Error("HYPOTHESIZER_AI may only write iteration_proposal or revised_hypothesis_card through /v1/science/iterate");
    }
  }
  return artifactType;
}
__name(resolveArtifactType, "resolveArtifactType");
async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text)
    return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
__name(parseJsonResponse, "parseJsonResponse");
async function createScienceFlow(request, env, body, projectName7, repoStore) {
  const url = new URL(request.url);
  const name = requireString5(body.name, "name");
  const title = requireString5(body.title, "title");
  const summary = optionalString4(body.summary);
  const createRequest = new Request(`${url.origin}/v1/flows`, {
    method: "POST",
    headers: jsonHeaders(request),
    body: JSON.stringify({
      project: projectName7,
      name,
      type: "science_flow",
      title,
      summary,
      initial_gate: "DRAFT"
    })
  });
  const createResponse = await handleFlowsRequest(createRequest, env, void 0, "collection", repoStore);
  const parsed = await parseJsonResponse(createResponse);
  if (!createResponse.ok) {
    return jsonResponse(parsed, createResponse.status);
  }
  if (!parsed || typeof parsed !== "object" || typeof parsed.flow_id !== "string") {
    return errorResponse("SCIENCE_FLOW_CREATE_FAILED", "Flow creation response did not include flow_id", 500);
  }
  return { flow_id: parsed.flow_id, response_body: parsed };
}
__name(createScienceFlow, "createScienceFlow");
async function writeScienceArtifact(request, env, flowRef, projectName7, artifactType, artifactTitle, artifactBody, repoStore) {
  const url = new URL(request.url);
  const artifactRequest = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowRef)}/artifacts`, {
    method: "POST",
    headers: jsonHeaders(request),
    body: JSON.stringify({
      project: projectName7,
      artifact_type: artifactType,
      title: artifactTitle,
      body: artifactBody
    })
  });
  return await handleFlowsRequest(artifactRequest, env, flowRef, "artifacts", repoStore);
}
__name(writeScienceArtifact, "writeScienceArtifact");
async function handleScienceRequest(request, env, command, repoStore = githubRepoStore) {
  try {
    if (!Object.prototype.hasOwnProperty.call(SCIENCE_COMMANDS, command)) {
      return errorResponse("SCIENCE_COMMAND_NOT_FOUND", `Unknown science command: ${command}`, 404);
    }
    const scienceCommand = command;
    const role = requireRole(request, env);
    if (scienceCommand === "share") {
      return await handleScienceShare(request, env, role, repoStore);
    }
    const policy = SCIENCE_COMMANDS[scienceCommand];
    if (request.method !== "POST") {
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    }
    const roleError = validateScienceCommandRole(scienceCommand, role);
    if (roleError)
      return scienceRouteRoleError(scienceCommand, role);
    const url = new URL(request.url);
    const body = await readJsonBody3(request);
    const projectName7 = projectNameFrom3(url, body);
    const artifactType = resolveArtifactType(policy, role, body);
    const artifactTitle = optionalString4(body.artifact_title) || optionalString4(body.title) || `${scienceCommand}: ${artifactType}`;
    const artifactBody = requireString5(body.body, "body");
    let flowRef = optionalString4(body.flow_ref) || getParam5(url, "flow_ref") || "";
    let createdFlow = null;
    if (!flowRef && policy.may_create_science_flow) {
      const created = await createScienceFlow(request, env, body, projectName7, repoStore);
      if (created instanceof Response)
        return created;
      flowRef = created.flow_id;
      createdFlow = created.response_body;
    }
    if (!flowRef) {
      return errorResponse("SCIENCE_FLOW_REF_REQUIRED", `/v1/science/${scienceCommand} requires flow_ref`, 400);
    }
    const artifactResponse = await writeScienceArtifact(
      request,
      env,
      flowRef,
      projectName7,
      artifactType,
      artifactTitle,
      artifactBody,
      repoStore
    );
    const artifactBodyParsed = await parseJsonResponse(artifactResponse);
    if (!artifactResponse.ok) {
      return jsonResponse(artifactBodyParsed, artifactResponse.status);
    }
    const responseBody = artifactBodyParsed && typeof artifactBodyParsed === "object" ? {
      ...artifactBodyParsed,
      science_command: scienceCommand,
      science_route: `/v1/science/${scienceCommand}`,
      created_flow: createdFlow
    } : {
      ok: true,
      science_command: scienceCommand,
      science_route: `/v1/science/${scienceCommand}`,
      flow_id: flowRef,
      artifact_type: artifactType,
      artifact_response: artifactBodyParsed,
      created_flow: createdFlow
    };
    return jsonResponse(responseBody, artifactResponse.status);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be")) {
      return errorResponse("BAD_REQUEST", message, 400);
    }
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleScienceRequest, "handleScienceRequest");

// src/pm_handoff.ts
var FINDING_ARTIFACTS2 = /* @__PURE__ */ new Set(["finding_record", "negative_finding_record", "inconclusive_finding_record", "finding_boundary_record"]);
function requiredStatusLabels5() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels5, "requiredStatusLabels");
function optionalString5(value) {
  return typeof value === "string" ? value.trim() : "";
}
__name(optionalString5, "optionalString");
function requireString6(value, field) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Invalid or missing field: ${field}`);
  return value.trim();
}
__name(requireString6, "requireString");
function getParam6(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam6, "getParam");
function projectNameFrom4(url, body) {
  const fromBody = body ? optionalString5(body.project) : "";
  const fromQuery = getParam6(url, "project") || "";
  return fromBody || fromQuery || "ArqonZero";
}
__name(projectNameFrom4, "projectNameFrom");
function utcIso3() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(utcIso3, "utcIso");
function safeFilePart3(value, max = 96) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safeFilePart3, "safeFilePart");
function formatJson3(value) {
  return `${JSON.stringify(value, null, 2)}
`;
}
__name(formatJson3, "formatJson");
function authorizationHeader2(request) {
  return request.headers.get("authorization") || "";
}
__name(authorizationHeader2, "authorizationHeader");
function jsonHeaders2(request) {
  const headers = new Headers();
  const auth = authorizationHeader2(request);
  if (auth)
    headers.set("authorization", auth);
  headers.set("content-type", "application/json");
  return headers;
}
__name(jsonHeaders2, "jsonHeaders");
function pmShareContextIndexPath() {
  return "governance/context/generated_pm_share_context.json";
}
__name(pmShareContextIndexPath, "pmShareContextIndexPath");
function pmHandoffContextIndexPath() {
  return "governance/context/generated_pm_handoff_context.json";
}
__name(pmHandoffContextIndexPath, "pmHandoffContextIndexPath");
function handoffRecordPath(handoffId2) {
  return `governance/context/pm_handoff/${handoffId2}.json`;
}
__name(handoffRecordPath, "handoffRecordPath");
function scienceShareRecordPath(flowId, shareId) {
  return `governance/flows/${flowId}/share/${shareId}/share_record.json`;
}
__name(scienceShareRecordPath, "scienceShareRecordPath");
async function readJsonBody4(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Missing or invalid JSON body");
  return body;
}
__name(readJsonBody4, "readJsonBody");
async function fetchJsonIfExists2(env, projectName7, path, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, path);
    return JSON.parse(file.content);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404"))
      return null;
    throw err;
  }
}
__name(fetchJsonIfExists2, "fetchJsonIfExists");
async function writeJson(env, projectName7, path, value, message, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  return await store.writeFile(env, project, path, formatJson3(value), message);
}
__name(writeJson, "writeJson");
async function parseJsonResponse2(response) {
  const text = await response.text();
  if (!text)
    return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
__name(parseJsonResponse2, "parseJsonResponse");
async function sha256Hex2(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex2, "sha256Hex");
async function loadPMShareContextEntry(env, projectName7, body, store) {
  const shareId = optionalString5(body.share_id);
  const sharePacketPath = optionalString5(body.share_packet_path);
  if (!shareId && !sharePacketPath) {
    throw new Error("Invalid or missing field: share_id or share_packet_path");
  }
  const index = await fetchJsonIfExists2(env, projectName7, pmShareContextIndexPath(), store);
  if (!index || index.schema_version !== "pm_share_context_index.v0.1" || !Array.isArray(index.entries)) {
    throw new Error("PM share context index is missing or invalid");
  }
  const entry = index.entries.find(
    (item) => shareId && item.share_id === shareId || sharePacketPath && item.share_packet_path === sharePacketPath
  );
  if (!entry)
    throw new Error(`No PM share context entry found for ${shareId || sharePacketPath}`);
  return entry;
}
__name(loadPMShareContextEntry, "loadPMShareContextEntry");
function hasRequiredLabels(labels3) {
  return requiredStatusLabels5().every((label) => Array.isArray(labels3) && labels3.includes(label));
}
__name(hasRequiredLabels, "hasRequiredLabels");
function validateShareRecord(record, entry) {
  if (record.schema_version !== "science_share_packet.v0.1") {
    return errorResponse("PM_HANDOFF_INVALID_SHARE_RECORD", "Share record schema is invalid", 409);
  }
  if (record.official_artifact !== true || record.created_by_role !== "HUMAN" || record.human_authority !== "server_authenticated_human") {
    return errorResponse("PM_HANDOFF_INVALID_SHARE_AUTHORITY", "Share record is not a Human-approved official share packet", 409);
  }
  if (record.share_id !== entry.share_id || record.flow_id !== entry.flow_id || record.project !== entry.project) {
    return errorResponse("PM_HANDOFF_SHARE_CONTEXT_MISMATCH", "Share record does not match PM share context entry", 409);
  }
  if (record.share_packet_hash !== entry.share_packet_hash) {
    return errorResponse("PM_HANDOFF_SHARE_HASH_MISMATCH", "Share packet hash does not match PM share context entry", 409);
  }
  if (!hasRequiredLabels(record.required_status_labels)) {
    return errorResponse("PM_HANDOFF_STATUS_LABELS_REQUIRED", "Share record is missing required diagnostic status labels", 409);
  }
  if (!record.forbidden_claims || record.forbidden_claims.length === 0) {
    return errorResponse("PM_HANDOFF_FORBIDDEN_CLAIMS_REQUIRED", "Share record must preserve forbidden claims before PM handoff", 409);
  }
  if (!record.resolved_source_artifacts || record.resolved_source_artifacts.length === 0) {
    return errorResponse("PM_HANDOFF_RESOLVED_SOURCES_REQUIRED", "Share record must preserve resolved source artifact metadata", 409);
  }
  const types = new Set(record.resolved_source_artifacts.map((item) => item.artifact_type));
  const missing = [];
  if (!types.has("audit_report"))
    missing.push("audit_report");
  if (!types.has("share_recommendation"))
    missing.push("share_recommendation");
  if (![...FINDING_ARTIFACTS2].some((type) => types.has(type)))
    missing.push("finding_record");
  if (missing.length > 0) {
    return errorResponse("PM_HANDOFF_SOURCE_BOUNDARY_REQUIRED", `Share record is missing source evidence classes: ${missing.join(", ")}`, 409);
  }
  return null;
}
__name(validateShareRecord, "validateShareRecord");
function buildHandoffId(shareId, idempotencyKey) {
  return `${safeFilePart3(shareId, 80)}-${safeFilePart3(idempotencyKey, 40)}`;
}
__name(buildHandoffId, "buildHandoffId");
async function createCodeFlow(request, env, projectName7, shareRecord, handoffId2, body, store) {
  const explicitRef = optionalString5(body.code_flow_ref);
  if (explicitRef) {
    const url2 = new URL(request.url);
    const loadRequest = new Request(`${url2.origin}/v1/flows/${encodeURIComponent(explicitRef)}?project=${encodeURIComponent(projectName7)}`, {
      method: "GET",
      headers: jsonHeaders2(request)
    });
    const response = await handleFlowsRequest(loadRequest, env, explicitRef, "item", store);
    const parsed = await parseJsonResponse2(response);
    if (!response.ok)
      return jsonResponse(parsed, response.status);
    const manifest = parsed.manifest;
    if (!manifest || manifest.type !== "code_flow") {
      return errorResponse("PM_HANDOFF_CODE_FLOW_REQUIRED", "code_flow_ref must refer to a code_flow", 409);
    }
    return { flow_id: manifest.flow_id, name: manifest.name, created: false };
  }
  const flowName = optionalString5(body.code_flow_name) || `code-handoff-${(await sha256Hex2(handoffId2)).slice(0, 16)}`;
  const flowTitle = optionalString5(body.code_flow_title) || `Code flow from science share ${shareRecord.share_id}`;
  const createBody = {
    project: projectName7,
    name: flowName,
    type: "code_flow",
    title: flowTitle,
    summary: `PM code handoff from Human-approved science share ${shareRecord.share_id}.`,
    initial_gate: "DRAFT"
  };
  const url = new URL(request.url);
  const createRequest = new Request(`${url.origin}/v1/flows`, {
    method: "POST",
    headers: jsonHeaders2(request),
    body: JSON.stringify(createBody)
  });
  const createResponse = await handleFlowsRequest(createRequest, env, void 0, "collection", store);
  const createParsed = await parseJsonResponse2(createResponse);
  if (createResponse.status === 201) {
    const created = createParsed;
    return { flow_id: created.flow_id, name: created.name, created: true };
  }
  if (createResponse.status === 409) {
    const loadRequest = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowName)}?project=${encodeURIComponent(projectName7)}`, {
      method: "GET",
      headers: jsonHeaders2(request)
    });
    const response = await handleFlowsRequest(loadRequest, env, flowName, "item", store);
    const parsed = await parseJsonResponse2(response);
    if (response.ok) {
      const manifest = parsed.manifest;
      if (manifest && manifest.type === "code_flow")
        return { flow_id: manifest.flow_id, name: manifest.name, created: false };
    }
  }
  return jsonResponse(createParsed, createResponse.status);
}
__name(createCodeFlow, "createCodeFlow");
function buildHandoffIntakeMarkdown(record, handoffId2, pmNotes) {
  return `# Science to Code Handoff Intake

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Handoff Boundary

This artifact imports a Human-approved Science Monkeys share into PM context. It does not certify, promote, or convert scientific evidence into product requirements automatically.

## Source Share

- handoff_id: ${handoffId2}
- share_id: ${record.share_id}
- science_flow_id: ${record.flow_id}
- evidence_level: ${record.evidence_level}
- uncertainty: ${record.uncertainty}
- share_packet_path: ${record.share_packet_path}
- share_packet_hash: ${record.share_packet_hash}
- submitted_payload_hash: ${record.submitted_payload_hash || record.share_packet_hash}

## Resolved Source Artifacts

${record.resolved_source_artifacts.map((item) => `- ${item.artifact_type}: ${item.artifact_id} (${item.source_path})`).join("\n")}

## Allowed Claims

${record.allowed_claims.map((claim) => `- ${claim}`).join("\n")}

## Forbidden Claims

${record.forbidden_claims.map((claim) => `- ${claim}`).join("\n")}

## PM Notes

${pmNotes || "No additional PM notes supplied."}

## Non-Laundering Rule

PM_AI may convert this share into candidate dossier/spec context only. Any product claim, implementation requirement, or promotion decision must preserve uncertainty, source links, forbidden claims, and required labels.
`;
}
__name(buildHandoffIntakeMarkdown, "buildHandoffIntakeMarkdown");
function buildDossierSeedMarkdown(record, handoffId2) {
  return `# PM Dossier Seed from Science Share

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Purpose

Seed a PM dossier from a Human-approved Science Monkeys share without laundering evidence.

## Candidate Context

- handoff_id: ${handoffId2}
- source_share_id: ${record.share_id}
- source_science_flow_id: ${record.flow_id}
- evidence_level: ${record.evidence_level}
- uncertainty: ${record.uncertainty}

## Candidate Allowed Claims

${record.allowed_claims.map((claim) => `- ${claim}`).join("\n")}

## Hard Forbidden Claims

${record.forbidden_claims.map((claim) => `- ${claim}`).join("\n")}

## Required Preservation

Any downstream PM specification, plan, tasks, or Code Monkey handoff must preserve:

- source share id
- source artifact references
- share_packet_hash
- submitted_payload_hash
- uncertainty
- forbidden claims
- required diagnostic status labels

## Explicit Boundary

This dossier seed is not a specification, not a task packet, not a promotion decision, and not certification.
`;
}
__name(buildDossierSeedMarkdown, "buildDossierSeedMarkdown");
async function writeCodeFlowArtifact(request, env, flowId, projectName7, artifactType, title, body, store) {
  const url = new URL(request.url);
  const artifactRequest = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, {
    method: "POST",
    headers: jsonHeaders2(request),
    body: JSON.stringify({
      project: projectName7,
      artifact_type: artifactType,
      title,
      body
    })
  });
  const response = await handleFlowsRequest(artifactRequest, env, flowId, "artifacts", store);
  const parsed = await parseJsonResponse2(response);
  if (!response.ok)
    return jsonResponse(parsed, response.status);
  const artifact = parsed.artifact;
  if (!artifact)
    return errorResponse("PM_HANDOFF_ARTIFACT_WRITE_FAILED", `Artifact write did not return summary for ${artifactType}`, 500);
  return artifact;
}
__name(writeCodeFlowArtifact, "writeCodeFlowArtifact");
async function loadHandoffIndex(env, projectName7, store) {
  const existing = await fetchJsonIfExists2(env, projectName7, pmHandoffContextIndexPath(), store);
  if (existing && existing.schema_version === "pm_handoff_context_index.v0.1" && Array.isArray(existing.entries))
    return existing;
  return {
    schema_version: "pm_handoff_context_index.v0.1",
    project: projectName7,
    updated_at: utcIso3(),
    entries: []
  };
}
__name(loadHandoffIndex, "loadHandoffIndex");
function upsertHandoffIndex(index, record) {
  const entry = {
    handoff_id: record.handoff_id,
    share_id: record.source_share.share_id,
    science_flow_id: record.source_share.science_flow_id,
    code_flow_id: record.code_flow.flow_id,
    share_packet_hash: record.source_share.share_packet_hash,
    evidence_level: record.source_share.evidence_level,
    uncertainty: record.source_share.uncertainty,
    handoff_record_path: record.handoff_record_path,
    created_at: record.created_at
  };
  const found = index.entries.findIndex((item) => item.handoff_id === record.handoff_id);
  if (found >= 0)
    index.entries[found] = entry;
  else
    index.entries.push(entry);
  index.updated_at = utcIso3();
  index.entries.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}
__name(upsertHandoffIndex, "upsertHandoffIndex");
async function handlePmHandoffRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "PM_AI") {
      return errorResponse("PM_HANDOFF_ROLE_FORBIDDEN", "Only PM_AI may create Science to Code handoff intake", 403);
    }
    if (request.method !== "POST") {
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    }
    const url = new URL(request.url);
    const body = await readJsonBody4(request);
    const projectName7 = projectNameFrom4(url, body);
    const project = getProject(projectName7);
    if (!project)
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
    const idempotencyKey = requireString6(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(idempotencyKey)) {
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    }
    const entry = await loadPMShareContextEntry(env, projectName7, body, repoStore);
    const shareRecord = await fetchJsonIfExists2(env, projectName7, scienceShareRecordPath(entry.flow_id, entry.share_id), repoStore);
    if (!shareRecord)
      return errorResponse("PM_HANDOFF_SHARE_RECORD_NOT_FOUND", `No share record found for ${entry.share_id}`, 404);
    const shareError = validateShareRecord(shareRecord, entry);
    if (shareError)
      return shareError;
    const pmNotes = optionalString5(body.pm_notes);
    const handoffId2 = buildHandoffId(shareRecord.share_id, idempotencyKey);
    const payloadHash = await sha256Hex2(JSON.stringify({
      project: projectName7,
      idempotency_key: idempotencyKey,
      share_id: shareRecord.share_id,
      share_packet_hash: shareRecord.share_packet_hash,
      submitted_payload_hash: shareRecord.submitted_payload_hash || shareRecord.share_packet_hash,
      code_flow_ref: optionalString5(body.code_flow_ref),
      code_flow_name: optionalString5(body.code_flow_name),
      code_flow_title: optionalString5(body.code_flow_title),
      pm_notes: pmNotes
    }));
    const recordPath6 = handoffRecordPath(handoffId2);
    const existingRecord = await fetchJsonIfExists2(env, projectName7, recordPath6, repoStore);
    if (existingRecord && existingRecord.schema_version === "science_to_code_handoff.v0.1") {
      if (existingRecord.submitted_payload_hash !== payloadHash) {
        return errorResponse("PM_HANDOFF_IDEMPOTENCY_CONFLICT", "Existing PM handoff idempotency record exists but submitted payload hash does not match", 409);
      }
      return jsonResponse({
        ok: true,
        idempotent_replay: true,
        handoff: existingRecord,
        required_status_labels: requiredStatusLabels5()
      }, 200);
    }
    const codeFlow = await createCodeFlow(request, env, projectName7, shareRecord, handoffId2, body, repoStore);
    if (codeFlow instanceof Response)
      return codeFlow;
    const intake = await writeCodeFlowArtifact(
      request,
      env,
      codeFlow.flow_id,
      projectName7,
      "handoff_intake",
      "Science to Code Handoff Intake",
      buildHandoffIntakeMarkdown(shareRecord, handoffId2, pmNotes),
      repoStore
    );
    if (intake instanceof Response)
      return intake;
    const dossierSeed = await writeCodeFlowArtifact(
      request,
      env,
      codeFlow.flow_id,
      projectName7,
      "dossier_seed",
      "PM Dossier Seed from Science Share",
      buildDossierSeedMarkdown(shareRecord, handoffId2),
      repoStore
    );
    if (dossierSeed instanceof Response)
      return dossierSeed;
    const createdAt = utcIso3();
    const record = {
      schema_version: "science_to_code_handoff.v0.1",
      official_artifact: true,
      project: projectName7,
      handoff_id: handoffId2,
      idempotency_key: idempotencyKey,
      created_at: createdAt,
      created_by_role: "PM_AI",
      source_share: {
        share_id: shareRecord.share_id,
        science_flow_id: shareRecord.flow_id,
        share_packet_path: shareRecord.share_packet_path,
        share_packet_hash: shareRecord.share_packet_hash,
        submitted_payload_hash: shareRecord.submitted_payload_hash || shareRecord.share_packet_hash,
        evidence_level: shareRecord.evidence_level,
        uncertainty: shareRecord.uncertainty,
        source_artifacts: shareRecord.source_artifacts,
        resolved_source_artifacts: shareRecord.resolved_source_artifacts,
        allowed_claims: shareRecord.allowed_claims,
        forbidden_claims: shareRecord.forbidden_claims
      },
      code_flow: {
        flow_id: codeFlow.flow_id,
        name: codeFlow.name,
        created_by_handoff: codeFlow.created
      },
      output_artifacts: {
        handoff_intake: intake,
        dossier_seed: dossierSeed
      },
      submitted_payload_hash: payloadHash,
      handoff_record_path: recordPath6,
      generated_handoff_context_path: pmHandoffContextIndexPath(),
      required_status_labels: requiredStatusLabels5()
    };
    const index = await loadHandoffIndex(env, projectName7, repoStore);
    upsertHandoffIndex(index, record);
    const indexWrite = await writeJson(env, projectName7, pmHandoffContextIndexPath(), index, `Update PM handoff context ${handoffId2}`, repoStore);
    record.generated_handoff_context_sha = indexWrite.sha;
    const recordWrite = await writeJson(env, projectName7, recordPath6, record, `Write PM handoff record ${handoffId2}`, repoStore);
    return jsonResponse({
      ok: true,
      idempotent_replay: false,
      project: projectName7,
      handoff: {
        ...record,
        handoff_record_sha: recordWrite.sha
      },
      required_status_labels: requiredStatusLabels5()
    }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be")) {
      return errorResponse("BAD_REQUEST", message, 400);
    }
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("No PM share context entry"))
      return errorResponse("PM_HANDOFF_SHARE_CONTEXT_NOT_FOUND", message, 404);
    if (message.includes("PM share context index is missing"))
      return errorResponse("PM_HANDOFF_SHARE_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handlePmHandoffRequest, "handlePmHandoffRequest");

// src/pm_intake.ts
function requiredStatusLabels6() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels6, "requiredStatusLabels");
function optionalString6(value) {
  return typeof value === "string" ? value.trim() : "";
}
__name(optionalString6, "optionalString");
function requireString7(value, field) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Invalid or missing field: ${field}`);
  return value.trim();
}
__name(requireString7, "requireString");
function getParam7(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam7, "getParam");
function projectNameFrom5(url, body) {
  const fromBody = body ? optionalString6(body.project) : "";
  const fromQuery = getParam7(url, "project") || "";
  return fromBody || fromQuery || "ArqonZero";
}
__name(projectNameFrom5, "projectNameFrom");
function utcIso4() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(utcIso4, "utcIso");
function safeFilePart4(value, max = 96) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safeFilePart4, "safeFilePart");
function formatJson4(value) {
  return `${JSON.stringify(value, null, 2)}
`;
}
__name(formatJson4, "formatJson");
function authorizationHeader3(request) {
  return request.headers.get("authorization") || "";
}
__name(authorizationHeader3, "authorizationHeader");
function jsonHeaders3(request) {
  const headers = new Headers();
  const auth = authorizationHeader3(request);
  if (auth)
    headers.set("authorization", auth);
  headers.set("content-type", "application/json");
  return headers;
}
__name(jsonHeaders3, "jsonHeaders");
function pmHandoffContextIndexPath2() {
  return "governance/context/generated_pm_handoff_context.json";
}
__name(pmHandoffContextIndexPath2, "pmHandoffContextIndexPath");
function pmIntakeContextIndexPath() {
  return "governance/context/generated_pm_intake_context.json";
}
__name(pmIntakeContextIndexPath, "pmIntakeContextIndexPath");
function pmIntakeRecordPath(intakeId) {
  return `governance/context/pm_intake/${intakeId}.json`;
}
__name(pmIntakeRecordPath, "pmIntakeRecordPath");
function flowManifestPath3(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(flowManifestPath3, "flowManifestPath");
async function readJsonBody5(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Missing or invalid JSON body");
  return body;
}
__name(readJsonBody5, "readJsonBody");
async function fetchJsonIfExists3(env, projectName7, path, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, path);
    return JSON.parse(file.content);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404"))
      return null;
    throw err;
  }
}
__name(fetchJsonIfExists3, "fetchJsonIfExists");
async function writeJson2(env, projectName7, path, value, message, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  return await store.writeFile(env, project, path, formatJson4(value), message);
}
__name(writeJson2, "writeJson");
async function parseJsonResponse3(response) {
  const text = await response.text();
  if (!text)
    return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
__name(parseJsonResponse3, "parseJsonResponse");
async function sha256Hex3(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex3, "sha256Hex");
function hasRequiredLabels2(labels3) {
  return requiredStatusLabels6().every((label) => Array.isArray(labels3) && labels3.includes(label));
}
__name(hasRequiredLabels2, "hasRequiredLabels");
async function loadPMHandoffContextEntry(env, projectName7, body, store) {
  const handoffId2 = optionalString6(body.handoff_id);
  const handoffRecordPath2 = optionalString6(body.handoff_record_path);
  if (!handoffId2 && !handoffRecordPath2)
    throw new Error("Invalid or missing field: handoff_id or handoff_record_path");
  const index = await fetchJsonIfExists3(env, projectName7, pmHandoffContextIndexPath2(), store);
  if (!index || index.schema_version !== "pm_handoff_context_index.v0.1" || !Array.isArray(index.entries)) {
    throw new Error("PM handoff context index is missing or invalid");
  }
  const entry = index.entries.find(
    (item) => handoffId2 && item.handoff_id === handoffId2 || handoffRecordPath2 && item.handoff_record_path === handoffRecordPath2
  );
  if (!entry)
    throw new Error(`No PM handoff context entry found for ${handoffId2 || handoffRecordPath2}`);
  return { handoff_id: entry.handoff_id, handoff_record_path: entry.handoff_record_path };
}
__name(loadPMHandoffContextEntry, "loadPMHandoffContextEntry");
function validateHandoffRecord(record) {
  if (record.schema_version !== "science_to_code_handoff.v0.1")
    return errorResponse("PM_INTAKE_INVALID_HANDOFF_RECORD", "Handoff record schema is invalid", 409);
  if (record.official_artifact !== true || record.created_by_role !== "PM_AI")
    return errorResponse("PM_INTAKE_INVALID_HANDOFF_AUTHORITY", "Handoff record is not an official PM handoff", 409);
  if (!record.source_share || !record.code_flow || !record.output_artifacts)
    return errorResponse("PM_INTAKE_HANDOFF_INCOMPLETE", "Handoff record is missing source share, code flow, or output artifacts", 409);
  if (!record.source_share.share_packet_hash || !record.source_share.uncertainty)
    return errorResponse("PM_INTAKE_HANDOFF_SOURCE_BOUNDARY_REQUIRED", "Handoff record must preserve share hash and uncertainty", 409);
  if (!record.source_share.forbidden_claims || record.source_share.forbidden_claims.length === 0)
    return errorResponse("PM_INTAKE_FORBIDDEN_CLAIMS_REQUIRED", "Handoff record must preserve forbidden claims", 409);
  if (!record.source_share.resolved_source_artifacts || record.source_share.resolved_source_artifacts.length === 0)
    return errorResponse("PM_INTAKE_RESOLVED_SOURCES_REQUIRED", "Handoff record must preserve resolved source metadata", 409);
  if (!record.output_artifacts.handoff_intake || !record.output_artifacts.dossier_seed)
    return errorResponse("PM_INTAKE_HANDOFF_ARTIFACTS_REQUIRED", "Handoff record must include handoff_intake and dossier_seed", 409);
  if (!hasRequiredLabels2(record.required_status_labels))
    return errorResponse("PM_INTAKE_STATUS_LABELS_REQUIRED", "Handoff record is missing required diagnostic status labels", 409);
  return null;
}
__name(validateHandoffRecord, "validateHandoffRecord");
function artifactById(manifest, artifactId) {
  return manifest.artifacts.find((artifact) => artifact.artifact_id === artifactId) || null;
}
__name(artifactById, "artifactById");
function validateExpectedHandoffArtifact(manifest, expected, expectedType) {
  const actual = artifactById(manifest, expected.artifact_id);
  if (!actual) {
    return errorResponse(
      "PM_INTAKE_HANDOFF_ARTIFACTS_NOT_ON_CODE_FLOW",
      `Code flow does not contain required handoff artifact ${expected.artifact_id}`,
      409
    );
  }
  if (actual.artifact_type !== expectedType || actual.role !== "PM_AI") {
    return errorResponse(
      "PM_INTAKE_HANDOFF_ARTIFACT_TYPE_MISMATCH",
      `Expected ${expectedType} by PM_AI for ${expected.artifact_id}`,
      409
    );
  }
  if (actual.source_path !== expected.source_path) {
    return errorResponse(
      "PM_INTAKE_HANDOFF_ARTIFACT_SOURCE_MISMATCH",
      `Handoff artifact source path mismatch for ${expected.artifact_id}`,
      409
    );
  }
  return null;
}
__name(validateExpectedHandoffArtifact, "validateExpectedHandoffArtifact");
function validateCodeFlowManifest(manifest, record) {
  if (!manifest || manifest.schema_version !== "flow_manifest.v0.3")
    return errorResponse("PM_INTAKE_CODE_FLOW_NOT_FOUND", "Code flow manifest not found", 404);
  if (manifest.type !== "code_flow" || manifest.flow_id !== record.code_flow.flow_id)
    return errorResponse("PM_INTAKE_CODE_FLOW_REQUIRED", "PM intake target must be a code_flow", 409);
  const intakeError = validateExpectedHandoffArtifact(manifest, record.output_artifacts.handoff_intake, "handoff_intake");
  if (intakeError)
    return intakeError;
  const seedError = validateExpectedHandoffArtifact(manifest, record.output_artifacts.dossier_seed, "dossier_seed");
  if (seedError)
    return seedError;
  return null;
}
__name(validateCodeFlowManifest, "validateCodeFlowManifest");
function buildIntakeId(handoffId2, idempotencyKey) {
  return `${safeFilePart4(handoffId2, 90)}-${safeFilePart4(idempotencyKey, 36)}`;
}
__name(buildIntakeId, "buildIntakeId");
function buildPMDossierMarkdown(record, intakeId, pmNotes) {
  return `# Code Monkeys PM Dossier

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Intake Boundary

This dossier is a PM intake artifact produced from a previously audited Science to Code handoff. It is not a specification, not a plan, not a task packet, not certification, and not a production-readiness claim.

## Source Chain

- intake_id: ${intakeId}
- handoff_id: ${record.handoff_id}
- code_flow_id: ${record.code_flow.flow_id}
- source_share_id: ${record.source_share.share_id}
- source_science_flow_id: ${record.source_share.science_flow_id}
- share_packet_hash: ${record.source_share.share_packet_hash}
- submitted_share_payload_hash: ${record.source_share.submitted_payload_hash || record.source_share.share_packet_hash}
- handoff_payload_hash: ${record.submitted_payload_hash}
- evidence_level: ${record.source_share.evidence_level}
- uncertainty: ${record.source_share.uncertainty}

## Candidate Product Context

${record.source_share.allowed_claims.map((claim) => `- ${claim}`).join("\n")}

## Hard Forbidden Claims

${record.source_share.forbidden_claims.map((claim) => `- ${claim}`).join("\n")}

## Source Artifacts

${record.source_share.resolved_source_artifacts.map((item) => `- ${item.artifact_type}: ${item.artifact_id} (${item.source_path})`).join("\n")}

## PM Notes

${pmNotes || "No additional PM notes supplied."}

## Non-Laundering Rule

This dossier may inform later specification work, but it does not itself authorize implementation, tasks, promotion, certification, or production deployment.
`;
}
__name(buildPMDossierMarkdown, "buildPMDossierMarkdown");
function buildPMGateDefinitionMarkdown(record, intakeId) {
  return `# PM Intake Gate Definition

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Purpose

Define the minimum gates that must remain true before this PM intake may become a specification, plan, or Coder task packet.

## Source Chain Required

- intake_id: ${intakeId}
- handoff_id: ${record.handoff_id}
- code_flow_id: ${record.code_flow.flow_id}
- source_share_id: ${record.source_share.share_id}
- share_packet_hash: ${record.source_share.share_packet_hash}

## Required Gates

1. Preserve source share id, share hash, uncertainty, source references, and forbidden claims.
2. Keep all downstream artifacts labeled development diagnostic only.
3. Do not treat Science evidence as a certified product requirement.
4. Do not issue Coder tasks until a later PM specification/plan stage explicitly defines scope and Human approval gates.
5. Do not remove forbidden claims without Human review and audit evidence.
6. Do not claim sealed-test certification or production readiness.

## Current Advancement Status

PM intake only. Specification, plan, tasks, implementation, and promotion remain out of scope.
`;
}
__name(buildPMGateDefinitionMarkdown, "buildPMGateDefinitionMarkdown");
async function writeCodeFlowArtifact2(request, env, flowId, projectName7, artifactType, title, body, store) {
  const url = new URL(request.url);
  const artifactRequest = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, {
    method: "POST",
    headers: jsonHeaders3(request),
    body: JSON.stringify({ project: projectName7, artifact_type: artifactType, title, body })
  });
  const response = await handleFlowsRequest(artifactRequest, env, flowId, "artifacts", store);
  const parsed = await parseJsonResponse3(response);
  if (!response.ok)
    return jsonResponse(parsed, response.status);
  const artifact = parsed.artifact;
  if (!artifact)
    return errorResponse("PM_INTAKE_ARTIFACT_WRITE_FAILED", `Artifact write did not return summary for ${artifactType}`, 500);
  return artifact;
}
__name(writeCodeFlowArtifact2, "writeCodeFlowArtifact");
async function loadIntakeIndex(env, projectName7, store) {
  const existing = await fetchJsonIfExists3(env, projectName7, pmIntakeContextIndexPath(), store);
  if (existing && existing.schema_version === "pm_intake_context_index.v0.1" && Array.isArray(existing.entries))
    return existing;
  return { schema_version: "pm_intake_context_index.v0.1", project: projectName7, updated_at: utcIso4(), entries: [] };
}
__name(loadIntakeIndex, "loadIntakeIndex");
function upsertIntakeIndex(index, record) {
  const entry = {
    intake_id: record.intake_id,
    handoff_id: record.source_handoff.handoff_id,
    code_flow_id: record.source_handoff.code_flow_id,
    share_id: record.source_handoff.share_id,
    science_flow_id: record.source_handoff.science_flow_id,
    share_packet_hash: record.source_handoff.share_packet_hash,
    evidence_level: record.source_handoff.evidence_level,
    uncertainty: record.source_handoff.uncertainty,
    pm_intake_record_path: record.pm_intake_record_path,
    created_at: record.created_at
  };
  const existing = index.entries.findIndex((item) => item.intake_id === record.intake_id);
  if (existing >= 0)
    index.entries[existing] = entry;
  else
    index.entries.push(entry);
  index.updated_at = utcIso4();
  index.entries.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}
__name(upsertIntakeIndex, "upsertIntakeIndex");
async function handlePmIntakeRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "PM_AI")
      return errorResponse("PM_INTAKE_ROLE_FORBIDDEN", "Only PM_AI may create Code Monkeys PM intake", 403);
    if (request.method !== "POST")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const url = new URL(request.url);
    const body = await readJsonBody5(request);
    const projectName7 = projectNameFrom5(url, body);
    const project = getProject(projectName7);
    if (!project)
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
    const idempotencyKey = requireString7(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(idempotencyKey)) {
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    }
    const handoffEntry = await loadPMHandoffContextEntry(env, projectName7, body, repoStore);
    const handoffRecord = await fetchJsonIfExists3(env, projectName7, handoffEntry.handoff_record_path, repoStore);
    if (!handoffRecord)
      return errorResponse("PM_INTAKE_HANDOFF_RECORD_NOT_FOUND", `No handoff record found for ${handoffEntry.handoff_id}`, 404);
    if (handoffRecord.handoff_id !== handoffEntry.handoff_id || handoffRecord.handoff_record_path !== handoffEntry.handoff_record_path) {
      return errorResponse("PM_INTAKE_HANDOFF_CONTEXT_MISMATCH", "Handoff record does not match generated PM handoff context", 409);
    }
    const handoffError = validateHandoffRecord(handoffRecord);
    if (handoffError)
      return handoffError;
    const codeFlowManifest = await fetchJsonIfExists3(env, projectName7, flowManifestPath3(handoffRecord.code_flow.flow_id), repoStore);
    const codeFlowError = validateCodeFlowManifest(codeFlowManifest, handoffRecord);
    if (codeFlowError)
      return codeFlowError;
    const pmNotes = optionalString6(body.pm_notes);
    const intakeId = buildIntakeId(handoffRecord.handoff_id, idempotencyKey);
    const payloadHash = await sha256Hex3(JSON.stringify({
      project: projectName7,
      idempotency_key: idempotencyKey,
      handoff_id: handoffRecord.handoff_id,
      handoff_record_path: handoffRecord.handoff_record_path,
      handoff_payload_hash: handoffRecord.submitted_payload_hash,
      share_packet_hash: handoffRecord.source_share.share_packet_hash,
      pm_notes: pmNotes
    }));
    const recordPath6 = pmIntakeRecordPath(intakeId);
    const existingRecord = await fetchJsonIfExists3(env, projectName7, recordPath6, repoStore);
    if (existingRecord && existingRecord.schema_version === "code_monkeys_pm_intake.v0.1") {
      if (existingRecord.submitted_payload_hash !== payloadHash) {
        return errorResponse("PM_INTAKE_IDEMPOTENCY_CONFLICT", "Existing PM intake idempotency record exists but submitted payload hash does not match", 409);
      }
      return jsonResponse({ ok: true, idempotent_replay: true, intake: existingRecord, required_status_labels: requiredStatusLabels6() }, 200);
    }
    const pmDossier = await writeCodeFlowArtifact2(request, env, handoffRecord.code_flow.flow_id, projectName7, "pm_dossier", "Code Monkeys PM Dossier", buildPMDossierMarkdown(handoffRecord, intakeId, pmNotes), repoStore);
    if (pmDossier instanceof Response)
      return pmDossier;
    const pmGateDefinition = await writeCodeFlowArtifact2(request, env, handoffRecord.code_flow.flow_id, projectName7, "pm_gate_definition", "PM Intake Gate Definition", buildPMGateDefinitionMarkdown(handoffRecord, intakeId), repoStore);
    if (pmGateDefinition instanceof Response)
      return pmGateDefinition;
    const createdAt = utcIso4();
    const record = {
      schema_version: "code_monkeys_pm_intake.v0.1",
      official_artifact: true,
      project: projectName7,
      intake_id: intakeId,
      idempotency_key: idempotencyKey,
      created_at: createdAt,
      created_by_role: "PM_AI",
      source_handoff: {
        handoff_id: handoffRecord.handoff_id,
        handoff_record_path: handoffRecord.handoff_record_path,
        code_flow_id: handoffRecord.code_flow.flow_id,
        share_id: handoffRecord.source_share.share_id,
        science_flow_id: handoffRecord.source_share.science_flow_id,
        share_packet_hash: handoffRecord.source_share.share_packet_hash,
        submitted_share_payload_hash: handoffRecord.source_share.submitted_payload_hash,
        handoff_payload_hash: handoffRecord.submitted_payload_hash,
        evidence_level: handoffRecord.source_share.evidence_level,
        uncertainty: handoffRecord.source_share.uncertainty,
        source_artifacts: handoffRecord.source_share.source_artifacts,
        resolved_source_artifacts: handoffRecord.source_share.resolved_source_artifacts,
        allowed_claims: handoffRecord.source_share.allowed_claims,
        forbidden_claims: handoffRecord.source_share.forbidden_claims
      },
      output_artifacts: { pm_dossier: pmDossier, pm_gate_definition: pmGateDefinition },
      submitted_payload_hash: payloadHash,
      pm_intake_record_path: recordPath6,
      generated_pm_intake_context_path: pmIntakeContextIndexPath(),
      required_status_labels: requiredStatusLabels6()
    };
    const index = await loadIntakeIndex(env, projectName7, repoStore);
    upsertIntakeIndex(index, record);
    const indexWrite = await writeJson2(env, projectName7, pmIntakeContextIndexPath(), index, `Update PM intake context ${intakeId}`, repoStore);
    record.generated_pm_intake_context_sha = indexWrite.sha;
    const recordWrite = await writeJson2(env, projectName7, recordPath6, record, `Write PM intake record ${intakeId}`, repoStore);
    return jsonResponse({ ok: true, idempotent_replay: false, project: projectName7, intake: { ...record, pm_intake_record_sha: recordWrite.sha }, required_status_labels: requiredStatusLabels6() }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("No PM handoff context entry"))
      return errorResponse("PM_INTAKE_HANDOFF_CONTEXT_NOT_FOUND", message, 404);
    if (message.includes("PM handoff context index is missing"))
      return errorResponse("PM_INTAKE_HANDOFF_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handlePmIntakeRequest, "handlePmIntakeRequest");

// src/pm_specify.ts
function requiredStatusLabels7() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels7, "requiredStatusLabels");
function optionalString7(value) {
  return typeof value === "string" ? value.trim() : "";
}
__name(optionalString7, "optionalString");
function requireString8(value, field) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Invalid or missing field: ${field}`);
  return value.trim();
}
__name(requireString8, "requireString");
function getParam8(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam8, "getParam");
function projectNameFrom6(url, body) {
  const fromBody = body ? optionalString7(body.project) : "";
  const fromQuery = getParam8(url, "project") || "";
  return fromBody || fromQuery || "ArqonZero";
}
__name(projectNameFrom6, "projectNameFrom");
function utcIso5() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(utcIso5, "utcIso");
function safeFilePart5(value, max = 96) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safeFilePart5, "safeFilePart");
function formatJson5(value) {
  return `${JSON.stringify(value, null, 2)}
`;
}
__name(formatJson5, "formatJson");
function authorizationHeader4(request) {
  return request.headers.get("authorization") || "";
}
__name(authorizationHeader4, "authorizationHeader");
function jsonHeaders4(request) {
  const headers = new Headers();
  const auth = authorizationHeader4(request);
  if (auth)
    headers.set("authorization", auth);
  headers.set("content-type", "application/json");
  return headers;
}
__name(jsonHeaders4, "jsonHeaders");
function pmIntakeContextIndexPath2() {
  return "governance/context/generated_pm_intake_context.json";
}
__name(pmIntakeContextIndexPath2, "pmIntakeContextIndexPath");
function pmSpecificationContextIndexPath() {
  return "governance/context/generated_pm_specification_context.json";
}
__name(pmSpecificationContextIndexPath, "pmSpecificationContextIndexPath");
function pmSpecificationRecordPath(specificationId) {
  return `governance/context/pm_specification/${specificationId}.json`;
}
__name(pmSpecificationRecordPath, "pmSpecificationRecordPath");
function flowManifestPath4(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(flowManifestPath4, "flowManifestPath");
async function readJsonBody6(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Missing or invalid JSON body");
  return body;
}
__name(readJsonBody6, "readJsonBody");
async function fetchJsonIfExists4(env, projectName7, path, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, path);
    return JSON.parse(file.content);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404"))
      return null;
    throw err;
  }
}
__name(fetchJsonIfExists4, "fetchJsonIfExists");
async function writeJson3(env, projectName7, path, value, message, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  return await store.writeFile(env, project, path, formatJson5(value), message);
}
__name(writeJson3, "writeJson");
async function parseJsonResponse4(response) {
  const text = await response.text();
  if (!text)
    return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
__name(parseJsonResponse4, "parseJsonResponse");
async function sha256Hex4(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex4, "sha256Hex");
function hasRequiredLabels3(labels3) {
  return requiredStatusLabels7().every((label) => Array.isArray(labels3) && labels3.includes(label));
}
__name(hasRequiredLabels3, "hasRequiredLabels");
async function loadPMIntakeContextEntry(env, projectName7, body, store) {
  const intakeId = optionalString7(body.intake_id);
  const intakeRecordPath2 = optionalString7(body.pm_intake_record_path);
  if (!intakeId && !intakeRecordPath2)
    throw new Error("Invalid or missing field: intake_id or pm_intake_record_path");
  const index = await fetchJsonIfExists4(env, projectName7, pmIntakeContextIndexPath2(), store);
  if (!index || index.schema_version !== "pm_intake_context_index.v0.1" || !Array.isArray(index.entries)) {
    throw new Error("PM intake context index is missing or invalid");
  }
  const entry = index.entries.find(
    (item) => intakeId && item.intake_id === intakeId || intakeRecordPath2 && item.pm_intake_record_path === intakeRecordPath2
  );
  if (!entry)
    throw new Error(`No PM intake context entry found for ${intakeId || intakeRecordPath2}`);
  return { intake_id: entry.intake_id, pm_intake_record_path: entry.pm_intake_record_path };
}
__name(loadPMIntakeContextEntry, "loadPMIntakeContextEntry");
function artifactById2(manifest, artifactId) {
  return manifest.artifacts.find((artifact) => artifact.artifact_id === artifactId) || null;
}
__name(artifactById2, "artifactById");
function validateExpectedIntakeArtifact(manifest, expected, expectedType) {
  const actual = artifactById2(manifest, expected.artifact_id);
  if (!actual)
    return errorResponse("PM_SPECIFY_INTAKE_ARTIFACTS_NOT_ON_CODE_FLOW", `Code flow does not contain required intake artifact ${expected.artifact_id}`, 409);
  if (actual.artifact_type !== expectedType || actual.role !== "PM_AI") {
    return errorResponse("PM_SPECIFY_INTAKE_ARTIFACT_TYPE_MISMATCH", `Expected ${expectedType} by PM_AI for ${expected.artifact_id}`, 409);
  }
  if (actual.source_path !== expected.source_path) {
    return errorResponse("PM_SPECIFY_INTAKE_ARTIFACT_SOURCE_MISMATCH", `Intake artifact source path mismatch for ${expected.artifact_id}`, 409);
  }
  return null;
}
__name(validateExpectedIntakeArtifact, "validateExpectedIntakeArtifact");
function validateIntakeRecord(record) {
  if (record.schema_version !== "code_monkeys_pm_intake.v0.1")
    return errorResponse("PM_SPECIFY_INVALID_INTAKE_RECORD", "PM intake record schema is invalid", 409);
  if (record.official_artifact !== true || record.created_by_role !== "PM_AI")
    return errorResponse("PM_SPECIFY_INVALID_INTAKE_AUTHORITY", "PM intake record is not official PM intake", 409);
  if (!record.source_handoff || !record.output_artifacts)
    return errorResponse("PM_SPECIFY_INTAKE_INCOMPLETE", "PM intake record is missing source handoff or output artifacts", 409);
  if (!record.source_handoff.share_packet_hash || !record.source_handoff.uncertainty)
    return errorResponse("PM_SPECIFY_SOURCE_BOUNDARY_REQUIRED", "PM intake record must preserve share hash and uncertainty", 409);
  if (!record.source_handoff.forbidden_claims || record.source_handoff.forbidden_claims.length === 0)
    return errorResponse("PM_SPECIFY_FORBIDDEN_CLAIMS_REQUIRED", "PM intake record must preserve forbidden claims", 409);
  if (!record.source_handoff.resolved_source_artifacts || record.source_handoff.resolved_source_artifacts.length === 0)
    return errorResponse("PM_SPECIFY_RESOLVED_SOURCES_REQUIRED", "PM intake record must preserve resolved source metadata", 409);
  if (!record.output_artifacts.pm_dossier || !record.output_artifacts.pm_gate_definition)
    return errorResponse("PM_SPECIFY_INTAKE_ARTIFACTS_REQUIRED", "PM intake record must include pm_dossier and pm_gate_definition", 409);
  if (!hasRequiredLabels3(record.required_status_labels))
    return errorResponse("PM_SPECIFY_STATUS_LABELS_REQUIRED", "PM intake record is missing required diagnostic status labels", 409);
  return null;
}
__name(validateIntakeRecord, "validateIntakeRecord");
function validateCodeFlowManifest2(manifest, record) {
  if (!manifest || manifest.schema_version !== "flow_manifest.v0.3")
    return errorResponse("PM_SPECIFY_CODE_FLOW_NOT_FOUND", "Code flow manifest not found", 404);
  if (manifest.type !== "code_flow" || manifest.flow_id !== record.source_handoff.code_flow_id)
    return errorResponse("PM_SPECIFY_CODE_FLOW_REQUIRED", "PM specify target must be a code_flow", 409);
  const dossierError = validateExpectedIntakeArtifact(manifest, record.output_artifacts.pm_dossier, "pm_dossier");
  if (dossierError)
    return dossierError;
  const gateError = validateExpectedIntakeArtifact(manifest, record.output_artifacts.pm_gate_definition, "pm_gate_definition");
  if (gateError)
    return gateError;
  return null;
}
__name(validateCodeFlowManifest2, "validateCodeFlowManifest");
function normalizeClaimText(value) {
  return value.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}
__name(normalizeClaimText, "normalizeClaimText");
function validateSpecificationBody(body) {
  const normalized = normalizeClaimText(body);
  const sealedTestCertified = ["sealed-test", "certified"].join(" ");
  const certification = "certification";
  const productionReady = ["production", "ready"].join(" ");
  const productionReadiness = ["production", "readiness"].join(" ");
  const readyForProduction = ["ready", "for", "production"].join(" ");
  const productReady = ["product", "ready"].join(" ");
  const promotable = "promotable";
  const promotableStatus = ["promotable", "status"].join(" ");
  const approvedForRelease = ["approved", "for", "release"].join(" ");
  const releaseReady = ["release", "ready"].join(" ");
  const forbiddenPatterns = [
    [new RegExp(`\\b${sealedTestCertified.replace(/\s+/g, "\\s+")}\\b`), sealedTestCertified],
    [new RegExp("\\bcertified\\b"), "certified"],
    [new RegExp(`\\b${certification}\\b`), certification],
    [new RegExp(`\\b${productionReady.replace(/\s+/g, "\\s+")}\\b`), productionReady],
    [new RegExp(`\\b${productionReadiness.replace(/\s+/g, "\\s+")}\\b`), productionReadiness],
    [new RegExp(`\\b${readyForProduction.replace(/\s+/g, "\\s+")}\\b`), readyForProduction],
    [new RegExp(`\\b${productReady.replace(/\s+/g, "\\s+")}\\b`), productReady],
    [new RegExp(`\\b${promotable}\\b`), promotable],
    [new RegExp(`\\b${promotableStatus.replace(/\s+/g, "\\s+")}\\b`), promotableStatus],
    [new RegExp(`\\b${approvedForRelease.replace(/\s+/g, "\\s+")}\\b`), approvedForRelease],
    [new RegExp(`\\b${releaseReady.replace(/\s+/g, "\\s+")}\\b`), releaseReady]
  ];
  const found = forbiddenPatterns.find(([pattern]) => pattern.test(normalized));
  if (found)
    return errorResponse("PM_SPECIFY_FORBIDDEN_CLAIM_INCLUDED", `Specification body contains forbidden promotion language: ${found[1]}`, 409);
  return null;
}
__name(validateSpecificationBody, "validateSpecificationBody");
function buildSpecificationId(intakeId, idempotencyKey) {
  return `${safeFilePart5(intakeId, 90)}-${safeFilePart5(idempotencyKey, 36)}`;
}
__name(buildSpecificationId, "buildSpecificationId");
function buildSpecificationMarkdown(record, specificationId, title, specificationBody) {
  return `# ${title}

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Specification Boundary

This is a PM specification candidate derived from audited PM intake. It is not a plan, not a task packet, not implementation authorization, not certification, and not a readiness claim for production.

## Source Chain

- specification_id: ${specificationId}
- intake_id: ${record.intake_id}
- handoff_id: ${record.source_handoff.handoff_id}
- code_flow_id: ${record.source_handoff.code_flow_id}
- source_share_id: ${record.source_handoff.share_id}
- source_science_flow_id: ${record.source_handoff.science_flow_id}
- share_packet_hash: ${record.source_handoff.share_packet_hash}
- submitted_share_payload_hash: ${record.source_handoff.submitted_share_payload_hash || record.source_handoff.share_packet_hash}
- handoff_payload_hash: ${record.source_handoff.handoff_payload_hash}
- intake_payload_hash: ${record.submitted_payload_hash}
- evidence_level: ${record.source_handoff.evidence_level}
- uncertainty: ${record.source_handoff.uncertainty}

## Specification Body

${specificationBody}

## Hard Forbidden Claims

${record.source_handoff.forbidden_claims.map((claim) => `- ${claim}`).join("\n")}

## Source Artifacts

${record.source_handoff.resolved_source_artifacts.map((item) => `- ${item.artifact_type}: ${item.artifact_id} (${item.source_path})`).join("\n")}

## Non-Laundering Rule

This specification remains downstream of diagnostic evidence. Plan, task, Coder handoff, Helper execution, and release advancement require later gated stages and Human approval.
`;
}
__name(buildSpecificationMarkdown, "buildSpecificationMarkdown");
async function writeCodeFlowArtifact3(request, env, flowId, projectName7, artifactType, title, body, store) {
  const url = new URL(request.url);
  const artifactRequest = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, {
    method: "POST",
    headers: jsonHeaders4(request),
    body: JSON.stringify({ project: projectName7, artifact_type: artifactType, title, body })
  });
  const response = await handleFlowsRequest(artifactRequest, env, flowId, "artifacts", store);
  const parsed = await parseJsonResponse4(response);
  if (!response.ok)
    return jsonResponse(parsed, response.status);
  const artifact = parsed.artifact;
  if (!artifact)
    return errorResponse("PM_SPECIFY_ARTIFACT_WRITE_FAILED", `Artifact write did not return summary for ${artifactType}`, 500);
  return artifact;
}
__name(writeCodeFlowArtifact3, "writeCodeFlowArtifact");
async function loadSpecificationIndex(env, projectName7, store) {
  const existing = await fetchJsonIfExists4(env, projectName7, pmSpecificationContextIndexPath(), store);
  if (existing && existing.schema_version === "pm_specification_context_index.v0.1" && Array.isArray(existing.entries))
    return existing;
  return { schema_version: "pm_specification_context_index.v0.1", project: projectName7, updated_at: utcIso5(), entries: [] };
}
__name(loadSpecificationIndex, "loadSpecificationIndex");
function upsertSpecificationIndex(index, record) {
  const entry = {
    specification_id: record.specification_id,
    intake_id: record.source_intake.intake_id,
    handoff_id: record.source_intake.handoff_id,
    code_flow_id: record.source_intake.code_flow_id,
    share_id: record.source_intake.share_id,
    science_flow_id: record.source_intake.science_flow_id,
    share_packet_hash: record.source_intake.share_packet_hash,
    evidence_level: record.source_intake.evidence_level,
    uncertainty: record.source_intake.uncertainty,
    pm_specification_record_path: record.pm_specification_record_path,
    created_at: record.created_at
  };
  const existing = index.entries.findIndex((item) => item.specification_id === record.specification_id);
  if (existing >= 0)
    index.entries[existing] = entry;
  else
    index.entries.push(entry);
  index.updated_at = utcIso5();
  index.entries.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}
__name(upsertSpecificationIndex, "upsertSpecificationIndex");
async function handlePmSpecifyRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "PM_AI")
      return errorResponse("PM_SPECIFY_ROLE_FORBIDDEN", "Only PM_AI may create PM specification artifacts", 403);
    if (request.method !== "POST")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const url = new URL(request.url);
    const body = await readJsonBody6(request);
    const projectName7 = projectNameFrom6(url, body);
    const project = getProject(projectName7);
    if (!project)
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
    const idempotencyKey = requireString8(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(idempotencyKey)) {
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    }
    const specificationTitle = requireString8(body.specification_title, "specification_title");
    const specificationBody = requireString8(body.specification_body, "specification_body");
    const bodyError = validateSpecificationBody(specificationBody);
    if (bodyError)
      return bodyError;
    const intakeEntry = await loadPMIntakeContextEntry(env, projectName7, body, repoStore);
    const intakeRecord = await fetchJsonIfExists4(env, projectName7, intakeEntry.pm_intake_record_path, repoStore);
    if (!intakeRecord)
      return errorResponse("PM_SPECIFY_INTAKE_RECORD_NOT_FOUND", `No PM intake record found for ${intakeEntry.intake_id}`, 404);
    if (intakeRecord.intake_id !== intakeEntry.intake_id || intakeRecord.pm_intake_record_path !== intakeEntry.pm_intake_record_path) {
      return errorResponse("PM_SPECIFY_INTAKE_CONTEXT_MISMATCH", "PM intake record does not match generated PM intake context", 409);
    }
    const intakeError = validateIntakeRecord(intakeRecord);
    if (intakeError)
      return intakeError;
    const codeFlowManifest = await fetchJsonIfExists4(env, projectName7, flowManifestPath4(intakeRecord.source_handoff.code_flow_id), repoStore);
    const codeFlowError = validateCodeFlowManifest2(codeFlowManifest, intakeRecord);
    if (codeFlowError)
      return codeFlowError;
    const specificationId = buildSpecificationId(intakeRecord.intake_id, idempotencyKey);
    const payloadHash = await sha256Hex4(JSON.stringify({
      project: projectName7,
      idempotency_key: idempotencyKey,
      intake_id: intakeRecord.intake_id,
      pm_intake_record_path: intakeRecord.pm_intake_record_path,
      intake_payload_hash: intakeRecord.submitted_payload_hash,
      share_packet_hash: intakeRecord.source_handoff.share_packet_hash,
      specification_title: specificationTitle,
      specification_body: specificationBody
    }));
    const recordPath6 = pmSpecificationRecordPath(specificationId);
    const existingRecord = await fetchJsonIfExists4(env, projectName7, recordPath6, repoStore);
    if (existingRecord && existingRecord.schema_version === "pm_specification_context.v0.1") {
      if (existingRecord.submitted_payload_hash !== payloadHash) {
        return errorResponse("PM_SPECIFY_IDEMPOTENCY_CONFLICT", "Existing PM specify idempotency record exists but submitted payload hash does not match", 409);
      }
      return jsonResponse({ ok: true, idempotent_replay: true, specification: existingRecord, required_status_labels: requiredStatusLabels7() }, 200);
    }
    const specificationArtifact = await writeCodeFlowArtifact3(
      request,
      env,
      intakeRecord.source_handoff.code_flow_id,
      projectName7,
      "specification",
      specificationTitle,
      buildSpecificationMarkdown(intakeRecord, specificationId, specificationTitle, specificationBody),
      repoStore
    );
    if (specificationArtifact instanceof Response)
      return specificationArtifact;
    const createdAt = utcIso5();
    const record = {
      schema_version: "pm_specification_context.v0.1",
      official_artifact: true,
      project: projectName7,
      specification_id: specificationId,
      idempotency_key: idempotencyKey,
      created_at: createdAt,
      created_by_role: "PM_AI",
      source_intake: {
        intake_id: intakeRecord.intake_id,
        pm_intake_record_path: intakeRecord.pm_intake_record_path,
        code_flow_id: intakeRecord.source_handoff.code_flow_id,
        handoff_id: intakeRecord.source_handoff.handoff_id,
        share_id: intakeRecord.source_handoff.share_id,
        science_flow_id: intakeRecord.source_handoff.science_flow_id,
        share_packet_hash: intakeRecord.source_handoff.share_packet_hash,
        submitted_share_payload_hash: intakeRecord.source_handoff.submitted_share_payload_hash,
        handoff_payload_hash: intakeRecord.source_handoff.handoff_payload_hash,
        intake_payload_hash: intakeRecord.submitted_payload_hash,
        evidence_level: intakeRecord.source_handoff.evidence_level,
        uncertainty: intakeRecord.source_handoff.uncertainty,
        source_artifacts: intakeRecord.source_handoff.source_artifacts,
        resolved_source_artifacts: intakeRecord.source_handoff.resolved_source_artifacts,
        allowed_claims: intakeRecord.source_handoff.allowed_claims,
        forbidden_claims: intakeRecord.source_handoff.forbidden_claims
      },
      output_artifacts: { specification: specificationArtifact },
      submitted_payload_hash: payloadHash,
      pm_specification_record_path: recordPath6,
      generated_pm_specification_context_path: pmSpecificationContextIndexPath(),
      required_status_labels: requiredStatusLabels7()
    };
    const index = await loadSpecificationIndex(env, projectName7, repoStore);
    upsertSpecificationIndex(index, record);
    const indexWrite = await writeJson3(env, projectName7, pmSpecificationContextIndexPath(), index, `Update PM specification context ${specificationId}`, repoStore);
    record.generated_pm_specification_context_sha = indexWrite.sha;
    const recordWrite = await writeJson3(env, projectName7, recordPath6, record, `Write PM specification record ${specificationId}`, repoStore);
    return jsonResponse({ ok: true, idempotent_replay: false, project: projectName7, specification: { ...record, pm_specification_record_sha: recordWrite.sha }, required_status_labels: requiredStatusLabels7() }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("No PM intake context entry"))
      return errorResponse("PM_SPECIFY_INTAKE_CONTEXT_NOT_FOUND", message, 404);
    if (message.includes("PM intake context index is missing"))
      return errorResponse("PM_SPECIFY_INTAKE_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handlePmSpecifyRequest, "handlePmSpecifyRequest");

// src/pm_plan.ts
var LABELS = [...STATUS_LABELS];
function optionalString8(v) {
  return typeof v === "string" ? v.trim() : "";
}
__name(optionalString8, "optionalString");
function requireString9(v, field) {
  if (typeof v !== "string" || !v.trim())
    throw new Error(`Invalid or missing field: ${field}`);
  return v.trim();
}
__name(requireString9, "requireString");
function safe(value, max = 96) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safe, "safe");
function now() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(now, "now");
function formatJson6(value) {
  return `${JSON.stringify(value, null, 2)}
`;
}
__name(formatJson6, "formatJson");
function authHeader(request) {
  return request.headers.get("authorization") || "";
}
__name(authHeader, "authHeader");
function jsonHeaders5(request) {
  const h = new Headers();
  const a = authHeader(request);
  if (a)
    h.set("authorization", a);
  h.set("content-type", "application/json");
  return h;
}
__name(jsonHeaders5, "jsonHeaders");
function projectName(url, body) {
  return optionalString8(body.project) || optionalString8(url.searchParams.get("project")) || "ArqonZero";
}
__name(projectName, "projectName");
function planIndexPath() {
  return "governance/context/generated_pm_plan_context.json";
}
__name(planIndexPath, "planIndexPath");
function specIndexPath() {
  return "governance/context/generated_pm_specification_context.json";
}
__name(specIndexPath, "specIndexPath");
function planRecordPath(id) {
  return `governance/context/pm_plan/${id}.json`;
}
__name(planRecordPath, "planRecordPath");
function flowManifestPath5(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(flowManifestPath5, "flowManifestPath");
function hasLabels(labels3) {
  return LABELS.every((label) => Array.isArray(labels3) && labels3.includes(label));
}
__name(hasLabels, "hasLabels");
async function bodyJson(request) {
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object" || Array.isArray(b))
    throw new Error("Missing or invalid JSON body");
  return b;
}
__name(bodyJson, "bodyJson");
async function sha256Hex5(value) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex5, "sha256Hex");
async function fetchJson(env, projectName7, path, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const f = await store.fetchFile(env, project, path);
    return JSON.parse(f.content);
  } catch (e) {
    if (e instanceof Error && e.message.includes("404"))
      return null;
    throw e;
  }
}
__name(fetchJson, "fetchJson");
async function writeJson4(env, projectName7, path, value, message, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  return await store.writeFile(env, project, path, formatJson6(value), message);
}
__name(writeJson4, "writeJson");
async function parseResponse(response) {
  const t = await response.text();
  if (!t)
    return null;
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}
__name(parseResponse, "parseResponse");
function normalizeClaimText2(value) {
  return value.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}
__name(normalizeClaimText2, "normalizeClaimText");
function joinWords(...parts) {
  return parts.join(" ");
}
__name(joinWords, "joinWords");
function joinParts(...parts) {
  return parts.join("");
}
__name(joinParts, "joinParts");
function makeWordPattern(...parts) {
  return new RegExp(`\\b${joinWords(...parts)}\\b`);
}
__name(makeWordPattern, "makeWordPattern");
function makePackedPattern(...parts) {
  return new RegExp(`\\b${joinParts(...parts)}\\b`);
}
__name(makePackedPattern, "makePackedPattern");
function validatePlanBody(body) {
  const n = normalizeClaimText2(body);
  const banned = [[makeWordPattern("sealed", "test", joinParts("certi", "fied")), joinWords("sealed-test", joinParts("certi", "fied"))], [makePackedPattern("certi", "fied"), joinWords("certi", "fied")], [makePackedPattern("certifi", "cation"), joinWords("certifi", "cation")], [makeWordPattern("production", "ready"), joinWords("production", "ready")], [makeWordPattern("production", "readiness"), joinWords("production", "readiness")], [makeWordPattern("ready", "for", "production"), joinWords("ready", "for", "production")], [makeWordPattern("product", "ready"), joinWords("product", "ready")], [makePackedPattern("promo", "table"), joinParts("promo", "table")], [makeWordPattern("approved", "for", "release"), joinWords("approved", "for", "release")], [makeWordPattern("release", "ready"), joinWords("release", "ready")]];
  const hit = banned.find(([p]) => p.test(n));
  return hit ? errorResponse("PM_PLAN_FORBIDDEN_CLAIM_INCLUDED", `Plan body contains forbidden promotion language: ${hit[1]}`, 409) : null;
}
__name(validatePlanBody, "validatePlanBody");
function validateSpecRecord(r) {
  if (r.schema_version !== "pm_specification_context.v0.1")
    return errorResponse("PM_PLAN_INVALID_SPECIFICATION_RECORD", "PM specification record schema is invalid", 409);
  if (r.official_artifact !== true || r.created_by_role !== "PM_AI")
    return errorResponse("PM_PLAN_INVALID_SPECIFICATION_AUTHORITY", "PM specification record is not official PM specification", 409);
  if (!r.source_intake || !r.output_artifacts?.specification)
    return errorResponse("PM_PLAN_SPECIFICATION_INCOMPLETE", "PM specification record is incomplete", 409);
  if (!r.source_intake.share_packet_hash || !r.source_intake.uncertainty)
    return errorResponse("PM_PLAN_SOURCE_BOUNDARY_REQUIRED", "PM specification record must preserve share hash and uncertainty", 409);
  if (!r.source_intake.forbidden_claims?.length)
    return errorResponse("PM_PLAN_FORBIDDEN_CLAIMS_REQUIRED", "PM specification record must preserve forbidden claims", 409);
  if (!r.source_intake.resolved_source_artifacts?.length)
    return errorResponse("PM_PLAN_RESOLVED_SOURCES_REQUIRED", "PM specification record must preserve resolved source metadata", 409);
  if (!hasLabels(r.required_status_labels))
    return errorResponse("PM_PLAN_STATUS_LABELS_REQUIRED", "PM specification record is missing required diagnostic status labels", 409);
  return null;
}
__name(validateSpecRecord, "validateSpecRecord");
function validateCodeFlow(m, r) {
  if (!m || m.schema_version !== "flow_manifest.v0.3")
    return errorResponse("PM_PLAN_CODE_FLOW_NOT_FOUND", "Code flow manifest not found", 404);
  if (m.type !== "code_flow" || m.flow_id !== r.source_intake.code_flow_id)
    return errorResponse("PM_PLAN_CODE_FLOW_REQUIRED", "PM plan target must be a code_flow", 409);
  const expected = r.output_artifacts.specification;
  const actual = m.artifacts.find((a) => a.artifact_id === expected.artifact_id);
  if (!actual)
    return errorResponse("PM_PLAN_SPECIFICATION_ARTIFACT_NOT_ON_CODE_FLOW", `Code flow does not contain specification ${expected.artifact_id}`, 409);
  if (actual.artifact_type !== "specification" || actual.role !== "PM_AI")
    return errorResponse("PM_PLAN_SPECIFICATION_ARTIFACT_TYPE_MISMATCH", `Expected specification by PM_AI for ${expected.artifact_id}`, 409);
  if (actual.source_path !== expected.source_path)
    return errorResponse("PM_PLAN_SPECIFICATION_ARTIFACT_SOURCE_MISMATCH", `Specification source path mismatch for ${expected.artifact_id}`, 409);
  return null;
}
__name(validateCodeFlow, "validateCodeFlow");
async function loadSpecEntry(env, projectName7, body, store) {
  const id = optionalString8(body.specification_id);
  const path = optionalString8(body.pm_specification_record_path);
  if (!id && !path)
    throw new Error("Invalid or missing field: specification_id or pm_specification_record_path");
  const index = await fetchJson(env, projectName7, specIndexPath(), store);
  if (!index || index.schema_version !== "pm_specification_context_index.v0.1" || !Array.isArray(index.entries))
    throw new Error("PM specification context index is missing or invalid");
  const entry = index.entries.find((e) => id && e.specification_id === id || path && e.pm_specification_record_path === path);
  if (!entry)
    throw new Error(`No PM specification context entry found for ${id || path}`);
  return entry;
}
__name(loadSpecEntry, "loadSpecEntry");
async function writeArtifact(request, env, flowId, projectName7, title, body, store) {
  const url = new URL(request.url);
  const r = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, { method: "POST", headers: jsonHeaders5(request), body: JSON.stringify({ project: projectName7, artifact_type: "plan", title, body }) });
  const response = await handleFlowsRequest(r, env, flowId, "artifacts", store);
  const parsed = await parseResponse(response);
  if (!response.ok)
    return jsonResponse(parsed, response.status);
  const artifact = parsed.artifact;
  return artifact || errorResponse("PM_PLAN_ARTIFACT_WRITE_FAILED", "Plan artifact write did not return summary", 500);
}
__name(writeArtifact, "writeArtifact");
function planMarkdown(r, planId, title, planBody) {
  return `# ${title}

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Plan Boundary

This PM plan is downstream of diagnostic evidence. It is not tasks, not Coder handoff, not Helper execution, not cert claim, and not release-readiness.

## Source Chain

- plan_id: ${planId}
- specification_id: ${r.specification_id}
- intake_id: ${r.source_intake.intake_id}
- handoff_id: ${r.source_intake.handoff_id}
- code_flow_id: ${r.source_intake.code_flow_id}
- share_packet_hash: ${r.source_intake.share_packet_hash}
- specification_payload_hash: ${r.submitted_payload_hash}
- evidence_level: ${r.source_intake.evidence_level}
- uncertainty: ${r.source_intake.uncertainty}

## Plan Body

${planBody}

## Hard Forbidden Claims

${r.source_intake.forbidden_claims.map((c) => `- ${c}`).join("\n")}

## Source Artifacts

${r.source_intake.resolved_source_artifacts.map((a) => `- ${a.artifact_type}: ${a.artifact_id} (${a.source_path})`).join("\n")}

## Non-Laundering Rule

Tasks, Coder handoff, Helper execution, and promotion require later gated stages and Human approval.
`;
}
__name(planMarkdown, "planMarkdown");
async function loadPlanIndex(env, projectName7, store) {
  const existing = await fetchJson(env, projectName7, planIndexPath(), store);
  return existing && existing.schema_version === "pm_plan_context_index.v0.1" && Array.isArray(existing.entries) ? existing : { schema_version: "pm_plan_context_index.v0.1", project: projectName7, updated_at: now(), entries: [] };
}
__name(loadPlanIndex, "loadPlanIndex");
function upsert(index, r) {
  const entry = { plan_id: r.plan_id, specification_id: r.source_specification.specification_id, code_flow_id: r.source_specification.code_flow_id, share_id: r.source_specification.share_id, science_flow_id: r.source_specification.science_flow_id, share_packet_hash: r.source_specification.share_packet_hash, evidence_level: r.source_specification.evidence_level, uncertainty: r.source_specification.uncertainty, pm_plan_record_path: r.pm_plan_record_path, created_at: r.created_at };
  const i = index.entries.findIndex((e) => e.plan_id === r.plan_id);
  if (i >= 0)
    index.entries[i] = entry;
  else
    index.entries.push(entry);
  index.updated_at = now();
}
__name(upsert, "upsert");
async function handlePmPlanRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "PM_AI")
      return errorResponse("PM_PLAN_ROLE_FORBIDDEN", "Only PM_AI may create PM plan artifacts", 403);
    if (request.method !== "POST")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const url = new URL(request.url);
    const body = await bodyJson(request);
    const project = projectName(url, body);
    if (!getProject(project))
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${project}`, 404);
    const idempotencyKey = requireString9(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(idempotencyKey))
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    const planTitle = requireString9(body.plan_title, "plan_title");
    const planBody = requireString9(body.plan_body, "plan_body");
    const bodyError = validatePlanBody(planBody);
    if (bodyError)
      return bodyError;
    const entry = await loadSpecEntry(env, project, body, repoStore);
    const spec = await fetchJson(env, project, entry.pm_specification_record_path, repoStore);
    if (!spec)
      return errorResponse("PM_PLAN_SPECIFICATION_RECORD_NOT_FOUND", `No PM specification record found for ${entry.specification_id}`, 404);
    if (spec.specification_id !== entry.specification_id || spec.pm_specification_record_path !== entry.pm_specification_record_path)
      return errorResponse("PM_PLAN_SPECIFICATION_CONTEXT_MISMATCH", "PM specification record does not match generated PM specification context", 409);
    const specError = validateSpecRecord(spec);
    if (specError)
      return specError;
    const manifest = await fetchJson(env, project, flowManifestPath5(spec.source_intake.code_flow_id), repoStore);
    const flowError = validateCodeFlow(manifest, spec);
    if (flowError)
      return flowError;
    const planId = `${safe(spec.specification_id, 90)}-${safe(idempotencyKey, 36)}`;
    const payloadHash = await sha256Hex5(JSON.stringify({ project, idempotency_key: idempotencyKey, specification_id: spec.specification_id, pm_specification_record_path: spec.pm_specification_record_path, specification_payload_hash: spec.submitted_payload_hash, share_packet_hash: spec.source_intake.share_packet_hash, plan_title: planTitle, plan_body: planBody }));
    const recordPath6 = planRecordPath(planId);
    const existing = await fetchJson(env, project, recordPath6, repoStore);
    if (existing && existing.schema_version === "pm_plan_context.v0.1") {
      if (existing.submitted_payload_hash !== payloadHash)
        return errorResponse("PM_PLAN_IDEMPOTENCY_CONFLICT", "Existing PM plan idempotency record exists but submitted payload hash does not match", 409);
      return jsonResponse({ ok: true, idempotent_replay: true, plan: existing, required_status_labels: LABELS }, 200);
    }
    const planArtifact = await writeArtifact(request, env, spec.source_intake.code_flow_id, project, planTitle, planMarkdown(spec, planId, planTitle, planBody), repoStore);
    if (planArtifact instanceof Response)
      return planArtifact;
    const createdAt = now();
    const record = { schema_version: "pm_plan_context.v0.1", official_artifact: true, project, plan_id: planId, idempotency_key: idempotencyKey, created_at: createdAt, created_by_role: "PM_AI", source_specification: { specification_id: spec.specification_id, pm_specification_record_path: spec.pm_specification_record_path, code_flow_id: spec.source_intake.code_flow_id, intake_id: spec.source_intake.intake_id, handoff_id: spec.source_intake.handoff_id, share_id: spec.source_intake.share_id, science_flow_id: spec.source_intake.science_flow_id, share_packet_hash: spec.source_intake.share_packet_hash, submitted_share_payload_hash: spec.source_intake.submitted_share_payload_hash, handoff_payload_hash: spec.source_intake.handoff_payload_hash, intake_payload_hash: spec.source_intake.intake_payload_hash, specification_payload_hash: spec.submitted_payload_hash, evidence_level: spec.source_intake.evidence_level, uncertainty: spec.source_intake.uncertainty, source_artifacts: spec.source_intake.source_artifacts, resolved_source_artifacts: spec.source_intake.resolved_source_artifacts, allowed_claims: spec.source_intake.allowed_claims, forbidden_claims: spec.source_intake.forbidden_claims }, output_artifacts: { plan: planArtifact }, submitted_payload_hash: payloadHash, pm_plan_record_path: recordPath6, generated_pm_plan_context_path: planIndexPath(), required_status_labels: LABELS };
    const index = await loadPlanIndex(env, project, repoStore);
    upsert(index, record);
    const indexWrite = await writeJson4(env, project, planIndexPath(), index, `Update PM plan context ${planId}`, repoStore);
    record.generated_pm_plan_context_sha = indexWrite.sha;
    const recordWrite = await writeJson4(env, project, recordPath6, record, `Write PM plan record ${planId}`, repoStore);
    return jsonResponse({ ok: true, idempotent_replay: false, project, plan: { ...record, pm_plan_record_sha: recordWrite.sha }, required_status_labels: LABELS }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("No PM specification context entry") || message.includes("PM specification context index is missing"))
      return errorResponse("PM_PLAN_SPECIFICATION_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handlePmPlanRequest, "handlePmPlanRequest");

// src/pm_tasking.ts
function requiredStatusLabels8() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels8, "requiredStatusLabels");
function optionalString9(value) {
  return typeof value === "string" ? value.trim() : "";
}
__name(optionalString9, "optionalString");
function requireString10(value, field) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Invalid or missing field: ${field}`);
  return value.trim();
}
__name(requireString10, "requireString");
function getParam9(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam9, "getParam");
function projectNameFrom7(url, body) {
  const fromBody = body ? optionalString9(body.project) : "";
  const fromQuery = getParam9(url, "project") || "";
  return fromBody || fromQuery || "ArqonZero";
}
__name(projectNameFrom7, "projectNameFrom");
function utcIso6() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(utcIso6, "utcIso");
function safeFilePart6(value, max = 96) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safeFilePart6, "safeFilePart");
function formatJson7(value) {
  return `${JSON.stringify(value, null, 2)}
`;
}
__name(formatJson7, "formatJson");
function authorizationHeader5(request) {
  return request.headers.get("authorization") || "";
}
__name(authorizationHeader5, "authorizationHeader");
function jsonHeaders6(request) {
  const headers = new Headers();
  const auth = authorizationHeader5(request);
  if (auth)
    headers.set("authorization", auth);
  headers.set("content-type", "application/json");
  return headers;
}
__name(jsonHeaders6, "jsonHeaders");
function pmPlanContextIndexPath() {
  return "governance/context/generated_pm_plan_context.json";
}
__name(pmPlanContextIndexPath, "pmPlanContextIndexPath");
function pmTaskingContextIndexPath() {
  return "governance/context/generated_pm_tasking_context.json";
}
__name(pmTaskingContextIndexPath, "pmTaskingContextIndexPath");
function pmTaskingRecordPath(taskingId) {
  return `governance/context/pm_tasking/${taskingId}.json`;
}
__name(pmTaskingRecordPath, "pmTaskingRecordPath");
function flowManifestPath6(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(flowManifestPath6, "flowManifestPath");
async function readJsonBody7(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Missing or invalid JSON body");
  return body;
}
__name(readJsonBody7, "readJsonBody");
async function fetchJsonIfExists5(env, projectName7, path, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, path);
    return JSON.parse(file.content);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404"))
      return null;
    throw err;
  }
}
__name(fetchJsonIfExists5, "fetchJsonIfExists");
async function writeJson5(env, projectName7, path, value, message, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  return await store.writeFile(env, project, path, formatJson7(value), message);
}
__name(writeJson5, "writeJson");
async function parseJsonResponse5(response) {
  const text = await response.text();
  if (!text)
    return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
__name(parseJsonResponse5, "parseJsonResponse");
async function sha256Hex6(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex6, "sha256Hex");
function hasRequiredLabels4(labels3) {
  return requiredStatusLabels8().every((label) => Array.isArray(labels3) && labels3.includes(label));
}
__name(hasRequiredLabels4, "hasRequiredLabels");
function normalizeClaimText3(value) {
  return value.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}
__name(normalizeClaimText3, "normalizeClaimText");
function joinParts2(...parts) {
  return parts.join("");
}
__name(joinParts2, "joinParts");
function joinWords2(...parts) {
  return parts.join(" ");
}
__name(joinWords2, "joinWords");
function makeWordPattern2(...parts) {
  return new RegExp(`\\b${joinWords2(...parts)}\\b`);
}
__name(makeWordPattern2, "makeWordPattern");
function makePackedPattern2(...parts) {
  return new RegExp(`\\b${joinParts2(...parts)}\\b`);
}
__name(makePackedPattern2, "makePackedPattern");
function validateTaskingBody(body) {
  const normalized = normalizeClaimText3(body);
  const forbiddenPromotion = [
    [makeWordPattern2("sealed", "test", joinParts2("certi", "fied")), joinWords2("sealed-test", joinParts2("certi", "fied"))],
    [makePackedPattern2("certi", "fied"), joinWords2("certi", "fied")],
    [makePackedPattern2("certifi", "cation"), joinWords2("certifi", "cation")],
    [makeWordPattern2("production", "ready"), joinWords2("production", "ready")],
    [makeWordPattern2("production", "readiness"), joinWords2("production", "readiness")],
    [makeWordPattern2("ready", "for", "production"), joinWords2("ready", "for", "production")],
    [makeWordPattern2("product", "ready"), joinWords2("product", "ready")],
    [makePackedPattern2("promo", "table"), joinParts2("promo", "table")],
    [makeWordPattern2("approved", "for", "release"), joinWords2("approved", "for", "release")],
    [makeWordPattern2("release", "ready"), joinWords2("release", "ready")]
  ];
  const promotion = forbiddenPromotion.find(([pattern]) => pattern.test(normalized));
  if (promotion) {
    return errorResponse("PM_TASKING_FORBIDDEN_CLAIM_INCLUDED", `PM tasking contains forbidden promotion language: ${promotion[1]}`, 409);
  }
  const forbiddenAuthority = [
    [/\bcoder may begin\b/, "coder may begin"],
    [/\bhelper may execute\b/, "helper may execute"],
    [/\bhelper can execute\b/, "helper can execute"],
    [/\bimplementation is authorized\b/, "implementation is authorized"],
    [/\bauthorized for implementation\b/, "authorized for implementation"],
    [/\bready for coding\b/, "ready for coding"],
    [/\bcreate and apply the patch\b/, "create and apply the patch"],
    [/\bapply the patch\b/, "apply the patch"],
    [/\bproceed to implementation\b/, "proceed to implementation"],
    [/\bno further review required\b/, "no further review required"],
    [/\bstart implementation now\b/, "start implementation now"]
  ];
  const authority = forbiddenAuthority.find(([pattern]) => pattern.test(normalized));
  if (authority) {
    return errorResponse(
      "PM_TASKING_IMPLEMENTATION_AUTHORITY_FORBIDDEN",
      `PM tasking may not authorize implementation or execution: ${authority[1]}`,
      409
    );
  }
  return null;
}
__name(validateTaskingBody, "validateTaskingBody");
async function loadPMPlanContextEntry(env, projectName7, body, store) {
  const planId = optionalString9(body.plan_id);
  const planRecordPath2 = optionalString9(body.pm_plan_record_path);
  if (!planId && !planRecordPath2)
    throw new Error("Invalid or missing field: plan_id or pm_plan_record_path");
  const index = await fetchJsonIfExists5(env, projectName7, pmPlanContextIndexPath(), store);
  if (!index || index.schema_version !== "pm_plan_context_index.v0.1" || !Array.isArray(index.entries)) {
    throw new Error("PM plan context index is missing or invalid");
  }
  const entry = index.entries.find(
    (item) => planId && item.plan_id === planId || planRecordPath2 && item.pm_plan_record_path === planRecordPath2
  );
  if (!entry)
    throw new Error(`No PM plan context entry found for ${planId || planRecordPath2}`);
  return { plan_id: entry.plan_id, pm_plan_record_path: entry.pm_plan_record_path };
}
__name(loadPMPlanContextEntry, "loadPMPlanContextEntry");
function artifactById3(manifest, artifactId) {
  return manifest.artifacts.find((artifact) => artifact.artifact_id === artifactId) || null;
}
__name(artifactById3, "artifactById");
function validateExpectedPlanArtifact(manifest, expected) {
  const actual = artifactById3(manifest, expected.artifact_id);
  if (!actual)
    return errorResponse("PM_TASKING_PLAN_ARTIFACT_NOT_ON_CODE_FLOW", `Code flow does not contain required plan artifact ${expected.artifact_id}`, 409);
  if (actual.artifact_type !== "plan" || actual.role !== "PM_AI") {
    return errorResponse("PM_TASKING_PLAN_ARTIFACT_TYPE_MISMATCH", `Expected plan by PM_AI for ${expected.artifact_id}`, 409);
  }
  if (actual.source_path !== expected.source_path) {
    return errorResponse("PM_TASKING_PLAN_ARTIFACT_SOURCE_MISMATCH", `Plan artifact source path mismatch for ${expected.artifact_id}`, 409);
  }
  return null;
}
__name(validateExpectedPlanArtifact, "validateExpectedPlanArtifact");
function validatePlanRecord(record) {
  if (record.schema_version !== "pm_plan_context.v0.1")
    return errorResponse("PM_TASKING_INVALID_PLAN_RECORD", "PM plan record schema is invalid", 409);
  if (record.official_artifact !== true || record.created_by_role !== "PM_AI")
    return errorResponse("PM_TASKING_INVALID_PLAN_AUTHORITY", "PM plan record is not official PM plan", 409);
  if (!record.source_specification || !record.output_artifacts)
    return errorResponse("PM_TASKING_PLAN_INCOMPLETE", "PM plan record is missing source specification or output artifacts", 409);
  if (!record.source_specification.share_packet_hash || !record.source_specification.uncertainty)
    return errorResponse("PM_TASKING_SOURCE_BOUNDARY_REQUIRED", "PM plan record must preserve share hash and uncertainty", 409);
  if (!record.source_specification.forbidden_claims || record.source_specification.forbidden_claims.length === 0)
    return errorResponse("PM_TASKING_FORBIDDEN_CLAIMS_REQUIRED", "PM plan record must preserve forbidden claims", 409);
  if (!record.source_specification.resolved_source_artifacts || record.source_specification.resolved_source_artifacts.length === 0)
    return errorResponse("PM_TASKING_RESOLVED_SOURCES_REQUIRED", "PM plan record must preserve resolved source metadata", 409);
  if (!record.output_artifacts.plan)
    return errorResponse("PM_TASKING_PLAN_ARTIFACT_REQUIRED", "PM plan record must include plan artifact", 409);
  if (!hasRequiredLabels4(record.required_status_labels))
    return errorResponse("PM_TASKING_STATUS_LABELS_REQUIRED", "PM plan record is missing required diagnostic status labels", 409);
  return null;
}
__name(validatePlanRecord, "validatePlanRecord");
function validateCodeFlowManifest3(manifest, record) {
  if (!manifest || manifest.schema_version !== "flow_manifest.v0.3")
    return errorResponse("PM_TASKING_CODE_FLOW_NOT_FOUND", "Code flow manifest not found", 404);
  if (manifest.type !== "code_flow" || manifest.flow_id !== record.source_specification.code_flow_id)
    return errorResponse("PM_TASKING_CODE_FLOW_REQUIRED", "PM tasking target must be a code_flow", 409);
  return validateExpectedPlanArtifact(manifest, record.output_artifacts.plan);
}
__name(validateCodeFlowManifest3, "validateCodeFlowManifest");
function buildTaskingId(planId, idempotencyKey) {
  return `${safeFilePart6(planId, 90)}-${safeFilePart6(idempotencyKey, 36)}`;
}
__name(buildTaskingId, "buildTaskingId");
function buildTaskingMarkdown(record, taskingId, title, taskingBody) {
  return `# ${title}

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## PM Tasking Boundary

This is a PM tasking / work-order artifact derived from an audited PM plan. It defines requested work, acceptance criteria, evidence requirements, risks, and boundaries.

It is not Coder implementation decomposition, not Coder handoff, not Helper execution, not implementation authorization, not certification, and not a production-readiness claim.

## Source Chain

- tasking_id: ${taskingId}
- plan_id: ${record.plan_id}
- specification_id: ${record.source_specification.specification_id}
- intake_id: ${record.source_specification.intake_id}
- handoff_id: ${record.source_specification.handoff_id}
- code_flow_id: ${record.source_specification.code_flow_id}
- source_share_id: ${record.source_specification.share_id}
- source_science_flow_id: ${record.source_specification.science_flow_id}
- share_packet_hash: ${record.source_specification.share_packet_hash}
- submitted_share_payload_hash: ${record.source_specification.submitted_share_payload_hash || record.source_specification.share_packet_hash}
- handoff_payload_hash: ${record.source_specification.handoff_payload_hash}
- intake_payload_hash: ${record.source_specification.intake_payload_hash}
- specification_payload_hash: ${record.source_specification.specification_payload_hash}
- plan_payload_hash: ${record.submitted_payload_hash}
- evidence_level: ${record.source_specification.evidence_level}
- uncertainty: ${record.source_specification.uncertainty}

## PM Tasking Body

${taskingBody}

## Hard Forbidden Claims

${record.source_specification.forbidden_claims.map((claim) => `- ${claim}`).join("\n")}

## Source Artifacts

${record.source_specification.resolved_source_artifacts.map((item) => `- ${item.artifact_type}: ${item.artifact_id} (${item.source_path})`).join("\n")}

## Non-Laundering Rule

PM tasking remains downstream of diagnostic evidence. Coder work plan, Coder implementation decomposition, Coder handoff, Helper execution, and promotion require later gated stages and Human approval.
`;
}
__name(buildTaskingMarkdown, "buildTaskingMarkdown");
async function writeCodeFlowArtifact4(request, env, flowId, projectName7, artifactType, title, body, store) {
  const url = new URL(request.url);
  const artifactRequest = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, {
    method: "POST",
    headers: jsonHeaders6(request),
    body: JSON.stringify({ project: projectName7, artifact_type: artifactType, title, body })
  });
  const response = await handleFlowsRequest(artifactRequest, env, flowId, "artifacts", store);
  const parsed = await parseJsonResponse5(response);
  if (!response.ok)
    return jsonResponse(parsed, response.status);
  const artifact = parsed.artifact;
  if (!artifact)
    return errorResponse("PM_TASKING_ARTIFACT_WRITE_FAILED", `Artifact write did not return summary for ${artifactType}`, 500);
  return artifact;
}
__name(writeCodeFlowArtifact4, "writeCodeFlowArtifact");
async function loadTaskingIndex(env, projectName7, store) {
  const existing = await fetchJsonIfExists5(env, projectName7, pmTaskingContextIndexPath(), store);
  if (existing && existing.schema_version === "pm_tasking_context_index.v0.1" && Array.isArray(existing.entries))
    return existing;
  return { schema_version: "pm_tasking_context_index.v0.1", project: projectName7, updated_at: utcIso6(), entries: [] };
}
__name(loadTaskingIndex, "loadTaskingIndex");
function upsertTaskingIndex(index, record) {
  const entry = {
    tasking_id: record.tasking_id,
    plan_id: record.source_plan.plan_id,
    specification_id: record.source_plan.specification_id,
    intake_id: record.source_plan.intake_id,
    handoff_id: record.source_plan.handoff_id,
    code_flow_id: record.source_plan.code_flow_id,
    share_id: record.source_plan.share_id,
    science_flow_id: record.source_plan.science_flow_id,
    share_packet_hash: record.source_plan.share_packet_hash,
    evidence_level: record.source_plan.evidence_level,
    uncertainty: record.source_plan.uncertainty,
    pm_tasking_record_path: record.pm_tasking_record_path,
    created_at: record.created_at
  };
  const existing = index.entries.findIndex((item) => item.tasking_id === record.tasking_id);
  if (existing >= 0)
    index.entries[existing] = entry;
  else
    index.entries.push(entry);
  index.updated_at = utcIso6();
  index.entries.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}
__name(upsertTaskingIndex, "upsertTaskingIndex");
async function handlePmTaskingRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "PM_AI")
      return errorResponse("PM_TASKING_ROLE_FORBIDDEN", "Only PM_AI may create PM tasking artifacts", 403);
    if (request.method !== "POST")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const url = new URL(request.url);
    const body = await readJsonBody7(request);
    const projectName7 = projectNameFrom7(url, body);
    const project = getProject(projectName7);
    if (!project)
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
    const idempotencyKey = requireString10(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(idempotencyKey)) {
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    }
    const taskingTitle = requireString10(body.tasking_title, "tasking_title");
    const taskingBody = requireString10(body.tasking_body, "tasking_body");
    const bodyError = validateTaskingBody(taskingBody);
    if (bodyError)
      return bodyError;
    const planEntry = await loadPMPlanContextEntry(env, projectName7, body, repoStore);
    const planRecord = await fetchJsonIfExists5(env, projectName7, planEntry.pm_plan_record_path, repoStore);
    if (!planRecord)
      return errorResponse("PM_TASKING_PLAN_RECORD_NOT_FOUND", `No PM plan record found for ${planEntry.plan_id}`, 404);
    if (planRecord.plan_id !== planEntry.plan_id || planRecord.pm_plan_record_path !== planEntry.pm_plan_record_path) {
      return errorResponse("PM_TASKING_PLAN_CONTEXT_MISMATCH", "PM plan record does not match generated PM plan context", 409);
    }
    const planError = validatePlanRecord(planRecord);
    if (planError)
      return planError;
    const codeFlowManifest = await fetchJsonIfExists5(env, projectName7, flowManifestPath6(planRecord.source_specification.code_flow_id), repoStore);
    const codeFlowError = validateCodeFlowManifest3(codeFlowManifest, planRecord);
    if (codeFlowError)
      return codeFlowError;
    const taskingId = buildTaskingId(planRecord.plan_id, idempotencyKey);
    const payloadHash = await sha256Hex6(JSON.stringify({
      project: projectName7,
      idempotency_key: idempotencyKey,
      plan_id: planRecord.plan_id,
      pm_plan_record_path: planRecord.pm_plan_record_path,
      plan_payload_hash: planRecord.submitted_payload_hash,
      share_packet_hash: planRecord.source_specification.share_packet_hash,
      tasking_title: taskingTitle,
      tasking_body: taskingBody
    }));
    const recordPath6 = pmTaskingRecordPath(taskingId);
    const existingRecord = await fetchJsonIfExists5(env, projectName7, recordPath6, repoStore);
    if (existingRecord && existingRecord.schema_version === "pm_tasking_context.v0.1") {
      if (existingRecord.submitted_payload_hash !== payloadHash) {
        return errorResponse("PM_TASKING_IDEMPOTENCY_CONFLICT", "Existing PM tasking idempotency record exists but submitted payload hash does not match", 409);
      }
      return jsonResponse({ ok: true, idempotent_replay: true, tasking: existingRecord, required_status_labels: requiredStatusLabels8() }, 200);
    }
    const taskingArtifact = await writeCodeFlowArtifact4(
      request,
      env,
      planRecord.source_specification.code_flow_id,
      projectName7,
      "pm_tasking",
      taskingTitle,
      buildTaskingMarkdown(planRecord, taskingId, taskingTitle, taskingBody),
      repoStore
    );
    if (taskingArtifact instanceof Response)
      return taskingArtifact;
    const createdAt = utcIso6();
    const record = {
      schema_version: "pm_tasking_context.v0.1",
      official_artifact: true,
      project: projectName7,
      tasking_id: taskingId,
      idempotency_key: idempotencyKey,
      created_at: createdAt,
      created_by_role: "PM_AI",
      source_plan: {
        plan_id: planRecord.plan_id,
        pm_plan_record_path: planRecord.pm_plan_record_path,
        code_flow_id: planRecord.source_specification.code_flow_id,
        specification_id: planRecord.source_specification.specification_id,
        intake_id: planRecord.source_specification.intake_id,
        handoff_id: planRecord.source_specification.handoff_id,
        share_id: planRecord.source_specification.share_id,
        science_flow_id: planRecord.source_specification.science_flow_id,
        share_packet_hash: planRecord.source_specification.share_packet_hash,
        submitted_share_payload_hash: planRecord.source_specification.submitted_share_payload_hash,
        handoff_payload_hash: planRecord.source_specification.handoff_payload_hash,
        intake_payload_hash: planRecord.source_specification.intake_payload_hash,
        specification_payload_hash: planRecord.source_specification.specification_payload_hash,
        plan_payload_hash: planRecord.submitted_payload_hash,
        evidence_level: planRecord.source_specification.evidence_level,
        uncertainty: planRecord.source_specification.uncertainty,
        source_artifacts: planRecord.source_specification.source_artifacts,
        resolved_source_artifacts: planRecord.source_specification.resolved_source_artifacts,
        allowed_claims: planRecord.source_specification.allowed_claims,
        forbidden_claims: planRecord.source_specification.forbidden_claims
      },
      output_artifacts: { pm_tasking: taskingArtifact },
      submitted_payload_hash: payloadHash,
      pm_tasking_record_path: recordPath6,
      generated_pm_tasking_context_path: pmTaskingContextIndexPath(),
      required_status_labels: requiredStatusLabels8()
    };
    const index = await loadTaskingIndex(env, projectName7, repoStore);
    upsertTaskingIndex(index, record);
    const indexWrite = await writeJson5(env, projectName7, pmTaskingContextIndexPath(), index, `Update PM tasking context ${taskingId}`, repoStore);
    record.generated_pm_tasking_context_sha = indexWrite.sha;
    const recordWrite = await writeJson5(env, projectName7, recordPath6, record, `Write PM tasking record ${taskingId}`, repoStore);
    return jsonResponse({ ok: true, idempotent_replay: false, project: projectName7, tasking: { ...record, pm_tasking_record_sha: recordWrite.sha }, required_status_labels: requiredStatusLabels8() }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("No PM plan context entry"))
      return errorResponse("PM_TASKING_PLAN_CONTEXT_NOT_FOUND", message, 404);
    if (message.includes("PM plan context index is missing"))
      return errorResponse("PM_TASKING_PLAN_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handlePmTaskingRequest, "handlePmTaskingRequest");

// src/coder_work_plan.ts
function requiredStatusLabels9() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels9, "requiredStatusLabels");
function optionalString10(value) {
  return typeof value === "string" ? value.trim() : "";
}
__name(optionalString10, "optionalString");
function requireString11(value, field) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Invalid or missing field: ${field}`);
  return value.trim();
}
__name(requireString11, "requireString");
function projectNameFrom8(url, body) {
  return optionalString10(body.project) || optionalString10(url.searchParams.get("project")) || "ArqonZero";
}
__name(projectNameFrom8, "projectNameFrom");
function utcIso7() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(utcIso7, "utcIso");
function safeFilePart7(value, max = 96) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safeFilePart7, "safeFilePart");
function formatJson8(value) {
  return `${JSON.stringify(value, null, 2)}
`;
}
__name(formatJson8, "formatJson");
function contextIndexPath() {
  return "governance/context/generated_pm_tasking_context.json";
}
__name(contextIndexPath, "contextIndexPath");
function workPlanIndexPath() {
  return "governance/context/generated_coder_work_plan_context.json";
}
__name(workPlanIndexPath, "workPlanIndexPath");
function recordPath(id) {
  return `governance/context/coder_work_plan/${id}.json`;
}
__name(recordPath, "recordPath");
function manifestPath(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(manifestPath, "manifestPath");
function labelsOk(labels3) {
  return Array.isArray(labels3) && requiredStatusLabels9().every((label) => labels3.includes(label));
}
__name(labelsOk, "labelsOk");
async function readBody(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Missing or invalid JSON body");
  return body;
}
__name(readBody, "readBody");
async function readJson(env, projectName7, path, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, path);
    return JSON.parse(file.content);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404"))
      return null;
    throw err;
  }
}
__name(readJson, "readJson");
async function writeJson6(env, projectName7, path, value, message, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  return await store.writeFile(env, project, path, formatJson8(value), message);
}
__name(writeJson6, "writeJson");
async function sha256Hex7(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex7, "sha256Hex");
async function parseJsonResponse6(response) {
  const text = await response.text();
  if (!text)
    return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
__name(parseJsonResponse6, "parseJsonResponse");
function jsonHeaders7(request) {
  const headers = new Headers();
  const auth = request.headers.get("authorization") || "";
  if (auth)
    headers.set("authorization", auth);
  headers.set("content-type", "application/json");
  return headers;
}
__name(jsonHeaders7, "jsonHeaders");
function normalizeClaimText4(value) {
  return value.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}
__name(normalizeClaimText4, "normalizeClaimText");
function validateWorkPlanBody(body) {
  const normalized = normalizeClaimText4(body);
  const promotion = [
    [/\bsealed test certified\b/, "sealed-test certified"],
    [/\bcertified\b/, "certified"],
    [/\bcertification\b/, "certification"],
    [/\bproduction ready\b/, "production ready"],
    [/\bproduction readiness\b/, "production readiness"],
    [/\bready for production\b/, "ready for production"],
    [/\bproduct ready\b/, "product ready"],
    [/\bpromotable\b/, "promotable"],
    [/\bapproved for release\b/, "approved for release"],
    [/\brelease ready\b/, "release ready"]
  ];
  const foundPromotion = promotion.find(([pattern]) => pattern.test(normalized));
  if (foundPromotion)
    return errorResponse("CODER_WORK_PLAN_FORBIDDEN_CLAIM_INCLUDED", `Coder work plan contains forbidden promotion language: ${foundPromotion[1]}`, 409);
  const execution = [
    [/\bhelper may execute\b/, "helper may execute"],
    [/\bhelper can execute\b/, "helper can execute"],
    [/\bexecution is authorized\b/, "execution is authorized"],
    [/\bauthorized for execution\b/, "authorized for execution"],
    [/\bapply the patch\b/, "apply the patch"],
    [/\bcreate and apply the patch\b/, "create and apply the patch"],
    [/\bdeploy now\b/, "deploy now"],
    [/\bno further review required\b/, "no further review required"],
    [/\bimplementation complete\b/, "implementation complete"],
    [/\bready for helper execution\b/, "ready for helper execution"]
  ];
  const foundExecution = execution.find(([pattern]) => pattern.test(normalized));
  if (foundExecution)
    return errorResponse("CODER_WORK_PLAN_EXECUTION_AUTHORITY_FORBIDDEN", `Coder work plan may not authorize Helper execution or completion: ${foundExecution[1]}`, 409);
  return null;
}
__name(validateWorkPlanBody, "validateWorkPlanBody");
async function loadTaskingEntry(env, projectName7, body, store) {
  const taskingId = optionalString10(body.tasking_id);
  const taskingPath = optionalString10(body.pm_tasking_record_path);
  if (!taskingId && !taskingPath)
    throw new Error("Invalid or missing field: tasking_id or pm_tasking_record_path");
  const index = await readJson(env, projectName7, contextIndexPath(), store);
  if (!index || index.schema_version !== "pm_tasking_context_index.v0.1" || !Array.isArray(index.entries))
    throw new Error("PM tasking context index is missing or invalid");
  const entry = index.entries.find((item) => taskingId && item.tasking_id === taskingId || taskingPath && item.pm_tasking_record_path === taskingPath);
  if (!entry)
    throw new Error(`No PM tasking context entry found for ${taskingId || taskingPath}`);
  return { tasking_id: entry.tasking_id, pm_tasking_record_path: entry.pm_tasking_record_path };
}
__name(loadTaskingEntry, "loadTaskingEntry");
function validateTaskingRecord(record) {
  if (record.schema_version !== "pm_tasking_context.v0.1")
    return errorResponse("CODER_WORK_PLAN_INVALID_TASKING_RECORD", "PM tasking record schema is invalid", 409);
  if (record.official_artifact !== true || record.created_by_role !== "PM_AI")
    return errorResponse("CODER_WORK_PLAN_INVALID_TASKING_AUTHORITY", "PM tasking record is not official PM tasking", 409);
  if (!record.source_plan || !record.output_artifacts?.pm_tasking)
    return errorResponse("CODER_WORK_PLAN_TASKING_INCOMPLETE", "PM tasking record is incomplete", 409);
  if (!record.source_plan.share_packet_hash || !record.source_plan.uncertainty)
    return errorResponse("CODER_WORK_PLAN_SOURCE_BOUNDARY_REQUIRED", "PM tasking record must preserve share hash and uncertainty", 409);
  if (!Array.isArray(record.source_plan.forbidden_claims) || record.source_plan.forbidden_claims.length === 0)
    return errorResponse("CODER_WORK_PLAN_FORBIDDEN_CLAIMS_REQUIRED", "PM tasking record must preserve forbidden claims", 409);
  if (!Array.isArray(record.source_plan.resolved_source_artifacts) || record.source_plan.resolved_source_artifacts.length === 0)
    return errorResponse("CODER_WORK_PLAN_RESOLVED_SOURCES_REQUIRED", "PM tasking record must preserve resolved source metadata", 409);
  if (!labelsOk(record.required_status_labels))
    return errorResponse("CODER_WORK_PLAN_STATUS_LABELS_REQUIRED", "PM tasking record is missing required diagnostic status labels", 409);
  return null;
}
__name(validateTaskingRecord, "validateTaskingRecord");
function validateManifest(manifest, record) {
  if (!manifest || manifest.schema_version !== "flow_manifest.v0.3")
    return errorResponse("CODER_WORK_PLAN_CODE_FLOW_NOT_FOUND", "Code flow manifest not found", 404);
  if (manifest.type !== "code_flow" || manifest.flow_id !== record.source_plan.code_flow_id)
    return errorResponse("CODER_WORK_PLAN_CODE_FLOW_REQUIRED", "Coder work plan target must be a code_flow", 409);
  const expected = record.output_artifacts.pm_tasking;
  const actual = (manifest.artifacts || []).find((artifact) => artifact.artifact_id === expected.artifact_id);
  if (!actual)
    return errorResponse("CODER_WORK_PLAN_TASKING_ARTIFACT_NOT_ON_CODE_FLOW", `Code flow does not contain required pm_tasking artifact ${expected.artifact_id}`, 409);
  if (actual.artifact_type !== "pm_tasking" || actual.role !== "PM_AI")
    return errorResponse("CODER_WORK_PLAN_TASKING_ARTIFACT_TYPE_MISMATCH", `Expected pm_tasking by PM_AI for ${expected.artifact_id}`, 409);
  if (actual.source_path !== expected.source_path)
    return errorResponse("CODER_WORK_PLAN_TASKING_ARTIFACT_SOURCE_MISMATCH", `PM tasking artifact source path mismatch for ${expected.artifact_id}`, 409);
  return null;
}
__name(validateManifest, "validateManifest");
function buildMarkdown(record, id, title, workPlanBody) {
  const sourceArtifacts = record.source_plan.resolved_source_artifacts.map((item) => `- ${item.artifact_type}: ${item.artifact_id} (${item.source_path})`).join("\n");
  const forbiddenClaims = record.source_plan.forbidden_claims.map((claim) => `- ${claim}`).join("\n");
  return `# ${title}

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Coder Work Plan Boundary

This is a Coder-owned engineering interpretation and decomposition proposal derived from PM tasking. It is not an implementation bundle, not a patch, not a Coder handoff, not Helper execution authorization, not certification, and not a production-readiness claim.

## Source Chain

- coder_work_plan_id: ${id}
- tasking_id: ${record.tasking_id}
- plan_id: ${record.source_plan.plan_id}
- specification_id: ${record.source_plan.specification_id}
- intake_id: ${record.source_plan.intake_id}
- handoff_id: ${record.source_plan.handoff_id}
- code_flow_id: ${record.source_plan.code_flow_id}
- source_share_id: ${record.source_plan.share_id}
- source_science_flow_id: ${record.source_plan.science_flow_id}
- share_packet_hash: ${record.source_plan.share_packet_hash}
- tasking_payload_hash: ${record.submitted_payload_hash}
- evidence_level: ${record.source_plan.evidence_level}
- uncertainty: ${record.source_plan.uncertainty}

## Coder Work Plan Body

${workPlanBody}

## Hard Forbidden Claims

${forbiddenClaims}

## Source Artifacts

${sourceArtifacts}

## Non-Laundering Rule

Coder work plan remains downstream of diagnostic evidence and PM tasking. Implementation bundle, Coder handoff, Helper execution, and promotion require later gated stages and Human approval.
`;
}
__name(buildMarkdown, "buildMarkdown");
async function writeArtifact2(request, env, flowId, projectName7, title, content, store) {
  const url = new URL(request.url);
  const response = await handleFlowsRequest(new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, {
    method: "POST",
    headers: jsonHeaders7(request),
    body: JSON.stringify({ project: projectName7, artifact_type: "coder_work_plan", title, body: content })
  }), env, flowId, "artifacts", store);
  const parsed = await parseJsonResponse6(response);
  if (!response.ok)
    return jsonResponse(parsed, response.status);
  if (!parsed.artifact)
    return errorResponse("CODER_WORK_PLAN_ARTIFACT_WRITE_FAILED", "Artifact write did not return summary for coder_work_plan", 500);
  return parsed.artifact;
}
__name(writeArtifact2, "writeArtifact");
async function loadIndex(env, projectName7, store) {
  const existing = await readJson(env, projectName7, workPlanIndexPath(), store);
  if (existing?.schema_version === "coder_work_plan_context_index.v0.1" && Array.isArray(existing.entries))
    return existing;
  return { schema_version: "coder_work_plan_context_index.v0.1", project: projectName7, updated_at: utcIso7(), entries: [] };
}
__name(loadIndex, "loadIndex");
async function handleCoderWorkPlanRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "CODER_AI")
      return errorResponse("CODER_WORK_PLAN_ROLE_FORBIDDEN", "Only CODER_AI may create Coder work plan artifacts", 403);
    if (request.method !== "POST")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const url = new URL(request.url);
    const body = await readBody(request);
    const projectName7 = projectNameFrom8(url, body);
    if (!getProject(projectName7))
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
    const idempotencyKey = requireString11(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(idempotencyKey))
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    const title = requireString11(body.work_plan_title, "work_plan_title");
    const workPlanBody = requireString11(body.work_plan_body, "work_plan_body");
    const bodyError = validateWorkPlanBody(workPlanBody);
    if (bodyError)
      return bodyError;
    const entry = await loadTaskingEntry(env, projectName7, body, repoStore);
    const tasking = await readJson(env, projectName7, entry.pm_tasking_record_path, repoStore);
    if (!tasking)
      return errorResponse("CODER_WORK_PLAN_TASKING_RECORD_NOT_FOUND", `No PM tasking record found for ${entry.tasking_id}`, 404);
    if (tasking.tasking_id !== entry.tasking_id || tasking.pm_tasking_record_path !== entry.pm_tasking_record_path)
      return errorResponse("CODER_WORK_PLAN_TASKING_CONTEXT_MISMATCH", "PM tasking record does not match generated PM tasking context", 409);
    const taskingError = validateTaskingRecord(tasking);
    if (taskingError)
      return taskingError;
    const manifestError = validateManifest(await readJson(env, projectName7, manifestPath(tasking.source_plan.code_flow_id), repoStore), tasking);
    if (manifestError)
      return manifestError;
    const workPlanId = `${safeFilePart7(tasking.tasking_id, 90)}-${safeFilePart7(idempotencyKey, 36)}`;
    const submittedPayloadHash = await sha256Hex7(JSON.stringify({ project: projectName7, idempotency_key: idempotencyKey, tasking_id: tasking.tasking_id, pm_tasking_record_path: tasking.pm_tasking_record_path, tasking_payload_hash: tasking.submitted_payload_hash, share_packet_hash: tasking.source_plan.share_packet_hash, work_plan_title: title, work_plan_body: workPlanBody }));
    const existing = await readJson(env, projectName7, recordPath(workPlanId), repoStore);
    if (existing?.schema_version === "coder_work_plan_context.v0.1") {
      if (existing.submitted_payload_hash !== submittedPayloadHash)
        return errorResponse("CODER_WORK_PLAN_IDEMPOTENCY_CONFLICT", "Existing Coder work plan idempotency record exists but submitted payload hash does not match", 409);
      return jsonResponse({ ok: true, idempotent_replay: true, coder_work_plan: existing, required_status_labels: requiredStatusLabels9() }, 200);
    }
    const artifact = await writeArtifact2(request, env, tasking.source_plan.code_flow_id, projectName7, title, buildMarkdown(tasking, workPlanId, title, workPlanBody), repoStore);
    if (artifact instanceof Response)
      return artifact;
    const createdAt = utcIso7();
    const record = {
      schema_version: "coder_work_plan_context.v0.1",
      official_artifact: true,
      project: projectName7,
      coder_work_plan_id: workPlanId,
      idempotency_key: idempotencyKey,
      created_at: createdAt,
      created_by_role: "CODER_AI",
      source_tasking: {
        tasking_id: tasking.tasking_id,
        pm_tasking_record_path: tasking.pm_tasking_record_path,
        code_flow_id: tasking.source_plan.code_flow_id,
        plan_id: tasking.source_plan.plan_id,
        specification_id: tasking.source_plan.specification_id,
        intake_id: tasking.source_plan.intake_id,
        handoff_id: tasking.source_plan.handoff_id,
        share_id: tasking.source_plan.share_id,
        science_flow_id: tasking.source_plan.science_flow_id,
        share_packet_hash: tasking.source_plan.share_packet_hash,
        submitted_share_payload_hash: tasking.source_plan.submitted_share_payload_hash,
        handoff_payload_hash: tasking.source_plan.handoff_payload_hash,
        intake_payload_hash: tasking.source_plan.intake_payload_hash,
        specification_payload_hash: tasking.source_plan.specification_payload_hash,
        plan_payload_hash: tasking.source_plan.plan_payload_hash,
        tasking_payload_hash: tasking.submitted_payload_hash,
        evidence_level: tasking.source_plan.evidence_level,
        uncertainty: tasking.source_plan.uncertainty,
        source_artifacts: tasking.source_plan.source_artifacts,
        resolved_source_artifacts: tasking.source_plan.resolved_source_artifacts,
        allowed_claims: tasking.source_plan.allowed_claims,
        forbidden_claims: tasking.source_plan.forbidden_claims
      },
      output_artifacts: { coder_work_plan: artifact },
      submitted_payload_hash: submittedPayloadHash,
      coder_work_plan_record_path: recordPath(workPlanId),
      generated_coder_work_plan_context_path: workPlanIndexPath(),
      required_status_labels: requiredStatusLabels9()
    };
    const index = await loadIndex(env, projectName7, repoStore);
    const entryOut = { coder_work_plan_id: workPlanId, tasking_id: tasking.tasking_id, plan_id: tasking.source_plan.plan_id, specification_id: tasking.source_plan.specification_id, intake_id: tasking.source_plan.intake_id, handoff_id: tasking.source_plan.handoff_id, code_flow_id: tasking.source_plan.code_flow_id, share_id: tasking.source_plan.share_id, science_flow_id: tasking.source_plan.science_flow_id, share_packet_hash: tasking.source_plan.share_packet_hash, evidence_level: tasking.source_plan.evidence_level, uncertainty: tasking.source_plan.uncertainty, coder_work_plan_record_path: record.coder_work_plan_record_path, created_at: createdAt };
    const pos = index.entries.findIndex((item) => item.coder_work_plan_id === workPlanId);
    if (pos >= 0)
      index.entries[pos] = entryOut;
    else
      index.entries.push(entryOut);
    index.updated_at = utcIso7();
    index.entries.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    const indexWrite = await writeJson6(env, projectName7, workPlanIndexPath(), index, `Update Coder work plan context ${workPlanId}`, repoStore);
    record.generated_coder_work_plan_context_sha = indexWrite.sha;
    const recordWrite = await writeJson6(env, projectName7, record.coder_work_plan_record_path, record, `Write Coder work plan record ${workPlanId}`, repoStore);
    return jsonResponse({ ok: true, idempotent_replay: false, project: projectName7, coder_work_plan: { ...record, coder_work_plan_record_sha: recordWrite.sha }, required_status_labels: requiredStatusLabels9() }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("No PM tasking context entry") || message.includes("PM tasking context index is missing"))
      return errorResponse("CODER_WORK_PLAN_TASKING_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleCoderWorkPlanRequest, "handleCoderWorkPlanRequest");

// src/coder_tasks.ts
function requiredStatusLabels10() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels10, "requiredStatusLabels");
function optionalString11(value) {
  return typeof value === "string" ? value.trim() : "";
}
__name(optionalString11, "optionalString");
function requireString12(value, field) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Invalid or missing field: ${field}`);
  return value.trim();
}
__name(requireString12, "requireString");
function getParam10(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam10, "getParam");
function projectNameFrom9(url, body) {
  const fromBody = body ? optionalString11(body.project) : "";
  const fromQuery = getParam10(url, "project") || "";
  return fromBody || fromQuery || "ArqonZero";
}
__name(projectNameFrom9, "projectNameFrom");
function utcIso8() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(utcIso8, "utcIso");
function safeFilePart8(value, max = 96) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safeFilePart8, "safeFilePart");
function formatJson9(value) {
  return `${JSON.stringify(value, null, 2)}
`;
}
__name(formatJson9, "formatJson");
function authorizationHeader6(request) {
  return request.headers.get("authorization") || "";
}
__name(authorizationHeader6, "authorizationHeader");
function jsonHeaders8(request) {
  const headers = new Headers();
  const auth = authorizationHeader6(request);
  if (auth)
    headers.set("authorization", auth);
  headers.set("content-type", "application/json");
  return headers;
}
__name(jsonHeaders8, "jsonHeaders");
function coderWorkPlanContextIndexPath() {
  return "governance/context/generated_coder_work_plan_context.json";
}
__name(coderWorkPlanContextIndexPath, "coderWorkPlanContextIndexPath");
function coderTasksContextIndexPath() {
  return "governance/context/generated_coder_tasks_context.json";
}
__name(coderTasksContextIndexPath, "coderTasksContextIndexPath");
function coderTasksRecordPath(coderTasksId) {
  return `governance/context/coder_tasks/${coderTasksId}.json`;
}
__name(coderTasksRecordPath, "coderTasksRecordPath");
function flowManifestPath7(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(flowManifestPath7, "flowManifestPath");
async function readJsonBody8(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Missing or invalid JSON body");
  return body;
}
__name(readJsonBody8, "readJsonBody");
async function fetchJsonIfExists6(env, projectName7, path, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, path);
    return JSON.parse(file.content);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404"))
      return null;
    throw err;
  }
}
__name(fetchJsonIfExists6, "fetchJsonIfExists");
async function writeJson7(env, projectName7, path, value, message, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  return await store.writeFile(env, project, path, formatJson9(value), message);
}
__name(writeJson7, "writeJson");
async function parseJsonResponse7(response) {
  const text = await response.text();
  if (!text)
    return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
__name(parseJsonResponse7, "parseJsonResponse");
async function sha256Hex8(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex8, "sha256Hex");
function hasRequiredLabels5(labels3) {
  return requiredStatusLabels10().every((label) => Array.isArray(labels3) && labels3.includes(label));
}
__name(hasRequiredLabels5, "hasRequiredLabels");
function normalizeClaimText5(value) {
  return value.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}
__name(normalizeClaimText5, "normalizeClaimText");
function validateCoderTasksBody(body) {
  const normalized = normalizeClaimText5(body);
  const forbiddenPromotion = [
    [/\bsealed test certified\b/, "sealed-test certified"],
    [/\bcertified\b/, "certified"],
    [/\bcertification\b/, "certification"],
    [/\bproduction ready\b/, "production ready"],
    [/\bproduction readiness\b/, "production readiness"],
    [/\bready for production\b/, "ready for production"],
    [/\bproduct ready\b/, "product ready"],
    [/\bpromotable\b/, "promotable"],
    [/\bapproved for release\b/, "approved for release"],
    [/\brelease ready\b/, "release ready"]
  ];
  const promotion = forbiddenPromotion.find(([pattern]) => pattern.test(normalized));
  if (promotion) {
    return errorResponse("CODER_TASKS_FORBIDDEN_CLAIM_INCLUDED", `Coder tasks contains forbidden promotion language: ${promotion[1]}`, 409);
  }
  const forbiddenExecutionAuthority = [
    [/\bhelper may execute\b/, "helper may execute"],
    [/\bhelper can execute\b/, "helper can execute"],
    [/\bexecution is authorized\b/, "execution is authorized"],
    [/\bauthorized for execution\b/, "authorized for execution"],
    [/\bapply the patch\b/, "apply the patch"],
    [/\bcreate and apply the patch\b/, "create and apply the patch"],
    [/\bdeploy now\b/, "deploy now"],
    [/\bno further review required\b/, "no further review required"],
    [/\bimplementation complete\b/, "implementation complete"],
    [/\bready for helper execution\b/, "ready for helper execution"]
  ];
  const executionAuthority = forbiddenExecutionAuthority.find(([pattern]) => pattern.test(normalized));
  if (executionAuthority) {
    return errorResponse(
      "CODER_TASKS_EXECUTION_AUTHORITY_FORBIDDEN",
      `Coder tasks may not authorize Helper execution or completion: ${executionAuthority[1]}`,
      409
    );
  }
  return null;
}
__name(validateCoderTasksBody, "validateCoderTasksBody");
async function loadCoderWorkPlanContextEntry(env, projectName7, body, store) {
  const coderWorkPlanId = optionalString11(body.coder_work_plan_id);
  const coderWorkPlanRecordPath = optionalString11(body.coder_work_plan_record_path);
  if (!coderWorkPlanId && !coderWorkPlanRecordPath)
    throw new Error("Invalid or missing field: coder_work_plan_id or coder_work_plan_record_path");
  const index = await fetchJsonIfExists6(env, projectName7, coderWorkPlanContextIndexPath(), store);
  if (!index || index.schema_version !== "coder_work_plan_context_index.v0.1" || !Array.isArray(index.entries)) {
    throw new Error("Coder work plan context index is missing or invalid");
  }
  const entry = index.entries.find(
    (item) => coderWorkPlanId && item.coder_work_plan_id === coderWorkPlanId || coderWorkPlanRecordPath && item.coder_work_plan_record_path === coderWorkPlanRecordPath
  );
  if (!entry)
    throw new Error(`No Coder work plan context entry found for ${coderWorkPlanId || coderWorkPlanRecordPath}`);
  return { coder_work_plan_id: entry.coder_work_plan_id, coder_work_plan_record_path: entry.coder_work_plan_record_path };
}
__name(loadCoderWorkPlanContextEntry, "loadCoderWorkPlanContextEntry");
function artifactById4(manifest, artifactId) {
  return manifest.artifacts.find((artifact) => artifact.artifact_id === artifactId) || null;
}
__name(artifactById4, "artifactById");
function validateExpectedCoderWorkPlanArtifact(manifest, expected) {
  const actual = artifactById4(manifest, expected.artifact_id);
  if (!actual)
    return errorResponse("CODER_TASKS_WORK_PLAN_ARTIFACT_NOT_ON_CODE_FLOW", `Code flow does not contain required coder_work_plan artifact ${expected.artifact_id}`, 409);
  if (actual.artifact_type !== "coder_work_plan" || actual.role !== "CODER_AI") {
    return errorResponse("CODER_TASKS_WORK_PLAN_ARTIFACT_TYPE_MISMATCH", `Expected coder_work_plan by CODER_AI for ${expected.artifact_id}`, 409);
  }
  if (actual.source_path !== expected.source_path) {
    return errorResponse("CODER_TASKS_WORK_PLAN_ARTIFACT_SOURCE_MISMATCH", `Coder work plan artifact source path mismatch for ${expected.artifact_id}`, 409);
  }
  return null;
}
__name(validateExpectedCoderWorkPlanArtifact, "validateExpectedCoderWorkPlanArtifact");
function validateCoderWorkPlanRecord(record) {
  if (record.schema_version !== "coder_work_plan_context.v0.1")
    return errorResponse("CODER_TASKS_INVALID_WORK_PLAN_RECORD", "Coder work plan record schema is invalid", 409);
  if (record.official_artifact !== true || record.created_by_role !== "CODER_AI")
    return errorResponse("CODER_TASKS_INVALID_WORK_PLAN_AUTHORITY", "Coder work plan record is not official Coder work plan", 409);
  if (!record.source_tasking || !record.output_artifacts)
    return errorResponse("CODER_TASKS_WORK_PLAN_INCOMPLETE", "Coder work plan record is missing source tasking or output artifacts", 409);
  if (!record.source_tasking.share_packet_hash || !record.source_tasking.uncertainty)
    return errorResponse("CODER_TASKS_SOURCE_BOUNDARY_REQUIRED", "Coder work plan record must preserve share hash and uncertainty", 409);
  if (!record.source_tasking.forbidden_claims || record.source_tasking.forbidden_claims.length === 0)
    return errorResponse("CODER_TASKS_FORBIDDEN_CLAIMS_REQUIRED", "Coder work plan record must preserve forbidden claims", 409);
  if (!record.source_tasking.resolved_source_artifacts || record.source_tasking.resolved_source_artifacts.length === 0)
    return errorResponse("CODER_TASKS_RESOLVED_SOURCES_REQUIRED", "Coder work plan record must preserve resolved source metadata", 409);
  if (!record.output_artifacts.coder_work_plan)
    return errorResponse("CODER_TASKS_WORK_PLAN_ARTIFACT_REQUIRED", "Coder work plan record must include coder_work_plan artifact", 409);
  if (!hasRequiredLabels5(record.required_status_labels))
    return errorResponse("CODER_TASKS_STATUS_LABELS_REQUIRED", "Coder work plan record is missing required diagnostic status labels", 409);
  return null;
}
__name(validateCoderWorkPlanRecord, "validateCoderWorkPlanRecord");
function validateCodeFlowManifest4(manifest, record) {
  if (!manifest || manifest.schema_version !== "flow_manifest.v0.3")
    return errorResponse("CODER_TASKS_CODE_FLOW_NOT_FOUND", "Code flow manifest not found", 404);
  if (manifest.type !== "code_flow" || manifest.flow_id !== record.source_tasking.code_flow_id)
    return errorResponse("CODER_TASKS_CODE_FLOW_REQUIRED", "Coder tasks target must be a code_flow", 409);
  return validateExpectedCoderWorkPlanArtifact(manifest, record.output_artifacts.coder_work_plan);
}
__name(validateCodeFlowManifest4, "validateCodeFlowManifest");
function buildCoderTasksId(coderWorkPlanId, idempotencyKey) {
  return `${safeFilePart8(coderWorkPlanId, 90)}-${safeFilePart8(idempotencyKey, 36)}`;
}
__name(buildCoderTasksId, "buildCoderTasksId");
function buildCoderTasksMarkdown(record, coderTasksId, title, tasksBody) {
  return `# ${title}

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Coder Tasks Boundary

This is Coder-owned implementation task decomposition derived from a Coder work plan.

It is not an implementation bundle, not a patch, not a Coder handoff, not Helper execution authorization, not certification, and not a production-readiness claim.

## Source Chain

- coder_tasks_id: ${coderTasksId}
- coder_work_plan_id: ${record.coder_work_plan_id}
- tasking_id: ${record.source_tasking.tasking_id}
- plan_id: ${record.source_tasking.plan_id}
- specification_id: ${record.source_tasking.specification_id}
- intake_id: ${record.source_tasking.intake_id}
- handoff_id: ${record.source_tasking.handoff_id}
- code_flow_id: ${record.source_tasking.code_flow_id}
- source_share_id: ${record.source_tasking.share_id}
- source_science_flow_id: ${record.source_tasking.science_flow_id}
- share_packet_hash: ${record.source_tasking.share_packet_hash}
- submitted_share_payload_hash: ${record.source_tasking.submitted_share_payload_hash || record.source_tasking.share_packet_hash}
- handoff_payload_hash: ${record.source_tasking.handoff_payload_hash}
- intake_payload_hash: ${record.source_tasking.intake_payload_hash}
- specification_payload_hash: ${record.source_tasking.specification_payload_hash}
- plan_payload_hash: ${record.source_tasking.plan_payload_hash}
- tasking_payload_hash: ${record.source_tasking.tasking_payload_hash}
- coder_work_plan_payload_hash: ${record.submitted_payload_hash}
- evidence_level: ${record.source_tasking.evidence_level}
- uncertainty: ${record.source_tasking.uncertainty}

## Coder Tasks Body

${tasksBody}

## Hard Forbidden Claims

${record.source_tasking.forbidden_claims.map((claim) => `- ${claim}`).join("\n")}

## Source Artifacts

${record.source_tasking.resolved_source_artifacts.map((item) => `- ${item.artifact_type}: ${item.artifact_id} (${item.source_path})`).join("\n")}

## Non-Laundering Rule

Coder tasks remain downstream of diagnostic evidence, PM tasking, and Coder work planning. Implementation bundle, Coder handoff, Helper execution, and promotion require later gated stages and Human approval.
`;
}
__name(buildCoderTasksMarkdown, "buildCoderTasksMarkdown");
async function writeCodeFlowArtifact5(request, env, flowId, projectName7, artifactType, title, body, store) {
  const url = new URL(request.url);
  const artifactRequest = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, {
    method: "POST",
    headers: jsonHeaders8(request),
    body: JSON.stringify({ project: projectName7, artifact_type: artifactType, title, body })
  });
  const response = await handleFlowsRequest(artifactRequest, env, flowId, "artifacts", store);
  const parsed = await parseJsonResponse7(response);
  if (!response.ok)
    return jsonResponse(parsed, response.status);
  const artifact = parsed.artifact;
  if (!artifact)
    return errorResponse("CODER_TASKS_ARTIFACT_WRITE_FAILED", `Artifact write did not return summary for ${artifactType}`, 500);
  return artifact;
}
__name(writeCodeFlowArtifact5, "writeCodeFlowArtifact");
async function loadCoderTasksIndex(env, projectName7, store) {
  const existing = await fetchJsonIfExists6(env, projectName7, coderTasksContextIndexPath(), store);
  if (existing && existing.schema_version === "coder_tasks_context_index.v0.1" && Array.isArray(existing.entries))
    return existing;
  return { schema_version: "coder_tasks_context_index.v0.1", project: projectName7, updated_at: utcIso8(), entries: [] };
}
__name(loadCoderTasksIndex, "loadCoderTasksIndex");
function upsertCoderTasksIndex(index, record) {
  const entry = {
    coder_tasks_id: record.coder_tasks_id,
    coder_work_plan_id: record.source_coder_work_plan.coder_work_plan_id,
    tasking_id: record.source_coder_work_plan.tasking_id,
    plan_id: record.source_coder_work_plan.plan_id,
    specification_id: record.source_coder_work_plan.specification_id,
    intake_id: record.source_coder_work_plan.intake_id,
    handoff_id: record.source_coder_work_plan.handoff_id,
    code_flow_id: record.source_coder_work_plan.code_flow_id,
    share_id: record.source_coder_work_plan.share_id,
    science_flow_id: record.source_coder_work_plan.science_flow_id,
    share_packet_hash: record.source_coder_work_plan.share_packet_hash,
    evidence_level: record.source_coder_work_plan.evidence_level,
    uncertainty: record.source_coder_work_plan.uncertainty,
    coder_tasks_record_path: record.coder_tasks_record_path,
    created_at: record.created_at
  };
  const existing = index.entries.findIndex((item) => item.coder_tasks_id === record.coder_tasks_id);
  if (existing >= 0)
    index.entries[existing] = entry;
  else
    index.entries.push(entry);
  index.updated_at = utcIso8();
  index.entries.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}
__name(upsertCoderTasksIndex, "upsertCoderTasksIndex");
async function handleCoderTasksRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "CODER_AI")
      return errorResponse("CODER_TASKS_ROLE_FORBIDDEN", "Only CODER_AI may create coder tasks artifacts", 403);
    if (request.method !== "POST")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const url = new URL(request.url);
    const body = await readJsonBody8(request);
    const projectName7 = projectNameFrom9(url, body);
    const project = getProject(projectName7);
    if (!project)
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
    const idempotencyKey = requireString12(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(idempotencyKey)) {
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    }
    const tasksTitle = requireString12(body.tasks_title, "tasks_title");
    const tasksBody = requireString12(body.tasks_body, "tasks_body");
    const bodyError = validateCoderTasksBody(tasksBody);
    if (bodyError)
      return bodyError;
    const workPlanEntry = await loadCoderWorkPlanContextEntry(env, projectName7, body, repoStore);
    const workPlanRecord = await fetchJsonIfExists6(env, projectName7, workPlanEntry.coder_work_plan_record_path, repoStore);
    if (!workPlanRecord)
      return errorResponse("CODER_TASKS_WORK_PLAN_RECORD_NOT_FOUND", `No Coder work plan record found for ${workPlanEntry.coder_work_plan_id}`, 404);
    if (workPlanRecord.coder_work_plan_id !== workPlanEntry.coder_work_plan_id || workPlanRecord.coder_work_plan_record_path !== workPlanEntry.coder_work_plan_record_path) {
      return errorResponse("CODER_TASKS_WORK_PLAN_CONTEXT_MISMATCH", "Coder work plan record does not match generated Coder work plan context", 409);
    }
    const workPlanError = validateCoderWorkPlanRecord(workPlanRecord);
    if (workPlanError)
      return workPlanError;
    const codeFlowManifest = await fetchJsonIfExists6(env, projectName7, flowManifestPath7(workPlanRecord.source_tasking.code_flow_id), repoStore);
    const codeFlowError = validateCodeFlowManifest4(codeFlowManifest, workPlanRecord);
    if (codeFlowError)
      return codeFlowError;
    const coderTasksId = buildCoderTasksId(workPlanRecord.coder_work_plan_id, idempotencyKey);
    const payloadHash = await sha256Hex8(JSON.stringify({
      project: projectName7,
      idempotency_key: idempotencyKey,
      coder_work_plan_id: workPlanRecord.coder_work_plan_id,
      coder_work_plan_record_path: workPlanRecord.coder_work_plan_record_path,
      coder_work_plan_payload_hash: workPlanRecord.submitted_payload_hash,
      share_packet_hash: workPlanRecord.source_tasking.share_packet_hash,
      tasks_title: tasksTitle,
      tasks_body: tasksBody
    }));
    const recordPath6 = coderTasksRecordPath(coderTasksId);
    const existingRecord = await fetchJsonIfExists6(env, projectName7, recordPath6, repoStore);
    if (existingRecord && existingRecord.schema_version === "coder_tasks_context.v0.1") {
      if (existingRecord.submitted_payload_hash !== payloadHash) {
        return errorResponse("CODER_TASKS_IDEMPOTENCY_CONFLICT", "Existing coder tasks idempotency record exists but submitted payload hash does not match", 409);
      }
      return jsonResponse({ ok: true, idempotent_replay: true, coder_tasks: existingRecord, required_status_labels: requiredStatusLabels10() }, 200);
    }
    const tasksArtifact = await writeCodeFlowArtifact5(
      request,
      env,
      workPlanRecord.source_tasking.code_flow_id,
      projectName7,
      "coder_tasks",
      tasksTitle,
      buildCoderTasksMarkdown(workPlanRecord, coderTasksId, tasksTitle, tasksBody),
      repoStore
    );
    if (tasksArtifact instanceof Response)
      return tasksArtifact;
    const createdAt = utcIso8();
    const record = {
      schema_version: "coder_tasks_context.v0.1",
      official_artifact: true,
      project: projectName7,
      coder_tasks_id: coderTasksId,
      idempotency_key: idempotencyKey,
      created_at: createdAt,
      created_by_role: "CODER_AI",
      source_coder_work_plan: {
        coder_work_plan_id: workPlanRecord.coder_work_plan_id,
        coder_work_plan_record_path: workPlanRecord.coder_work_plan_record_path,
        tasking_id: workPlanRecord.source_tasking.tasking_id,
        code_flow_id: workPlanRecord.source_tasking.code_flow_id,
        plan_id: workPlanRecord.source_tasking.plan_id,
        specification_id: workPlanRecord.source_tasking.specification_id,
        intake_id: workPlanRecord.source_tasking.intake_id,
        handoff_id: workPlanRecord.source_tasking.handoff_id,
        share_id: workPlanRecord.source_tasking.share_id,
        science_flow_id: workPlanRecord.source_tasking.science_flow_id,
        share_packet_hash: workPlanRecord.source_tasking.share_packet_hash,
        submitted_share_payload_hash: workPlanRecord.source_tasking.submitted_share_payload_hash,
        handoff_payload_hash: workPlanRecord.source_tasking.handoff_payload_hash,
        intake_payload_hash: workPlanRecord.source_tasking.intake_payload_hash,
        specification_payload_hash: workPlanRecord.source_tasking.specification_payload_hash,
        plan_payload_hash: workPlanRecord.source_tasking.plan_payload_hash,
        tasking_payload_hash: workPlanRecord.source_tasking.tasking_payload_hash,
        coder_work_plan_payload_hash: workPlanRecord.submitted_payload_hash,
        evidence_level: workPlanRecord.source_tasking.evidence_level,
        uncertainty: workPlanRecord.source_tasking.uncertainty,
        source_artifacts: workPlanRecord.source_tasking.source_artifacts,
        resolved_source_artifacts: workPlanRecord.source_tasking.resolved_source_artifacts,
        allowed_claims: workPlanRecord.source_tasking.allowed_claims,
        forbidden_claims: workPlanRecord.source_tasking.forbidden_claims
      },
      output_artifacts: { coder_tasks: tasksArtifact },
      submitted_payload_hash: payloadHash,
      coder_tasks_record_path: recordPath6,
      generated_coder_tasks_context_path: coderTasksContextIndexPath(),
      required_status_labels: requiredStatusLabels10()
    };
    const index = await loadCoderTasksIndex(env, projectName7, repoStore);
    upsertCoderTasksIndex(index, record);
    const indexWrite = await writeJson7(env, projectName7, coderTasksContextIndexPath(), index, `Update Coder tasks context ${coderTasksId}`, repoStore);
    record.generated_coder_tasks_context_sha = indexWrite.sha;
    const recordWrite = await writeJson7(env, projectName7, recordPath6, record, `Write Coder tasks record ${coderTasksId}`, repoStore);
    return jsonResponse({ ok: true, idempotent_replay: false, project: projectName7, coder_tasks: { ...record, coder_tasks_record_sha: recordWrite.sha }, required_status_labels: requiredStatusLabels10() }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("No Coder work plan context entry"))
      return errorResponse("CODER_TASKS_WORK_PLAN_CONTEXT_NOT_FOUND", message, 404);
    if (message.includes("Coder work plan context index is missing"))
      return errorResponse("CODER_TASKS_WORK_PLAN_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleCoderTasksRequest, "handleCoderTasksRequest");

// src/coder_implementation_bundle.ts
function requiredStatusLabels11() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels11, "requiredStatusLabels");
function optionalString12(value) {
  return typeof value === "string" ? value.trim() : "";
}
__name(optionalString12, "optionalString");
function requireString13(value, field) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Invalid or missing field: ${field}`);
  return value.trim();
}
__name(requireString13, "requireString");
function getParam11(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam11, "getParam");
function projectNameFrom10(url, body) {
  const fromBody = body ? optionalString12(body.project) : "";
  const fromQuery = getParam11(url, "project") || "";
  return fromBody || fromQuery || "ArqonZero";
}
__name(projectNameFrom10, "projectNameFrom");
function utcIso9() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(utcIso9, "utcIso");
function safeFilePart9(value, max = 96) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safeFilePart9, "safeFilePart");
function formatJson10(value) {
  return `${JSON.stringify(value, null, 2)}
`;
}
__name(formatJson10, "formatJson");
function authorizationHeader7(request) {
  return request.headers.get("authorization") || "";
}
__name(authorizationHeader7, "authorizationHeader");
function jsonHeaders9(request) {
  const headers = new Headers();
  const auth = authorizationHeader7(request);
  if (auth)
    headers.set("authorization", auth);
  headers.set("content-type", "application/json");
  return headers;
}
__name(jsonHeaders9, "jsonHeaders");
function coderTasksContextIndexPath2() {
  return "governance/context/generated_coder_tasks_context.json";
}
__name(coderTasksContextIndexPath2, "coderTasksContextIndexPath");
function coderImplementationBundleContextIndexPath() {
  return "governance/context/generated_coder_implementation_bundle_context.json";
}
__name(coderImplementationBundleContextIndexPath, "coderImplementationBundleContextIndexPath");
function implementationBundleRecordPath(implementationBundleId) {
  return `governance/context/coder_implementation_bundle/${implementationBundleId}.json`;
}
__name(implementationBundleRecordPath, "implementationBundleRecordPath");
function flowManifestPath8(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(flowManifestPath8, "flowManifestPath");
async function readJsonBody9(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Missing or invalid JSON body");
  return body;
}
__name(readJsonBody9, "readJsonBody");
async function fetchJsonIfExists7(env, projectName7, path, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, path);
    return JSON.parse(file.content);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404"))
      return null;
    throw err;
  }
}
__name(fetchJsonIfExists7, "fetchJsonIfExists");
async function writeJson8(env, projectName7, path, value, message, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  return await store.writeFile(env, project, path, formatJson10(value), message);
}
__name(writeJson8, "writeJson");
async function parseJsonResponse8(response) {
  const text = await response.text();
  if (!text)
    return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
__name(parseJsonResponse8, "parseJsonResponse");
async function sha256Hex9(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex9, "sha256Hex");
function hasRequiredLabels6(labels3) {
  return requiredStatusLabels11().every((label) => Array.isArray(labels3) && labels3.includes(label));
}
__name(hasRequiredLabels6, "hasRequiredLabels");
function normalizeClaimText6(value) {
  return value.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}
__name(normalizeClaimText6, "normalizeClaimText");
function validateImplementationBundleBody(body) {
  const normalized = normalizeClaimText6(body);
  const forbiddenPromotion = [
    [/\bsealed test certified\b/, "sealed-test certified"],
    [/\bcertified\b/, "certified"],
    [/\bcertification\b/, "certification"],
    [/\bproduction ready\b/, "production ready"],
    [/\bproduction readiness\b/, "production readiness"],
    [/\bready for production\b/, "ready for production"],
    [/\bproduct ready\b/, "product ready"],
    [/\bpromotable\b/, "promotable"],
    [/\bapproved for release\b/, "approved for release"],
    [/\brelease ready\b/, "release ready"]
  ];
  const promotion = forbiddenPromotion.find(([pattern]) => pattern.test(normalized));
  if (promotion) {
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_FORBIDDEN_CLAIM_INCLUDED", `Implementation bundle contains forbidden promotion language: ${promotion[1]}`, 409);
  }
  const forbiddenExecutionAuthority = [
    [/\bhelper may execute\b/, "helper may execute"],
    [/\bhelper can execute\b/, "helper can execute"],
    [/\bexecution is authorized\b/, "execution is authorized"],
    [/\bauthorized for execution\b/, "authorized for execution"],
    [/\bapply the patch\b/, "apply the patch"],
    [/\bdeploy now\b/, "deploy now"],
    [/\bno further review required\b/, "no further review required"],
    [/\bready for helper execution\b/, "ready for helper execution"],
    [/\bhelper should run\b/, "helper should run"]
  ];
  const executionAuthority = forbiddenExecutionAuthority.find(([pattern]) => pattern.test(normalized));
  if (executionAuthority) {
    return errorResponse(
      "CODER_IMPLEMENTATION_BUNDLE_EXECUTION_AUTHORITY_FORBIDDEN",
      `Implementation bundle may not authorize Helper execution: ${executionAuthority[1]}`,
      409
    );
  }
  return null;
}
__name(validateImplementationBundleBody, "validateImplementationBundleBody");
async function loadCoderTasksContextEntry(env, projectName7, body, store) {
  const coderTasksId = optionalString12(body.coder_tasks_id);
  const coderTasksRecordPath2 = optionalString12(body.coder_tasks_record_path);
  if (!coderTasksId && !coderTasksRecordPath2)
    throw new Error("Invalid or missing field: coder_tasks_id or coder_tasks_record_path");
  const index = await fetchJsonIfExists7(env, projectName7, coderTasksContextIndexPath2(), store);
  if (!index || index.schema_version !== "coder_tasks_context_index.v0.1" || !Array.isArray(index.entries)) {
    throw new Error("Coder tasks context index is missing or invalid");
  }
  const entry = index.entries.find((item) => {
    if (coderTasksId && coderTasksRecordPath2) {
      return item.coder_tasks_id === coderTasksId && item.coder_tasks_record_path === coderTasksRecordPath2;
    }
    return coderTasksId && item.coder_tasks_id === coderTasksId || coderTasksRecordPath2 && item.coder_tasks_record_path === coderTasksRecordPath2;
  });
  if (!entry && coderTasksId && coderTasksRecordPath2) {
    throw new Error("Coder tasks context fields conflict: coder_tasks_id and coder_tasks_record_path do not resolve to the same generated context entry");
  }
  if (!entry)
    throw new Error(`No Coder tasks context entry found for ${coderTasksId || coderTasksRecordPath2}`);
  return { coder_tasks_id: entry.coder_tasks_id, coder_tasks_record_path: entry.coder_tasks_record_path };
}
__name(loadCoderTasksContextEntry, "loadCoderTasksContextEntry");
function artifactById5(manifest, artifactId) {
  return manifest.artifacts.find((artifact) => artifact.artifact_id === artifactId) || null;
}
__name(artifactById5, "artifactById");
function validateExpectedCoderTasksArtifact(manifest, expected) {
  const actual = artifactById5(manifest, expected.artifact_id);
  if (!actual)
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_TASKS_ARTIFACT_NOT_ON_CODE_FLOW", `Code flow does not contain required coder_tasks artifact ${expected.artifact_id}`, 409);
  if (actual.artifact_type !== "coder_tasks" || actual.role !== "CODER_AI") {
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_TASKS_ARTIFACT_TYPE_MISMATCH", `Expected coder_tasks by CODER_AI for ${expected.artifact_id}`, 409);
  }
  if (actual.source_path !== expected.source_path) {
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_TASKS_ARTIFACT_SOURCE_MISMATCH", `Coder tasks artifact source path mismatch for ${expected.artifact_id}`, 409);
  }
  if (actual.source_sha !== expected.source_sha) {
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_TASKS_ARTIFACT_SHA_MISMATCH", `Coder tasks artifact source sha mismatch for ${expected.artifact_id}`, 409);
  }
  return null;
}
__name(validateExpectedCoderTasksArtifact, "validateExpectedCoderTasksArtifact");
function validateCoderTasksRecord(record) {
  if (record.schema_version !== "coder_tasks_context.v0.1")
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_INVALID_TASKS_RECORD", "Coder tasks record schema is invalid", 409);
  if (record.official_artifact !== true || record.created_by_role !== "CODER_AI")
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_INVALID_TASKS_AUTHORITY", "Coder tasks record is not official Coder tasks", 409);
  if (!record.source_coder_work_plan || !record.output_artifacts)
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_TASKS_INCOMPLETE", "Coder tasks record is missing source Coder work plan or output artifacts", 409);
  if (!record.source_coder_work_plan.share_packet_hash || !record.source_coder_work_plan.uncertainty)
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_SOURCE_BOUNDARY_REQUIRED", "Coder tasks record must preserve share hash and uncertainty", 409);
  if (!record.source_coder_work_plan.forbidden_claims || record.source_coder_work_plan.forbidden_claims.length === 0)
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_FORBIDDEN_CLAIMS_REQUIRED", "Coder tasks record must preserve forbidden claims", 409);
  if (!record.source_coder_work_plan.resolved_source_artifacts || record.source_coder_work_plan.resolved_source_artifacts.length === 0)
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_RESOLVED_SOURCES_REQUIRED", "Coder tasks record must preserve resolved source metadata", 409);
  if (!record.output_artifacts.coder_tasks)
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_TASKS_ARTIFACT_REQUIRED", "Coder tasks record must include coder_tasks artifact", 409);
  if (!hasRequiredLabels6(record.required_status_labels))
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_STATUS_LABELS_REQUIRED", "Coder tasks record is missing required diagnostic status labels", 409);
  return null;
}
__name(validateCoderTasksRecord, "validateCoderTasksRecord");
function validateCodeFlowManifest5(manifest, record) {
  if (!manifest || manifest.schema_version !== "flow_manifest.v0.3")
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_CODE_FLOW_NOT_FOUND", "Code flow manifest not found", 404);
  if (manifest.type !== "code_flow" || manifest.flow_id !== record.source_coder_work_plan.code_flow_id)
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_CODE_FLOW_REQUIRED", "Implementation bundle target must be a code_flow", 409);
  return validateExpectedCoderTasksArtifact(manifest, record.output_artifacts.coder_tasks);
}
__name(validateCodeFlowManifest5, "validateCodeFlowManifest");
function buildImplementationBundleId(coderTasksId, idempotencyKey) {
  return `${safeFilePart9(coderTasksId, 90)}-${safeFilePart9(idempotencyKey, 36)}`;
}
__name(buildImplementationBundleId, "buildImplementationBundleId");
function buildImplementationBundleMarkdown(record, implementationBundleId, title, bundleBody) {
  return `# ${title}

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Implementation Bundle Boundary

This is a Coder-owned implementation proposal/package derived from audited coder_tasks.

It is not a Coder handoff, not Helper execution authorization, not an executed patch, not certification, and not a production-readiness claim.

## Source Chain

- implementation_bundle_id: ${implementationBundleId}
- coder_tasks_id: ${record.coder_tasks_id}
- coder_work_plan_id: ${record.source_coder_work_plan.coder_work_plan_id}
- tasking_id: ${record.source_coder_work_plan.tasking_id}
- plan_id: ${record.source_coder_work_plan.plan_id}
- specification_id: ${record.source_coder_work_plan.specification_id}
- intake_id: ${record.source_coder_work_plan.intake_id}
- handoff_id: ${record.source_coder_work_plan.handoff_id}
- code_flow_id: ${record.source_coder_work_plan.code_flow_id}
- source_share_id: ${record.source_coder_work_plan.share_id}
- source_science_flow_id: ${record.source_coder_work_plan.science_flow_id}
- share_packet_hash: ${record.source_coder_work_plan.share_packet_hash}
- submitted_share_payload_hash: ${record.source_coder_work_plan.submitted_share_payload_hash || record.source_coder_work_plan.share_packet_hash}
- handoff_payload_hash: ${record.source_coder_work_plan.handoff_payload_hash}
- intake_payload_hash: ${record.source_coder_work_plan.intake_payload_hash}
- specification_payload_hash: ${record.source_coder_work_plan.specification_payload_hash}
- plan_payload_hash: ${record.source_coder_work_plan.plan_payload_hash}
- tasking_payload_hash: ${record.source_coder_work_plan.tasking_payload_hash}
- coder_work_plan_payload_hash: ${record.source_coder_work_plan.coder_work_plan_payload_hash}
- coder_tasks_payload_hash: ${record.submitted_payload_hash}
- evidence_level: ${record.source_coder_work_plan.evidence_level}
- uncertainty: ${record.source_coder_work_plan.uncertainty}

## Implementation Bundle Body

${bundleBody}

## Hard Forbidden Claims

${record.source_coder_work_plan.forbidden_claims.map((claim) => `- ${claim}`).join("\n")}

## Source Artifacts

${record.source_coder_work_plan.resolved_source_artifacts.map((item) => `- ${item.artifact_type}: ${item.artifact_id} (${item.source_path})`).join("\n")}

## Non-Laundering Rule

Implementation bundle remains downstream of diagnostic evidence, PM tasking, Coder work planning, and Coder tasks. Coder handoff, Helper execution, audit, and promotion require later gated stages and Human approval.
`;
}
__name(buildImplementationBundleMarkdown, "buildImplementationBundleMarkdown");
async function writeCodeFlowArtifact6(request, env, flowId, projectName7, artifactType, title, body, store) {
  const url = new URL(request.url);
  const artifactRequest = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, {
    method: "POST",
    headers: jsonHeaders9(request),
    body: JSON.stringify({ project: projectName7, artifact_type: artifactType, title, body })
  });
  const response = await writeRouteScopedFlowArtifact(artifactRequest, env, flowId, store);
  const parsed = await parseJsonResponse8(response);
  if (!response.ok)
    return jsonResponse(parsed, response.status);
  const artifact = parsed.artifact;
  if (!artifact)
    return errorResponse("CODER_IMPLEMENTATION_BUNDLE_ARTIFACT_WRITE_FAILED", `Artifact write did not return summary for ${artifactType}`, 500);
  return artifact;
}
__name(writeCodeFlowArtifact6, "writeCodeFlowArtifact");
async function loadImplementationBundleIndex(env, projectName7, store) {
  const existing = await fetchJsonIfExists7(env, projectName7, coderImplementationBundleContextIndexPath(), store);
  if (existing && existing.schema_version === "coder_implementation_bundle_context_index.v0.1" && Array.isArray(existing.entries))
    return existing;
  return { schema_version: "coder_implementation_bundle_context_index.v0.1", project: projectName7, updated_at: utcIso9(), entries: [] };
}
__name(loadImplementationBundleIndex, "loadImplementationBundleIndex");
function upsertImplementationBundleIndex(index, record) {
  const entry = {
    implementation_bundle_id: record.implementation_bundle_id,
    coder_tasks_id: record.source_coder_tasks.coder_tasks_id,
    coder_work_plan_id: record.source_coder_tasks.coder_work_plan_id,
    tasking_id: record.source_coder_tasks.tasking_id,
    plan_id: record.source_coder_tasks.plan_id,
    specification_id: record.source_coder_tasks.specification_id,
    intake_id: record.source_coder_tasks.intake_id,
    handoff_id: record.source_coder_tasks.handoff_id,
    code_flow_id: record.source_coder_tasks.code_flow_id,
    share_id: record.source_coder_tasks.share_id,
    science_flow_id: record.source_coder_tasks.science_flow_id,
    share_packet_hash: record.source_coder_tasks.share_packet_hash,
    evidence_level: record.source_coder_tasks.evidence_level,
    uncertainty: record.source_coder_tasks.uncertainty,
    implementation_bundle_record_path: record.implementation_bundle_record_path,
    created_at: record.created_at
  };
  const existing = index.entries.findIndex((item) => item.implementation_bundle_id === record.implementation_bundle_id);
  if (existing >= 0)
    index.entries[existing] = entry;
  else
    index.entries.push(entry);
  index.updated_at = utcIso9();
  index.entries.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}
__name(upsertImplementationBundleIndex, "upsertImplementationBundleIndex");
async function handleCoderImplementationBundleRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "CODER_AI")
      return errorResponse("CODER_IMPLEMENTATION_BUNDLE_ROLE_FORBIDDEN", "Only CODER_AI may create implementation bundle artifacts", 403);
    if (request.method !== "POST")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const url = new URL(request.url);
    const body = await readJsonBody9(request);
    const projectName7 = projectNameFrom10(url, body);
    const project = getProject(projectName7);
    if (!project)
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
    const idempotencyKey = requireString13(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(idempotencyKey)) {
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    }
    const bundleTitle = requireString13(body.bundle_title, "bundle_title");
    const bundleBody = requireString13(body.bundle_body, "bundle_body");
    const bodyError = validateImplementationBundleBody(bundleBody);
    if (bodyError)
      return bodyError;
    const tasksEntry = await loadCoderTasksContextEntry(env, projectName7, body, repoStore);
    const tasksRecord = await fetchJsonIfExists7(env, projectName7, tasksEntry.coder_tasks_record_path, repoStore);
    if (!tasksRecord)
      return errorResponse("CODER_IMPLEMENTATION_BUNDLE_TASKS_RECORD_NOT_FOUND", `No Coder tasks record found for ${tasksEntry.coder_tasks_id}`, 404);
    if (tasksRecord.coder_tasks_id !== tasksEntry.coder_tasks_id || tasksRecord.coder_tasks_record_path !== tasksEntry.coder_tasks_record_path) {
      return errorResponse("CODER_IMPLEMENTATION_BUNDLE_TASKS_CONTEXT_MISMATCH", "Coder tasks record does not match generated Coder tasks context", 409);
    }
    const tasksError = validateCoderTasksRecord(tasksRecord);
    if (tasksError)
      return tasksError;
    const codeFlowManifest = await fetchJsonIfExists7(env, projectName7, flowManifestPath8(tasksRecord.source_coder_work_plan.code_flow_id), repoStore);
    const codeFlowError = validateCodeFlowManifest5(codeFlowManifest, tasksRecord);
    if (codeFlowError)
      return codeFlowError;
    const implementationBundleId = buildImplementationBundleId(tasksRecord.coder_tasks_id, idempotencyKey);
    const payloadHash = await sha256Hex9(JSON.stringify({
      project: projectName7,
      idempotency_key: idempotencyKey,
      coder_tasks_id: tasksRecord.coder_tasks_id,
      coder_tasks_record_path: tasksRecord.coder_tasks_record_path,
      coder_tasks_payload_hash: tasksRecord.submitted_payload_hash,
      share_packet_hash: tasksRecord.source_coder_work_plan.share_packet_hash,
      bundle_title: bundleTitle,
      bundle_body: bundleBody
    }));
    const recordPath6 = implementationBundleRecordPath(implementationBundleId);
    const existingRecord = await fetchJsonIfExists7(env, projectName7, recordPath6, repoStore);
    if (existingRecord && existingRecord.schema_version !== "coder_implementation_bundle_context.v0.1") {
      return errorResponse("CODER_IMPLEMENTATION_BUNDLE_EXISTING_RECORD_INVALID", "Existing implementation bundle idempotency record has invalid schema", 409);
    }
    if (existingRecord && existingRecord.schema_version === "coder_implementation_bundle_context.v0.1") {
      if (existingRecord.submitted_payload_hash !== payloadHash) {
        return errorResponse("CODER_IMPLEMENTATION_BUNDLE_IDEMPOTENCY_CONFLICT", "Existing implementation bundle idempotency record exists but submitted payload hash does not match", 409);
      }
      return jsonResponse({ ok: true, idempotent_replay: true, implementation_bundle: existingRecord, required_status_labels: requiredStatusLabels11() }, 200);
    }
    const bundleArtifact = await writeCodeFlowArtifact6(
      request,
      env,
      tasksRecord.source_coder_work_plan.code_flow_id,
      projectName7,
      "implementation_bundle",
      bundleTitle,
      buildImplementationBundleMarkdown(tasksRecord, implementationBundleId, bundleTitle, bundleBody),
      repoStore
    );
    if (bundleArtifact instanceof Response)
      return bundleArtifact;
    const createdAt = utcIso9();
    const record = {
      schema_version: "coder_implementation_bundle_context.v0.1",
      official_artifact: true,
      project: projectName7,
      implementation_bundle_id: implementationBundleId,
      idempotency_key: idempotencyKey,
      created_at: createdAt,
      created_by_role: "CODER_AI",
      source_coder_tasks: {
        coder_tasks_id: tasksRecord.coder_tasks_id,
        coder_tasks_record_path: tasksRecord.coder_tasks_record_path,
        coder_work_plan_id: tasksRecord.source_coder_work_plan.coder_work_plan_id,
        tasking_id: tasksRecord.source_coder_work_plan.tasking_id,
        code_flow_id: tasksRecord.source_coder_work_plan.code_flow_id,
        plan_id: tasksRecord.source_coder_work_plan.plan_id,
        specification_id: tasksRecord.source_coder_work_plan.specification_id,
        intake_id: tasksRecord.source_coder_work_plan.intake_id,
        handoff_id: tasksRecord.source_coder_work_plan.handoff_id,
        share_id: tasksRecord.source_coder_work_plan.share_id,
        science_flow_id: tasksRecord.source_coder_work_plan.science_flow_id,
        share_packet_hash: tasksRecord.source_coder_work_plan.share_packet_hash,
        submitted_share_payload_hash: tasksRecord.source_coder_work_plan.submitted_share_payload_hash,
        handoff_payload_hash: tasksRecord.source_coder_work_plan.handoff_payload_hash,
        intake_payload_hash: tasksRecord.source_coder_work_plan.intake_payload_hash,
        specification_payload_hash: tasksRecord.source_coder_work_plan.specification_payload_hash,
        plan_payload_hash: tasksRecord.source_coder_work_plan.plan_payload_hash,
        tasking_payload_hash: tasksRecord.source_coder_work_plan.tasking_payload_hash,
        coder_work_plan_payload_hash: tasksRecord.source_coder_work_plan.coder_work_plan_payload_hash,
        coder_tasks_payload_hash: tasksRecord.submitted_payload_hash,
        evidence_level: tasksRecord.source_coder_work_plan.evidence_level,
        uncertainty: tasksRecord.source_coder_work_plan.uncertainty,
        source_artifacts: tasksRecord.source_coder_work_plan.source_artifacts,
        resolved_source_artifacts: tasksRecord.source_coder_work_plan.resolved_source_artifacts,
        allowed_claims: tasksRecord.source_coder_work_plan.allowed_claims,
        forbidden_claims: tasksRecord.source_coder_work_plan.forbidden_claims
      },
      output_artifacts: { implementation_bundle: bundleArtifact },
      submitted_payload_hash: payloadHash,
      implementation_bundle_record_path: recordPath6,
      generated_coder_implementation_bundle_context_path: coderImplementationBundleContextIndexPath(),
      required_status_labels: requiredStatusLabels11()
    };
    const index = await loadImplementationBundleIndex(env, projectName7, repoStore);
    upsertImplementationBundleIndex(index, record);
    const indexWrite = await writeJson8(env, projectName7, coderImplementationBundleContextIndexPath(), index, `Update Coder implementation bundle context ${implementationBundleId}`, repoStore);
    record.generated_coder_implementation_bundle_context_sha = indexWrite.sha;
    const recordWrite = await writeJson8(env, projectName7, recordPath6, record, `Write Coder implementation bundle record ${implementationBundleId}`, repoStore);
    return jsonResponse({ ok: true, idempotent_replay: false, project: projectName7, implementation_bundle: { ...record, implementation_bundle_record_sha: recordWrite.sha }, required_status_labels: requiredStatusLabels11() }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("Coder tasks context fields conflict"))
      return errorResponse("CODER_IMPLEMENTATION_BUNDLE_TASKS_CONTEXT_MISMATCH", message, 409);
    if (message.includes("No Coder tasks context entry"))
      return errorResponse("CODER_IMPLEMENTATION_BUNDLE_TASKS_CONTEXT_NOT_FOUND", message, 404);
    if (message.includes("Coder tasks context index is missing"))
      return errorResponse("CODER_IMPLEMENTATION_BUNDLE_TASKS_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleCoderImplementationBundleRequest, "handleCoderImplementationBundleRequest");

// src/helper_execution_intake.ts
function labels() {
  return [...STATUS_LABELS];
}
__name(labels, "labels");
function opt(v) {
  return typeof v === "string" ? v.trim() : "";
}
__name(opt, "opt");
function req(v, f) {
  if (typeof v !== "string" || !v.trim())
    throw new Error(`Invalid or missing field: ${f}`);
  return v.trim();
}
__name(req, "req");
function projectName2(url, body) {
  return opt(body.project) || url.searchParams.get("project") || "ArqonZero";
}
__name(projectName2, "projectName");
function safe2(v, max = 96) {
  return v.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safe2, "safe");
function now2() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(now2, "now");
function fmt(v) {
  return `${JSON.stringify(v, null, 2)}
`;
}
__name(fmt, "fmt");
function hasLabels2(xs) {
  return labels().every((label) => Array.isArray(xs) && xs.includes(label));
}
__name(hasLabels2, "hasLabels");
function authHeaders(request) {
  const h = new Headers({ "content-type": "application/json" });
  const a = request.headers.get("authorization");
  if (a)
    h.set("authorization", a);
  return h;
}
__name(authHeaders, "authHeaders");
function normalize(s) {
  return s.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}
__name(normalize, "normalize");
function validateText(value, field) {
  const x = normalize(value);
  const promo = [[/\bsealed test certified\b/, "sealed-test certified"], [/\bcertified\b/, "certified"], [/\bcertification\b/, "certification"], [/\bproduction ready\b/, "production ready"], [/\bproduction readiness\b/, "production readiness"], [/\bready for production\b/, "ready for production"], [/\bproduct ready\b/, "product ready"], [/\bpromotable\b/, "promotable"], [/\bapproved for release\b/, "approved for release"], [/\brelease ready\b/, "release ready"], [/\bdeployed\b/, "deployed"], [/\bdeployment complete\b/, "deployment complete"]];
  const p = promo.find(([r]) => r.test(x));
  if (p)
    return errorResponse("HELPER_EXECUTION_INTAKE_FORBIDDEN_CLAIM_INCLUDED", `${field} contains forbidden promotion/deployment language: ${p[1]}`, 409);
  const exec = [[/\bcommands were run\b/, "commands were run"], [/\bcommand executed\b/, "command executed"], [/\bpatch applied\b/, "patch applied"], [/\bapplied the patch\b/, "applied the patch"], [/\btests passed\b/, "tests passed"], [/\bexecution complete\b/, "execution complete"], [/\bhelper executed\b/, "helper executed"], [/\bno further review required\b/, "no further review required"], [/\bdeploy now\b/, "deploy now"]];
  const e = exec.find(([r]) => r.test(x));
  if (e)
    return errorResponse("HELPER_EXECUTION_INTAKE_EXECUTION_CLAIM_FORBIDDEN", `${field} may not claim execution or authorize deployment: ${e[1]}`, 409);
  return null;
}
__name(validateText, "validateText");
async function bodyJson2(request) {
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object" || Array.isArray(b))
    throw new Error("Missing or invalid JSON body");
  return b;
}
__name(bodyJson2, "bodyJson");
async function fetchJson2(env, project, path, store) {
  const p = getProject(project);
  if (!p)
    throw new Error(`Unknown project: ${project}`);
  try {
    return JSON.parse((await store.fetchFile(env, p, path)).content);
  } catch (e) {
    if (e instanceof Error && e.message.includes("404"))
      return null;
    throw e;
  }
}
__name(fetchJson2, "fetchJson");
async function writeJson9(env, project, path, value, message, store) {
  const p = getProject(project);
  if (!p)
    throw new Error(`Unknown project: ${project}`);
  return store.writeFile(env, p, path, fmt(value), message);
}
__name(writeJson9, "writeJson");
async function parseResponse2(r) {
  const t = await r.text();
  if (!t)
    return null;
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}
__name(parseResponse2, "parseResponse");
async function sha(value) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha, "sha");
var handoffIndexPath = /* @__PURE__ */ __name(() => "governance/context/generated_coder_handoff_context.json", "handoffIndexPath");
var intakeIndexPath = /* @__PURE__ */ __name(() => "governance/context/generated_helper_execution_intake_context.json", "intakeIndexPath");
var intakeRecordPath = /* @__PURE__ */ __name((id) => `governance/context/helper_execution_intake/${id}.json`, "intakeRecordPath");
var manifestPath2 = /* @__PURE__ */ __name((flowId) => `governance/flows/${flowId}/flow_manifest.json`, "manifestPath");
async function loadHandoffEntry(env, project, body, store) {
  const id = opt(body.coder_handoff_id), path = opt(body.coder_handoff_record_path);
  if (!id && !path)
    throw new Error("Invalid or missing field: coder_handoff_id or coder_handoff_record_path");
  const index = await fetchJson2(env, project, handoffIndexPath(), store);
  if (!index || index.schema_version !== "coder_handoff_context_index.v0.1" || !Array.isArray(index.entries))
    throw new Error("Coder handoff context index is missing or invalid");
  const entry = index.entries.find((item) => id && path ? item.coder_handoff_id === id && item.coder_handoff_record_path === path : id && item.coder_handoff_id === id || path && item.coder_handoff_record_path === path);
  if (!entry && id && path)
    throw new Error("Coder handoff context fields conflict: coder_handoff_id and coder_handoff_record_path do not resolve to the same generated context entry");
  if (!entry)
    throw new Error(`No Coder handoff context entry found for ${id || path}`);
  return { coder_handoff_id: entry.coder_handoff_id, coder_handoff_record_path: entry.coder_handoff_record_path };
}
__name(loadHandoffEntry, "loadHandoffEntry");
function validateHandoffRecord2(record) {
  if (record.schema_version !== "coder_handoff_context.v0.1")
    return errorResponse("HELPER_EXECUTION_INTAKE_INVALID_HANDOFF_RECORD", "Coder handoff record schema is invalid", 409);
  if (record.official_artifact !== true || record.created_by_role !== "CODER_AI")
    return errorResponse("HELPER_EXECUTION_INTAKE_INVALID_HANDOFF_AUTHORITY", "Coder handoff record is not official Coder output", 409);
  if (!record.source_implementation_bundle || !record.output_artifacts?.coder_handoff)
    return errorResponse("HELPER_EXECUTION_INTAKE_HANDOFF_INCOMPLETE", "Coder handoff record is missing source implementation bundle or output artifact", 409);
  if (!record.source_implementation_bundle.share_packet_hash || !record.source_implementation_bundle.uncertainty)
    return errorResponse("HELPER_EXECUTION_INTAKE_SOURCE_BOUNDARY_REQUIRED", "Coder handoff record must preserve share hash and uncertainty", 409);
  if (!Array.isArray(record.source_implementation_bundle.forbidden_claims) || record.source_implementation_bundle.forbidden_claims.length === 0)
    return errorResponse("HELPER_EXECUTION_INTAKE_FORBIDDEN_CLAIMS_REQUIRED", "Coder handoff record must preserve forbidden claims", 409);
  if (!Array.isArray(record.source_implementation_bundle.resolved_source_artifacts) || record.source_implementation_bundle.resolved_source_artifacts.length === 0)
    return errorResponse("HELPER_EXECUTION_INTAKE_RESOLVED_SOURCES_REQUIRED", "Coder handoff record must preserve resolved source metadata", 409);
  if (!hasLabels2(record.required_status_labels))
    return errorResponse("HELPER_EXECUTION_INTAKE_STATUS_LABELS_REQUIRED", "Coder handoff record is missing required diagnostic status labels", 409);
  return null;
}
__name(validateHandoffRecord2, "validateHandoffRecord");
function validateManifest2(manifest, record) {
  if (!manifest || manifest.schema_version !== "flow_manifest.v0.3")
    return errorResponse("HELPER_EXECUTION_INTAKE_CODE_FLOW_NOT_FOUND", "Code flow manifest not found", 404);
  if (manifest.type !== "code_flow" || manifest.flow_id !== record.source_implementation_bundle.code_flow_id)
    return errorResponse("HELPER_EXECUTION_INTAKE_CODE_FLOW_REQUIRED", "Helper execution intake target must be a code_flow", 409);
  const expected = record.output_artifacts.coder_handoff;
  const actual = manifest.artifacts.find((a) => a.artifact_id === expected.artifact_id);
  if (!actual)
    return errorResponse("HELPER_EXECUTION_INTAKE_HANDOFF_ARTIFACT_NOT_ON_CODE_FLOW", `Code flow does not contain required coder_handoff artifact ${expected.artifact_id}`, 409);
  if (actual.artifact_type !== "coder_handoff" || actual.role !== "CODER_AI")
    return errorResponse("HELPER_EXECUTION_INTAKE_HANDOFF_ARTIFACT_TYPE_MISMATCH", `Expected coder_handoff by CODER_AI for ${expected.artifact_id}`, 409);
  if (actual.source_path !== expected.source_path)
    return errorResponse("HELPER_EXECUTION_INTAKE_HANDOFF_ARTIFACT_SOURCE_MISMATCH", `Coder handoff artifact source path mismatch for ${expected.artifact_id}`, 409);
  if (actual.source_sha !== expected.source_sha)
    return errorResponse("HELPER_EXECUTION_INTAKE_HANDOFF_ARTIFACT_SHA_MISMATCH", `Coder handoff artifact source sha mismatch for ${expected.artifact_id}`, 409);
  return null;
}
__name(validateManifest2, "validateManifest");
function buildId(handoffId2, key) {
  return `${safe2(handoffId2, 90)}-${safe2(key, 36)}`;
}
__name(buildId, "buildId");
function markdown(record, id, title, text) {
  const src = record.source_implementation_bundle;
  return `# ${title}

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Helper Execution Intake Boundary

This is a Helper-owned intake artifact derived from an audited Coder handoff. It records receipt for later controlled work. It is not command execution, not patch application, not deployment, not audit certification, and not promotion.

## Source Chain

- helper_execution_intake_id: ${id}
- coder_handoff_id: ${record.coder_handoff_id}
- implementation_bundle_id: ${src.implementation_bundle_id}
- code_flow_id: ${src.code_flow_id}
- share_packet_hash: ${src.share_packet_hash}
- coder_handoff_payload_hash: ${record.submitted_payload_hash}
- evidence_level: ${src.evidence_level}
- uncertainty: ${src.uncertainty}

## Intake Body

${text}

## Non-Execution Rule

Actual commands, patch application, deployment, audit, promotion, and Human advancement require later explicit gated stages.
`;
}
__name(markdown, "markdown");
async function writeArtifact3(request, env, flowId, project, type, title, body, store) {
  const url = new URL(request.url);
  const req3 = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, { method: "POST", headers: authHeaders(request), body: JSON.stringify({ project, artifact_type: type, title, body }) });
  const res = await writeRouteScopedFlowArtifact(req3, env, flowId, store);
  const parsed = await parseResponse2(res);
  if (!res.ok)
    return jsonResponse(parsed, res.status);
  const artifact = parsed.artifact;
  if (!artifact)
    return errorResponse("HELPER_EXECUTION_INTAKE_ARTIFACT_WRITE_FAILED", `Artifact write did not return summary for ${type}`, 500);
  return artifact;
}
__name(writeArtifact3, "writeArtifact");
async function loadIndex2(env, project, store) {
  const existing = await fetchJson2(env, project, intakeIndexPath(), store);
  if (existing?.schema_version === "helper_execution_intake_context_index.v0.1" && Array.isArray(existing.entries))
    return existing;
  return { schema_version: "helper_execution_intake_context_index.v0.1", project, updated_at: now2(), entries: [] };
}
__name(loadIndex2, "loadIndex");
function upsert2(index, record) {
  const entry = { helper_execution_intake_id: record.helper_execution_intake_id, coder_handoff_id: record.source_coder_handoff.coder_handoff_id, implementation_bundle_id: record.source_coder_handoff.implementation_bundle_id, coder_tasks_id: record.source_coder_handoff.coder_tasks_id, code_flow_id: record.source_coder_handoff.code_flow_id, share_id: record.source_coder_handoff.share_id, science_flow_id: record.source_coder_handoff.science_flow_id, share_packet_hash: record.source_coder_handoff.share_packet_hash, evidence_level: record.source_coder_handoff.evidence_level, uncertainty: record.source_coder_handoff.uncertainty, helper_execution_intake_record_path: record.helper_execution_intake_record_path, created_at: record.created_at };
  const i = index.entries.findIndex((x) => x.helper_execution_intake_id === record.helper_execution_intake_id);
  if (i >= 0)
    index.entries[i] = entry;
  else
    index.entries.push(entry);
  index.updated_at = now2();
  index.entries.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}
__name(upsert2, "upsert");
async function handleHelperExecutionIntakeRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "HELPER_AI")
      return errorResponse("HELPER_EXECUTION_INTAKE_ROLE_FORBIDDEN", "Only HELPER_AI may create Helper execution-intake artifacts", 403);
    if (request.method !== "POST")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const url = new URL(request.url);
    const body = await bodyJson2(request);
    const project = projectName2(url, body);
    if (!getProject(project))
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${project}`, 404);
    const key = req(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(key))
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    const title = req(body.intake_title, "intake_title");
    const intakeBody = req(body.intake_body, "intake_body");
    const titleError = validateText(title, "intake_title");
    if (titleError)
      return titleError;
    const bodyError = validateText(intakeBody, "intake_body");
    if (bodyError)
      return bodyError;
    const entry = await loadHandoffEntry(env, project, body, repoStore);
    const handoff = await fetchJson2(env, project, entry.coder_handoff_record_path, repoStore);
    if (!handoff)
      return errorResponse("HELPER_EXECUTION_INTAKE_HANDOFF_RECORD_NOT_FOUND", `No Coder handoff record found for ${entry.coder_handoff_id}`, 404);
    if (handoff.coder_handoff_id !== entry.coder_handoff_id || handoff.coder_handoff_record_path !== entry.coder_handoff_record_path)
      return errorResponse("HELPER_EXECUTION_INTAKE_HANDOFF_CONTEXT_MISMATCH", "Coder handoff record does not match generated Coder handoff context", 409);
    const recordError = validateHandoffRecord2(handoff);
    if (recordError)
      return recordError;
    const manifest = await fetchJson2(env, project, manifestPath2(handoff.source_implementation_bundle.code_flow_id), repoStore);
    const manifestError = validateManifest2(manifest, handoff);
    if (manifestError)
      return manifestError;
    const id = buildId(handoff.coder_handoff_id, key);
    const payloadHash = await sha(JSON.stringify({ project, idempotency_key: key, coder_handoff_id: handoff.coder_handoff_id, coder_handoff_record_path: handoff.coder_handoff_record_path, coder_handoff_payload_hash: handoff.submitted_payload_hash, share_packet_hash: handoff.source_implementation_bundle.share_packet_hash, intake_title: title, intake_body: intakeBody }));
    const recPath = intakeRecordPath(id);
    const existing = await fetchJson2(env, project, recPath, repoStore);
    if (existing && existing.schema_version !== "helper_execution_intake_context.v0.1")
      return errorResponse("HELPER_EXECUTION_INTAKE_EXISTING_RECORD_INVALID", "Existing Helper execution-intake idempotency record has invalid schema", 409);
    if (existing?.schema_version === "helper_execution_intake_context.v0.1") {
      if (existing.submitted_payload_hash !== payloadHash)
        return errorResponse("HELPER_EXECUTION_INTAKE_IDEMPOTENCY_CONFLICT", "Existing Helper execution-intake idempotency record exists but submitted payload hash does not match", 409);
      return jsonResponse({ ok: true, idempotent_replay: true, helper_execution_intake: existing, required_status_labels: labels() }, 200);
    }
    const artifact = await writeArtifact3(request, env, handoff.source_implementation_bundle.code_flow_id, project, "helper_execution_intake", title, markdown(handoff, id, title, intakeBody), repoStore);
    if (artifact instanceof Response)
      return artifact;
    const created = now2();
    const src = handoff.source_implementation_bundle;
    const record = { schema_version: "helper_execution_intake_context.v0.1", official_artifact: true, project, helper_execution_intake_id: id, idempotency_key: key, created_at: created, created_by_role: "HELPER_AI", source_coder_handoff: { coder_handoff_id: handoff.coder_handoff_id, coder_handoff_record_path: handoff.coder_handoff_record_path, implementation_bundle_id: src.implementation_bundle_id, coder_tasks_id: src.coder_tasks_id, coder_work_plan_id: src.coder_work_plan_id, tasking_id: src.tasking_id, code_flow_id: src.code_flow_id, plan_id: src.plan_id, specification_id: src.specification_id, intake_id: src.intake_id, pm_handoff_id: src.pm_handoff_id, share_id: src.share_id, science_flow_id: src.science_flow_id, share_packet_hash: src.share_packet_hash, submitted_share_payload_hash: src.submitted_share_payload_hash, handoff_payload_hash: src.handoff_payload_hash, intake_payload_hash: src.intake_payload_hash, specification_payload_hash: src.specification_payload_hash, plan_payload_hash: src.plan_payload_hash, tasking_payload_hash: src.tasking_payload_hash, coder_work_plan_payload_hash: src.coder_work_plan_payload_hash, coder_tasks_payload_hash: src.coder_tasks_payload_hash, implementation_bundle_payload_hash: src.implementation_bundle_payload_hash, coder_handoff_payload_hash: handoff.submitted_payload_hash, evidence_level: src.evidence_level, uncertainty: src.uncertainty, source_artifacts: src.source_artifacts, resolved_source_artifacts: src.resolved_source_artifacts, allowed_claims: src.allowed_claims, forbidden_claims: src.forbidden_claims }, output_artifacts: { helper_execution_intake: artifact }, submitted_payload_hash: payloadHash, helper_execution_intake_record_path: recPath, generated_helper_execution_intake_context_path: intakeIndexPath(), required_status_labels: labels() };
    const index = await loadIndex2(env, project, repoStore);
    upsert2(index, record);
    const iw = await writeJson9(env, project, intakeIndexPath(), index, `Update Helper execution-intake context ${id}`, repoStore);
    record.generated_helper_execution_intake_context_sha = iw.sha;
    const rw = await writeJson9(env, project, recPath, record, `Write Helper execution-intake record ${id}`, repoStore);
    return jsonResponse({ ok: true, idempotent_replay: false, project, helper_execution_intake: { ...record, helper_execution_intake_record_sha: rw.sha }, required_status_labels: labels() }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("Coder handoff context fields conflict"))
      return errorResponse("HELPER_EXECUTION_INTAKE_HANDOFF_CONTEXT_MISMATCH", message, 409);
    if (message.includes("No Coder handoff context entry") || message.includes("Coder handoff context index is missing"))
      return errorResponse("HELPER_EXECUTION_INTAKE_HANDOFF_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleHelperExecutionIntakeRequest, "handleHelperExecutionIntakeRequest");

// src/helper_execution_report.ts
var INTAKE_INDEX_PATH = "governance/context/generated_helper_execution_intake_context.json";
var REPORT_INDEX_PATH = "governance/context/generated_helper_execution_report_context.json";
var LABELS2 = /* @__PURE__ */ __name(() => [...STATUS_LABELS], "LABELS");
function reqStr(v, f) {
  if (typeof v !== "string" || !v.trim())
    throw new Error(`Invalid or missing field: ${f}`);
  return v.trim();
}
__name(reqStr, "reqStr");
function optStr(v) {
  return typeof v === "string" ? v.trim() : "";
}
__name(optStr, "optStr");
function safe3(v, max = 96) {
  return v.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safe3, "safe");
function iso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(iso, "iso");
function j(v) {
  return `${JSON.stringify(v, null, 2)}
`;
}
__name(j, "j");
function recordPath2(id) {
  return `governance/context/helper_execution_report/${id}.json`;
}
__name(recordPath2, "recordPath");
function manifestPath3(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(manifestPath3, "manifestPath");
function projectName3(url, body) {
  return optStr(body.project) || url.searchParams.get("project") || "ArqonZero";
}
__name(projectName3, "projectName");
function hasLabels3(labels3) {
  return LABELS2().every((l) => Array.isArray(labels3) && labels3.includes(l));
}
__name(hasLabels3, "hasLabels");
async function fetchJson3(env, project, path, store) {
  const cfg = getProject(project);
  if (!cfg)
    throw new Error(`Unknown project: ${project}`);
  try {
    return JSON.parse((await store.fetchFile(env, cfg, path)).content);
  } catch (e) {
    if (e instanceof Error && e.message.includes("404"))
      return null;
    throw e;
  }
}
__name(fetchJson3, "fetchJson");
async function writeJson10(env, project, path, value, message, store) {
  const cfg = getProject(project);
  if (!cfg)
    throw new Error(`Unknown project: ${project}`);
  return store.writeFile(env, cfg, path, j(value), message);
}
__name(writeJson10, "writeJson");
async function parseResponse3(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}
__name(parseResponse3, "parseResponse");
async function sha256Hex10(value) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex10, "sha256Hex");
function normalize2(v) {
  return v.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}
__name(normalize2, "normalize");
function forbiddenEvidenceText(value, field) {
  const n = normalize2(value);
  const forbidden = [
    [/\bsealed test certified\b/, "sealed-test certified"],
    [/\bcertified\b/, "certified"],
    [/\bcertification complete\b/, "certification complete"],
    [/\bproduction ready\b/, "production ready"],
    [/\bready for production\b/, "ready for production"],
    [/\bpromotable\b/, "promotable"],
    [/\bapproved for release\b/, "approved for release"],
    [/\brelease ready\b/, "release ready"],
    [/\bdeployment complete\b/, "deployment complete"],
    [/\bdeployed to production\b/, "deployed to production"],
    [/\bdeploy now\b/, "deploy now"],
    [/\bno further review required\b/, "no further review required"]
  ];
  const hit = forbidden.find(([r]) => r.test(n));
  return hit ? errorResponse("HELPER_EXECUTION_REPORT_FORBIDDEN_CLAIM_INCLUDED", `${field} contains forbidden certification/promotion/deployment language: ${hit[1]}`, 409) : null;
}
__name(forbiddenEvidenceText, "forbiddenEvidenceText");
function secretMaterialText(value, field) {
  const secretPatterns = [
    [/BEGIN PRIVATE KEY/i, "BEGIN PRIVATE KEY"],
    [/GITHUB_APP_PRIVATE_KEY/i, "GITHUB_APP_PRIVATE_KEY"],
    [/BROKER_KEY_/i, "BROKER_KEY_"],
    [/Authorization:/i, "Authorization:"],
    [/\bBearer\s+/i, "Bearer "],
    [/\bapi_key\b/i, "api_key"],
    [/\btoken=/i, "token="]
  ];
  const hit = secretPatterns.find(([pattern]) => pattern.test(value));
  return hit ? errorResponse("HELPER_EXECUTION_REPORT_SECRET_MATERIAL_FORBIDDEN", `${field} contains forbidden secret-like material: ${hit[1]}`, 409) : null;
}
__name(secretMaterialText, "secretMaterialText");
function commandList(value) {
  if (!Array.isArray(value) || value.length === 0)
    throw new Error("commands must be a non-empty array");
  return value.map((item, idx) => {
    if (!item || typeof item !== "object" || Array.isArray(item))
      throw new Error(`commands[${idx}] must be an object`);
    const rec = item;
    const command = reqStr(rec.command, `commands[${idx}].command`);
    const purpose = reqStr(rec.purpose, `commands[${idx}].purpose`);
    const result = reqStr(rec.result, `commands[${idx}].result`);
    const exitCode = Number(rec.exit_code);
    if (!Number.isInteger(exitCode))
      throw new Error(`commands[${idx}].exit_code must be an integer`);
    if (!["PASS", "FAIL", "SKIPPED"].includes(result))
      throw new Error(`commands[${idx}].result must be PASS, FAIL, or SKIPPED`);
    return { command, purpose, result, exit_code: exitCode, stdout_excerpt: optStr(rec.stdout_excerpt).slice(0, 4e3), stderr_excerpt: optStr(rec.stderr_excerpt).slice(0, 4e3) };
  });
}
__name(commandList, "commandList");
function validateCommandEvidence(commands) {
  for (let idx = 0; idx < commands.length; idx += 1) {
    const command = commands[idx];
    const prefix = `commands[${idx}]`;
    const fields = [
      [`${prefix}.command`, command.command],
      [`${prefix}.purpose`, command.purpose],
      [`${prefix}.stdout_excerpt`, command.stdout_excerpt || ""],
      [`${prefix}.stderr_excerpt`, command.stderr_excerpt || ""]
    ];
    for (const [field, value] of fields) {
      const forbidden = forbiddenEvidenceText(value, field);
      if (forbidden)
        return forbidden;
      const secret = secretMaterialText(value, field);
      if (secret)
        return secret;
    }
  }
  return null;
}
__name(validateCommandEvidence, "validateCommandEvidence");
async function loadIntakeEntry(env, project, body, store) {
  const id = optStr(body.helper_execution_intake_id), path = optStr(body.helper_execution_intake_record_path);
  if (!id && !path)
    throw new Error("Invalid or missing field: helper_execution_intake_id or helper_execution_intake_record_path");
  const index = await fetchJson3(env, project, INTAKE_INDEX_PATH, store);
  if (!index || index.schema_version !== "helper_execution_intake_context_index.v0.1" || !Array.isArray(index.entries))
    throw new Error("Helper execution intake context index is missing or invalid");
  const entry = index.entries.find((e) => id && path ? e.helper_execution_intake_id === id && e.helper_execution_intake_record_path === path : id && e.helper_execution_intake_id === id || path && e.helper_execution_intake_record_path === path);
  if (!entry && id && path)
    throw new Error("Helper execution intake context fields conflict: helper_execution_intake_id and helper_execution_intake_record_path do not resolve to the same generated context entry");
  if (!entry)
    throw new Error(`No Helper execution intake context entry found for ${id || path}`);
  return { id: entry.helper_execution_intake_id, path: entry.helper_execution_intake_record_path };
}
__name(loadIntakeEntry, "loadIntakeEntry");
function validateIntakeRecord2(record) {
  if (record.schema_version !== "helper_execution_intake_context.v0.1")
    return errorResponse("HELPER_EXECUTION_REPORT_INVALID_INTAKE_RECORD", "Helper execution intake record schema is invalid", 409);
  if (record.official_artifact !== true || record.created_by_role !== "HELPER_AI")
    return errorResponse("HELPER_EXECUTION_REPORT_INVALID_INTAKE_AUTHORITY", "Helper execution intake record is not official Helper output", 409);
  const src = record.source_coder_handoff;
  if (!src || !src.share_packet_hash || !src.uncertainty)
    return errorResponse("HELPER_EXECUTION_REPORT_SOURCE_BOUNDARY_REQUIRED", "Helper intake record must preserve source boundary metadata", 409);
  if (!Array.isArray(src.resolved_source_artifacts) || src.resolved_source_artifacts.length === 0)
    return errorResponse("HELPER_EXECUTION_REPORT_RESOLVED_SOURCES_REQUIRED", "Helper intake must preserve resolved source metadata", 409);
  if (!record.output_artifacts?.helper_execution_intake)
    return errorResponse("HELPER_EXECUTION_REPORT_INTAKE_ARTIFACT_REQUIRED", "Helper intake record must include helper_execution_intake artifact", 409);
  if (!hasLabels3(record.required_status_labels))
    return errorResponse("HELPER_EXECUTION_REPORT_STATUS_LABELS_REQUIRED", "Helper intake record is missing required status labels", 409);
  return null;
}
__name(validateIntakeRecord2, "validateIntakeRecord");
function validateFlow(manifest, record) {
  if (!manifest || manifest.schema_version !== "flow_manifest.v0.3")
    return errorResponse("HELPER_EXECUTION_REPORT_CODE_FLOW_NOT_FOUND", "Code flow manifest not found", 404);
  if (manifest.type !== "code_flow" || manifest.flow_id !== record.source_coder_handoff.code_flow_id)
    return errorResponse("HELPER_EXECUTION_REPORT_CODE_FLOW_REQUIRED", "Execution report target must be a code_flow", 409);
  const expected = record.output_artifacts.helper_execution_intake;
  const actual = manifest.artifacts.find((a) => a.artifact_id === expected.artifact_id);
  if (!actual)
    return errorResponse("HELPER_EXECUTION_REPORT_INTAKE_ARTIFACT_NOT_ON_CODE_FLOW", `Code flow does not contain helper_execution_intake artifact ${expected.artifact_id}`, 409);
  if (actual.artifact_type !== "helper_execution_intake" || actual.role !== "HELPER_AI")
    return errorResponse("HELPER_EXECUTION_REPORT_INTAKE_ARTIFACT_TYPE_MISMATCH", "Expected helper_execution_intake by HELPER_AI", 409);
  if (actual.source_path !== expected.source_path)
    return errorResponse("HELPER_EXECUTION_REPORT_INTAKE_ARTIFACT_SOURCE_MISMATCH", "Helper intake source path mismatch", 409);
  if (actual.source_sha !== expected.source_sha)
    return errorResponse("HELPER_EXECUTION_REPORT_INTAKE_ARTIFACT_SHA_MISMATCH", "Helper intake source SHA mismatch", 409);
  return null;
}
__name(validateFlow, "validateFlow");
async function writeArtifact4(request, env, project, flowId, artifactType, title, body, store) {
  const url = new URL(request.url);
  const r = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, { method: "POST", headers: new Headers({ authorization: request.headers.get("authorization") || "", "content-type": "application/json" }), body: JSON.stringify({ project, artifact_type: artifactType, title, body }) });
  const response = await writeRouteScopedFlowArtifact(r, env, flowId, store);
  const parsed = await parseResponse3(response);
  if (!response.ok)
    return jsonResponse(parsed, response.status);
  if (!parsed?.artifact)
    return errorResponse("HELPER_EXECUTION_REPORT_ARTIFACT_WRITE_FAILED", `No artifact returned for ${artifactType}`, 500);
  return parsed.artifact;
}
__name(writeArtifact4, "writeArtifact");
function mdReport(title, summary, commands, intake) {
  return `# ${title}

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Boundary

This records Helper execution evidence from an audited Helper execution intake.

It is not deployment, certification, promotion, Science behavior, or runtime personalization.

## Source

- helper_execution_intake_id: ${intake.helper_execution_intake_id}
- coder_handoff_id: ${intake.source_coder_handoff.coder_handoff_id}
- code_flow_id: ${intake.source_coder_handoff.code_flow_id}
- share_packet_hash: ${intake.source_coder_handoff.share_packet_hash}
- uncertainty: ${intake.source_coder_handoff.uncertainty}

## Summary

${summary}

## Command Results

${commands.map((c, i) => `${i + 1}. \`${c.command}\` \u2014 ${c.result} (exit ${c.exit_code})`).join("\n")}
`;
}
__name(mdReport, "mdReport");
function mdCommandLog(commands) {
  return `# Helper Command Log

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

${commands.map((c, i) => `## Command ${i + 1}

Command:

${c.command}

Purpose:

${c.purpose}

Result:

${c.result}

Exit code:

${c.exit_code}

Stdout excerpt:

${c.stdout_excerpt || "(empty)"}

Stderr excerpt:

${c.stderr_excerpt || "(empty)"}
`).join("\n")}
`;
}
__name(mdCommandLog, "mdCommandLog");
function mdEvidenceManifest(reportId, commands, intake) {
  return `# Helper Evidence Manifest

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

- helper_execution_report_id: ${reportId}
- helper_execution_intake_id: ${intake.helper_execution_intake_id}
- command_count: ${commands.length}
- contains_deployment_claim: false
- contains_certification_claim: false
- contains_promotion_claim: false
`;
}
__name(mdEvidenceManifest, "mdEvidenceManifest");
async function handleHelperExecutionReportRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "HELPER_AI")
      return errorResponse("HELPER_EXECUTION_REPORT_ROLE_FORBIDDEN", "Only HELPER_AI may create Helper execution reports", 403);
    if (request.method !== "POST")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error("Missing or invalid JSON body");
    const url = new URL(request.url);
    const project = projectName3(url, body);
    if (!getProject(project))
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${project}`, 404);
    const idempotencyKey = reqStr(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(idempotencyKey))
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    const title = reqStr(body.execution_title, "execution_title");
    const summary = reqStr(body.execution_summary, "execution_summary");
    const titleError = forbiddenEvidenceText(title, "execution_title");
    if (titleError)
      return titleError;
    const summaryError = forbiddenEvidenceText(summary, "execution_summary");
    if (summaryError)
      return summaryError;
    const titleSecretError = secretMaterialText(title, "execution_title");
    if (titleSecretError)
      return titleSecretError;
    const summarySecretError = secretMaterialText(summary, "execution_summary");
    if (summarySecretError)
      return summarySecretError;
    const commands = commandList(body.commands);
    const commandEvidenceError = validateCommandEvidence(commands);
    if (commandEvidenceError)
      return commandEvidenceError;
    const entry = await loadIntakeEntry(env, project, body, repoStore);
    const intake = await fetchJson3(env, project, entry.path, repoStore);
    if (!intake)
      return errorResponse("HELPER_EXECUTION_REPORT_INTAKE_RECORD_NOT_FOUND", `No Helper execution intake record found for ${entry.id}`, 404);
    if (intake.helper_execution_intake_id !== entry.id || intake.helper_execution_intake_record_path !== entry.path)
      return errorResponse("HELPER_EXECUTION_REPORT_INTAKE_CONTEXT_MISMATCH", "Helper intake record does not match generated context", 409);
    const intakeError = validateIntakeRecord2(intake);
    if (intakeError)
      return intakeError;
    const manifest = await fetchJson3(env, project, manifestPath3(intake.source_coder_handoff.code_flow_id), repoStore);
    const flowError = validateFlow(manifest, intake);
    if (flowError)
      return flowError;
    const reportId = `${safe3(intake.helper_execution_intake_id, 90)}-${safe3(idempotencyKey, 36)}`;
    const payloadHash = await sha256Hex10(JSON.stringify({ project, idempotency_key: idempotencyKey, helper_execution_intake_id: intake.helper_execution_intake_id, helper_execution_intake_record_path: intake.helper_execution_intake_record_path, intake_payload_hash: intake.submitted_payload_hash, execution_title: title, execution_summary: summary, commands }));
    const path = recordPath2(reportId);
    const existing = await fetchJson3(env, project, path, repoStore);
    if (existing && existing.schema_version !== "helper_execution_report_context.v0.1")
      return errorResponse("HELPER_EXECUTION_REPORT_EXISTING_RECORD_INVALID", "Existing Helper execution report idempotency record has invalid schema", 409);
    if (existing) {
      if (existing.submitted_payload_hash !== payloadHash)
        return errorResponse("HELPER_EXECUTION_REPORT_IDEMPOTENCY_CONFLICT", "Existing Helper execution report payload hash does not match", 409);
      return jsonResponse({ ok: true, idempotent_replay: true, helper_execution_report: existing, required_status_labels: LABELS2() }, 200);
    }
    const flowId = intake.source_coder_handoff.code_flow_id;
    const executionReport = await writeArtifact4(request, env, project, flowId, "execution_report", title, mdReport(title, summary, commands, intake), repoStore);
    if (executionReport instanceof Response)
      return executionReport;
    const commandLog = await writeArtifact4(request, env, project, flowId, "command_log", `${title} Command Log`, mdCommandLog(commands), repoStore);
    if (commandLog instanceof Response)
      return commandLog;
    const evidenceManifest = await writeArtifact4(request, env, project, flowId, "evidence_manifest", `${title} Evidence Manifest`, mdEvidenceManifest(reportId, commands, intake), repoStore);
    if (evidenceManifest instanceof Response)
      return evidenceManifest;
    const record = {
      schema_version: "helper_execution_report_context.v0.1",
      official_artifact: true,
      project,
      helper_execution_report_id: reportId,
      idempotency_key: idempotencyKey,
      created_at: iso(),
      created_by_role: "HELPER_AI",
      source_helper_execution_intake: { helper_execution_intake_id: intake.helper_execution_intake_id, helper_execution_intake_record_path: intake.helper_execution_intake_record_path, coder_handoff_id: intake.source_coder_handoff.coder_handoff_id, implementation_bundle_id: intake.source_coder_handoff.implementation_bundle_id, code_flow_id: flowId, share_id: intake.source_coder_handoff.share_id, science_flow_id: intake.source_coder_handoff.science_flow_id, share_packet_hash: intake.source_coder_handoff.share_packet_hash, helper_execution_intake_payload_hash: intake.submitted_payload_hash, evidence_level: intake.source_coder_handoff.evidence_level, uncertainty: intake.source_coder_handoff.uncertainty, source_artifacts: intake.source_coder_handoff.source_artifacts, resolved_source_artifacts: intake.source_coder_handoff.resolved_source_artifacts, allowed_claims: intake.source_coder_handoff.allowed_claims, forbidden_claims: intake.source_coder_handoff.forbidden_claims },
      command_count: commands.length,
      commands,
      output_artifacts: { execution_report: executionReport, command_log: commandLog, evidence_manifest: evidenceManifest },
      submitted_payload_hash: payloadHash,
      helper_execution_report_record_path: path,
      generated_helper_execution_report_context_path: REPORT_INDEX_PATH,
      required_status_labels: LABELS2()
    };
    const index = await fetchJson3(env, project, REPORT_INDEX_PATH, repoStore) || { schema_version: "helper_execution_report_context_index.v0.1", project, updated_at: iso(), entries: [] };
    if (!Array.isArray(index.entries))
      index.entries = [];
    const idx = { helper_execution_report_id: reportId, helper_execution_intake_id: intake.helper_execution_intake_id, coder_handoff_id: intake.source_coder_handoff.coder_handoff_id, code_flow_id: flowId, share_id: intake.source_coder_handoff.share_id, share_packet_hash: intake.source_coder_handoff.share_packet_hash, evidence_level: intake.source_coder_handoff.evidence_level, uncertainty: intake.source_coder_handoff.uncertainty, helper_execution_report_record_path: path, created_at: record.created_at };
    index.entries = index.entries.filter((e) => e.helper_execution_report_id !== reportId);
    index.entries.unshift(idx);
    index.updated_at = iso();
    const indexWrite = await writeJson10(env, project, REPORT_INDEX_PATH, index, `Update Helper execution report context ${reportId}`, repoStore);
    record.generated_helper_execution_report_context_sha = indexWrite.sha;
    const recordWrite = await writeJson10(env, project, path, record, `Write Helper execution report ${reportId}`, repoStore);
    return jsonResponse({ ok: true, idempotent_replay: false, project, helper_execution_report: { ...record, helper_execution_report_record_sha: recordWrite.sha }, required_status_labels: LABELS2() }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be") || message.includes("commands"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("Helper execution intake context fields conflict"))
      return errorResponse("HELPER_EXECUTION_REPORT_INTAKE_CONTEXT_MISMATCH", message, 409);
    if (message.includes("No Helper execution intake context entry") || message.includes("Helper execution intake context index is missing"))
      return errorResponse("HELPER_EXECUTION_REPORT_INTAKE_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleHelperExecutionReportRequest, "handleHelperExecutionReportRequest");

// src/auditor_helper_execution_review.ts
var REPORT_INDEX_PATH2 = "governance/context/generated_helper_execution_report_context.json";
var REVIEW_INDEX_PATH = "governance/context/generated_auditor_helper_execution_review_context.json";
var LABELS3 = /* @__PURE__ */ __name(() => [...STATUS_LABELS], "LABELS");
var VERDICTS = /* @__PURE__ */ new Set(["AUDITOR_REVIEW_PASS", "REQUIRES_REVISION", "BLOCKED"]);
function reqStr2(v, f) {
  if (typeof v !== "string" || !v.trim())
    throw new Error(`Invalid or missing field: ${f}`);
  return v.trim();
}
__name(reqStr2, "reqStr");
function optStr2(v) {
  return typeof v === "string" ? v.trim() : "";
}
__name(optStr2, "optStr");
function safe4(v, max = 96) {
  return v.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safe4, "safe");
function iso2() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(iso2, "iso");
function j2(v) {
  return `${JSON.stringify(v, null, 2)}
`;
}
__name(j2, "j");
function recordPath3(id) {
  return `governance/context/auditor_helper_execution_review/${id}.json`;
}
__name(recordPath3, "recordPath");
function manifestPath4(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(manifestPath4, "manifestPath");
function projectName4(url, body) {
  return optStr2(body.project) || url.searchParams.get("project") || "ArqonZero";
}
__name(projectName4, "projectName");
function hasLabels4(labels3) {
  return LABELS3().every((l) => Array.isArray(labels3) && labels3.includes(l));
}
__name(hasLabels4, "hasLabels");
async function fetchJson4(env, project, path, store) {
  const cfg = getProject(project);
  if (!cfg)
    throw new Error(`Unknown project: ${project}`);
  try {
    return JSON.parse((await store.fetchFile(env, cfg, path)).content);
  } catch (e) {
    if (e instanceof Error && e.message.includes("404"))
      return null;
    throw e;
  }
}
__name(fetchJson4, "fetchJson");
async function writeJson11(env, project, path, value, message, store) {
  const cfg = getProject(project);
  if (!cfg)
    throw new Error(`Unknown project: ${project}`);
  return store.writeFile(env, cfg, path, j2(value), message);
}
__name(writeJson11, "writeJson");
async function parseResponse4(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}
__name(parseResponse4, "parseResponse");
async function sha256Hex11(value) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex11, "sha256Hex");
function normalize3(v) {
  return v.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}
__name(normalize3, "normalize");
function forbiddenReviewText(value, field) {
  const n = normalize3(value);
  const forbidden = [
    [/\bsealed test certified\b/, "sealed-test certified"],
    [/\bcertified\b/, "certified"],
    [/\bcertification complete\b/, "certification complete"],
    [/\bproduction ready\b/, "production ready"],
    [/\bready for production\b/, "ready for production"],
    [/\bpromotable\b/, "promotable"],
    [/\bapproved for release\b/, "approved for release"],
    [/\brelease ready\b/, "release ready"],
    [/\bdeployment complete\b/, "deployment complete"],
    [/\bdeployed to production\b/, "deployed to production"],
    [/\bdeploy now\b/, "deploy now"],
    [/\bhuman advancement approved\b/, "human advancement approved"],
    [/\bno further review required\b/, "no further review required"]
  ];
  const hit = forbidden.find(([r]) => r.test(n));
  return hit ? errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_FORBIDDEN_CLAIM_INCLUDED", `${field} contains forbidden advancement/certification/promotion/deployment language: ${hit[1]}`, 409) : null;
}
__name(forbiddenReviewText, "forbiddenReviewText");
function secretText(value, field) {
  const patterns = [
    [/BEGIN PRIVATE KEY/i, "BEGIN PRIVATE KEY"],
    [/GITHUB_APP_PRIVATE_KEY/i, "GITHUB_APP_PRIVATE_KEY"],
    [/BROKER_KEY_/i, "BROKER_KEY_"],
    [/Authorization:/i, "Authorization:"],
    [/\bBearer\s+/i, "Bearer "],
    [/\bapi_key\b/i, "api_key"],
    [/\btoken=/i, "token="]
  ];
  const hit = patterns.find(([p]) => p.test(value));
  return hit ? errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_SECRET_MATERIAL_FORBIDDEN", `${field} contains forbidden secret-like material: ${hit[1]}`, 409) : null;
}
__name(secretText, "secretText");
function validateText2(value, field) {
  return forbiddenReviewText(value, field) || secretText(value, field);
}
__name(validateText2, "validateText");
function findingList(value) {
  if (!Array.isArray(value))
    return [];
  return value.map((v, i) => reqStr2(v, `findings[${i}]`));
}
__name(findingList, "findingList");
async function loadReportEntry(env, project, body, store) {
  const id = optStr2(body.helper_execution_report_id);
  const path = optStr2(body.helper_execution_report_record_path);
  if (!id && !path)
    throw new Error("Invalid or missing field: helper_execution_report_id or helper_execution_report_record_path");
  const index = await fetchJson4(env, project, REPORT_INDEX_PATH2, store);
  if (!index || index.schema_version !== "helper_execution_report_context_index.v0.1" || !Array.isArray(index.entries)) {
    throw new Error("Helper execution report context index is missing or invalid");
  }
  const entry = index.entries.find((e) => {
    if (id && path)
      return e.helper_execution_report_id === id && e.helper_execution_report_record_path === path;
    return id && e.helper_execution_report_id === id || path && e.helper_execution_report_record_path === path;
  });
  if (!entry && id && path)
    throw new Error("Helper execution report context fields conflict: helper_execution_report_id and helper_execution_report_record_path do not resolve to the same generated context entry");
  if (!entry)
    throw new Error(`No Helper execution report context entry found for ${id || path}`);
  return { id: entry.helper_execution_report_id, path: entry.helper_execution_report_record_path };
}
__name(loadReportEntry, "loadReportEntry");
function artifactByType(record, artifactType) {
  const artifact = record.output_artifacts?.[artifactType];
  return artifact && artifact.artifact_type === artifactType ? artifact : null;
}
__name(artifactByType, "artifactByType");
function validateReportRecord(record) {
  if (record.schema_version !== "helper_execution_report_context.v0.1")
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_INVALID_REPORT_RECORD", "Helper execution report record schema is invalid", 409);
  if (record.official_artifact !== true || record.created_by_role !== "HELPER_AI")
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_INVALID_REPORT_AUTHORITY", "Helper execution report is not official Helper output", 409);
  if (!record.source_helper_execution_intake?.share_packet_hash || !record.source_helper_execution_intake?.uncertainty)
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_SOURCE_BOUNDARY_REQUIRED", "Helper execution report must preserve source boundary metadata", 409);
  if (!Array.isArray(record.source_helper_execution_intake.resolved_source_artifacts) || record.source_helper_execution_intake.resolved_source_artifacts.length === 0)
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_RESOLVED_SOURCES_REQUIRED", "Helper execution report must preserve resolved source metadata", 409);
  if (!artifactByType(record, "execution_report") || !artifactByType(record, "command_log") || !artifactByType(record, "evidence_manifest"))
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_ARTIFACTS_REQUIRED", "Helper execution report must include execution_report, command_log, and evidence_manifest", 409);
  if (!Number.isInteger(record.command_count) || record.command_count < 1 || !Array.isArray(record.commands) || record.commands.length < 1)
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_COMMAND_EVIDENCE_REQUIRED", "Helper execution report must include command evidence", 409);
  if (!hasLabels4(record.required_status_labels))
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_STATUS_LABELS_REQUIRED", "Helper execution report is missing required status labels", 409);
  return null;
}
__name(validateReportRecord, "validateReportRecord");
function validateArtifactInFlow(manifest, expected, kind) {
  if (expected.artifact_type !== kind || expected.role !== "HELPER_AI") {
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_ARTIFACT_TYPE_MISMATCH", `Expected ${kind} by HELPER_AI`, 409);
  }
  const actual = manifest.artifacts.find((a) => a.artifact_id === expected.artifact_id);
  if (!actual)
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_ARTIFACT_NOT_ON_CODE_FLOW", `Code flow does not contain ${kind} artifact ${expected.artifact_id}`, 409);
  if (actual.artifact_type !== expected.artifact_type || actual.role !== "HELPER_AI")
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_ARTIFACT_TYPE_MISMATCH", `Expected ${kind} by HELPER_AI`, 409);
  if (actual.source_path !== expected.source_path)
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_ARTIFACT_SOURCE_MISMATCH", `${kind} source path mismatch`, 409);
  if (actual.source_sha !== expected.source_sha)
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_ARTIFACT_SHA_MISMATCH", `${kind} source SHA mismatch`, 409);
  return null;
}
__name(validateArtifactInFlow, "validateArtifactInFlow");
function validateFlow2(manifest, record) {
  if (!manifest || manifest.schema_version !== "flow_manifest.v0.3")
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_CODE_FLOW_NOT_FOUND", "Code flow manifest not found", 404);
  const flowId = record.source_helper_execution_intake.code_flow_id;
  if (manifest.type !== "code_flow" || manifest.flow_id !== flowId)
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_CODE_FLOW_REQUIRED", "Auditor review target must be a code_flow", 409);
  for (const kind of ["execution_report", "command_log", "evidence_manifest"]) {
    const artifact = artifactByType(record, kind);
    if (!artifact)
      return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_ARTIFACTS_REQUIRED", `Missing ${kind}`, 409);
    const error = validateArtifactInFlow(manifest, artifact, kind);
    if (error)
      return error;
  }
  return null;
}
__name(validateFlow2, "validateFlow");
async function writeArtifact5(request, env, project, flowId, title, body, store) {
  const url = new URL(request.url);
  const r = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, {
    method: "POST",
    headers: new Headers({ authorization: request.headers.get("authorization") || "", "content-type": "application/json" }),
    body: JSON.stringify({ project, artifact_type: "helper_execution_review", title, body })
  });
  const response = await writeRouteScopedFlowArtifact(r, env, flowId, store);
  const parsed = await parseResponse4(response);
  if (!response.ok)
    return jsonResponse(parsed, response.status);
  if (!parsed?.artifact)
    return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_ARTIFACT_WRITE_FAILED", "No artifact returned for helper_execution_review", 500);
  return parsed.artifact;
}
__name(writeArtifact5, "writeArtifact");
function mdReview(title, summary, verdict, findings, report) {
  return `# ${title}

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Boundary

This is an Auditor-owned review of Helper execution evidence.

It is not Human advancement, deployment, certification, promotion, Science behavior, or runtime personalization.

## Verdict

${verdict}

## Source

- helper_execution_report_id: ${report.helper_execution_report_id}
- helper_execution_intake_id: ${report.source_helper_execution_intake.helper_execution_intake_id}
- code_flow_id: ${report.source_helper_execution_intake.code_flow_id}
- share_packet_hash: ${report.source_helper_execution_intake.share_packet_hash}
- command_count: ${report.command_count}
- uncertainty: ${report.source_helper_execution_intake.uncertainty}

## Summary

${summary}

## Findings

${findings.length ? findings.map((f) => `- ${f}`).join("\n") : "- No additional findings recorded."}

## Non-Advancement Rule

Human advancement requires a later explicit Human gate.
`;
}
__name(mdReview, "mdReview");
async function handleAuditorHelperExecutionReviewRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "AUDITOR_AI")
      return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_ROLE_FORBIDDEN", "Only AUDITOR_AI may create Helper execution reviews", 403);
    if (request.method !== "POST")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error("Missing or invalid JSON body");
    const url = new URL(request.url);
    const project = projectName4(url, body);
    if (!getProject(project))
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${project}`, 404);
    const idempotencyKey = reqStr2(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(idempotencyKey))
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    const title = reqStr2(body.review_title, "review_title");
    const summary = reqStr2(body.review_summary, "review_summary");
    const verdict = reqStr2(body.review_verdict, "review_verdict");
    if (!VERDICTS.has(verdict))
      return errorResponse("BAD_REQUEST", "review_verdict must be AUDITOR_REVIEW_PASS, REQUIRES_REVISION, or BLOCKED", 400);
    const findings = findingList(body.findings);
    for (const [field, value] of [["review_title", title], ["review_summary", summary], ["review_verdict", verdict]]) {
      const error = validateText2(value, field);
      if (error)
        return error;
    }
    for (let i = 0; i < findings.length; i += 1) {
      const error = validateText2(findings[i], `findings[${i}]`);
      if (error)
        return error;
    }
    const entry = await loadReportEntry(env, project, body, repoStore);
    const report = await fetchJson4(env, project, entry.path, repoStore);
    if (!report)
      return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_REPORT_NOT_FOUND", `No Helper execution report record found for ${entry.id}`, 404);
    if (report.helper_execution_report_id !== entry.id || report.helper_execution_report_record_path !== entry.path)
      return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_REPORT_CONTEXT_MISMATCH", "Helper execution report does not match generated context", 409);
    const reportError = validateReportRecord(report);
    if (reportError)
      return reportError;
    const manifest = await fetchJson4(env, project, manifestPath4(report.source_helper_execution_intake.code_flow_id), repoStore);
    const flowError = validateFlow2(manifest, report);
    if (flowError)
      return flowError;
    const reviewId = `${safe4(report.helper_execution_report_id, 90)}-${safe4(idempotencyKey, 36)}`;
    const payloadHash = await sha256Hex11(JSON.stringify({ project, idempotency_key: idempotencyKey, helper_execution_report_id: report.helper_execution_report_id, helper_execution_report_record_path: report.helper_execution_report_record_path, helper_execution_report_payload_hash: report.submitted_payload_hash, review_title: title, review_summary: summary, review_verdict: verdict, findings }));
    const path = recordPath3(reviewId);
    const existing = await fetchJson4(env, project, path, repoStore);
    if (existing && existing.schema_version !== "auditor_helper_execution_review_context.v0.1")
      return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_EXISTING_RECORD_INVALID", "Existing Auditor review idempotency record has invalid schema", 409);
    if (existing) {
      if (existing.submitted_payload_hash !== payloadHash)
        return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_IDEMPOTENCY_CONFLICT", "Existing Auditor review payload hash does not match", 409);
      return jsonResponse({ ok: true, idempotent_replay: true, auditor_helper_execution_review: existing, required_status_labels: LABELS3() }, 200);
    }
    const flowId = report.source_helper_execution_intake.code_flow_id;
    const reviewArtifact = await writeArtifact5(request, env, project, flowId, title, mdReview(title, summary, verdict, findings, report), repoStore);
    if (reviewArtifact instanceof Response)
      return reviewArtifact;
    const record = {
      schema_version: "auditor_helper_execution_review_context.v0.1",
      official_artifact: true,
      project,
      auditor_helper_execution_review_id: reviewId,
      idempotency_key: idempotencyKey,
      created_at: iso2(),
      created_by_role: "AUDITOR_AI",
      review_verdict: verdict,
      findings,
      source_helper_execution_report: {
        helper_execution_report_id: report.helper_execution_report_id,
        helper_execution_report_record_path: report.helper_execution_report_record_path,
        helper_execution_intake_id: report.source_helper_execution_intake.helper_execution_intake_id,
        coder_handoff_id: report.source_helper_execution_intake.coder_handoff_id,
        implementation_bundle_id: report.source_helper_execution_intake.implementation_bundle_id,
        code_flow_id: flowId,
        share_id: report.source_helper_execution_intake.share_id,
        science_flow_id: report.source_helper_execution_intake.science_flow_id,
        share_packet_hash: report.source_helper_execution_intake.share_packet_hash,
        helper_execution_report_payload_hash: report.submitted_payload_hash,
        evidence_level: report.source_helper_execution_intake.evidence_level,
        uncertainty: report.source_helper_execution_intake.uncertainty,
        source_artifacts: report.source_helper_execution_intake.source_artifacts,
        resolved_source_artifacts: report.source_helper_execution_intake.resolved_source_artifacts,
        allowed_claims: report.source_helper_execution_intake.allowed_claims,
        forbidden_claims: report.source_helper_execution_intake.forbidden_claims
      },
      output_artifacts: { helper_execution_review: reviewArtifact },
      submitted_payload_hash: payloadHash,
      auditor_helper_execution_review_record_path: path,
      generated_auditor_helper_execution_review_context_path: REVIEW_INDEX_PATH,
      required_status_labels: LABELS3()
    };
    const index = await fetchJson4(env, project, REVIEW_INDEX_PATH, repoStore) || { schema_version: "auditor_helper_execution_review_context_index.v0.1", project, updated_at: iso2(), entries: [] };
    if (!Array.isArray(index.entries))
      index.entries = [];
    const idx = { auditor_helper_execution_review_id: reviewId, helper_execution_report_id: report.helper_execution_report_id, helper_execution_intake_id: report.source_helper_execution_intake.helper_execution_intake_id, code_flow_id: flowId, share_id: report.source_helper_execution_intake.share_id, share_packet_hash: report.source_helper_execution_intake.share_packet_hash, review_verdict: verdict, evidence_level: report.source_helper_execution_intake.evidence_level, uncertainty: report.source_helper_execution_intake.uncertainty, auditor_helper_execution_review_record_path: path, created_at: record.created_at };
    index.entries = index.entries.filter((e) => e.auditor_helper_execution_review_id !== reviewId);
    index.entries.unshift(idx);
    index.updated_at = iso2();
    const indexWrite = await writeJson11(env, project, REVIEW_INDEX_PATH, index, `Update Auditor helper execution review context ${reviewId}`, repoStore);
    record.generated_auditor_helper_execution_review_context_sha = indexWrite.sha;
    const recordWrite = await writeJson11(env, project, path, record, `Write Auditor helper execution review ${reviewId}`, repoStore);
    return jsonResponse({ ok: true, idempotent_replay: false, project, auditor_helper_execution_review: { ...record, auditor_helper_execution_review_record_sha: recordWrite.sha }, required_status_labels: LABELS3() }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be") || message.includes("findings"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("Helper execution report context fields conflict"))
      return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_REPORT_CONTEXT_MISMATCH", message, 409);
    if (message.includes("No Helper execution report context entry") || message.includes("Helper execution report context index is missing"))
      return errorResponse("AUDITOR_HELPER_EXECUTION_REVIEW_REPORT_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleAuditorHelperExecutionReviewRequest, "handleAuditorHelperExecutionReviewRequest");

// src/human_advancement_decision.ts
var REVIEW_INDEX_PATH2 = "governance/context/generated_auditor_helper_execution_review_context.json";
var DECISION_INDEX_PATH = "governance/context/generated_human_advancement_decision_context.json";
var OUTCOMES = /* @__PURE__ */ new Set(["advance", "require_revision", "reject", "quarantine"]);
var LABELS4 = /* @__PURE__ */ __name(() => [...STATUS_LABELS], "LABELS");
function reqStr3(v, f) {
  if (typeof v !== "string" || !v.trim())
    throw new Error(`Invalid or missing field: ${f}`);
  return v.trim();
}
__name(reqStr3, "reqStr");
function optStr3(v) {
  return typeof v === "string" ? v.trim() : "";
}
__name(optStr3, "optStr");
function safe5(v, max = 96) {
  return v.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safe5, "safe");
function iso3() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(iso3, "iso");
function j3(v) {
  return `${JSON.stringify(v, null, 2)}
`;
}
__name(j3, "j");
function recordPath4(id) {
  return `governance/context/human_advancement_decision/${id}.json`;
}
__name(recordPath4, "recordPath");
function manifestPath5(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(manifestPath5, "manifestPath");
function projectName5(url, body) {
  return optStr3(body.project) || url.searchParams.get("project") || "ArqonZero";
}
__name(projectName5, "projectName");
function hasLabels5(labels3) {
  return LABELS4().every((l) => Array.isArray(labels3) && labels3.includes(l));
}
__name(hasLabels5, "hasLabels");
async function fetchJson5(env, project, path, store) {
  const cfg = getProject(project);
  if (!cfg)
    throw new Error(`Unknown project: ${project}`);
  try {
    return JSON.parse((await store.fetchFile(env, cfg, path)).content);
  } catch (e) {
    if (e instanceof Error && e.message.includes("404"))
      return null;
    throw e;
  }
}
__name(fetchJson5, "fetchJson");
async function writeJson12(env, project, path, value, message, store) {
  const cfg = getProject(project);
  if (!cfg)
    throw new Error(`Unknown project: ${project}`);
  return store.writeFile(env, cfg, path, j3(value), message);
}
__name(writeJson12, "writeJson");
async function parseResponse5(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}
__name(parseResponse5, "parseResponse");
async function sha256Hex12(value) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex12, "sha256Hex");
function normalize4(v) {
  return v.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}
__name(normalize4, "normalize");
function forbiddenDecisionText(value, field) {
  const n = normalize4(value);
  const forbidden = [
    [/\bsealed test certified\b/, "sealed-test certified"],
    [/\bcertified\b/, "certified"],
    [/\bcertification complete\b/, "certification complete"],
    [/\bproduction ready\b/, "production ready"],
    [/\bready for production\b/, "ready for production"],
    [/\bpromotable\b/, "promotable"],
    [/\bapproved for release\b/, "approved for release"],
    [/\brelease ready\b/, "release ready"],
    [/\bdeployment complete\b/, "deployment complete"],
    [/\bdeployed to production\b/, "deployed to production"],
    [/\bdeploy now\b/, "deploy now"],
    [/\bautomatic approval\b/, "automatic approval"],
    [/\bai approved advancement\b/, "AI-approved advancement"],
    [/\bno further review required\b/, "no further review required"]
  ];
  const hit = forbidden.find(([r]) => r.test(n));
  return hit ? errorResponse("HUMAN_ADVANCEMENT_DECISION_FORBIDDEN_CLAIM_INCLUDED", `${field} contains forbidden certification/promotion/deployment/automation language: ${hit[1]}`, 409) : null;
}
__name(forbiddenDecisionText, "forbiddenDecisionText");
function secretText2(value, field) {
  const patterns = [
    [/BEGIN PRIVATE KEY/i, "BEGIN PRIVATE KEY"],
    [/GITHUB_APP_PRIVATE_KEY/i, "GITHUB_APP_PRIVATE_KEY"],
    [/BROKER_KEY_/i, "BROKER_KEY_"],
    [/Authorization:/i, "Authorization:"],
    [/\bBearer\s+/i, "Bearer "],
    [/\bapi_key\b/i, "api_key"],
    [/\btoken=/i, "token="]
  ];
  const hit = patterns.find(([p]) => p.test(value));
  return hit ? errorResponse("HUMAN_ADVANCEMENT_DECISION_SECRET_MATERIAL_FORBIDDEN", `${field} contains forbidden secret-like material: ${hit[1]}`, 409) : null;
}
__name(secretText2, "secretText");
function validateText3(value, field) {
  return forbiddenDecisionText(value, field) || secretText2(value, field);
}
__name(validateText3, "validateText");
function stringList(value, field) {
  if (!Array.isArray(value))
    return [];
  return value.map((v, i) => reqStr3(v, `${field}[${i}]`));
}
__name(stringList, "stringList");
async function loadReviewEntry(env, project, body, store) {
  const id = optStr3(body.auditor_helper_execution_review_id);
  const path = optStr3(body.auditor_helper_execution_review_record_path);
  if (!id && !path)
    throw new Error("Invalid or missing field: auditor_helper_execution_review_id or auditor_helper_execution_review_record_path");
  const index = await fetchJson5(env, project, REVIEW_INDEX_PATH2, store);
  if (!index || index.schema_version !== "auditor_helper_execution_review_context_index.v0.1" || !Array.isArray(index.entries)) {
    throw new Error("Auditor helper execution review context index is missing or invalid");
  }
  const entry = index.entries.find((e) => {
    if (id && path)
      return e.auditor_helper_execution_review_id === id && e.auditor_helper_execution_review_record_path === path;
    return id && e.auditor_helper_execution_review_id === id || path && e.auditor_helper_execution_review_record_path === path;
  });
  if (!entry && id && path)
    throw new Error("Auditor helper execution review context fields conflict: auditor_helper_execution_review_id and auditor_helper_execution_review_record_path do not resolve to the same generated context entry");
  if (!entry)
    throw new Error(`No Auditor helper execution review context entry found for ${id || path}`);
  return { id: entry.auditor_helper_execution_review_id, path: entry.auditor_helper_execution_review_record_path };
}
__name(loadReviewEntry, "loadReviewEntry");
function validateReviewRecord(record) {
  if (record.schema_version !== "auditor_helper_execution_review_context.v0.1")
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_INVALID_REVIEW_RECORD", "Auditor helper execution review record schema is invalid", 409);
  if (record.official_artifact !== true || record.created_by_role !== "AUDITOR_AI")
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_INVALID_REVIEW_AUTHORITY", "Auditor helper execution review is not official Auditor output", 409);
  if (!record.source_helper_execution_report?.share_packet_hash || !record.source_helper_execution_report?.uncertainty)
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_SOURCE_BOUNDARY_REQUIRED", "Auditor review must preserve source boundary metadata", 409);
  if (!Array.isArray(record.source_helper_execution_report.resolved_source_artifacts) || record.source_helper_execution_report.resolved_source_artifacts.length === 0)
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_RESOLVED_SOURCES_REQUIRED", "Auditor review must preserve resolved source metadata", 409);
  if (!record.output_artifacts?.helper_execution_review)
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_REVIEW_ARTIFACT_REQUIRED", "Auditor review must include helper_execution_review artifact", 409);
  if (!hasLabels5(record.required_status_labels))
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_STATUS_LABELS_REQUIRED", "Auditor review is missing required status labels", 409);
  return null;
}
__name(validateReviewRecord, "validateReviewRecord");
function validateReviewArtifact(manifest, record) {
  if (!manifest || manifest.schema_version !== "flow_manifest.v0.3")
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_CODE_FLOW_NOT_FOUND", "Code flow manifest not found", 404);
  const flowId = record.source_helper_execution_report.code_flow_id;
  if (manifest.type !== "code_flow" || manifest.flow_id !== flowId)
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_CODE_FLOW_REQUIRED", "Human advancement decision target must be a code_flow", 409);
  const expected = record.output_artifacts.helper_execution_review;
  const actual = manifest.artifacts.find((a) => a.artifact_id === expected.artifact_id);
  if (!actual)
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_REVIEW_ARTIFACT_NOT_ON_CODE_FLOW", `Code flow does not contain helper_execution_review artifact ${expected.artifact_id}`, 409);
  if (expected.role !== "AUDITOR_AI" || actual.role !== "AUDITOR_AI" || expected.artifact_type !== "helper_execution_review" || actual.artifact_type !== "helper_execution_review")
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_REVIEW_ARTIFACT_TYPE_MISMATCH", "Expected helper_execution_review by AUDITOR_AI", 409);
  if (actual.source_path !== expected.source_path)
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_REVIEW_ARTIFACT_SOURCE_MISMATCH", "helper_execution_review source path mismatch", 409);
  if (actual.source_sha !== expected.source_sha)
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_REVIEW_ARTIFACT_SHA_MISMATCH", "helper_execution_review source SHA mismatch", 409);
  return null;
}
__name(validateReviewArtifact, "validateReviewArtifact");
async function writeArtifact6(request, env, project, flowId, title, body, store) {
  const url = new URL(request.url);
  const r = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, {
    method: "POST",
    headers: new Headers({ authorization: request.headers.get("authorization") || "", "content-type": "application/json" }),
    body: JSON.stringify({ project, artifact_type: "human_advancement_decision", title, body })
  });
  const response = await writeRouteScopedFlowArtifact(r, env, flowId, store);
  const parsed = await parseResponse5(response);
  if (!response.ok)
    return jsonResponse(parsed, response.status);
  if (!parsed?.artifact)
    return errorResponse("HUMAN_ADVANCEMENT_DECISION_ARTIFACT_WRITE_FAILED", "No artifact returned for human_advancement_decision", 500);
  return parsed.artifact;
}
__name(writeArtifact6, "writeArtifact");
function mdDecision(title, summary, outcome, nextAction, blockers, review) {
  return `# ${title}

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Boundary

This is a Human-owned advancement decision.

It is not deployment, certification, promotion, production readiness, or sealed-test certification.

## Decision Outcome

${outcome}

## Source

- auditor_helper_execution_review_id: ${review.auditor_helper_execution_review_id}
- helper_execution_report_id: ${review.source_helper_execution_report.helper_execution_report_id}
- helper_execution_intake_id: ${review.source_helper_execution_report.helper_execution_intake_id}
- code_flow_id: ${review.source_helper_execution_report.code_flow_id}
- share_packet_hash: ${review.source_helper_execution_report.share_packet_hash}
- auditor_review_verdict: ${review.review_verdict}
- uncertainty: ${review.source_helper_execution_report.uncertainty}

## Decision Summary

${summary}

## Required Next Action

${nextAction}

## Unresolved Blockers

${blockers.length ? blockers.map((b) => `- ${b}`).join("\n") : "- None declared."}

## Non-Promotion Rule

This decision only controls whether the chain may move to the next bounded stage. It does not deploy, certify, promote, or declare production readiness.
`;
}
__name(mdDecision, "mdDecision");
async function handleHumanAdvancementDecisionRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "HUMAN")
      return errorResponse("HUMAN_ADVANCEMENT_DECISION_ROLE_FORBIDDEN", "Only HUMAN may create Human advancement decisions", 403);
    if (request.method !== "POST")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error("Missing or invalid JSON body");
    const url = new URL(request.url);
    const project = projectName5(url, body);
    if (!getProject(project))
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${project}`, 404);
    const idempotencyKey = reqStr3(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(idempotencyKey))
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    const title = reqStr3(body.decision_title, "decision_title");
    const summary = reqStr3(body.decision_summary, "decision_summary");
    const outcome = reqStr3(body.decision_outcome, "decision_outcome");
    const nextAction = reqStr3(body.required_next_action, "required_next_action");
    if (!OUTCOMES.has(outcome))
      return errorResponse("BAD_REQUEST", "decision_outcome must be advance, require_revision, reject, or quarantine", 400);
    const unresolvedBlockers = stringList(body.unresolved_blockers, "unresolved_blockers");
    const findings = stringList(body.findings, "findings");
    for (const [field, value] of [["decision_title", title], ["decision_summary", summary], ["decision_outcome", outcome], ["required_next_action", nextAction]]) {
      const error = validateText3(value, field);
      if (error)
        return error;
    }
    for (let i = 0; i < unresolvedBlockers.length; i += 1) {
      const error = validateText3(unresolvedBlockers[i], `unresolved_blockers[${i}]`);
      if (error)
        return error;
    }
    for (let i = 0; i < findings.length; i += 1) {
      const error = validateText3(findings[i], `findings[${i}]`);
      if (error)
        return error;
    }
    const entry = await loadReviewEntry(env, project, body, repoStore);
    const review = await fetchJson5(env, project, entry.path, repoStore);
    if (!review)
      return errorResponse("HUMAN_ADVANCEMENT_DECISION_REVIEW_NOT_FOUND", `No Auditor helper execution review record found for ${entry.id}`, 404);
    if (review.auditor_helper_execution_review_id !== entry.id || review.auditor_helper_execution_review_record_path !== entry.path)
      return errorResponse("HUMAN_ADVANCEMENT_DECISION_REVIEW_CONTEXT_MISMATCH", "Auditor review does not match generated context", 409);
    const reviewError = validateReviewRecord(review);
    if (reviewError)
      return reviewError;
    const manifest = await fetchJson5(env, project, manifestPath5(review.source_helper_execution_report.code_flow_id), repoStore);
    const artifactError = validateReviewArtifact(manifest, review);
    if (artifactError)
      return artifactError;
    if (outcome === "advance" && review.review_verdict !== "AUDITOR_REVIEW_PASS")
      return errorResponse("HUMAN_ADVANCEMENT_DECISION_AUDITOR_REVIEW_NOT_PASS", "advance requires source Auditor review verdict AUDITOR_REVIEW_PASS", 409);
    if (outcome === "advance" && unresolvedBlockers.length > 0)
      return errorResponse("HUMAN_ADVANCEMENT_DECISION_UNRESOLVED_BLOCKERS_PRESENT", "advance is forbidden while unresolved blockers are present", 409);
    const decisionId = `${safe5(review.auditor_helper_execution_review_id, 90)}-${safe5(idempotencyKey, 36)}`;
    const payloadHash = await sha256Hex12(JSON.stringify({ project, idempotency_key: idempotencyKey, auditor_helper_execution_review_id: review.auditor_helper_execution_review_id, auditor_helper_execution_review_record_path: review.auditor_helper_execution_review_record_path, review_payload_hash: review.submitted_payload_hash, decision_title: title, decision_summary: summary, decision_outcome: outcome, required_next_action: nextAction, unresolved_blockers: unresolvedBlockers, findings }));
    const path = recordPath4(decisionId);
    const existing = await fetchJson5(env, project, path, repoStore);
    if (existing && existing.schema_version !== "human_advancement_decision_context.v0.1")
      return errorResponse("HUMAN_ADVANCEMENT_DECISION_EXISTING_RECORD_INVALID", "Existing Human decision idempotency record has invalid schema", 409);
    if (existing) {
      if (existing.submitted_payload_hash !== payloadHash)
        return errorResponse("HUMAN_ADVANCEMENT_DECISION_IDEMPOTENCY_CONFLICT", "Existing Human decision payload hash does not match", 409);
      return jsonResponse({ ok: true, idempotent_replay: true, human_advancement_decision: existing, required_status_labels: LABELS4() }, 200);
    }
    const flowId = review.source_helper_execution_report.code_flow_id;
    const decisionArtifact = await writeArtifact6(request, env, project, flowId, title, mdDecision(title, summary, outcome, nextAction, unresolvedBlockers, review), repoStore);
    if (decisionArtifact instanceof Response)
      return decisionArtifact;
    const record = {
      schema_version: "human_advancement_decision_context.v0.1",
      official_artifact: true,
      project,
      human_advancement_decision_id: decisionId,
      idempotency_key: idempotencyKey,
      created_at: iso3(),
      created_by_role: "HUMAN",
      decision_outcome: outcome,
      decision_summary: summary,
      required_next_action: nextAction,
      unresolved_blockers: unresolvedBlockers,
      findings,
      source_auditor_helper_execution_review: {
        auditor_helper_execution_review_id: review.auditor_helper_execution_review_id,
        auditor_helper_execution_review_record_path: review.auditor_helper_execution_review_record_path,
        helper_execution_report_id: review.source_helper_execution_report.helper_execution_report_id,
        helper_execution_intake_id: review.source_helper_execution_report.helper_execution_intake_id,
        coder_handoff_id: review.source_helper_execution_report.coder_handoff_id,
        implementation_bundle_id: review.source_helper_execution_report.implementation_bundle_id,
        code_flow_id: flowId,
        share_id: review.source_helper_execution_report.share_id,
        science_flow_id: review.source_helper_execution_report.science_flow_id,
        share_packet_hash: review.source_helper_execution_report.share_packet_hash,
        auditor_review_payload_hash: review.submitted_payload_hash,
        review_verdict: review.review_verdict,
        evidence_level: review.source_helper_execution_report.evidence_level,
        uncertainty: review.source_helper_execution_report.uncertainty,
        source_artifacts: review.source_helper_execution_report.source_artifacts,
        resolved_source_artifacts: review.source_helper_execution_report.resolved_source_artifacts,
        allowed_claims: review.source_helper_execution_report.allowed_claims,
        forbidden_claims: review.source_helper_execution_report.forbidden_claims
      },
      output_artifacts: { human_advancement_decision: decisionArtifact },
      submitted_payload_hash: payloadHash,
      human_advancement_decision_record_path: path,
      generated_human_advancement_decision_context_path: DECISION_INDEX_PATH,
      required_status_labels: LABELS4()
    };
    const index = await fetchJson5(env, project, DECISION_INDEX_PATH, repoStore) || { schema_version: "human_advancement_decision_context_index.v0.1", project, updated_at: iso3(), entries: [] };
    if (!Array.isArray(index.entries))
      index.entries = [];
    const idx = { human_advancement_decision_id: decisionId, auditor_helper_execution_review_id: review.auditor_helper_execution_review_id, helper_execution_report_id: review.source_helper_execution_report.helper_execution_report_id, code_flow_id: flowId, share_id: review.source_helper_execution_report.share_id, share_packet_hash: review.source_helper_execution_report.share_packet_hash, decision_outcome: outcome, review_verdict: review.review_verdict, evidence_level: review.source_helper_execution_report.evidence_level, uncertainty: review.source_helper_execution_report.uncertainty, human_advancement_decision_record_path: path, created_at: record.created_at };
    index.entries = index.entries.filter((e) => e.human_advancement_decision_id !== decisionId);
    index.entries.unshift(idx);
    index.updated_at = iso3();
    const indexWrite = await writeJson12(env, project, DECISION_INDEX_PATH, index, `Update Human advancement decision context ${decisionId}`, repoStore);
    record.generated_human_advancement_decision_context_sha = indexWrite.sha;
    const recordWrite = await writeJson12(env, project, path, record, `Write Human advancement decision ${decisionId}`, repoStore);
    return jsonResponse({ ok: true, idempotent_replay: false, project, human_advancement_decision: { ...record, human_advancement_decision_record_sha: recordWrite.sha }, required_status_labels: LABELS4() }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be") || message.includes("findings") || message.includes("unresolved_blockers"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("Auditor helper execution review context fields conflict"))
      return errorResponse("HUMAN_ADVANCEMENT_DECISION_REVIEW_CONTEXT_MISMATCH", message, 409);
    if (message.includes("No Auditor helper execution review context entry") || message.includes("Auditor helper execution review context index is missing"))
      return errorResponse("HUMAN_ADVANCEMENT_DECISION_REVIEW_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleHumanAdvancementDecisionRequest, "handleHumanAdvancementDecisionRequest");

// src/coder_handoff.ts
function labels2() {
  return [...STATUS_LABELS];
}
__name(labels2, "labels");
function opt2(v) {
  return typeof v === "string" ? v.trim() : "";
}
__name(opt2, "opt");
function req2(v, f) {
  if (typeof v !== "string" || !v.trim())
    throw new Error(`Invalid or missing field: ${f}`);
  return v.trim();
}
__name(req2, "req");
function safe6(v, max = 96) {
  return v.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, max);
}
__name(safe6, "safe");
function now3() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(now3, "now");
function json(v) {
  return `${JSON.stringify(v, null, 2)}
`;
}
__name(json, "json");
function indexPath() {
  return "governance/context/generated_coder_implementation_bundle_context.json";
}
__name(indexPath, "indexPath");
function handoffIndexPath2() {
  return "governance/context/generated_coder_handoff_context.json";
}
__name(handoffIndexPath2, "handoffIndexPath");
function recordPath5(id) {
  return `governance/context/coder_handoff/${id}.json`;
}
__name(recordPath5, "recordPath");
function manifestPath6(id) {
  return `governance/flows/${id}/flow_manifest.json`;
}
__name(manifestPath6, "manifestPath");
function hasLabels6(xs) {
  return labels2().every((x) => Array.isArray(xs) && xs.includes(x));
}
__name(hasLabels6, "hasLabels");
function projectName6(url, body) {
  return opt2(body.project) || url.searchParams.get("project") || "ArqonZero";
}
__name(projectName6, "projectName");
function authHeaders2(request) {
  const h = new Headers({ "content-type": "application/json" });
  const a = request.headers.get("authorization");
  if (a)
    h.set("authorization", a);
  return h;
}
__name(authHeaders2, "authHeaders");
async function readBody2(request) {
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object" || Array.isArray(b))
    throw new Error("Missing or invalid JSON body");
  return b;
}
__name(readBody2, "readBody");
async function sha256Hex13(value) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex13, "sha256Hex");
async function fetchJson6(env, projectName7, path, store) {
  const p = getProject(projectName7);
  if (!p)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const f = await store.fetchFile(env, p, path);
    return JSON.parse(f.content);
  } catch (e) {
    if (e instanceof Error && e.message.includes("404"))
      return null;
    throw e;
  }
}
__name(fetchJson6, "fetchJson");
async function writeJson13(env, projectName7, path, value, message, store) {
  const p = getProject(projectName7);
  if (!p)
    throw new Error(`Unknown project: ${projectName7}`);
  return store.writeFile(env, p, path, json(value), message);
}
__name(writeJson13, "writeJson");
async function parseResponse6(r) {
  const t = await r.text();
  if (!t)
    return null;
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}
__name(parseResponse6, "parseResponse");
function normalize5(s) {
  return s.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}
__name(normalize5, "normalize");
function validateText4(value) {
  const n = normalize5(value);
  const promotion = [[/\bsealed test certified\b/, "sealed-test certified"], [/\bcertified\b/, "certified"], [/\bcertification\b/, "certification"], [/\bproduction ready\b/, "production ready"], [/\bready for production\b/, "ready for production"], [/\bproduct ready\b/, "product ready"], [/\bpromotable\b/, "promotable"], [/\bapproved for release\b/, "approved for release"], [/\brelease ready\b/, "release ready"]];
  const p = promotion.find(([r]) => r.test(n));
  if (p)
    return errorResponse("CODER_HANDOFF_FORBIDDEN_CLAIM_INCLUDED", `Coder handoff contains forbidden promotion language: ${p[1]}`, 409);
  const exec = [[/\bhelper may execute\b/, "helper may execute"], [/\bhelper can execute\b/, "helper can execute"], [/\bexecution is authorized\b/, "execution is authorized"], [/\bauthorized for execution\b/, "authorized for execution"], [/\bapply the patch\b/, "apply the patch"], [/\bdeploy now\b/, "deploy now"], [/\bno further review required\b/, "no further review required"], [/\bready for helper execution\b/, "ready for helper execution"], [/\bhelper should run\b/, "helper should run"], [/\brun the commands\b/, "run the commands"], [/\bexecute the bundle\b/, "execute the bundle"]];
  const e = exec.find(([r]) => r.test(n));
  if (e)
    return errorResponse("CODER_HANDOFF_EXECUTION_AUTHORITY_FORBIDDEN", `Coder handoff may not authorize Helper execution: ${e[1]}`, 409);
  return null;
}
__name(validateText4, "validateText");
async function loadBundleEntry(env, projectName7, body, store) {
  const id = opt2(body.implementation_bundle_id);
  const path = opt2(body.implementation_bundle_record_path);
  if (!id && !path)
    throw new Error("Invalid or missing field: implementation_bundle_id or implementation_bundle_record_path");
  const idx = await fetchJson6(env, projectName7, indexPath(), store);
  if (!idx || idx.schema_version !== "coder_implementation_bundle_context_index.v0.1" || !Array.isArray(idx.entries))
    throw new Error("Coder implementation bundle context index is missing or invalid");
  const entry = idx.entries.find((x) => id && path ? x.implementation_bundle_id === id && x.implementation_bundle_record_path === path : id && x.implementation_bundle_id === id || path && x.implementation_bundle_record_path === path);
  if (!entry && id && path)
    throw new Error("Coder implementation bundle context fields conflict: implementation_bundle_id and implementation_bundle_record_path do not resolve to the same generated context entry");
  if (!entry)
    throw new Error(`No Coder implementation bundle context entry found for ${id || path}`);
  return { implementation_bundle_id: entry.implementation_bundle_id, implementation_bundle_record_path: entry.implementation_bundle_record_path };
}
__name(loadBundleEntry, "loadBundleEntry");
function validateBundleRecord(record) {
  if (record.schema_version !== "coder_implementation_bundle_context.v0.1")
    return errorResponse("CODER_HANDOFF_INVALID_IMPLEMENTATION_BUNDLE_RECORD", "Implementation bundle record schema is invalid", 409);
  if (record.official_artifact !== true || record.created_by_role !== "CODER_AI")
    return errorResponse("CODER_HANDOFF_INVALID_IMPLEMENTATION_BUNDLE_AUTHORITY", "Implementation bundle record is not official Coder output", 409);
  if (!record.source_coder_tasks || !record.output_artifacts?.implementation_bundle)
    return errorResponse("CODER_HANDOFF_IMPLEMENTATION_BUNDLE_INCOMPLETE", "Implementation bundle record is missing source Coder tasks or implementation_bundle artifact", 409);
  if (!record.source_coder_tasks.share_packet_hash || !record.source_coder_tasks.uncertainty)
    return errorResponse("CODER_HANDOFF_SOURCE_BOUNDARY_REQUIRED", "Implementation bundle record must preserve share hash and uncertainty", 409);
  if (!Array.isArray(record.source_coder_tasks.forbidden_claims) || record.source_coder_tasks.forbidden_claims.length === 0)
    return errorResponse("CODER_HANDOFF_FORBIDDEN_CLAIMS_REQUIRED", "Implementation bundle record must preserve forbidden claims", 409);
  if (!Array.isArray(record.source_coder_tasks.resolved_source_artifacts) || record.source_coder_tasks.resolved_source_artifacts.length === 0)
    return errorResponse("CODER_HANDOFF_RESOLVED_SOURCES_REQUIRED", "Implementation bundle record must preserve resolved source metadata", 409);
  if (!hasLabels6(record.required_status_labels))
    return errorResponse("CODER_HANDOFF_STATUS_LABELS_REQUIRED", "Implementation bundle record is missing required diagnostic status labels", 409);
  return null;
}
__name(validateBundleRecord, "validateBundleRecord");
function validateManifest3(manifest, record) {
  if (!manifest || manifest.schema_version !== "flow_manifest.v0.3")
    return errorResponse("CODER_HANDOFF_CODE_FLOW_NOT_FOUND", "Code flow manifest not found", 404);
  if (manifest.type !== "code_flow" || manifest.flow_id !== record.source_coder_tasks.code_flow_id)
    return errorResponse("CODER_HANDOFF_CODE_FLOW_REQUIRED", "Coder handoff target must be a code_flow", 409);
  const expected = record.output_artifacts.implementation_bundle;
  const actual = manifest.artifacts.find((a) => a.artifact_id === expected.artifact_id);
  if (!actual)
    return errorResponse("CODER_HANDOFF_IMPLEMENTATION_BUNDLE_ARTIFACT_NOT_ON_CODE_FLOW", `Code flow does not contain required implementation_bundle artifact ${expected.artifact_id}`, 409);
  if (actual.artifact_type !== "implementation_bundle" || actual.role !== "CODER_AI")
    return errorResponse("CODER_HANDOFF_IMPLEMENTATION_BUNDLE_ARTIFACT_TYPE_MISMATCH", `Expected implementation_bundle by CODER_AI for ${expected.artifact_id}`, 409);
  if (actual.source_path !== expected.source_path)
    return errorResponse("CODER_HANDOFF_IMPLEMENTATION_BUNDLE_ARTIFACT_SOURCE_MISMATCH", `Implementation bundle artifact source path mismatch for ${expected.artifact_id}`, 409);
  if (actual.source_sha !== expected.source_sha)
    return errorResponse("CODER_HANDOFF_IMPLEMENTATION_BUNDLE_ARTIFACT_SHA_MISMATCH", `Implementation bundle artifact source sha mismatch for ${expected.artifact_id}`, 409);
  return null;
}
__name(validateManifest3, "validateManifest");
function handoffId(implId, key) {
  return `${safe6(implId, 90)}-${safe6(key, 36)}`;
}
__name(handoffId, "handoffId");
function markdown2(record, id, title, body) {
  return `# ${title}

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Coder Handoff Boundary

This is a Coder-owned handoff package derived from an accepted implementation_bundle.

It is not Helper execution authorization, not an executed patch, not deployment, not audit certification, and not promotion.

## Source Chain

- coder_handoff_id: ${id}
- implementation_bundle_id: ${record.implementation_bundle_id}
- coder_tasks_id: ${record.source_coder_tasks.coder_tasks_id}
- code_flow_id: ${record.source_coder_tasks.code_flow_id}
- share_packet_hash: ${record.source_coder_tasks.share_packet_hash}
- implementation_bundle_payload_hash: ${record.submitted_payload_hash}
- evidence_level: ${record.source_coder_tasks.evidence_level}
- uncertainty: ${record.source_coder_tasks.uncertainty}

## Coder Handoff Body

${body}

## Non-Execution Rule

Helper execution, patch application, deployment, audit, promotion, and Human advancement require later explicit gated stages.
`;
}
__name(markdown2, "markdown");
async function writeArtifact7(request, env, flowId, projectName7, title, body, store) {
  const url = new URL(request.url);
  const r = new Request(`${url.origin}/v1/flows/${encodeURIComponent(flowId)}/artifacts`, { method: "POST", headers: authHeaders2(request), body: JSON.stringify({ project: projectName7, artifact_type: "coder_handoff", title, body }) });
  const response = await writeRouteScopedFlowArtifact(r, env, flowId, store);
  const parsed = await parseResponse6(response);
  if (!response.ok)
    return jsonResponse(parsed, response.status);
  const artifact = parsed.artifact;
  if (!artifact)
    return errorResponse("CODER_HANDOFF_ARTIFACT_WRITE_FAILED", "Artifact write did not return coder_handoff summary", 500);
  return artifact;
}
__name(writeArtifact7, "writeArtifact");
async function loadHandoffIndex2(env, projectName7, store) {
  const existing = await fetchJson6(env, projectName7, handoffIndexPath2(), store);
  if (existing && existing.schema_version === "coder_handoff_context_index.v0.1" && Array.isArray(existing.entries))
    return existing;
  return { schema_version: "coder_handoff_context_index.v0.1", project: projectName7, updated_at: now3(), entries: [] };
}
__name(loadHandoffIndex2, "loadHandoffIndex");
function upsertIndex(index, record) {
  const entry = {
    coder_handoff_id: record.coder_handoff_id,
    implementation_bundle_id: record.source_implementation_bundle.implementation_bundle_id,
    coder_tasks_id: record.source_implementation_bundle.coder_tasks_id,
    code_flow_id: record.source_implementation_bundle.code_flow_id,
    share_packet_hash: record.source_implementation_bundle.share_packet_hash,
    evidence_level: record.source_implementation_bundle.evidence_level,
    uncertainty: record.source_implementation_bundle.uncertainty,
    coder_handoff_record_path: record.coder_handoff_record_path,
    created_at: record.created_at
  };
  const i = index.entries.findIndex((x) => x.coder_handoff_id === record.coder_handoff_id);
  if (i >= 0)
    index.entries[i] = entry;
  else
    index.entries.push(entry);
  index.updated_at = now3();
  index.entries.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}
__name(upsertIndex, "upsertIndex");
async function handleCoderHandoffRequest(request, env, repoStore = githubRepoStore) {
  try {
    const role = requireRole(request, env);
    if (role !== "CODER_AI")
      return errorResponse("CODER_HANDOFF_ROLE_FORBIDDEN", "Only CODER_AI may create Coder handoff artifacts", 403);
    if (request.method !== "POST")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const url = new URL(request.url);
    const body = await readBody2(request);
    const project = projectName6(url, body);
    if (!getProject(project))
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${project}`, 404);
    const key = req2(body.idempotency_key, "idempotency_key");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/.test(key))
      return errorResponse("BAD_REQUEST", "idempotency_key must be 8-128 chars and contain only letters, numbers, dot, underscore, or dash", 400);
    const title = req2(body.handoff_title, "handoff_title");
    const handoffBody = req2(body.handoff_body, "handoff_body");
    const titleError = validateText4(title);
    if (titleError)
      return titleError;
    const bodyError = validateText4(handoffBody);
    if (bodyError)
      return bodyError;
    const entry = await loadBundleEntry(env, project, body, repoStore);
    const bundle = await fetchJson6(env, project, entry.implementation_bundle_record_path, repoStore);
    if (!bundle)
      return errorResponse("CODER_HANDOFF_IMPLEMENTATION_BUNDLE_RECORD_NOT_FOUND", `No Coder implementation bundle record found for ${entry.implementation_bundle_id}`, 404);
    if (bundle.implementation_bundle_id !== entry.implementation_bundle_id || bundle.implementation_bundle_record_path !== entry.implementation_bundle_record_path)
      return errorResponse("CODER_HANDOFF_IMPLEMENTATION_BUNDLE_CONTEXT_MISMATCH", "Implementation bundle record does not match generated implementation bundle context", 409);
    const recordError = validateBundleRecord(bundle);
    if (recordError)
      return recordError;
    const manifest = await fetchJson6(env, project, manifestPath6(bundle.source_coder_tasks.code_flow_id), repoStore);
    const manifestError = validateManifest3(manifest, bundle);
    if (manifestError)
      return manifestError;
    const id = handoffId(bundle.implementation_bundle_id, key);
    const payloadHash = await sha256Hex13(JSON.stringify({ project, idempotency_key: key, implementation_bundle_id: bundle.implementation_bundle_id, implementation_bundle_record_path: bundle.implementation_bundle_record_path, implementation_bundle_payload_hash: bundle.submitted_payload_hash, share_packet_hash: bundle.source_coder_tasks.share_packet_hash, handoff_title: title, handoff_body: handoffBody }));
    const path = recordPath5(id);
    const existing = await fetchJson6(env, project, path, repoStore);
    if (existing && existing.schema_version !== "coder_handoff_context.v0.1")
      return errorResponse("CODER_HANDOFF_EXISTING_RECORD_INVALID", "Existing Coder handoff idempotency record has invalid schema", 409);
    if (existing && existing.schema_version === "coder_handoff_context.v0.1") {
      if (existing.submitted_payload_hash !== payloadHash)
        return errorResponse("CODER_HANDOFF_IDEMPOTENCY_CONFLICT", "Existing Coder handoff idempotency record exists but submitted payload hash does not match", 409);
      return jsonResponse({ ok: true, idempotent_replay: true, coder_handoff: existing, required_status_labels: labels2() }, 200);
    }
    const artifact = await writeArtifact7(request, env, bundle.source_coder_tasks.code_flow_id, project, title, markdown2(bundle, id, title, handoffBody), repoStore);
    if (artifact instanceof Response)
      return artifact;
    const created = now3();
    const record = {
      schema_version: "coder_handoff_context.v0.1",
      official_artifact: true,
      project,
      coder_handoff_id: id,
      idempotency_key: key,
      created_at: created,
      created_by_role: "CODER_AI",
      source_implementation_bundle: { implementation_bundle_id: bundle.implementation_bundle_id, implementation_bundle_record_path: bundle.implementation_bundle_record_path, ...bundle.source_coder_tasks, pm_handoff_id: bundle.source_coder_tasks.handoff_id, implementation_bundle_payload_hash: bundle.submitted_payload_hash },
      output_artifacts: { coder_handoff: artifact },
      submitted_payload_hash: payloadHash,
      coder_handoff_record_path: path,
      generated_coder_handoff_context_path: handoffIndexPath2(),
      required_status_labels: labels2()
    };
    const idx = await loadHandoffIndex2(env, project, repoStore);
    upsertIndex(idx, record);
    const idxWrite = await writeJson13(env, project, handoffIndexPath2(), idx, `Update Coder handoff context ${id}`, repoStore);
    record.generated_coder_handoff_context_sha = idxWrite.sha;
    const recWrite = await writeJson13(env, project, path, record, `Write Coder handoff record ${id}`, repoStore);
    return jsonResponse({ ok: true, idempotent_replay: false, project, coder_handoff: { ...record, coder_handoff_record_sha: recWrite.sha }, required_status_labels: labels2() }, 201);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Missing") || message.includes("must be"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("Coder implementation bundle context fields conflict"))
      return errorResponse("CODER_HANDOFF_IMPLEMENTATION_BUNDLE_CONTEXT_MISMATCH", message, 409);
    if (message.includes("No Coder implementation bundle context entry"))
      return errorResponse("CODER_HANDOFF_IMPLEMENTATION_BUNDLE_CONTEXT_NOT_FOUND", message, 404);
    if (message.includes("Coder implementation bundle context index is missing"))
      return errorResponse("CODER_HANDOFF_IMPLEMENTATION_BUNDLE_CONTEXT_NOT_FOUND", message, 404);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleCoderHandoffRequest, "handleCoderHandoffRequest");

// src/read_resume.ts
var ARTIFACT_OPEN_DEFAULT_SCAN_LIMIT = 4;
var ARTIFACT_OPEN_MAX_SCAN_LIMIT = 8;
var SECRET_LIKE_PATTERNS = [
  { name: "PRIVATE_KEY_BLOCK", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "GITHUB_TOKEN", pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { name: "OPENAI_STYLE_API_KEY", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: "BEARER_TOKEN", pattern: /\bBearer\s+[A-Za-z0-9._~+\/=:-]{20,}/i },
  { name: "SECRET_ASSIGNMENT", pattern: /\b(?:api[_-]?key|secret|token|password|private[_-]?key)\s*[:=]\s*[\"']?[A-Za-z0-9._~+\/=:-]{12,}/i }
];
var UNIVERSAL_READ_ROUTES = [
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
var FORBIDDEN_CLAIMS = [
  "certification",
  "promotion",
  "deployment approval",
  "production readiness",
  "autonomous Science operation",
  "scientific truth without harness evidence",
  "sealed-test certification"
];
var TRUTH_BOUNDARY = "Routed artifacts are governed records, not scientific truth. Raw GPT output is not evidence. No harness = No truth.";
function requiredStatusLabels12() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels12, "requiredStatusLabels");
function getParam12(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam12, "getParam");
function projectNameFrom11(url) {
  return getParam12(url, "project") || "ArqonZero";
}
__name(projectNameFrom11, "projectNameFrom");
function flowIndexPath3() {
  return "governance/flows/flow_index.json";
}
__name(flowIndexPath3, "flowIndexPath");
function flowManifestPath9(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(flowManifestPath9, "flowManifestPath");
function looksLikeFlowId2(flowRef) {
  return /^FLOW-\d{4}-\d{4}$/.test(flowRef);
}
__name(looksLikeFlowId2, "looksLikeFlowId");
function roleFamily(role) {
  if (role === "HUMAN")
    return "human";
  if (role === "SCIENCE_EXECUTOR_AI")
    return "science_executor";
  if (["EXPLORER_AI", "HYPOTHESIZER_AI", "DESIGNER_AI", "SCIENCE_AUDITOR_AI"].includes(role))
    return "science_gpt";
  if (["PM_AI", "CODER_AI", "HELPER_AI", "HELPER_CODEX", "AUDITOR_AI"].includes(role))
    return "code_governance_gpt";
  return "unknown";
}
__name(roleFamily, "roleFamily");
function isGptRole(role) {
  return role !== "HUMAN" && role !== "SCIENCE_EXECUTOR_AI";
}
__name(isGptRole, "isGptRole");
function allowedWriteRoutes(role) {
  const routes = [];
  if (role === "HUMAN") {
    routes.push("POST /v1/flows/{flow_ref}/advance", "POST /v1/science/share", "POST /v1/human/advancement-decision");
  }
  if (role === "PM_AI")
    routes.push("POST /v1/flows", "POST /v1/pm/intake", "POST /v1/pm/specify", "POST /v1/pm/plan", "POST /v1/pm/tasking", "POST /v1/pm/handoff");
  if (role === "CODER_AI")
    routes.push("POST /v1/coder/work-plan", "POST /v1/coder/tasks", "POST /v1/coder/implementation-bundle", "POST /v1/coder/handoff");
  if (role === "HELPER_AI")
    routes.push("POST /v1/helper/execution-intake", "POST /v1/helper/execution-report");
  if (role === "AUDITOR_AI")
    routes.push("POST /v1/auditor/helper-execution-review");
  if (role === "EXPLORER_AI")
    routes.push("POST /v1/flows", "POST /v1/science/research");
  if (role === "HYPOTHESIZER_AI")
    routes.push("POST /v1/science/hypothesize", "POST /v1/science/interpret", "POST /v1/science/iterate");
  if (role === "DESIGNER_AI")
    routes.push("POST /v1/science/design-experiment", "POST /v1/science/iterate");
  if (role === "SCIENCE_EXECUTOR_AI")
    routes.push("POST /v1/science/execute-experiment");
  if (role === "SCIENCE_AUDITOR_AI")
    routes.push("POST /v1/science/audit-experiment", "POST /v1/science/record-finding");
  return routes;
}
__name(allowedWriteRoutes, "allowedWriteRoutes");
function forbiddenRoutes(role) {
  const common = [
    "POST /v1/queue/{queue_id}/claim",
    "POST /v1/queue/{queue_id}/complete",
    "POST /v1/queue/{queue_id}/block",
    "POST /v1/queue/{queue_id}/quarantine",
    "POST /v1/queue/{queue_id}/handoff"
  ];
  if (role !== "HUMAN")
    common.push("POST /v1/flows/{flow_ref}/advance", "POST /v1/science/share");
  if (isGptRole(role))
    common.push("POST /v1/science/execute-experiment");
  if (role === "SCIENCE_EXECUTOR_AI")
    common.push("POST /v1/science/hypothesize", "POST /v1/science/design-experiment", "POST /v1/science/audit-experiment", "POST /v1/science/share");
  return common;
}
__name(forbiddenRoutes, "forbiddenRoutes");
function jsonUnknown(note) {
  return [note];
}
__name(jsonUnknown, "jsonUnknown");
async function loadFlowIndex3(env, projectName7, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, flowIndexPath3());
    const parsed = JSON.parse(file.content);
    if (parsed.schema_version !== "flow_index.v0.3" || !Array.isArray(parsed.flows)) {
      throw new Error("Invalid flow index schema");
    }
    return parsed;
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) {
      return { schema_version: "flow_index.v0.3", project: projectName7, updated_at: "UNKNOWN", flows: [] };
    }
    throw err;
  }
}
__name(loadFlowIndex3, "loadFlowIndex");
async function loadFlowManifest3(env, projectName7, flowId, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  const file = await store.fetchFile(env, project, flowManifestPath9(flowId));
  const parsed = JSON.parse(file.content);
  if (parsed.schema_version !== "flow_manifest.v0.3" || parsed.flow_id !== flowId) {
    throw new Error(`Invalid flow manifest schema for ${flowId}`);
  }
  return parsed;
}
__name(loadFlowManifest3, "loadFlowManifest");
async function resolveFlow(env, projectName7, flowRef, store) {
  const index = await loadFlowIndex3(env, projectName7, store);
  const direct = index.flows.find((entry) => entry.flow_id === flowRef);
  if (direct)
    return { index, flowId: direct.flow_id };
  const byName = index.flows.filter((entry) => entry.name === flowRef);
  if (byName.length === 1)
    return { index, flowId: byName[0].flow_id };
  if (byName.length > 1) {
    return errorResponse("FLOW_REF_AMBIGUOUS", `Multiple flows match ref: ${flowRef}`, 409);
  }
  if (looksLikeFlowId2(flowRef)) {
    try {
      await loadFlowManifest3(env, projectName7, flowRef, store);
      return { index, flowId: flowRef };
    } catch {
    }
  }
  return errorResponse("FLOW_NOT_FOUND", `No flow found for ref: ${flowRef}`, 404);
}
__name(resolveFlow, "resolveFlow");
function artifactSortDescending(a, b) {
  return Date.parse(b.created_at) - Date.parse(a.created_at) || a.artifact_id.localeCompare(b.artifact_id);
}
__name(artifactSortDescending, "artifactSortDescending");
function safeArtifactMetadata(artifact) {
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
__name(safeArtifactMetadata, "safeArtifactMetadata");
function latestArtifacts(manifest) {
  const latest = {};
  for (const artifact of [...manifest.artifacts].sort(artifactSortDescending)) {
    if (!latest[artifact.artifact_type])
      latest[artifact.artifact_type] = safeArtifactMetadata(artifact);
  }
  return latest;
}
__name(latestArtifacts, "latestArtifacts");
function latestByRole(manifest) {
  const latest = {};
  for (const artifact of [...manifest.artifacts].sort(artifactSortDescending)) {
    if (!latest[artifact.role])
      latest[artifact.role] = safeArtifactMetadata(artifact);
  }
  return latest;
}
__name(latestByRole, "latestByRole");
function countUnsafeArtifacts(artifacts) {
  return artifacts.map(safeArtifactMetadata).filter((artifact) => artifact.path_safety === "UNSAFE").length;
}
__name(countUnsafeArtifacts, "countUnsafeArtifacts");
function findSecretLikeMarkers(content) {
  return SECRET_LIKE_PATTERNS.filter((rule) => rule.pattern.test(content)).map((rule) => rule.name);
}
__name(findSecretLikeMarkers, "findSecretLikeMarkers");
function summarizeFlow(entry, manifest) {
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
__name(summarizeFlow, "summarizeFlow");
function hasArtifact(manifest, artifactType) {
  return manifest.artifacts.some((artifact) => artifact.artifact_type === artifactType);
}
__name(hasArtifact, "hasArtifact");
function hasAnyArtifact2(manifest, artifactTypes2) {
  return artifactTypes2.some((type) => hasArtifact(manifest, type));
}
__name(hasAnyArtifact2, "hasAnyArtifact");
function deriveNext(manifest) {
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
    if (!hasAnyArtifact2(manifest, ["research_dossier", "source_map", "contradiction_map", "open_questions"])) {
      return { next_allowed_action: "create research artifact", next_allowed_route: "POST /v1/science/research", next_allowed_role: "EXPLORER_AI", next_allowed_artifact_type_if_any: "research_dossier", requires_human_gate: false, unknowns: [] };
    }
    if (!hasAnyArtifact2(manifest, ["hypothesis_card", "null_hypothesis", "prediction_record"])) {
      return { next_allowed_action: "create hypothesis artifact", next_allowed_route: "POST /v1/science/hypothesize", next_allowed_role: "HYPOTHESIZER_AI", next_allowed_artifact_type_if_any: "hypothesis_card", requires_human_gate: false, unknowns: [] };
    }
    if (!hasAnyArtifact2(manifest, ["experiment_protocol", "metric_plan", "control_plan", "execution_packet", "sealed_boundary_plan"])) {
      return { next_allowed_action: "create experiment design artifact", next_allowed_route: "POST /v1/science/design-experiment", next_allowed_role: "DESIGNER_AI", next_allowed_artifact_type_if_any: "experiment_protocol", requires_human_gate: false, unknowns: [] };
    }
    if (!hasAnyArtifact2(manifest, ["execution_report", "evidence_manifest", "command_log", "raw_result_index", "deviation_report"])) {
      return { next_allowed_action: "local Science Executor evidence required", next_allowed_route: "POST /v1/science/execute-experiment", next_allowed_role: "SCIENCE_EXECUTOR_AI", next_allowed_artifact_type_if_any: "execution_report", requires_human_gate: false, unknowns: [] };
    }
    if (!hasAnyArtifact2(manifest, ["audit_report", "evidence_audit", "claim_scope_audit", "protocol_audit"])) {
      return { next_allowed_action: "audit experiment evidence", next_allowed_route: "POST /v1/science/audit-experiment", next_allowed_role: "SCIENCE_AUDITOR_AI", next_allowed_artifact_type_if_any: "audit_report", requires_human_gate: false, unknowns: [] };
    }
    if (!hasAnyArtifact2(manifest, ["finding_record", "negative_finding_record", "inconclusive_finding_record", "finding_boundary_record"])) {
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
__name(deriveNext, "deriveNext");
function globalStopConditions() {
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
__name(globalStopConditions, "globalStopConditions");
function roleStopConditions(role) {
  const stops = ["raw GPT output presented as evidence", "routed artifact presented as scientific truth"];
  if (role !== "HUMAN")
    stops.push("attempt to advance flow", "attempt to use /v1/science/share");
  if (isGptRole(role))
    stops.push("attempt to execute Science experiment");
  if (role === "SCIENCE_EXECUTOR_AI")
    stops.push("attempt to hypothesize/design/audit/share/advance");
  return stops;
}
__name(roleStopConditions, "roleStopConditions");
function flowSpecificStopConditions(manifest) {
  const conditions = [];
  if (manifest.status === "blocked")
    conditions.push("flow status is blocked");
  if (manifest.type === "science_flow" && hasAnyArtifact2(manifest, ["execution_report", "evidence_manifest", "command_log"]) && !hasAnyArtifact2(manifest, ["audit_report", "evidence_audit", "claim_scope_audit", "protocol_audit"])) {
    conditions.push("execution evidence exists but audit evidence is missing");
  }
  if (manifest.type === "science_flow" && hasAnyArtifact2(manifest, ["finding_record", "negative_finding_record", "inconclusive_finding_record", "finding_boundary_record"]) && !hasArtifact(manifest, "share_packet")) {
    conditions.push("finding exists but official Human share has not occurred");
  }
  return conditions;
}
__name(flowSpecificStopConditions, "flowSpecificStopConditions");
function whoamiBody(projectName7, role) {
  return {
    ok: true,
    project: projectName7,
    authenticated_role: role,
    role_family: roleFamily(role),
    is_human: role === "HUMAN",
    is_gpt_role: isGptRole(role),
    is_science_executor: role === "SCIENCE_EXECUTOR_AI",
    status_labels: requiredStatusLabels12(),
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
__name(whoamiBody, "whoamiBody");
function capabilitiesBody(projectName7, role) {
  return {
    ok: true,
    project: projectName7,
    authenticated_role: role,
    read_capabilities: UNIVERSAL_READ_ROUTES,
    write_capabilities: allowedWriteRoutes(role),
    human_only_capabilities: ["POST /v1/flows/{flow_ref}/advance", "POST /v1/science/share", "promotion/certification/deployment decisions remain outside this slice"],
    executor_only_capabilities: ["POST /v1/science/execute-experiment"],
    forbidden_capabilities: forbiddenRoutes(role),
    artifact_read_scope: "governed flow artifacts only; /v1/artifacts/{artifact_id} resolves only known artifact IDs from flow manifests",
    artifact_write_scope: ROLE_FLOW_ARTIFACTS,
    flow_artifact_slots: FLOW_ARTIFACT_SLOTS,
    status_labels: requiredStatusLabels12(),
    truth_boundary: TRUTH_BOUNDARY
  };
}
__name(capabilitiesBody, "capabilitiesBody");
async function handleShow(request, env, store) {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = projectNameFrom11(url);
  const index = await loadFlowIndex3(env, projectName7, store);
  const limit = Number.parseInt(getParam12(url, "limit") || "10", 10);
  const boundedLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 10;
  const recentEntries = [...index.flows].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)).slice(0, boundedLimit);
  const manifests = /* @__PURE__ */ new Map();
  for (const entry of recentEntries) {
    try {
      manifests.set(entry.flow_id, await loadFlowManifest3(env, projectName7, entry.flow_id, store));
    } catch {
    }
  }
  const summarize = /* @__PURE__ */ __name((entry) => summarizeFlow(entry, manifests.get(entry.flow_id)), "summarize");
  return jsonResponse({
    ok: true,
    project: projectName7,
    active_flows: index.flows.filter((flow) => flow.status === "active").slice(0, boundedLimit).map(summarize),
    blocked_flows: index.flows.filter((flow) => flow.status === "blocked").slice(0, boundedLimit).map(summarize),
    waiting_for_human_review: index.flows.filter((flow) => ["INTEGRITY_GATE_PASSED", "CLAIM_OR_PROMOTION_CANDIDATE"].includes(flow.current_gate)).slice(0, boundedLimit).map(summarize),
    recent_flows: recentEntries.map(summarize),
    status_labels: requiredStatusLabels12(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: index.flows.length === 0 ? jsonUnknown("NO_FLOWS_FOUND") : []
  });
}
__name(handleShow, "handleShow");
async function buildFlowResume(env, projectName7, role, flowRef, store) {
  const resolved = await resolveFlow(env, projectName7, flowRef, store);
  if (resolved instanceof Response)
    return resolved;
  const manifest = await loadFlowManifest3(env, projectName7, resolved.flowId, store);
  const next = deriveNext(manifest);
  const latestHumanDecisionRaw = [...manifest.artifacts].sort(artifactSortDescending).find((artifact) => artifact.role === "HUMAN");
  const latestHumanDecision = latestHumanDecisionRaw ? safeArtifactMetadata(latestHumanDecisionRaw) : "UNKNOWN";
  return jsonResponse({
    ok: true,
    project: projectName7,
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
    status_labels: requiredStatusLabels12(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: []
  });
}
__name(buildFlowResume, "buildFlowResume");
async function handleDefaultResume(request, env, role, store) {
  const url = new URL(request.url);
  const projectName7 = projectNameFrom11(url);
  const requestedFlow = getParam12(url, "flow_ref") || getParam12(url, "flow") || getParam12(url, "name");
  if (requestedFlow)
    return buildFlowResume(env, projectName7, role, requestedFlow, store);
  const index = await loadFlowIndex3(env, projectName7, store);
  const candidates = index.flows.filter((flow) => flow.status === "active" || flow.status === "blocked").sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
  if (candidates.length === 1)
    return buildFlowResume(env, projectName7, role, candidates[0].flow_id, store);
  return jsonResponse({
    ok: true,
    project: projectName7,
    authenticated_role: role,
    selected_flow: "UNKNOWN",
    candidates,
    message: candidates.length === 0 ? "No active or blocked flows found." : "Multiple candidate flows found; provide flow_ref/name to resume safely.",
    status_labels: requiredStatusLabels12(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: ["SAFE_SINGLE_FLOW_SELECTION_UNKNOWN"]
  });
}
__name(handleDefaultResume, "handleDefaultResume");
async function handleFlowHistory(request, env, flowRef, store) {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = projectNameFrom11(url);
  const resolved = await resolveFlow(env, projectName7, flowRef, store);
  if (resolved instanceof Response)
    return resolved;
  const manifest = await loadFlowManifest3(env, projectName7, resolved.flowId, store);
  return jsonResponse({
    ok: true,
    project: projectName7,
    flow_id: manifest.flow_id,
    flow_name: manifest.name,
    events: manifest.history || [],
    human_decisions: (manifest.artifacts || []).filter((artifact) => artifact.role === "HUMAN").map(safeArtifactMetadata),
    artifact_events: (manifest.history || []).filter((event) => event.event_type === "write_artifact"),
    gate_events: (manifest.history || []).filter((event) => event.event_type === "advance_flow"),
    audit_events: (manifest.artifacts || []).filter((artifact) => artifact.role === "AUDITOR_AI" || artifact.role === "SCIENCE_AUDITOR_AI").map(safeArtifactMetadata),
    status_labels: requiredStatusLabels12(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: (manifest.history || []).length === 0 ? ["NO_HISTORY_EVENTS_RECORDED"] : []
  });
}
__name(handleFlowHistory, "handleFlowHistory");
async function handleFlowArtifacts(request, env, flowRef, store) {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = projectNameFrom11(url);
  const resolved = await resolveFlow(env, projectName7, flowRef, store);
  if (resolved instanceof Response)
    return resolved;
  const manifest = await loadFlowManifest3(env, projectName7, resolved.flowId, store);
  return jsonResponse({
    ok: true,
    project: projectName7,
    flow_id: manifest.flow_id,
    flow_name: manifest.name,
    artifacts: manifest.artifacts.map(safeArtifactMetadata),
    status_labels: requiredStatusLabels12(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: [
      ...manifest.artifacts.length === 0 ? ["NO_ARTIFACTS_RECORDED"] : [],
      ...countUnsafeArtifacts(manifest.artifacts) > 0 ? ["UNSAFE_ARTIFACT_SOURCE_PATH_PRESENT"] : []
    ]
  });
}
__name(handleFlowArtifacts, "handleFlowArtifacts");
async function handleFlowLatest(request, env, flowRef, store) {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = projectNameFrom11(url);
  const resolved = await resolveFlow(env, projectName7, flowRef, store);
  if (resolved instanceof Response)
    return resolved;
  const manifest = await loadFlowManifest3(env, projectName7, resolved.flowId, store);
  return jsonResponse({
    ok: true,
    project: projectName7,
    flow_id: manifest.flow_id,
    flow_name: manifest.name,
    latest_by_artifact_type: latestArtifacts(manifest),
    latest_by_role: latestByRole(manifest),
    status_labels: requiredStatusLabels12(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: manifest.artifacts.length === 0 ? ["NO_ARTIFACTS_RECORDED"] : []
  });
}
__name(handleFlowLatest, "handleFlowLatest");
async function handleFlowNext(request, env, flowRef, store) {
  const role = requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = projectNameFrom11(url);
  const resolved = await resolveFlow(env, projectName7, flowRef, store);
  if (resolved instanceof Response)
    return resolved;
  const manifest = await loadFlowManifest3(env, projectName7, resolved.flowId, store);
  const next = deriveNext(manifest);
  return jsonResponse({
    ok: true,
    project: projectName7,
    flow_id: manifest.flow_id,
    flow_name: manifest.name,
    authenticated_role: role,
    ...next,
    forbidden_actions: forbiddenRoutes(role),
    status_labels: requiredStatusLabels12(),
    truth_boundary: TRUTH_BOUNDARY
  });
}
__name(handleFlowNext, "handleFlowNext");
async function handleStopConditions(request, env, flowRef, store) {
  const role = requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = projectNameFrom11(url);
  const resolved = await resolveFlow(env, projectName7, flowRef, store);
  if (resolved instanceof Response)
    return resolved;
  const manifest = await loadFlowManifest3(env, projectName7, resolved.flowId, store);
  return jsonResponse({
    ok: true,
    project: projectName7,
    flow_id: manifest.flow_id,
    flow_name: manifest.name,
    global_stop_conditions: globalStopConditions(),
    role_stop_conditions: roleStopConditions(role),
    flow_specific_stop_conditions: flowSpecificStopConditions(manifest),
    quarantine_triggers: ["secret exposure", "evidence fabrication", "role-boundary violation", "unsupported claim", "Human gate bypass attempt"],
    status_labels: requiredStatusLabels12(),
    truth_boundary: TRUTH_BOUNDARY
  });
}
__name(handleStopConditions, "handleStopConditions");
function assertSafeArtifactId(artifactId) {
  if (!artifactId || artifactId.length > 120)
    throw new Error("Invalid artifact_id");
  const lower = artifactId.toLowerCase();
  if (artifactId.includes("/") || artifactId.includes("\\") || lower.includes("..") || lower.includes("%2e") || lower.includes("%2f") || lower.includes("%5c") || artifactId.startsWith(".")) {
    throw new Error("Unsafe artifact_id");
  }
  if (!/^ART-[A-Za-z0-9._-]+$/.test(artifactId))
    throw new Error("Invalid artifact_id");
}
__name(assertSafeArtifactId, "assertSafeArtifactId");
function assertSafeArtifactPath(path) {
  if (!path || path.length > 512)
    throw new Error("Invalid artifact source path");
  if (path.startsWith("/") || path.includes("\\") || path.includes("../") || path.includes("/..") || path.includes("%2e") || path.includes("%2f") || path.includes("%5c")) {
    throw new Error("Unsafe artifact source path");
  }
  if (!/^governance\/flows\/FLOW-\d{4}-\d{4}\/artifacts\/[A-Za-z0-9._-]+\.md$/.test(path)) {
    throw new Error("Artifact source path is outside governed flow artifacts");
  }
  assertSafeReadPath(path);
}
__name(assertSafeArtifactPath, "assertSafeArtifactPath");
function artifactsMatchingId(manifest, artifactId) {
  return manifest.artifacts.filter((candidate) => candidate.artifact_id === artifactId).map((artifact) => ({ manifest, artifact }));
}
__name(artifactsMatchingId, "artifactsMatchingId");
function artifactScanLimitFrom(url) {
  const requested = Number.parseInt(getParam12(url, "scan_limit") || "", 10);
  if (!Number.isFinite(requested))
    return ARTIFACT_OPEN_DEFAULT_SCAN_LIMIT;
  return Math.min(Math.max(requested, 1), ARTIFACT_OPEN_MAX_SCAN_LIMIT);
}
__name(artifactScanLimitFrom, "artifactScanLimitFrom");
async function artifactOpenResponse(env, projectName7, manifest, artifact, store, lookupMetadata) {
  const project = getProject(projectName7);
  if (!project)
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  assertSafeArtifactPath(artifact.source_path);
  const file = await store.fetchFile(env, project, artifact.source_path);
  assertSafeArtifactPath(file.path);
  const secretMarkers = findSecretLikeMarkers(file.content);
  if (secretMarkers.length > 0) {
    return errorResponse("ARTIFACT_CONTENT_POLICY_DENIED", "Artifact body contains secret-like content and is not returned by this read/resume route.", 403);
  }
  return jsonResponse({
    ok: true,
    project: projectName7,
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
    status_labels: requiredStatusLabels12(),
    truth_boundary: TRUTH_BOUNDARY,
    unknowns: []
  });
}
__name(artifactOpenResponse, "artifactOpenResponse");
async function handleArtifactOpen(request, env, artifactId, store) {
  requireRole(request, env);
  assertSafeArtifactId(artifactId);
  const url = new URL(request.url);
  const projectName7 = projectNameFrom11(url);
  if (!getProject(projectName7))
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  const requestedFlow = getParam12(url, "flow_ref") || getParam12(url, "flow") || getParam12(url, "name");
  if (requestedFlow) {
    const resolved = await resolveFlow(env, projectName7, requestedFlow, store);
    if (resolved instanceof Response)
      return resolved;
    const manifest = await loadFlowManifest3(env, projectName7, resolved.flowId, store);
    const matches2 = artifactsMatchingId(manifest, artifactId);
    if (matches2.length === 0)
      return errorResponse("ARTIFACT_NOT_FOUND", `No governed artifact found for id ${artifactId} in flow ${resolved.flowId}`, 404);
    if (matches2.length > 1)
      return errorResponse("ARTIFACT_ID_AMBIGUOUS", `Multiple governed artifacts found for id ${artifactId} in flow ${resolved.flowId}`, 409);
    return artifactOpenResponse(env, projectName7, matches2[0].manifest, matches2[0].artifact, store, {
      mode: "FLOW_SCOPED_LOOKUP",
      flow_ref: requestedFlow,
      scanned_flow_count: 1,
      strict_duplicate_scope: "single_flow_manifest"
    });
  }
  const index = await loadFlowIndex3(env, projectName7, store);
  const scanLimit = artifactScanLimitFrom(url);
  const scannedFlowIds = [];
  const matches = [];
  const candidates = [...index.flows].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)).slice(0, scanLimit);
  for (const entry of candidates) {
    try {
      const manifest = await loadFlowManifest3(env, projectName7, entry.flow_id, store);
      scannedFlowIds.push(entry.flow_id);
      matches.push(...artifactsMatchingId(manifest, artifactId));
      if (matches.length > 1)
        break;
    } catch {
      scannedFlowIds.push(entry.flow_id);
    }
  }
  if (matches.length === 0) {
    return errorResponse(
      "ARTIFACT_FLOW_REF_REQUIRED",
      `Artifact id ${artifactId} was not found within the bounded recent-flow scan. Retry with flow_ref to avoid Worker subrequest limits.`,
      404
    );
  }
  if (matches.length > 1)
    return errorResponse("ARTIFACT_ID_AMBIGUOUS", `Multiple governed artifacts found for id: ${artifactId}`, 409);
  return artifactOpenResponse(env, projectName7, matches[0].manifest, matches[0].artifact, store, {
    mode: "BOUNDED_RECENT_FLOW_SCAN",
    scan_limit: scanLimit,
    scanned_flow_count: scannedFlowIds.length,
    scanned_flow_ids: scannedFlowIds,
    strict_duplicate_scope: scannedFlowIds.length === index.flows.length ? "all_indexed_flows" : "bounded_recent_flows",
    recommendation: "Pass flow_ref for deterministic low-subrequest artifact body reads."
  });
}
__name(handleArtifactOpen, "handleArtifactOpen");
async function handleReadResumeRequest(request, env, action, options = {}) {
  try {
    if (request.method !== "GET")
      return errorResponse("METHOD_NOT_ALLOWED", `Unsupported method: ${request.method}`, 405);
    const role = requireRole(request, env);
    const url = new URL(request.url);
    const projectName7 = projectNameFrom11(url);
    if (!getProject(projectName7))
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
    const store = options.repoStore || githubRepoStore;
    if (action === "whoami")
      return jsonResponse(whoamiBody(projectName7, role));
    if (action === "capabilities")
      return jsonResponse(capabilitiesBody(projectName7, role));
    if (action === "show")
      return await handleShow(request, env, store);
    if (action === "resume")
      return await handleDefaultResume(request, env, role, store);
    if (action === "artifact_open") {
      if (!options.artifactId)
        return errorResponse("INVALID_REQUEST", "Missing artifact_id", 400);
      return await handleArtifactOpen(request, env, options.artifactId, store);
    }
    if (!options.flowRef)
      return errorResponse("INVALID_REQUEST", "Missing flow_ref", 400);
    if (action === "flow_resume")
      return await buildFlowResume(env, projectName7, role, options.flowRef, store);
    if (action === "flow_history")
      return await handleFlowHistory(request, env, options.flowRef, store);
    if (action === "flow_artifacts")
      return await handleFlowArtifacts(request, env, options.flowRef, store);
    if (action === "flow_latest")
      return await handleFlowLatest(request, env, options.flowRef, store);
    if (action === "flow_next")
      return await handleFlowNext(request, env, options.flowRef, store);
    if (action === "flow_stop_conditions")
      return await handleStopConditions(request, env, options.flowRef, store);
    return errorResponse("NOT_FOUND", "Unknown read/resume action", 404);
  } catch (err) {
    if (err instanceof Response)
      return err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Invalid") || message.startsWith("Unsafe") || message.includes("must be"))
      return errorResponse("BAD_REQUEST", message, 400);
    if (message.startsWith("Unknown project"))
      return errorResponse("UNKNOWN_PROJECT", message, 404);
    if (message.includes("Forbidden path") || message.includes("outside governed flow artifacts") || message.includes("Artifact source path"))
      return errorResponse("POLICY_DENIED", message, 403);
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
__name(handleReadResumeRequest, "handleReadResumeRequest");

// src/science_queue_read.ts
var TRUTH_BOUNDARY2 = {
  queue_record_is_truth: false,
  queue_record_is_evidence: false,
  raw_gpt_output_is_evidence: false,
  contextbus_notes_messages_are_evidence: false,
  requires_harness: true
};
var SCIENCE_QUEUE_ROLES = [
  "EXPLORER_AI",
  "HYPOTHESIZER_AI",
  "DESIGNER_AI",
  "SCIENCE_AUDITOR_AI",
  "SCIENCE_EXECUTOR_AI",
  "HUMAN"
];
function getParam13(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam13, "getParam");
function requiredStatusLabels13() {
  return [...STATUS_LABELS];
}
__name(requiredStatusLabels13, "requiredStatusLabels");
function parseBoundedScanLimit(url) {
  const raw = getParam13(url, "scan_limit") || getParam13(url, "limit") || "";
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed))
    return 8;
  return Math.min(Math.max(parsed, 1), 20);
}
__name(parseBoundedScanLimit, "parseBoundedScanLimit");
function flowIndexPath4() {
  return "governance/flows/flow_index.json";
}
__name(flowIndexPath4, "flowIndexPath");
function flowManifestPath10(flowId) {
  return `governance/flows/${flowId}/flow_manifest.json`;
}
__name(flowManifestPath10, "flowManifestPath");
function emptyFlowIndex(project) {
  return { schema_version: "flow_index.v0.3", project, flows: [] };
}
__name(emptyFlowIndex, "emptyFlowIndex");
function safePath(path) {
  if (!path)
    return "UNKNOWN";
  try {
    assertSafeReadPath(path);
    return path;
  } catch {
    return "UNKNOWN_UNSAFE_PATH";
  }
}
__name(safePath, "safePath");
function readState(status, gate) {
  const normalizedStatus = (status || "").toLowerCase();
  const normalizedGate = (gate || "").toUpperCase();
  if (normalizedStatus === "blocked")
    return "BLOCKED";
  if (normalizedStatus === "completed")
    return "COMPLETED_STEP";
  if (normalizedGate.includes("QUARANTINE"))
    return "QUARANTINED";
  if (normalizedGate.includes("EXECUTOR"))
    return "WAITING_FOR_EXECUTOR";
  if (normalizedGate.includes("HUMAN"))
    return "WAITING_FOR_HUMAN";
  if (normalizedGate.includes("BLOCK"))
    return "BLOCKED";
  if (normalizedStatus === "active")
    return "READY";
  return "UNKNOWN";
}
__name(readState, "readState");
function roleFromGate(gate) {
  const normalized = (gate || "").toUpperCase();
  if (normalized.includes("EXPLORER"))
    return "EXPLORER_AI";
  if (normalized.includes("HYPOTHESIZER"))
    return "HYPOTHESIZER_AI";
  if (normalized.includes("DESIGNER"))
    return "DESIGNER_AI";
  if (normalized.includes("AUDITOR"))
    return "SCIENCE_AUDITOR_AI";
  if (normalized.includes("EXECUTOR"))
    return "SCIENCE_EXECUTOR_AI";
  if (normalized.includes("HUMAN"))
    return "HUMAN";
  return "UNKNOWN";
}
__name(roleFromGate, "roleFromGate");
function isScienceQueueMutatingRole(role) {
  return ["EXPLORER_AI", "HYPOTHESIZER_AI", "DESIGNER_AI", "SCIENCE_AUDITOR_AI"].includes(role);
}
__name(isScienceQueueMutatingRole, "isScienceQueueMutatingRole");
function allowedNextActionForQueueItem(role, state, currentRoleOwner, allowedNextRole) {
  if (!isScienceQueueMutatingRole(role))
    return "READ_ONLY_RECOMMENDATION_ONLY";
  if (state === "READY") {
    if (currentRoleOwner === "UNKNOWN" || currentRoleOwner === role || allowedNextRole === role) {
      return "CLAIM_ELIGIBLE";
    }
    return "CLAIM_POLICY_CHECK_REQUIRED";
  }
  if (state === "CLAIMED")
    return "CLAIMED_ITEM_REQUIRES_STATE_RECORD_CHECK";
  if (state === "BLOCKED")
    return "BLOCKED_ITEM_POLICY_CHECK_REQUIRED";
  if (state === "QUARANTINED")
    return "READ_ONLY_RECOMMENDATION_ONLY";
  if (state === "COMPLETED_STEP")
    return "READ_ONLY_RECOMMENDATION_ONLY";
  return "READ_ONLY_RECOMMENDATION_ONLY";
}
__name(allowedNextActionForQueueItem, "allowedNextActionForQueueItem");
function safeArtifacts(artifacts) {
  return (artifacts || []).map((artifact) => ({
    artifact_id: artifact.artifact_id || "UNKNOWN",
    artifact_type: artifact.artifact_type || "UNKNOWN",
    title: artifact.title || "UNKNOWN",
    role: artifact.role || "UNKNOWN",
    created_at: artifact.created_at || "UNKNOWN",
    source_path: safePath(artifact.source_path),
    source_sha: artifact.source_sha || "UNKNOWN"
  }));
}
__name(safeArtifacts, "safeArtifacts");
function visibilityFilter(role, item) {
  if (role === "HUMAN")
    return true;
  if (role === "SCIENCE_EXECUTOR_AI") {
    return item.current_state === "WAITING_FOR_EXECUTOR" || item.allowed_next_role === "SCIENCE_EXECUTOR_AI";
  }
  if (item.current_role_owner === role || item.allowed_next_role === role)
    return true;
  if (["READY", "UNKNOWN", "BLOCKED", "QUARANTINED", "WAITING_FOR_HUMAN", "HANDOFF_REQUESTED", "COMPLETED_STEP"].includes(item.current_state))
    return true;
  return false;
}
__name(visibilityFilter, "visibilityFilter");
async function loadFlowIndex4(env, projectName7, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, flowIndexPath4());
    const parsed = JSON.parse(file.content);
    if (!Array.isArray(parsed.flows))
      return emptyFlowIndex(projectName7);
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("404"))
      return emptyFlowIndex(projectName7);
    throw error;
  }
}
__name(loadFlowIndex4, "loadFlowIndex");
async function loadManifest(env, projectName7, flowId, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, flowManifestPath10(flowId));
    return JSON.parse(file.content);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("404"))
      return null;
    throw error;
  }
}
__name(loadManifest, "loadManifest");
async function loadQueueMutationState(env, projectName7, queueItemId, store) {
  try {
    const stateRef = await readJsonIfExists(env, projectName7, statePath(queueItemId), store);
    return stateRef.value || null;
  } catch {
    return null;
  }
}
__name(loadQueueMutationState, "loadQueueMutationState");
function buildQueueItemFromFlowEntry(projectName7, role, entry, manifest, mutationState = null) {
  const currentGate = manifest?.current_gate || entry.current_gate || "UNKNOWN";
  const manifestState = readState(manifest?.status || entry.status || "UNKNOWN", currentGate);
  const gateRole = roleFromGate(currentGate);
  const queueItemId = `Q-${entry.flow_id}`;
  const effectiveState = mutationState?.current_state || manifestState;
  const handoffTargetRole = mutationState?.handoff_target_role || null;
  const claimedBy = mutationState?.claimed_by || null;
  const effectiveRoleOwner = handoffTargetRole || claimedBy || gateRole;
  const allowedNextRole = handoffTargetRole || gateRole;
  return {
    queue_item_id: queueItemId,
    project: projectName7,
    flow_id: entry.flow_id,
    flow_ref: manifest?.name || entry.name || entry.flow_id,
    queue_lane: "diagnostic",
    current_state: effectiveState,
    current_role_owner: effectiveRoleOwner,
    allowed_next_role: allowedNextRole,
    allowed_next_action: allowedNextActionForQueueItem(role, effectiveState, effectiveRoleOwner, allowedNextRole),
    blocked_reason: effectiveState === "BLOCKED" ? "UNKNOWN" : null,
    stop_condition: effectiveState === "QUARANTINED" ? "QUARANTINE_CONDITION_PRESENT" : null,
    claimed_by: claimedBy,
    handoff_target_role: handoffTargetRole,
    latest_mutation_id: mutationState?.latest_mutation_id || "NONE",
    related_artifacts: safeArtifacts(manifest?.artifacts),
    evidence_requirements: [],
    audit_status: "UNKNOWN",
    human_decision_status: "UNKNOWN",
    truth_boundary: TRUTH_BOUNDARY2
  };
}
__name(buildQueueItemFromFlowEntry, "buildQueueItemFromFlowEntry");
async function buildQueueItemForRef(env, projectName7, role, queueItemRef, store) {
  const flowIndex = await loadFlowIndex4(env, projectName7, store);
  const scienceFlows = flowIndex.flows.filter((entry) => entry.type === "science_flow");
  const normalizedRef = queueItemRef.startsWith("Q-") ? queueItemRef.slice(2) : queueItemRef;
  let entry = scienceFlows.find((candidate) => `Q-${candidate.flow_id}` === queueItemRef || candidate.flow_id === queueItemRef || candidate.name === queueItemRef || candidate.flow_id === normalizedRef || candidate.name === normalizedRef);
  if (!entry && looksLikeFlowId2(normalizedRef)) {
    entry = {
      flow_id: normalizedRef,
      name: normalizedRef,
      type: "science_flow",
      title: "UNKNOWN",
      status: "UNKNOWN",
      current_gate: "UNKNOWN",
      updated_at: "UNKNOWN"
    };
  }
  if (!entry)
    return null;
  const manifest = await loadManifest(env, projectName7, entry.flow_id, store);
  if (!manifest && !looksLikeFlowId2(entry.flow_id))
    return null;
  const queueItemId = `Q-${entry.flow_id}`;
  const mutationState = await loadQueueMutationState(env, projectName7, queueItemId, store);
  const item = buildQueueItemFromFlowEntry(projectName7, role, entry, manifest, mutationState);
  return { item, manifest };
}
__name(buildQueueItemForRef, "buildQueueItemForRef");
async function buildQueueItems(env, projectName7, role, store) {
  const SUBREQUEST_BUDGET_UNITS = 20;
  const SUBREQUEST_UNITS_PER_FLOW = 2;
  const flowIndex = await loadFlowIndex4(env, projectName7, store);
  const scienceFlows = flowIndex.flows.filter((entry) => entry.type === "science_flow");
  const maxFlows = arguments.length > 4 && arguments[4]?.maxFlows && Number.isFinite(arguments[4].maxFlows) ? Math.max(1, Math.floor(arguments[4].maxFlows)) : scienceFlows.length;
  const cappedFlows = scienceFlows.slice(0, maxFlows);
  const items = [];
  const queueReadErrors = [];
  let stoppedEarly = false;
  let stopReason = null;
  let subrequestUnitsUsed = 0;
  for (const entry of cappedFlows) {
    const queueItemId = `Q-${entry.flow_id}`;
    if (subrequestUnitsUsed + SUBREQUEST_UNITS_PER_FLOW > SUBREQUEST_BUDGET_UNITS) {
      stoppedEarly = true;
      stopReason = "SUBREQUEST_BUDGET_GUARD";
      break;
    }
    try {
      subrequestUnitsUsed += SUBREQUEST_UNITS_PER_FLOW;
      const manifest = await loadManifest(env, projectName7, entry.flow_id, store);
      const mutationState = await loadQueueMutationState(env, projectName7, queueItemId, store);
      const item = buildQueueItemFromFlowEntry(projectName7, role, entry, manifest, mutationState);
      if (visibilityFilter(role, item))
        items.push(item);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      queueReadErrors.push({
        flow_id: entry.flow_id || "UNKNOWN",
        queue_item_id: queueItemId,
        error: message.slice(0, 280)
      });
      if (/subrequest|1101|too many/i.test(message)) {
        stoppedEarly = true;
        stopReason = "SUBREQUEST_PRESSURE_SUSPECTED";
        break;
      }
    }
  }
  return {
    queue_items: items.sort((a, b) => a.flow_id.localeCompare(b.flow_id)),
    queue_read_errors: queueReadErrors,
    bounded_scan: {
      applied: cappedFlows.length < scienceFlows.length,
      max_flows: maxFlows,
      total_science_flows: scienceFlows.length,
      scanned_science_flows: cappedFlows.length,
      stopped_early: stoppedEarly,
      stop_reason: stopReason
    }
  };
}
__name(buildQueueItems, "buildQueueItems");
function queueResponseBase(projectName7, role) {
  return {
    ok: true,
    project: projectName7,
    authenticated_role: role,
    required_status_labels: requiredStatusLabels13(),
    truth_boundary: TRUTH_BOUNDARY2,
    no_mutation: true,
    warning: "Queue records are governance coordination records, not evidence or scientific truth."
  };
}
__name(queueResponseBase, "queueResponseBase");
function methodGuard(request) {
  if (request.method !== "GET") {
    return errorResponse("METHOD_NOT_ALLOWED", `Only GET is allowed for ${new URL(request.url).pathname}`, 405);
  }
  return null;
}
__name(methodGuard, "methodGuard");
function enforceRoleQuery(url, authenticatedRole) {
  const requestedRole = getParam13(url, "role");
  if (!requestedRole)
    return null;
  if (authenticatedRole !== "HUMAN" && requestedRole !== authenticatedRole) {
    return errorResponse("ROLE_MISMATCH", `Authenticated role ${authenticatedRole} cannot request ${requestedRole}`, 403);
  }
  return null;
}
__name(enforceRoleQuery, "enforceRoleQuery");
function assertScienceQueueRole(role) {
  if (!SCIENCE_QUEUE_ROLES.includes(role)) {
    return errorResponse("SCIENCE_QUEUE_ROLE_FORBIDDEN", `Role ${role} cannot access read-only science queue`, 403);
  }
  return null;
}
__name(assertScienceQueueRole, "assertScienceQueueRole");
async function handleScienceQueueReadRequest(request, env, route, args = {}, repoStore) {
  let projectName7 = "ArqonZero";
  let role = "HUMAN";
  try {
    const methodError = methodGuard(request);
    if (methodError)
      return methodError;
    role = requireRole(request, env);
    const roleError = assertScienceQueueRole(role);
    if (roleError)
      return roleError;
    const url = new URL(request.url);
    const roleQueryError = enforceRoleQuery(url, role);
    if (roleQueryError)
      return roleQueryError;
    projectName7 = getParam13(url, "project") || "ArqonZero";
    if (!getProject(projectName7))
      return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
    const store = repoStore || githubRepoStore;
    const base = queueResponseBase(projectName7, role);

    if (route === "item" || route === "history") {
      const queueItemId = args.queueItemId || "";
      const targeted = await buildQueueItemForRef(env, projectName7, role, queueItemId, store);
      if (!targeted || !targeted.item)
        return errorResponse("QUEUE_ITEM_NOT_FOUND", `Unknown queue item: ${queueItemId}`, 404);
      if (!visibilityFilter(role, targeted.item))
        return errorResponse("QUEUE_ITEM_NOT_FOUND", `Unknown or invisible queue item: ${queueItemId}`, 404);
      if (route === "item")
        return jsonResponse({ ...base, queue_item: targeted.item });
      const history = (targeted.manifest?.history || []).map((event) => ({
        event_id: event.event_id || "UNKNOWN",
        event_type: event.event_type || "UNKNOWN",
        role: event.role || "UNKNOWN",
        created_at: event.created_at || "UNKNOWN",
        note: event.note || ""
      }));
      return jsonResponse({ ...base, queue_item: targeted.item, history });
    }

    if (route === "by_flow") {
      const flowRef = args.flowRef || "";
      const targeted = await buildQueueItemForRef(env, projectName7, role, flowRef, store);
      if (!targeted || !targeted.item || !visibilityFilter(role, targeted.item))
        return errorResponse("QUEUE_FLOW_NOT_FOUND", `No queue items for flow ref: ${flowRef}`, 404);
      return jsonResponse({ ...base, queue_items: [targeted.item] });
    }

    const queueBuild = await buildQueueItems(env, projectName7, role, store, { maxFlows: parseBoundedScanLimit(url) });
    const items = queueBuild.queue_items;
    if (route === "list")
      return jsonResponse({ ...base, ...queueBuild });
    if (route === "next") {
      const nextItem = items.find((item) => item.allowed_next_role === role) || items[0] || null;
      return jsonResponse({ ...base, ...queueBuild, queue_item: nextItem });
    }
    if (route === "blocked")
      return jsonResponse({ ...base, ...queueBuild, queue_items: items.filter((item) => item.current_state === "BLOCKED") });
    if (route === "quarantined")
      return jsonResponse({ ...base, ...queueBuild, queue_items: items.filter((item) => item.current_state === "QUARANTINED") });
    if (route === "handoffs") {
      const handoffs = items.filter((item) => item.allowed_next_role !== "UNKNOWN").map((item) => ({
        queue_item_id: item.queue_item_id,
        flow_id: item.flow_id,
        from_role: item.current_role_owner,
        to_role: item.allowed_next_role,
        handoff_note: "READ_ONLY_HANDOFF_VISIBILITY_ONLY"
      }));
      return jsonResponse({ ...base, ...queueBuild, handoffs });
    }
    return errorResponse("QUEUE_ROUTE_NOT_IMPLEMENTED", `Unsupported queue route: ${route}`, 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({
      ok: false,
      project: projectName7,
      authenticated_role: role,
      no_mutation: true,
      truth_boundary: TRUTH_BOUNDARY2,
      required_status_labels: requiredStatusLabels13(),
      error: {
        code: "INTERNAL_QUEUE_LIST_ERROR",
        message
      }
    }, 500);
  }
}
__name(handleScienceQueueReadRequest, "handleScienceQueueReadRequest");

// src/science_queue_mutation.ts
var MUTATION_TRUTH_BOUNDARY = {
  ...TRUTH_BOUNDARY2,
  mutation_record_is_truth: false,
  mutation_record_is_evidence_by_itself: false
};
var MUTATING_ROLES = [
  "EXPLORER_AI",
  "HYPOTHESIZER_AI",
  "DESIGNER_AI",
  "SCIENCE_AUDITOR_AI"
];
var ALLOWED_HANDOFF_TARGETS = {
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
var TRANSITIONS = {
  claim: ["READY", "BLOCKED"],
  complete: ["CLAIMED", "IN_PROGRESS"],
  block: ["READY", "CLAIMED", "IN_PROGRESS"],
  quarantine: ["READY", "CLAIMED", "IN_PROGRESS", "BLOCKED", "HANDOFF_REQUESTED"],
  handoff: ["COMPLETED_STEP", "BLOCKED", "READY"]
};
function isMutatingRole(role) {
  return MUTATING_ROLES.includes(role);
}
__name(isMutatingRole, "isMutatingRole");
function mutationError(code, message, status) {
  return errorResponse(code, message, status);
}
__name(mutationError, "mutationError");
function sanitizeSegment(value) {
  return value.replace(/[^A-Za-z0-9._-]+/g, "_");
}
__name(sanitizeSegment, "sanitizeSegment");
function isSafeIdentifier(value) {
  return /^[A-Za-z0-9._:-]+$/.test(value);
}
__name(isSafeIdentifier, "isSafeIdentifier");
function statePath(queueItemId) {
  return `governance/queues/mutations/state/${sanitizeSegment(queueItemId)}.json`;
}
__name(statePath, "statePath");
function mutationRecordPath(timestamp, queueItemId, route, role, idempotencyKey) {
  const yearMonth = `${timestamp.slice(0, 4)}/${timestamp.slice(5, 7)}`;
  return `governance/queues/mutations/${yearMonth}/${sanitizeSegment(queueItemId)}__${route}__${sanitizeSegment(role)}__${sanitizeSegment(idempotencyKey)}.json`;
}
__name(mutationRecordPath, "mutationRecordPath");
function payloadSignature(route, payload) {
  return JSON.stringify({
    route,
    project: payload.project,
    reason: payload.reason,
    idempotency_key: payload.idempotency_key,
    target_role: payload.target_role || null,
    evidence_refs: payload.evidence_refs || []
  });
}
__name(payloadSignature, "payloadSignature");
async function readJsonIfExists(env, projectName7, path, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  try {
    const file = await store.fetchFile(env, project, path);
    return { value: JSON.parse(file.content), sha: file.sha };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("404"))
      return { value: null, sha: null };
    throw error;
  }
}
__name(readJsonIfExists, "readJsonIfExists");
async function writeJson14(env, projectName7, path, payload, message, store) {
  const project = getProject(projectName7);
  if (!project)
    throw new Error(`Unknown project: ${projectName7}`);
  return store.writeFile(env, project, path, `${JSON.stringify(payload, null, 2)}
`, message);
}
__name(writeJson14, "writeJson");
async function parseBody(request) {
  const text = await request.text();
  if (!text.trim())
    return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    throw mutationError("INVALID_JSON", "Request body must be valid JSON", 400);
  }
}
__name(parseBody, "parseBody");
function denyBodyRoleSpoof(body, authenticatedRole) {
  const roleValue = body.role;
  if (typeof roleValue !== "string" || !roleValue.trim())
    return null;
  if (roleValue !== authenticatedRole) {
    return mutationError("ROLE_SPOOF_DENIED", `Body role ${roleValue} does not match authenticated role ${authenticatedRole}`, 403);
  }
  return null;
}
__name(denyBodyRoleSpoof, "denyBodyRoleSpoof");
function normalizeRequest(route, body) {
  const project = typeof body.project === "string" && body.project.trim() ? body.project.trim() : "ArqonZero";
  const idempotencyKey = typeof body.idempotency_key === "string" ? body.idempotency_key.trim() : "";
  if (!idempotencyKey)
    throw mutationError("IDEMPOTENCY_KEY_REQUIRED", "idempotency_key is required", 400);
  if (!isSafeIdentifier(idempotencyKey))
    throw mutationError("INVALID_IDEMPOTENCY_KEY", "idempotency_key contains unsafe characters", 400);
  if (route === "claim") {
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    return { project, idempotency_key: idempotencyKey, reason: reason || "CLAIM_REQUEST" };
  }
  if (route === "complete") {
    const completionSummary = typeof body.completion_summary === "string" ? body.completion_summary.trim() : "";
    if (!completionSummary)
      throw mutationError("COMPLETION_SUMMARY_REQUIRED", "completion_summary is required", 400);
    const evidenceRefs = Array.isArray(body.evidence_refs) ? body.evidence_refs.filter((value) => typeof value === "string") : [];
    return { project, idempotency_key: idempotencyKey, reason: completionSummary, evidence_refs: evidenceRefs };
  }
  if (route === "block") {
    const blockedReason = typeof body.blocked_reason === "string" ? body.blocked_reason.trim() : "";
    if (!blockedReason)
      throw mutationError("BLOCKED_REASON_REQUIRED", "blocked_reason is required", 400);
    return { project, idempotency_key: idempotencyKey, reason: blockedReason };
  }
  if (route === "quarantine") {
    const quarantineReason = typeof body.quarantine_reason === "string" ? body.quarantine_reason.trim() : "";
    if (!quarantineReason)
      throw mutationError("QUARANTINE_REASON_REQUIRED", "quarantine_reason is required", 400);
    return { project, idempotency_key: idempotencyKey, reason: quarantineReason };
  }
  const handoffReason = typeof body.handoff_reason === "string" ? body.handoff_reason.trim() : "";
  const targetRole = typeof body.target_role === "string" ? body.target_role.trim() : "";
  if (!handoffReason)
    throw mutationError("HANDOFF_REASON_REQUIRED", "handoff_reason is required", 400);
  if (!targetRole)
    throw mutationError("TARGET_ROLE_REQUIRED", "target_role is required", 400);
  return { project, idempotency_key: idempotencyKey, reason: handoffReason, target_role: targetRole };
}
__name(normalizeRequest, "normalizeRequest");
function nextState(route) {
  if (route === "claim")
    return "CLAIMED";
  if (route === "complete")
    return "COMPLETED_STEP";
  if (route === "block")
    return "BLOCKED";
  if (route === "quarantine")
    return "QUARANTINED";
  return "HANDOFF_REQUESTED";
}
__name(nextState, "nextState");
async function resolveQueueState(env, projectName7, queueItemId, role, store) {
  const items = await buildQueueItems(env, projectName7, role, store);
  const item = items.find((candidate) => candidate.queue_item_id === queueItemId || candidate.flow_id === queueItemId || candidate.flow_ref === queueItemId);
  if (!item)
    throw mutationError("QUEUE_ITEM_NOT_FOUND", `Unknown or invisible queue item: ${queueItemId}`, 404);
  const stateRef = await readJsonIfExists(env, projectName7, statePath(item.queue_item_id), store);
  const state = stateRef.value || {
    queue_item_id: item.queue_item_id,
    flow_ref: item.flow_ref,
    flow_id: item.flow_id,
    project: projectName7,
    current_state: item.current_state,
    claimed_by: null,
    handoff_target_role: null,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    latest_mutation_id: "NONE"
  };
  return { item, state };
}
__name(resolveQueueState, "resolveQueueState");
function validateRouteAuthority(route, role, state, itemRoleOwner, payload) {
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
__name(validateRouteAuthority, "validateRouteAuthority");
function buildResponse(projectName7, role, record, recordPath6, recordSha, replay = false) {
  return {
    ok: true,
    project: projectName7,
    authenticated_role: role,
    queue_item_id: record.queue_item_id,
    flow_ref: record.flow_ref,
    mutation_type: record.mutation_type,
    prior_state: record.prior_state,
    new_state: record.new_state,
    mutation_id: record.mutation_id,
    idempotency_key: record.idempotency_key,
    required_status_labels: requiredStatusLabels13(),
    truth_boundary: MUTATION_TRUTH_BOUNDARY,
    mutation_record_path: recordPath6,
    mutation_record_sha: recordSha,
    idempotent_replay: replay
  };
}
__name(buildResponse, "buildResponse");
async function handleScienceQueueMutationRequest(request, env, route, args, repoStore) {
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
  if (bodyRoleError)
    return bodyRoleError;
  const queryRole = getParam13(url, "role");
  if (queryRole && queryRole !== authenticatedRole) {
    return mutationError("ROLE_SPOOF_DENIED", `Query role ${queryRole} does not match authenticated role ${authenticatedRole}`, 403);
  }
  const payload = normalizeRequest(route, body);
  if (!getProject(payload.project))
    return mutationError("UNKNOWN_PROJECT", `Unknown project: ${payload.project}`, 404);
  const store = repoStore || githubRepoStore;
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const signature = payloadSignature(route, payload);
  const replayQueueItemIds = queueItemId.startsWith("Q-") ? [queueItemId] : [`Q-${queueItemId}`, queueItemId];
  for (const replayQueueItemId of [...new Set(replayQueueItemIds)]) {
    const replayRecordPath = mutationRecordPath(timestamp, replayQueueItemId, route, authenticatedRole, payload.idempotency_key);
    const existing = await readJsonIfExists(env, payload.project, replayRecordPath, store);
    if (existing.value) {
      if (existing.value.payload_signature !== signature) {
        return mutationError("IDEMPOTENCY_CONFLICT", `Existing idempotency_key ${payload.idempotency_key} conflicts with a different payload`, 409);
      }
      return jsonResponse(buildResponse(payload.project, authenticatedRole, existing.value, replayRecordPath, existing.sha || "UNKNOWN", true));
    }
  }
  const { item, state } = await resolveQueueState(env, payload.project, queueItemId, authenticatedRole, store);
  const authorityCheck = validateRouteAuthority(route, authenticatedRole, state, item.current_role_owner, payload);
  const recordPath6 = mutationRecordPath(timestamp, item.queue_item_id, route, authenticatedRole, payload.idempotency_key);
  const record = {
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
    required_status_labels: requiredStatusLabels13(),
    payload_signature: signature
  };
  if (payload.target_role)
    record.handoff_target_role = payload.target_role;
  if (payload.evidence_refs)
    record.completion_evidence_refs = payload.evidence_refs;
  const writtenRecord = await writeJson14(
    env,
    payload.project,
    recordPath6,
    record,
    `science queue mutation ${route}: ${item.queue_item_id}`,
    store
  );
  const newState = {
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
  if (route === "block" || route === "quarantine")
    newState.claimed_by = state.claimed_by;
  await writeJson14(env, payload.project, statePath(item.queue_item_id), newState, `science queue state ${route}: ${item.queue_item_id}`, store);
  return jsonResponse(buildResponse(payload.project, authenticatedRole, record, writtenRecord.path, writtenRecord.sha), 201);
}
__name(handleScienceQueueMutationRequest, "handleScienceQueueMutationRequest");

// src/index.ts
function getParam14(url, name) {
  const value = url.searchParams.get(name);
  return value && value.trim() ? value.trim() : null;
}
__name(getParam14, "getParam");
async function handleHealth(env) {
  return jsonResponse({
    ok: true,
    service: "Arqon ContextOS Broker",
    version: env.BROKER_VERSION,
    status: ["REQUIRES_HUMAN_REVIEW", "development diagnostic only", "NOT SEALED-TEST CERTIFIED", "not promotable"]
  });
}
__name(handleHealth, "handleHealth");
async function handleContext(request, env) {
  const authRole = requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = getParam14(url, "project") || "";
  const requestedRole = getParam14(url, "role") || authRole;
  if (authRole !== "HUMAN" && authRole !== requestedRole) {
    return errorResponse("ROLE_MISMATCH", `Authenticated role ${authRole} cannot request ${requestedRole}`, 403);
  }
  const project = getProject(projectName7);
  if (!project)
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  const path = contextPathFor(project, requestedRole);
  if (!path)
    return errorResponse("ROLE_CONTEXT_NOT_FOUND", `No context path for role: ${requestedRole}`, 404);
  const file = await fetchGithubFile(env, project, path);
  return jsonResponse({ ok: true, project: projectName7, role: requestedRole, source_path: file.path, source_sha: file.sha, context: JSON.parse(file.content) });
}
__name(handleContext, "handleContext");
async function handleManifest(request, env) {
  requireRole(request, env);
  const url = new URL(request.url);
  const projectName7 = getParam14(url, "project") || "";
  const project = getProject(projectName7);
  if (!project)
    return errorResponse("UNKNOWN_PROJECT", `Unknown project: ${projectName7}`, 404);
  const file = await fetchGithubFile(env, project, project.manifest);
  return jsonResponse({ ok: true, project: projectName7, source_path: file.path, source_sha: file.sha, manifest: JSON.parse(file.content) });
}
__name(handleManifest, "handleManifest");
async function handleNotImplemented(name) {
  return errorResponse("NOT_IMPLEMENTED", `${name} is reserved in v0.1 scaffold. Implement after read-only context load is validated.`, 501);
}
__name(handleNotImplemented, "handleNotImplemented");
function brokerKeyConfigError(env) {
  const validation = validateBrokerKeyUniqueness(env);
  if (validation.ok)
    return null;
  return errorResponse(
    "BROKER_KEY_CONFIGURATION_INVALID",
    `Broker key configuration has missing or duplicate role credentials: missing=${validation.missing.join(",")}; duplicate_groups=${validation.duplicate_groups.map((group) => group.join("+")).join(",")}`,
    500
  );
}
__name(brokerKeyConfigError, "brokerKeyConfigError");
async function handleWorkerFetch(request, env, options = {}) {
  try {
    const url = new URL(request.url);
    if (url.pathname === "/v1/health" && request.method === "GET")
      return handleHealth(env);
    const keyConfigError = brokerKeyConfigError(env);
    if (keyConfigError)
      return keyConfigError;
    if (url.pathname === "/v1/context" && request.method === "GET")
      return handleContext(request, env);
    if (url.pathname === "/v1/constitution" && request.method === "GET")
      return handleContext(request, env);
    if (url.pathname === "/v1/manifest" && request.method === "GET")
      return handleManifest(request, env);
    if (url.pathname === "/v1/whoami")
      return handleReadResumeRequest(request, env, "whoami", { repoStore: options.flowRepoStore });
    if (url.pathname === "/v1/capabilities")
      return handleReadResumeRequest(request, env, "capabilities", { repoStore: options.flowRepoStore });
    if (url.pathname === "/v1/show")
      return handleReadResumeRequest(request, env, "show", { repoStore: options.flowRepoStore });
    if (url.pathname === "/v1/resume")
      return handleReadResumeRequest(request, env, "resume", { repoStore: options.flowRepoStore });
    if (url.pathname === "/v1/notes")
      return handleNotesRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/messages")
      return handleMessagesRequest(request, env, void 0, "collection", options.flowRepoStore);
    if (url.pathname === "/v1/messages/inbox")
      return handleMessagesRequest(request, env, void 0, "collection", options.flowRepoStore);
    const messageArchiveMatch = url.pathname.match(/^\/v1\/messages\/([^/]+)\/archive$/);
    if (messageArchiveMatch)
      return handleMessagesRequest(request, env, decodeURIComponent(messageArchiveMatch[1]), "archive", options.flowRepoStore);
    const messageMatch = url.pathname.match(/^\/v1\/messages\/([^/]+)$/);
    if (messageMatch)
      return handleMessagesRequest(request, env, decodeURIComponent(messageMatch[1]), "item", options.flowRepoStore);
    if (url.pathname === "/v1/science/queue")
      return handleScienceQueueReadRequest(request, env, "list", {}, options.flowRepoStore);
    const scienceQueueItemHistoryMatch = url.pathname.match(/^\/v1\/science\/queue\/history\/([^/]+)$/);
    if (scienceQueueItemHistoryMatch) {
      return handleScienceQueueReadRequest(
        request,
        env,
        "history",
        { queueItemId: decodeURIComponent(scienceQueueItemHistoryMatch[1]) },
        options.flowRepoStore
      );
    }
    const scienceQueueClaimMatch = url.pathname.match(/^\/v1\/science\/queue\/([^/]+)\/claim$/);
    if (scienceQueueClaimMatch) {
      return handleScienceQueueMutationRequest(
        request,
        env,
        "claim",
        { queueItemId: decodeURIComponent(scienceQueueClaimMatch[1]) },
        options.flowRepoStore
      );
    }
    const scienceQueueCompleteMatch = url.pathname.match(/^\/v1\/science\/queue\/([^/]+)\/complete$/);
    if (scienceQueueCompleteMatch) {
      return handleScienceQueueMutationRequest(
        request,
        env,
        "complete",
        { queueItemId: decodeURIComponent(scienceQueueCompleteMatch[1]) },
        options.flowRepoStore
      );
    }
    const scienceQueueBlockMatch = url.pathname.match(/^\/v1\/science\/queue\/([^/]+)\/block$/);
    if (scienceQueueBlockMatch) {
      return handleScienceQueueMutationRequest(
        request,
        env,
        "block",
        { queueItemId: decodeURIComponent(scienceQueueBlockMatch[1]) },
        options.flowRepoStore
      );
    }
    const scienceQueueQuarantineMatch = url.pathname.match(/^\/v1\/science\/queue\/([^/]+)\/quarantine$/);
    if (scienceQueueQuarantineMatch) {
      return handleScienceQueueMutationRequest(
        request,
        env,
        "quarantine",
        { queueItemId: decodeURIComponent(scienceQueueQuarantineMatch[1]) },
        options.flowRepoStore
      );
    }
    const scienceQueueHandoffMatch = url.pathname.match(/^\/v1\/science\/queue\/([^/]+)\/handoff$/);
    if (scienceQueueHandoffMatch) {
      return handleScienceQueueMutationRequest(
        request,
        env,
        "handoff",
        { queueItemId: decodeURIComponent(scienceQueueHandoffMatch[1]) },
        options.flowRepoStore
      );
    }
    const scienceQueueByFlowMatch = url.pathname.match(/^\/v1\/science\/queue\/by-flow\/([^/]+)$/);
    if (scienceQueueByFlowMatch) {
      return handleScienceQueueReadRequest(
        request,
        env,
        "by_flow",
        { flowRef: decodeURIComponent(scienceQueueByFlowMatch[1]) },
        options.flowRepoStore
      );
    }
    if (url.pathname === "/v1/science/queue/next")
      return handleScienceQueueReadRequest(request, env, "next", {}, options.flowRepoStore);
    if (url.pathname === "/v1/science/queue/blocked")
      return handleScienceQueueReadRequest(request, env, "blocked", {}, options.flowRepoStore);
    if (url.pathname === "/v1/science/queue/quarantined")
      return handleScienceQueueReadRequest(request, env, "quarantined", {}, options.flowRepoStore);
    if (url.pathname === "/v1/science/queue/handoffs")
      return handleScienceQueueReadRequest(request, env, "handoffs", {}, options.flowRepoStore);
    const scienceQueueItemMatch = url.pathname.match(/^\/v1\/science\/queue\/([^/]+)$/);
    if (scienceQueueItemMatch) {
      return handleScienceQueueReadRequest(
        request,
        env,
        "item",
        { queueItemId: decodeURIComponent(scienceQueueItemMatch[1]) },
        options.flowRepoStore
      );
    }
    const scienceMatch = url.pathname.match(/^\/v1\/science\/([^/]+)$/);
    if (scienceMatch)
      return handleScienceRequest(request, env, decodeURIComponent(scienceMatch[1]), options.flowRepoStore);
    if (url.pathname === "/v1/pm/handoff")
      return handlePmHandoffRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/pm/intake")
      return handlePmIntakeRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/pm/specify")
      return handlePmSpecifyRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/pm/plan")
      return handlePmPlanRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/pm/tasks")
      return errorResponse("PM_TASKS_ROUTE_RETIRED_USE_PM_TASKING", "The generic PM Tasks route is retired. Use /v1/pm/tasking for PM tasking; Coder owns implementation task decomposition.", 410);
    if (url.pathname === "/v1/pm/tasking")
      return handlePmTaskingRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/coder/work-plan")
      return handleCoderWorkPlanRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/coder/tasks")
      return handleCoderTasksRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/coder/implementation-bundle")
      return handleCoderImplementationBundleRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/coder/handoff")
      return handleCoderHandoffRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/helper/execution-intake")
      return handleHelperExecutionIntakeRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/helper/execution-report")
      return handleHelperExecutionReportRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/auditor/helper-execution-review")
      return handleAuditorHelperExecutionReviewRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/human/advancement-decision")
      return handleHumanAdvancementDecisionRequest(request, env, options.flowRepoStore);
    if (url.pathname === "/v1/flows")
      return handleFlowsRequest(request, env, void 0, "collection", options.flowRepoStore);
    const artifactOpenMatch = url.pathname.match(/^\/v1\/artifacts\/([^/]+)$/);
    if (artifactOpenMatch)
      return handleReadResumeRequest(request, env, "artifact_open", { artifactId: decodeURIComponent(artifactOpenMatch[1]), repoStore: options.flowRepoStore });
    const flowResumeMatch = url.pathname.match(/^\/v1\/flows\/([^/]+)\/resume$/);
    if (flowResumeMatch)
      return handleReadResumeRequest(request, env, "flow_resume", { flowRef: decodeURIComponent(flowResumeMatch[1]), repoStore: options.flowRepoStore });
    const flowHistoryMatch = url.pathname.match(/^\/v1\/flows\/([^/]+)\/history$/);
    if (flowHistoryMatch)
      return handleReadResumeRequest(request, env, "flow_history", { flowRef: decodeURIComponent(flowHistoryMatch[1]), repoStore: options.flowRepoStore });
    const flowLatestMatch = url.pathname.match(/^\/v1\/flows\/([^/]+)\/latest$/);
    if (flowLatestMatch)
      return handleReadResumeRequest(request, env, "flow_latest", { flowRef: decodeURIComponent(flowLatestMatch[1]), repoStore: options.flowRepoStore });
    const flowNextMatch = url.pathname.match(/^\/v1\/flows\/([^/]+)\/next$/);
    if (flowNextMatch)
      return handleReadResumeRequest(request, env, "flow_next", { flowRef: decodeURIComponent(flowNextMatch[1]), repoStore: options.flowRepoStore });
    const flowStopConditionsMatch = url.pathname.match(/^\/v1\/flows\/([^/]+)\/stop-conditions$/);
    if (flowStopConditionsMatch)
      return handleReadResumeRequest(request, env, "flow_stop_conditions", { flowRef: decodeURIComponent(flowStopConditionsMatch[1]), repoStore: options.flowRepoStore });
    const flowStatusMatch = url.pathname.match(/^\/v1\/flows\/([^/]+)\/status$/);
    if (flowStatusMatch)
      return handleFlowsRequest(request, env, decodeURIComponent(flowStatusMatch[1]), "status", options.flowRepoStore);
    const flowArtifactsMatch = url.pathname.match(/^\/v1\/flows\/([^/]+)\/artifacts$/);
    if (flowArtifactsMatch && request.method === "GET")
      return handleReadResumeRequest(request, env, "flow_artifacts", { flowRef: decodeURIComponent(flowArtifactsMatch[1]), repoStore: options.flowRepoStore });
    if (flowArtifactsMatch)
      return handleFlowsRequest(request, env, decodeURIComponent(flowArtifactsMatch[1]), "artifacts", options.flowRepoStore);
    const flowAdvanceMatch = url.pathname.match(/^\/v1\/flows\/([^/]+)\/advance$/);
    if (flowAdvanceMatch)
      return handleFlowsRequest(request, env, decodeURIComponent(flowAdvanceMatch[1]), "advance", options.flowRepoStore);
    const flowMatch = url.pathname.match(/^\/v1\/flows\/([^/]+)$/);
    if (flowMatch)
      return handleFlowsRequest(request, env, decodeURIComponent(flowMatch[1]), "item", options.flowRepoStore);
    if (url.pathname.startsWith("/v1/runs"))
      return handleNotImplemented("runs");
    return errorResponse("NOT_FOUND", `No route for ${request.method} ${url.pathname}`, 404);
  } catch (err) {
    if (err instanceof Response)
      return err;
    return errorResponse("INTERNAL_ERROR", err instanceof Error ? err.message : String(err), 500);
  }
}
__name(handleWorkerFetch, "handleWorkerFetch");
var src_default = {
  async fetch(request, env) {
    try {
      return await handleWorkerFetch(request, env);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return jsonResponse({
        ok: false,
        error: {
          code: "UNCAUGHT_WORKER_EXCEPTION",
          message
        },
        no_mutation: true,
        required_status_labels: [...STATUS_LABELS],
        truth_boundary: {
          queue_record_is_truth: false,
          queue_record_is_evidence: false,
          raw_gpt_output_is_evidence: false,
          contextbus_notes_messages_are_evidence: false,
          requires_harness: true
        }
      }, 500);
    }
  }
};
export {
  src_default as default,
  handleWorkerFetch
};
//# sourceMappingURL=index.js.map
