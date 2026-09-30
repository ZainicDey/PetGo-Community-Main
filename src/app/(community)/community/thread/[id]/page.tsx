import ThreadDetailPage from "@/sections/community/ThreadDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ThreadPage({ params }: PageProps) {
  const { id } = await params;

  return <ThreadDetailPage threadId={id} />;
}
