import CommunityLayout from "@/sections/community/CommunityLayout";

export default function CommunityGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommunityLayout>{children}</CommunityLayout>;
}
