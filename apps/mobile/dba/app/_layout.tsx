import { useFonts } from 'expo-font';
// SDK 56+: expo-router vendors react-navigation; theming comes from expo-router itself.
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TenantProvider } from '@/src/TenantProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 3000, fade: true });

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    TeluguFont: require('../assets/fonts/NotoSansTelugu-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TenantProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="poem/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="play/[id]" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </TenantProvider>
    </ThemeProvider>
  );
}
