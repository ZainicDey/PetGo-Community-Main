import UserProfilePage from '@/sections/community/UserProfilePage';
import CommunityLayout from '@/sections/community/CommunityLayout';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;
  return {
    title: `User Profile #${userId} | PetGo Community`,
    description: 'View this user\'s profile and posts on PetGo Community.',
  };
}

export default async function UserProfileRoute({ params }: PageProps) {
  const { userId } = await params;
  const numericId = Number(userId);

  return (
    <CommunityLayout>
      <UserProfilePage userId={numericId} />
    </CommunityLayout>
  );
}
