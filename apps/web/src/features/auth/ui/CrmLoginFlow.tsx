import type { CrmLang } from "@/widgets/crm-app/model/types";
import { CrmLoginScreen } from "@/features/crm-auth";
import { crmCopy } from "@/widgets/crm-app/model/config";

type AuthStep = "credentials" | "code";

type CrmLoginFlowProps = {
  crmLang: CrmLang;
  email: string;
  login: string;
  password: string;
  code: string;
  authStep: AuthStep;
  loginError: string | null;
  submitting: boolean;
  onLoginChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onContinue: () => void;
  onVerify: () => void;
  onBack: () => void;
};

export function CrmLoginFlow({
  crmLang,
  email,
  login,
  password,
  code,
  authStep,
  loginError,
  submitting,
  onLoginChange,
  onPasswordChange,
  onCodeChange,
  onContinue,
  onVerify,
  onBack,
}: CrmLoginFlowProps) {
  const authUi = crmCopy[crmLang];
  const codeHint =
    authStep === "code" && email
      ? authUi.crmLoginCodeHint.replace("{email}", email)
      : authUi.crmLoginCodeHint;

  return (
    <CrmLoginScreen
      crmLang={crmLang}
      title={authUi.crmLoginTitle}
      subtitle={authUi.crmLoginSubtitle}
      stepCredentialsLabel={authUi.crmLoginStepCredentials}
      stepCodeLabel={authUi.crmLoginStepCode}
      loginLabel={authUi.crmLoginFieldEmail}
      loginPlaceholder={authUi.crmLoginPlaceholderEmail}
      passwordLabel={authUi.crmLoginFieldPassword}
      passwordPlaceholder={authUi.crmLoginPlaceholderPassword}
      codeLabel={authUi.crmLoginFieldCode}
      continueLabel={authUi.crmLoginContinue}
      verifyLabel={authUi.crmLoginVerify}
      backLabel={authUi.crmLoginBack}
      sendingLabel={authUi.crmLoginSending}
      codeHint={codeHint}
      login={login}
      password={password}
      code={code}
      authStep={authStep}
      loginError={loginError}
      submitting={submitting}
      onLoginChange={onLoginChange}
      onPasswordChange={onPasswordChange}
      onCodeChange={onCodeChange}
      onContinue={onContinue}
      onVerify={onVerify}
      onBack={onBack}
    />
  );
}
