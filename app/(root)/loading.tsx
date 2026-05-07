import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </header>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Market Summary */}
          <section className="bg-[#111111] rounded-2xl border border-zinc-800 p-6 h-[550px] space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Skeleton className="w-full h-[350px] rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </section>

          {/* Your Watchlist */}
          <section className="bg-[#111111] rounded-2xl border border-zinc-800 p-6 h-[550px] space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </section>

          {/* Today's Top Stocks */}
          <section className="bg-[#111111] rounded-2xl border border-zinc-800 p-6 h-[400px] space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </section>

          {/* Today's Financial News */}
          <section className="bg-[#111111] rounded-2xl border border-zinc-800 p-6 h-[400px] space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <Skeleton className="w-20 h-20 rounded-xl" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <Skeleton className="w-20 h-20 rounded-xl" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
