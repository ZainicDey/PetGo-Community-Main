import { Metadata } from 'next';
import FollowingFeedPage from '@/sections/community/FollowingFeedPage';
import CommunityLayout from '@/sections/community/CommunityLayout';

export const metadata: Metadata = {
  title: 'Following - PetGo Community',
  description: 'View users you are following in PetGo Community',
};

export default function FollowingRoute() {
  return (
    <CommunityLayout>
      <FollowingFeedPage />
    </CommunityLayout>
  );
}
