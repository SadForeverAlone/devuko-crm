import { useEffect, useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

type PlatformLogActionFilterProps = {
  label: string;
  value: string;
  allLabel: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

export function PlatformLogActionFilter({
  label,
  value,
  allLabel,
  options,
  onChange,
}: PlatformLogActionFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const currentLabel =
    value === "all"
      ? allLabel
      : options.find((option) => option.value === value)?.label ?? allLabel;

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

  const selectValue = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  const itemCount = options.length + 1;
  const panelClassName =
    itemCount > 10
      ? "crm-filter-menu__panel crm-filter-menu__panel--scroll"
      : "crm-filter-menu__panel";

  return (
    <div className="crm-filter-menu" ref={rootRef}>
      <span className="crm-muted crm-filter-menu__label">{label}</span>
      <button
        type="button"
        className="crm-filter-menu__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="crm-filter-menu__value">{currentLabel}</span>
        <FontAwesomeIcon icon={faChevronDown} className="crm-filter-menu__caret" />
      </button>
      {open ? (
        <div className={panelClassName} id={panelId} role="listbox" aria-label={label}>
          <button
            type="button"
            role="option"
            aria-selected={value === "all"}
            className={
              value === "all"
                ? "crm-filter-menu__option crm-filter-menu__option--active"
                : "crm-filter-menu__option"
            }
            onClick={() => selectValue("all")}
          >
            {allLabel}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={
                value === option.value
                  ? "crm-filter-menu__option crm-filter-menu__option--active"
                  : "crm-filter-menu__option"
              }
              onClick={() => selectValue(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
