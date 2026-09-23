import { Metadata } from 'next';
import LikedFeedPage from '@/sections/community/LikedFeedPage';
import CommunityLayout from '@/sections/community/CommunityLayout';

export const metadata: Metadata = {
  title: 'Liked Posts - PetGo Community',
  description: 'View posts you have liked in PetGo Community',
};

export default function LikedRoute() {
  return (
    <CommunityLayout>
      <LikedFeedPage />
    </CommunityLayout>
  );
}
