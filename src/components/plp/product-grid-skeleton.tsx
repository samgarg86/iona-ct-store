export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div aria-hidden className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex animate-pulse flex-col gap-3">
          <div className="aspect-square rounded-lg bg-surface" />
          <div className="h-4 w-3/4 rounded bg-surface" />
          <div className="h-4 w-1/4 rounded bg-surface" />
        </div>
      ))}
    </div>
  );
}
