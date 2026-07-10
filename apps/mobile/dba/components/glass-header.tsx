import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type GlassHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  titleStyle?: StyleProp<TextStyle>;
  titleNumberOfLines?: number;
};

/**
 * Full-bleed gradient header with a specular bottom edge. Doubles as a
 * detail-screen header when `onBack` is provided.
 */
export function GlassHeader({
  title,
  subtitle,
  onBack,
  titleStyle,
  titleNumberOfLines = 1,
}: GlassHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const glass = Colors[colorScheme].glass;

  return (
    <LinearGradient
      colors={glass.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>← Back</ThemedText>
        </TouchableOpacity>
      ) : null}
      <ThemedText style={[styles.title, titleStyle]} numberOfLines={titleNumberOfLines}>
        {title}
      </ThemedText>
      {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
      <View style={[styles.specular, { backgroundColor: glass.highlight }]} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  back: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  specular: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
