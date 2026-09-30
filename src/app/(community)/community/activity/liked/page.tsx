import { Metadata } from 'next';
import LikedFeedPage from '@/sections/community/LikedFeedPage';

export const metadata: Metadata = {
  title: 'Liked Posts - PetGo Community',
  description: 'View posts you have liked in PetGo Community',
};

export default function LikedRoute() {
  return <LikedFeedPage />;
}
