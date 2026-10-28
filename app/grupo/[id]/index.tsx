import { GroupHomeView } from '@/features/groups/GroupHomeView';
import { useLocalSearchParams } from 'expo-router';

export default function GrupoHome() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return <GroupHomeView groupId={Array.isArray(id) ? id[0] : id} />;
}
