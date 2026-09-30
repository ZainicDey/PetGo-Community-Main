import { Metadata } from 'next';
import FollowingFeedPage from '@/sections/community/FollowingFeedPage';

export const metadata: Metadata = {
  title: 'Following - PetGo Community',
  description: 'View users you are following in PetGo Community',
};

export default function FollowingRoute() {
  return <FollowingFeedPage />;
}
