import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Full-bleed warm gradient rendered behind every screen so the frosted
 * glass surfaces have color to refract. Render it as the first (bottom)
 * child of a screen's root view.
 */
export function GradientBackground() {
  const colorScheme = useColorScheme() ?? 'light';
  const { gradient } = Colors[colorScheme].glass;

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}
