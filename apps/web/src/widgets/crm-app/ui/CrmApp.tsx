import { Outlet } from "react-router-dom";
import { useCrmWorkspace } from "../model/useCrmWorkspace";
import { CrmWorkspaceProvider } from "../model/crm-workspace-context";
import { CrmAuthenticatedLayout } from "./CrmAuthenticatedLayout";
import { CrmLoginFlow } from "@/features/auth";

export function CrmApp() {
  const workspace = useCrmWorkspace();

  if (!workspace.token) {
    return (
      <>
        <CrmLoginFlow
          crmLang={workspace.crmLang}
          email={workspace.email}
          login={workspace.login}
          password={workspace.password}
          code={workspace.code}
          authStep={workspace.authStep}
          loginError={workspace.loginError}
          submitting={workspace.submitting}
          onLoginChange={workspace.setLogin}
          onPasswordChange={workspace.setPassword}
          onCodeChange={workspace.setCode}
          onContinue={() => void workspace.handleRequestOtp()}
          onVerify={() => void workspace.handleVerifyOtp()}
          onBack={workspace.handleBackToCredentials}
        />
        <Outlet />
      </>
    );
  }

  return (
    <CrmWorkspaceProvider value={workspace}>
      <CrmAuthenticatedLayout />
    </CrmWorkspaceProvider>
  );
}
