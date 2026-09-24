import CommunityLayout from "@/sections/community/CommunityLayout";
import { ThreadSkeleton } from "@/sections/community/ThreadSkeleton";

export default function Loading() {
  return (
    <CommunityLayout>
      <div className="max-w-[680px] mx-auto pb-20">
        <div className="sticky top-0 z-10 bg-[#101010]/95 backdrop-blur-md px-5 py-4 flex items-center gap-6 border-b border-white/5">
          <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse shrink-0" />
          <div className="w-16 h-6 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="mt-4">
          <ThreadSkeleton hasImages />
          <ThreadSkeleton />
        </div>
      </div>
    </CommunityLayout>
  );
}
