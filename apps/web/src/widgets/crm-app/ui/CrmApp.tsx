import "./crm.css";
import "./platform.css";
import { useCrmWorkspace } from "../model/useCrmWorkspace";
import { CrmAuthenticatedLayout } from "./CrmAuthenticatedLayout";
import { CrmLoginScreen } from "./CrmLoginScreen";

export function CrmApp() {
  const workspace = useCrmWorkspace();

  if (!workspace.token) {
    const authUi = workspace.authUi;
    return (
      <CrmLoginScreen
        title={authUi.crmLoginTitle}
        subtitle={authUi.crmLoginSubtitle}
        loginLabel={authUi.crmLoginFieldLogin}
        passwordLabel={authUi.crmLoginFieldPassword}
        loginPlaceholder={authUi.crmLoginPlaceholderLogin}
        passwordPlaceholder={authUi.crmLoginPlaceholderPassword}
        submitLabel={authUi.crmLoginSubmit}
        login={workspace.login}
        password={workspace.password}
        loginError={workspace.loginError}
        onLoginChange={workspace.setLogin}
        onPasswordChange={workspace.setPassword}
        onSubmit={() => void workspace.handleLogin()}
      />
    );
  }

  return <CrmAuthenticatedLayout workspace={workspace} />;
}
