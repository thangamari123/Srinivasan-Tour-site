/** Loading placeholder matching the editorial .pk-card layout. */
export default function PackageCardSkeleton() {
  return (
    <div className="pk-card animate-pulse" aria-hidden="true">
      <div className="aspect-[4/3] w-full bg-[#ebe6da]" />
      <div className="pk-body">
        <div className="h-5 bg-[#e6dfd1] rounded-md w-4/5" />
        <div className="h-5 bg-[#e6dfd1] rounded-md w-3/5" />
        <div className="h-3.5 bg-[#efeae0] rounded w-1/2 mt-1" />
        <div className="h-3.5 bg-[#efeae0] rounded w-full" />
        <div className="h-3.5 bg-[#efeae0] rounded w-5/6" />
        <div className="flex items-center gap-2 pt-1">
          <div className="w-8 h-8 rounded-[10px] bg-[#f3efe5]" />
          <div className="w-8 h-8 rounded-[10px] bg-[#f3efe5]" />
          <div className="w-8 h-8 rounded-[10px] bg-[#f3efe5]" />
          <div className="w-8 h-8 rounded-[10px] bg-[#f3efe5]" />
        </div>
        <div className="h-[50px] bg-[#e6dfd1] rounded-full mt-auto" />
      </div>
    </div>
  );
}

export function PackageGridSkeleton({ count = 6, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`pk-grid ${className}`.trim()}>
      {Array.from({ length: count }).map((_, i) => (
        <PackageCardSkeleton key={i} />
      ))}
    </div>
  );
}
