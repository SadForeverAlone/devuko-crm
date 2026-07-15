type SkeletonProps = {
  width?: "full" | "sm" | "md" | "lg";
  height?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const WIDTH_CLASS: Record<NonNullable<SkeletonProps["width"]>, string> = {
  full: "dv-skeleton--w-full",
  sm: "dv-skeleton--w-sm",
  md: "dv-skeleton--w-md",
  lg: "dv-skeleton--w-lg",
};

const HEIGHT_CLASS: Record<NonNullable<SkeletonProps["height"]>, string> = {
  xs: "dv-skeleton--h-xs",
  sm: "dv-skeleton--h-sm",
  md: "dv-skeleton--h-md",
  lg: "dv-skeleton--h-lg",
};

export function Skeleton({ width = "full", height = "sm", className = "" }: SkeletonProps) {
  return (
    <span
      className={`dv-skeleton ${WIDTH_CLASS[width]} ${HEIGHT_CLASS[height]} ${className}`.trim()}
      aria-hidden
    />
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="dv-skeleton-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="dv-skeleton-card">
          <Skeleton height="xs" width="sm" />
          <Skeleton height="lg" width="md" />
          <Skeleton height="xs" width="lg" />
        </div>
      ))}
    </div>
  );
}
