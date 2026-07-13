type SkeletonProps = {
  width?: string;
  height?: string;
  className?: string;
};

export function Skeleton({ width = "100%", height = "1rem", className = "" }: SkeletonProps) {
  return (
    <span
      className={`dv-skeleton ${className}`.trim()}
      style={{ width, height }}
      aria-hidden
    />
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="dv-skeleton-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="dv-skeleton-card">
          <Skeleton height="0.75rem" width="40%" />
          <Skeleton height="1.75rem" width="55%" />
          <Skeleton height="0.65rem" width="70%" />
        </div>
      ))}
    </div>
  );
}
