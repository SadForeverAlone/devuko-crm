import { generalSettingsBlueprint, seoSettingsBlueprint } from "../../model/config";
import { crmCopy } from "../../model/i18n";
import type { SettingsSectionProps } from "./sectionTypes";

export function SettingsSection({
  crmLang,
  settingsDraft,
  setSettingsDraft,
  onSaveSettings,
}: SettingsSectionProps) {
  const ui = crmCopy[crmLang];
  return (
    <section className="crm-grid crm-grid--two">
      <article className="crm-panel crm-table-card">
        <div className="crm-section-head">
          <h3>{ui.settingsTitle}</h3>
          <span className="crm-muted">{ui.settingsSubtitle}</span>
        </div>
        <p className="crm-muted crm-settings-intro">{ui.settingsCompactHint}</p>
        <div className="crm-settings-list">
          {generalSettingsBlueprint.map((item, index) => (
            <div key={item.key} className="crm-settings-item">
              <div>
                <h4>{item.title[crmLang]}</h4>
                <p>{item.description[crmLang]}</p>
              </div>
              <div className="crm-settings-item__controls">
                <button type="button" className="crm-toggle" aria-pressed={index % 2 === 0}>
                  <span />
                </button>
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
        <button type="button" className="crm-btn crm-btn--primary" onClick={() => void onSaveSettings()}>
          {ui.settingsSave}
        </button>
      </article>
      <article className="crm-panel crm-table-card">
        <div className="crm-section-head">
          <h3>{ui.settingsSeoTitle}</h3>
        </div>
        <div className="crm-settings-list">
          {seoSettingsBlueprint.map((item, index) => (
            <div key={item.key} className="crm-settings-item">
              <div>
                <h4>{item.title[crmLang]}</h4>
                <p>{item.description[crmLang]}</p>
              </div>
              <div className="crm-settings-item__controls">
                <button type="button" className="crm-toggle" aria-pressed={index % 2 === 0}>
                  <span />
                </button>
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
        <button type="button" className="crm-btn crm-btn--primary" onClick={() => void onSaveSettings()}>
          {ui.settingsSave}
        </button>
      </article>
    </section>
  );
}
