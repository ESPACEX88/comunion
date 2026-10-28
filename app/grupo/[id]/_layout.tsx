import { GroupLiveProvider } from '@/features/groups/useGroupLive';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function GrupoIdLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Array.isArray(id) ? id[0] : id;
  return (
    <GroupLiveProvider groupId={groupId}>
      <Stack screenOptions={{ headerShown: false }} />
    </GroupLiveProvider>
  );
}
