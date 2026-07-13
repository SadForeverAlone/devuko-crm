type StatusPillTone = "healthy" | "warning" | "critical" | "neutral" | "info";

type StatusPillProps = {
  label: string;
  tone?: StatusPillTone;
};

const toneToStatus: Record<StatusPillTone, string> = {
  healthy: "active",
  warning: "provisioning",
  critical: "error",
  neutral: "pending",
  info: "provisioning",
};

export function StatusPill({ label, tone = "neutral" }: StatusPillProps) {
  return <span className={`crm-site-status crm-site-status--${toneToStatus[tone]}`}>{label}</span>;
}
