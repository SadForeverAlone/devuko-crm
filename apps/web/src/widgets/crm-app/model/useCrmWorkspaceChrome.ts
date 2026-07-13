import { useCallback, useEffect } from "react";
import { updateCrmSettings } from "@/entities/crm";
import { emitAppNotification } from "@/shared/lib/notify";

type UseCrmWorkspaceChromeInput = {
  workspaceMenuOpen: boolean;
  setWorkspaceMenuOpen: (open: boolean) => void;
  settingsDraft: Record<string, string>;
  load: () => Promise<void>;
};

export function useCrmWorkspaceChrome({
  workspaceMenuOpen,
  setWorkspaceMenuOpen,
  settingsDraft,
  load,
}: UseCrmWorkspaceChromeInput) {
  useEffect(() => {
    const close = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        setWorkspaceMenuOpen(false);
        return;
      }
      if (!target.closest(".crm-workspace-picker")) {
        setWorkspaceMenuOpen(false);
      }
    };
    if (!workspaceMenuOpen) {
      return;
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [workspaceMenuOpen, setWorkspaceMenuOpen]);

  const handleSaveSettings = useCallback(async () => {
    await updateCrmSettings(
      Object.entries(settingsDraft).map(([key, value]) => ({ key, value }))
    );
    emitAppNotification("Настройки CRM сохранены");
    await load();
  }, [load, settingsDraft]);

  return { handleSaveSettings };
}
