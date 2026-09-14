import { Metadata } from 'next';
import ActivityPage from '@/sections/community/ActivityPage';
import CommunityLayout from '@/sections/community/CommunityLayout';

export const metadata: Metadata = {
  title: 'My Activity - PetGo Community',
  description: 'View your likes and reposts in PetGo Community',
};

export default function Activity() {
  return (
    <CommunityLayout>
      <ActivityPage />
    </CommunityLayout>
  );
}
