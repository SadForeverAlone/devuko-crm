import type { KeyboardEvent, ReactNode } from "react";

type DashboardLinkCardProps = {
  className?: string;
  onActivate: () => void;
  children: ReactNode;
};

export function DashboardLinkCard({ className, onActivate, children }: DashboardLinkCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate();
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={onActivate}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  );
}
