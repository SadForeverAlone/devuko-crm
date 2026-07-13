import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";

type PlatformCardProps = {
  title?: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  icon?: IconDefinition;
  children: ReactNode;
  className?: string;
  compact?: boolean;
};

export function PlatformCard({
  title,
  subtitle,
  action,
  icon,
  children,
  className = "",
  compact = false,
}: PlatformCardProps) {
  const hasHead = Boolean(title || subtitle || action || icon);

  if (compact) {
    return (
      <article className={`crm-panel crm-panel--static crm-side-card ${className}`.trim()}>
        {hasHead ? (
          <header className="crm-section-head">
            <div>
              {title ? <h3>{title}</h3> : null}
              {subtitle ? <p className="crm-muted">{subtitle}</p> : null}
            </div>
            {action ? <div className="crm-section-head__actions">{action}</div> : null}
          </header>
        ) : null}
        {children}
      </article>
    );
  }

  return (
    <article className={`crm-panel crm-panel--static crm-platform-card ${className}`.trim()}>
      {hasHead ? (
        <header className="crm-platform-card__head">
          {icon ? (
            <span className="crm-platform-card__icon" aria-hidden>
              <FontAwesomeIcon icon={icon} />
            </span>
          ) : null}
          <div className="crm-platform-card__titles">
            {title ? <h3 className="crm-platform-card__title">{title}</h3> : null}
            {subtitle ? <p className="crm-platform-card__subtitle">{subtitle}</p> : null}
          </div>
          {action ? <div className="crm-platform-card__actions">{action}</div> : null}
        </header>
      ) : null}
      <div className={hasHead ? "crm-platform-card__body" : "crm-platform-card__body crm-platform-card__body--solo"}>
        {children}
      </div>
    </article>
  );
}
