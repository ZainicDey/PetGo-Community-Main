import type { Metadata } from 'next';
import ThreadDetailPage from '@/sections/community/ThreadDetailPage';

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ThreadPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Thread #${id} | PetGo Community`,
    description: 'View this thread and join the conversation on PetGo Community.',
  };
}

export default async function ThreadRoute({ params }: ThreadPageProps) {
  const { id } = await params;
  return <ThreadDetailPage threadId={id} />;
}
