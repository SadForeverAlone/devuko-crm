type CrmMeterBarProps = {
  value: number;
  className?: string;
  toneClassName?: string;
};

export function CrmMeterBar({ value, className = "", toneClassName = "" }: CrmMeterBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <svg
      className={`crm-infra-meter__svg ${className}`.trim()}
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      role="img"
      aria-hidden
    >
      <rect className="crm-infra-meter__track-rect" x="0" y="0" width="100" height="8" rx="4" />
      <rect
        className={`crm-infra-meter__bar-rect ${toneClassName}`.trim()}
        x="0"
        y="0"
        width={pct}
        height="8"
        rx="4"
      />
    </svg>
  );
}
