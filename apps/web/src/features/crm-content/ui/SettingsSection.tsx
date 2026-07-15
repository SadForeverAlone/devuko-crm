import { useState } from "react";
import { PlatformPage } from "@/shared/ui/platform";
import { generalSettingsBlueprint, seoSettingsBlueprint } from "@/widgets/crm-app/model/config";
import { crmCopy } from "@/widgets/crm-app/model/i18n";
import type { SettingsSectionProps } from "@/shared/crm/ui/sectionTypes";

type SettingsTab = "general" | "seo";

export function SettingsSection({
  crmLang,
  settingsDraft,
  setSettingsDraft,
  onSaveSettings,
}: SettingsSectionProps) {
  const ui = crmCopy[crmLang];
  const [tab, setTab] = useState<SettingsTab>("general");
  const [saving, setSaving] = useState(false);
  const blueprint = tab === "general" ? generalSettingsBlueprint : seoSettingsBlueprint;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveSettings();
    } finally {
      setSaving(false);
    }
  };

  return (
    <PlatformPage
      title={ui.settingsTitle}
      subtitle={ui.settingsSubtitle}
      actions={
        <button
          type="button"
          className="crm-btn crm-btn--primary"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {ui.settingsSave}
        </button>
      }
    >
      <nav className="crm-tab-rail" aria-label={ui.settingsTitle}>
        <button
          type="button"
          className={tab === "general" ? "crm-tab-rail__item crm-tab-rail__item--active" : "crm-tab-rail__item"}
          onClick={() => setTab("general")}
        >
          {ui.settingsTitle}
        </button>
        <button
          type="button"
          className={tab === "seo" ? "crm-tab-rail__item crm-tab-rail__item--active" : "crm-tab-rail__item"}
          onClick={() => setTab("seo")}
        >
          {ui.settingsSeoTitle}
        </button>
      </nav>

      <article className="crm-panel crm-table-card crm-settings-panel">
        {tab === "general" ? (
          <p className="crm-muted crm-settings-intro">{ui.settingsCompactHint}</p>
        ) : null}
        <div className="crm-settings-list">
          {blueprint.map((item) => (
            <div key={item.key} className="crm-settings-item">
              <div>
                <h4>{item.title[crmLang]}</h4>
                <p>{item.description[crmLang]}</p>
              </div>
              <div className="crm-settings-item__controls">
                <input
                  className="spx-input crm-input crm-input--editor"
                  value={settingsDraft[item.key] ?? ""}
                  onChange={(event) =>
                    setSettingsDraft((prev) => ({
                      ...prev,
                      [item.key]: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </article>
    </PlatformPage>
  );
}
