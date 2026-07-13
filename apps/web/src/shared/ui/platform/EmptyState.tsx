import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type EmptyStateProps = {
  icon: IconDefinition;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="crm-sites-empty-state">
      <div className="crm-sites-empty-state__icon" aria-hidden>
        <FontAwesomeIcon icon={icon} />
      </div>
      <p>{title}</p>
      {description ? <p className="crm-muted">{description}</p> : null}
      {action}
    </div>
  );
}
