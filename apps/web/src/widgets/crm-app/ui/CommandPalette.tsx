import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import type { CrmLang } from "@/widgets/crm-app/model/types";
import { buildCommandPaletteItems, type CommandPaletteItem } from "@/widgets/crm-app/model/platform-nav";

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  crmLang: CrmLang;
  isPlatformWorkspace: boolean;
};

export function CommandPalette({
  open,
  onClose,
  onNavigate,
  crmLang,
  isPlatformWorkspace,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const items = useMemo(() => buildCommandPaletteItems(isPlatformWorkspace), [isPlatformWorkspace]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const label = item.label[crmLang].toLowerCase();
      const group = item.group[crmLang].toLowerCase();
      const keywords = item.keywords?.join(" ").toLowerCase() ?? "";
      return label.includes(q) || group.includes(q) || keywords.includes(q);
    });
  }, [items, query, crmLang]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandPaletteItem[]>();
    for (const item of filtered) {
      const key = item.group[crmLang];
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [filtered, crmLang]);

  const activeOptionId = filtered[activeIndex] ? `${listboxId}-option-${filtered[activeIndex].id}` : undefined;

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      previousFocusRef.current?.focus?.();
      previousFocusRef.current = null;
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'input, button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (event.key === "Enter" && filtered[activeIndex]) {
        event.preventDefault();
        onNavigate(filtered[activeIndex].path);
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, activeIndex, onClose, onNavigate]);

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div
      className="dv-cmd-palette-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="dv-cmd-palette"
        role="dialog"
        aria-modal="true"
        aria-label={crmLang === "ru" ? "Командная палитра" : "Command palette"}
      >
        <div className="dv-cmd-palette__search">
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden />
          <input
            ref={inputRef}
            type="search"
            className="dv-cmd-palette__input"
            placeholder={crmLang === "ru" ? "Поиск команд и страниц…" : "Search commands and pages…"}
            aria-label={crmLang === "ru" ? "Поиск команд и страниц" : "Search commands and pages"}
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd className="dv-cmd-palette__kbd" aria-hidden="true">
            Esc
          </kbd>
        </div>
        <div className="dv-cmd-palette__results" id={listboxId} role="listbox">
          {filtered.length === 0 ? (
            <p className="dv-cmd-palette__empty">
              {crmLang === "ru" ? "Ничего не найдено" : "No results"}
            </p>
          ) : (
            grouped.map(([group, groupItems]) => (
              <div key={group} className="dv-cmd-palette__group" role="group" aria-label={group}>
                <p className="dv-cmd-palette__group-label">{group}</p>
                {groupItems.map((item) => {
                  flatIndex += 1;
                  const index = flatIndex;
                  return (
                    <button
                      key={item.id}
                      id={`${listboxId}-option-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      className={
                        index === activeIndex
                          ? "dv-cmd-palette__item dv-cmd-palette__item--active"
                          : "dv-cmd-palette__item"
                      }
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => {
                        onNavigate(item.path);
                        onClose();
                      }}
                    >
                      <span>{item.label[crmLang]}</span>
                      <FontAwesomeIcon icon={faArrowRight} aria-hidden />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
