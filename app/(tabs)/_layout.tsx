import { TabMark } from '@/components/nav/TabMark';
import { ComunionTabBar } from '@/components/nav/ComunionTabBar';
import { useTheme } from '@/theme';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <ComunionTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        animation: 'fade',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoy',
          tabBarIcon: ({ focused }) => <TabMark kind="hoy" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="grupo"
        options={{
          title: 'Dúo',
          tabBarIcon: ({ focused }) => <TabMark kind="grupo" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="planes"
        options={{
          title: 'Planes',
          tabBarIcon: ({ focused }) => <TabMark kind="planes" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="yo"
        options={{
          title: 'Yo',
          tabBarIcon: ({ focused }) => <TabMark kind="yo" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
