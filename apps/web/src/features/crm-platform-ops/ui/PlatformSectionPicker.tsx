import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import type { CrmLang } from "@/widgets/crm-app/model/types";

export type SectionPickerOption<T extends string> = {
  key: T;
  label: Record<CrmLang, string>;
  icon: IconDefinition;
  badge?: number;
};

export type SectionPickerGroup<T extends string> = {
  id: string;
  label: Record<CrmLang, string>;
  tabs: T[];
};

type PlatformSectionPickerProps<T extends string> = {
  crmLang: CrmLang;
  value: T;
  onChange: (value: T) => void;
  groups: SectionPickerGroup<T>[];
  options: SectionPickerOption<T>[];
  panelAriaLabel: Record<CrmLang, string>;
};

export function PlatformSectionPicker<T extends string>({
  crmLang,
  value,
  onChange,
  groups,
  options,
  panelAriaLabel,
}: PlatformSectionPickerProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const optionMap = useMemo(() => new Map(options.map((option) => [option.key, option])), [options]);
  const current = optionMap.get(value);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectSection(nextValue: T) {
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <div className="crm-project-picker" ref={rootRef}>
      <button
        type="button"
        className="crm-project-picker__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((state) => !state)}
      >
        {current ? (
          <FontAwesomeIcon icon={current.icon} className="crm-project-picker__trigger-icon" />
        ) : null}
        <span>{current?.label[crmLang] ?? value}</span>
        <FontAwesomeIcon icon={faChevronDown} className="crm-project-picker__trigger-chevron" />
      </button>

      {open ? (
        <div
          id={panelId}
          className="crm-project-picker__panel"
          role="dialog"
          aria-label={panelAriaLabel[crmLang]}
        >
          {groups.map((group) => (
            <section key={group.id} className="crm-project-picker__group">
              <h3 className="crm-project-picker__group-label">{group.label[crmLang]}</h3>
              <div className="crm-project-picker__grid">
                {group.tabs.map((key) => {
                  const option = optionMap.get(key);
                  if (!option) return null;
                  const isActive = value === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={
                        isActive
                          ? "crm-project-picker__option crm-project-picker__option--active"
                          : "crm-project-picker__option"
                      }
                      onClick={() => selectSection(key)}
                    >
                      <FontAwesomeIcon icon={option.icon} className="crm-project-picker__option-icon" />
                      <span className="crm-project-picker__option-label">{option.label[crmLang]}</span>
                      {option.badge != null && option.badge > 0 ? (
                        <span className="crm-project-picker__option-badge">{option.badge}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
