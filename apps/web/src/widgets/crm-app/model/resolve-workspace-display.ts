import {
  getStoredCrmWorkspaceMeta,
  PLATFORM_WORKSPACE_ID,
  type CrmWorkspace,
} from "@/entities/crm";

export type WorkspaceDisplay = {
  label: string;
  kind: "platform" | "site";
};

export function resolveWorkspaceDisplay(
  activeWorkspaceId: string,
  activeWorkspace: CrmWorkspace | null,
  platformLabel: string
): WorkspaceDisplay {
  if (activeWorkspace) {
    const isPlatform = activeWorkspace.kind === "platform";
    return {
      label: isPlatform ? platformLabel : activeWorkspace.label,
      kind: isPlatform ? "platform" : "site",
    };
  }

  if (activeWorkspaceId === PLATFORM_WORKSPACE_ID) {
    return { label: platformLabel, kind: "platform" };
  }

  const stored = getStoredCrmWorkspaceMeta();
  if (stored?.id === activeWorkspaceId) {
    return { label: stored.label, kind: stored.kind };
  }

  return { label: stored?.label ?? "…", kind: stored?.kind ?? "site" };
}
