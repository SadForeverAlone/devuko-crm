import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { useCrmWorkspace } from "./useCrmWorkspace";

export type CrmWorkspaceValue = ReturnType<typeof useCrmWorkspace>;

const CrmWorkspaceContext = createContext<CrmWorkspaceValue | null>(null);

export function CrmWorkspaceProvider({
  value,
  children,
}: {
  value: CrmWorkspaceValue;
  children: ReactNode;
}) {
  return <CrmWorkspaceContext.Provider value={value}>{children}</CrmWorkspaceContext.Provider>;
}

export function useCrmWorkspaceContext(): CrmWorkspaceValue {
  const value = useContext(CrmWorkspaceContext);
  if (!value) {
    throw new Error("useCrmWorkspaceContext must be used within CrmWorkspaceProvider");
  }
  return value;
}

export function useOptionalCrmWorkspaceContext(): CrmWorkspaceValue | null {
  return useContext(CrmWorkspaceContext);
}
