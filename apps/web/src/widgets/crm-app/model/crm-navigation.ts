import type { NavigateOptions } from "react-router-dom";

export type CrmNavigationState = {
  workspaceId?: string;
};

export function getWorkspaceIdFromLocationState(state: unknown): string | null {
  if (!state || typeof state !== "object") {
    return null;
  }
  const workspaceId = (state as CrmNavigationState).workspaceId;
  return typeof workspaceId === "string" && workspaceId.trim() ? workspaceId.trim() : null;
}

export function withWorkspaceNavigationState(
  workspaceId: string,
  options?: NavigateOptions,
): NavigateOptions {
  const previousState =
    options?.state && typeof options.state === "object"
      ? (options.state as Record<string, unknown>)
      : {};

  return {
    ...options,
    state: {
      ...previousState,
      workspaceId,
    },
  };
}
