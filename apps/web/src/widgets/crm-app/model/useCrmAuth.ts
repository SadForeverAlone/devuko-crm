import { useState } from "react";
import {
  clearStoredCrmToken,
  getStoredCrmToken,
  loginCrm,
  PLATFORM_WORKSPACE_ID,
  setStoredCrmToken,
  setStoredCrmWorkspace,
} from "@/entities/crm";
import { crmCopy } from "./config";
import type { CrmLang } from "./types";

type UseCrmAuthInput = {
  crmLang: CrmLang;
  onAuthenticated: (workspaceId: string) => void;
};

export function useCrmAuth({ crmLang, onAuthenticated }: UseCrmAuthInput) {
  const [token, setToken] = useState(() => getStoredCrmToken());
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoginError(null);
    const authUi = crmCopy[crmLang];
    const response = await loginCrm(login, password);
    if (!response.ok || !response.token) {
      setLoginError(authUi.crmLoginError);
      return;
    }
    setStoredCrmToken(response.token);
    setToken(response.token);
    setStoredCrmWorkspace(PLATFORM_WORKSPACE_ID, {
      label: authUi.platformWorkspaceLabel,
      kind: "platform",
    });
    onAuthenticated(PLATFORM_WORKSPACE_ID);
  };

  const handleLogout = () => {
    clearStoredCrmToken();
    setToken("");
  };

  return {
    token,
    setToken,
    login,
    setLogin,
    password,
    setPassword,
    loginError,
    handleLogin,
    handleLogout,
  };
}
