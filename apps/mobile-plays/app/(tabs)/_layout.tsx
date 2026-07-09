import { Tabs } from "expo-router";
import { theme } from "../../src/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Poems",
          tabBarLabel: "కవితలు",
        }}
      />
      <Tabs.Screen
        name="talks"
        options={{
          title: "Talks",
          tabBarLabel: "ప్రసంగాలు",
        }}
      />
    </Tabs>
  );
}
