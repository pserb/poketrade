"use client";

export default function DashboardSkeleton() {
  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full skeleton"></div>
          <div className="h-9 w-48 skeleton"></div>
        </div>

        <div className="flex space-x-2">
          <div className="h-8 w-20 skeleton"></div>
          <div className="h-8 w-32 skeleton"></div>
        </div>
      </div>

      {/* Content card skeleton */}
      <div className="bg-card/60 rounded-lg border border-border/50 shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 skeleton"></div>
            <div className="h-7 w-24 skeleton"></div>
          </div>
          <div className="h-8 w-36 skeleton"></div>
        </div>

        {/* Model item skeletons */}
        <div className="space-y-4 divide-y divide-border/30">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row justify-between items-start w-full py-4"
            >
              <div className="flex flex-col space-y-2 w-full max-w-[80%]">
                <div className="h-6 w-3/4 skeleton"></div>
                <div className="h-4 w-full skeleton"></div>
                <div className="h-4 w-1/2 skeleton"></div>
              </div>
              <div className="mt-2 sm:mt-0 h-8 w-24 skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
