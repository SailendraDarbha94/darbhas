import { BlurView } from 'expo-blur';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type GlassCardProps = ViewProps & {
  /** Blur strength of the frosted surface. */
  intensity?: number;
};

/**
 * Frosted "liquid glass" surface: blur + translucent fill + hairline border
 * + a 1px specular highlight along the top edge. No internal padding —
 * callers provide their own.
 */
export function GlassCard({ style, children, intensity = 40, ...rest }: GlassCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const glass = Colors[colorScheme].glass;

  return (
    <View style={[styles.card, { borderColor: glass.border }, style]} {...rest}>
      <BlurView
        intensity={intensity}
        tint={glass.tint}
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.surface }]} />
      <View style={[styles.highlight, { backgroundColor: glass.highlight }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
