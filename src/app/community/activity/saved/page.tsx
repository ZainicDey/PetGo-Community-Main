import { Metadata } from 'next';
import SavedPage from '@/sections/community/SavedPage';
import CommunityLayout from '@/sections/community/CommunityLayout';

export const metadata: Metadata = {
  title: 'Saved Posts - PetGo Community',
  description: 'View posts you have saved in PetGo Community',
};

export default function SavedRoute() {
  return (
    <CommunityLayout>
      <SavedPage />
    </CommunityLayout>
  );
}
