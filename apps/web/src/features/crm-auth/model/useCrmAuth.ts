import { useEffect, useState } from "react";
import {
  clearStoredCrmToken,
  CRM_AUTH_SESSION_MARKER,
  getCrmSession,
  logoutCrm,
  requestCrmOtp,
  resolveInitialCrmAuthToken,
  setStoredCrmAuthSession,
  setStoredCrmWorkspace,
  verifyCrmOtp,
  PLATFORM_WORKSPACE_ID,
} from "@/entities/crm";
import { ApiError } from "@/shared/api/http";
import { emitAppNotification } from "@/shared/lib/notify";
import { crmCopy } from "@/widgets/crm-app/model/config";
import type { CrmLang } from "@/widgets/crm-app/model/types";

type AuthStep = "credentials" | "code";

type UseCrmAuthInput = {
  crmLang: CrmLang;
  onAuthenticated: (workspaceId: string) => void;
};

function completeLogin(
  crmLang: CrmLang,
  setToken: (token: string) => void,
  onAuthenticated: (workspaceId: string) => void
) {
  const authUi = crmCopy[crmLang];
  setStoredCrmAuthSession();
  setToken(CRM_AUTH_SESSION_MARKER);
  setStoredCrmWorkspace(PLATFORM_WORKSPACE_ID, {
    label: authUi.platformWorkspaceLabel,
    kind: "platform",
  });
  onAuthenticated(PLATFORM_WORKSPACE_ID);
}

export function useCrmAuth({ crmLang, onAuthenticated }: UseCrmAuthInput) {
  const [token, setToken] = useState(() => resolveInitialCrmAuthToken());
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [authStep, setAuthStep] = useState<AuthStep>("credentials");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      return;
    }
    let cancelled = false;
    void getCrmSession()
      .then(() => {
        if (!cancelled) {
          setStoredCrmAuthSession();
          setToken(CRM_AUTH_SESSION_MARKER);
        }
      })
      .catch(() => {
        /* not authenticated */
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleRequestOtp = async () => {
    setLoginError(null);
    const authUi = crmCopy[crmLang];
    const identifier = login.trim();
    if (!identifier || !password) {
      setLoginError(authUi.crmLoginCredentialsRequired);
      return;
    }

    setSubmitting(true);
    try {
      const response = await requestCrmOtp(identifier, password);
      if (!response.ok || !response.email) {
        setLoginError(authUi.crmLoginError);
        return;
      }
      setEmail(response.email);
      setCode("");
      setPassword("");
      setAuthStep("code");
      emitAppNotification(
        authUi.crmLoginOtpSentToast.replace("{email}", response.email),
        "success"
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setLoginError(authUi.crmLoginOtpCooldown);
      } else if (error instanceof ApiError) {
        setLoginError(error.message);
      } else {
        setLoginError(authUi.crmLoginOtpSendError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoginError(null);
    const authUi = crmCopy[crmLang];
    const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
    if (normalizedCode.length !== 6) {
      setLoginError(authUi.crmLoginCodeInvalid);
      return;
    }

    setSubmitting(true);
    try {
      const response = await verifyCrmOtp(email, normalizedCode);
      if (!response.ok) {
        setLoginError(authUi.crmLoginCodeError);
        return;
      }
      completeLogin(crmLang, setToken, onAuthenticated);
    } catch (error) {
      if (error instanceof ApiError) {
        setLoginError(error.message);
      } else {
        setLoginError(authUi.crmLoginCodeError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToCredentials = () => {
    setAuthStep("credentials");
    setCode("");
    setLoginError(null);
  };

  const handleLogout = () => {
    void logoutCrm().catch(() => {
      /* cookie may already be cleared */
    });
    clearStoredCrmToken();
    setToken("");
    setAuthStep("credentials");
    setCode("");
    setPassword("");
  };

  return {
    token,
    setToken,
    login,
    setLogin,
    password,
    setPassword,
    email,
    code,
    setCode,
    authStep,
    loginError,
    submitting,
    handleRequestOtp,
    handleVerifyOtp,
    handleBackToCredentials,
    handleLogout,
  };
}
