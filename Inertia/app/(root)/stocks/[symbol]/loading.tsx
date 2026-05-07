import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Top Row: Chart & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-[#111111] rounded-xl border border-zinc-800 p-6 h-[600px]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="w-full h-[450px] rounded-lg" />
          </div>
          <div className="bg-[#111111] rounded-xl border border-zinc-800 p-6 space-y-6 h-[600px]">
            <Skeleton className="h-8 w-24" />
            <div className="space-y-4 pt-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="h-px bg-zinc-800" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Skeleton className="h-[150px] w-full rounded-xl" />
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </div>
          <div className="bg-[#111111] rounded-xl border border-zinc-800 p-6 h-[400px] space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
          <div className="bg-[#111111] rounded-xl border border-zinc-800 p-6 h-[400px] space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
