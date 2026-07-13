import type { ReactNode } from "react";

type PlatformPageProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PlatformPage({ title, subtitle, actions, children, className = "" }: PlatformPageProps) {
  return (
    <section className={`crm-page ${className}`.trim()}>
      <header className="crm-page__head">
        <div className="crm-page__titles">
          <h1 className="crm-page__title">{title}</h1>
          {subtitle ? <p className="crm-page__subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="crm-page__actions">{actions}</div> : null}
      </header>
      <div className="crm-page__body">{children}</div>
    </section>
  );
}
