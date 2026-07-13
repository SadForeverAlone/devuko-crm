const CRM_TOKEN_KEY = "spx-crm-token";
const CRM_WORKSPACE_KEY = "spx-crm-workspace-id";
const CRM_WORKSPACE_LABEL_KEY = "spx-crm-workspace-label";
const CRM_WORKSPACE_KIND_KEY = "spx-crm-workspace-kind";

export const PLATFORM_WORKSPACE_ID = "platform";

export type CrmWorkspaceKind = "platform" | "site";

export type StoredCrmWorkspaceMeta = {
  id: string;
  label: string;
  kind: CrmWorkspaceKind;
};

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

export function getStoredCrmToken() {
  try {
    return localStorage.getItem(CRM_TOKEN_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function setStoredCrmToken(token: string) {
  try {
    localStorage.setItem(CRM_TOKEN_KEY, token.trim());
  } catch {
    /* ignore */
  }
}

export function clearStoredCrmToken() {
  try {
    localStorage.removeItem(CRM_TOKEN_KEY);
    if (localStorage.getItem(CRM_TOKEN_KEY) !== null) {
      localStorage.setItem(CRM_TOKEN_KEY, "");
      localStorage.removeItem(CRM_TOKEN_KEY);
    }
  } catch {
    /* ignore */
  }
}
