const CRM_TOKEN_KEY = "spx-crm-token";
const CRM_AUTH_SESSION_KEY = "spx-crm-auth-session";
const CRM_WORKSPACE_KEY = "spx-crm-workspace-id";
const CRM_WORKSPACE_LABEL_KEY = "spx-crm-workspace-label";
const CRM_WORKSPACE_KIND_KEY = "spx-crm-workspace-kind";

/** Sentinel stored in React state when auth is cookie-based (no JWT in JS). */
export const CRM_AUTH_SESSION_MARKER = "session";

export const PLATFORM_WORKSPACE_ID = "platform";

export type CrmWorkspaceKind = "platform" | "site";

export type StoredCrmWorkspaceMeta = {
  id: string;
  label: string;
  kind: CrmWorkspaceKind;
};

function readLegacyLocalToken() {
  try {
    return localStorage.getItem(CRM_TOKEN_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

function clearLegacyLocalToken() {
  try {
    localStorage.removeItem(CRM_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function getStoredCrmWorkspaceId() {
  try {
    return localStorage.getItem(CRM_WORKSPACE_KEY)?.trim() ?? PLATFORM_WORKSPACE_ID;
  } catch {
    return PLATFORM_WORKSPACE_ID;
  }
}

export function getStoredCrmWorkspaceMeta(): StoredCrmWorkspaceMeta | null {
  const id = getStoredCrmWorkspaceId();
  try {
    const label = localStorage.getItem(CRM_WORKSPACE_LABEL_KEY)?.trim() ?? "";
    const kind = localStorage.getItem(CRM_WORKSPACE_KIND_KEY)?.trim();
    if ((kind === "platform" || kind === "site") && label) {
      return { id, label, kind };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function setStoredCrmWorkspaceId(workspaceId: string) {
  try {
    localStorage.setItem(CRM_WORKSPACE_KEY, workspaceId.trim());
  } catch {
    /* ignore */
  }
}

export function setStoredCrmWorkspace(
  workspaceId: string,
  meta?: { label: string; kind: CrmWorkspaceKind }
) {
  setStoredCrmWorkspaceId(workspaceId);
  if (!meta) {
    return;
  }
  try {
    localStorage.setItem(CRM_WORKSPACE_LABEL_KEY, meta.label.trim());
    localStorage.setItem(CRM_WORKSPACE_KIND_KEY, meta.kind);
  } catch {
    /* ignore */
  }
}

export function hasStoredCrmAuthSession() {
  try {
    return sessionStorage.getItem(CRM_AUTH_SESSION_KEY) === CRM_AUTH_SESSION_MARKER;
  } catch {
    return false;
  }
}

export function setStoredCrmAuthSession() {
  try {
    sessionStorage.setItem(CRM_AUTH_SESSION_KEY, CRM_AUTH_SESSION_MARKER);
    clearLegacyLocalToken();
  } catch {
    /* ignore */
  }
}

/** @deprecated JWT is stored in httpOnly cookie; returns legacy bearer token if present. */
export function getStoredCrmToken() {
  if (hasStoredCrmAuthSession()) {
    return CRM_AUTH_SESSION_MARKER;
  }
  const legacy = readLegacyLocalToken();
  if (legacy) {
    setStoredCrmAuthSession();
    clearLegacyLocalToken();
    return CRM_AUTH_SESSION_MARKER;
  }
  return "";
}

/** @deprecated Use setStoredCrmAuthSession after OTP verify (cookie holds JWT). */
export function setStoredCrmToken(token: string) {
  if (token.trim()) {
    setStoredCrmAuthSession();
  }
}

export function clearStoredCrmToken() {
  try {
    sessionStorage.removeItem(CRM_AUTH_SESSION_KEY);
  } catch {
    /* ignore */
  }
  clearLegacyLocalToken();
}

export function resolveInitialCrmAuthToken() {
  if (hasStoredCrmAuthSession()) {
    return CRM_AUTH_SESSION_MARKER;
  }
  if (readLegacyLocalToken()) {
    setStoredCrmAuthSession();
    clearLegacyLocalToken();
    return CRM_AUTH_SESSION_MARKER;
  }
  return "";
}
