import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-800/60 dark:bg-zinc-800/80",
        className
      )}
      {...props}
    />
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Skeleton */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="w-40 h-6" />
              <Skeleton className="w-28 h-4" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-20 h-8 rounded-lg" />
            <Skeleton className="w-20 h-8 rounded-lg" />
            <Skeleton className="w-20 h-8 rounded-lg" />
          </div>
        </div>
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>

      {/* Issues Skeleton */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="w-36 h-5" />
          <Skeleton className="w-24 h-5" />
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="w-48 h-5" />
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-3/4 h-4" />
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="w-56 h-5" />
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-2/3 h-4" />
        </div>
      </div>
    </div>
  );
}
