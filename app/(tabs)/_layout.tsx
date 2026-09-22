import { TabMark } from '@/components/nav/TabMark';
import { fonts, useTheme } from '@/theme';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.ui,
          fontSize: 11,
          letterSpacing: 1.1,
          textTransform: 'uppercase',
        },
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
          title: 'Nosotros',
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
