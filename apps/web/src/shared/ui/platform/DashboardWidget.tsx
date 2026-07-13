import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import type { ReactNode } from "react";

type DashboardWidgetProps = {
  title: string;
  icon: IconDefinition;
  onOpen?: () => void;
  openLabel?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardWidget({
  title,
  icon,
  onOpen,
  openLabel,
  children,
  className = "",
}: DashboardWidgetProps) {
  return (
    <article className={`crm-panel crm-panel--static crm-dashboard-widget ${className}`.trim()}>
      <header className="crm-dashboard-widget__head">
        <span className="crm-dashboard-widget__icon" aria-hidden>
          <FontAwesomeIcon icon={icon} />
        </span>
        <h3 className="crm-dashboard-widget__title">{title}</h3>
        {onOpen ? (
          <button type="button" className="crm-dashboard-widget__open" onClick={onOpen}>
            {openLabel}
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        ) : null}
      </header>
      <div className="crm-dashboard-widget__body">{children}</div>
    </article>
  );
}

type DashboardWidgetRowProps = {
  label: ReactNode;
  value: ReactNode;
};

export function DashboardWidgetRow({ label, value }: DashboardWidgetRowProps) {
  return (
    <li className="crm-dashboard-widget__row">
      <span className="crm-dashboard-widget__label">{label}</span>
      <span className="crm-dashboard-widget__value">{value}</span>
    </li>
  );
}

type DashboardWidgetFeedItemProps = {
  title: string;
  meta?: string;
  trailing: ReactNode;
  tone?: "ok" | "fail" | "neutral";
};

export function DashboardWidgetFeedItem({
  title,
  meta,
  trailing,
  tone = "neutral",
}: DashboardWidgetFeedItemProps) {
  return (
    <li className="crm-dashboard-widget__feed-item">
      <span className={`crm-dashboard-widget__feed-dot crm-dashboard-widget__feed-dot--${tone}`} aria-hidden />
      <div className="crm-dashboard-widget__feed-text">
        <p className="crm-dashboard-widget__feed-title">{title}</p>
        {meta ? <p className="crm-dashboard-widget__feed-meta">{meta}</p> : null}
      </div>
      {trailing}
    </li>
  );
}
