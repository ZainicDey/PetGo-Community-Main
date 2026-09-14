import SearchPage from '@/sections/community/SearchPage';
import CommunityLayout from '@/sections/community/CommunityLayout';

export const metadata = {
  title: 'Search | PetGo Community',
  description: 'Search for users in the PetGo Community',
};

export default function SearchRoute() {
  return (
    <CommunityLayout>
      <SearchPage />
    </CommunityLayout>
  );
}
