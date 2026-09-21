import { TabMark } from '@/components/nav/TabMark';
import { colors, fonts } from '@/theme';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.amberSoft,
        tabBarInactiveTintColor: '#8A8176',
        tabBarStyle: {
          backgroundColor: colors.charcoal,
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
          title: 'Grupo',
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
