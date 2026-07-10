import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { GlassHeader } from '@/components/glass-header';
import { GradientBackground } from '@/components/gradient-background';
import { Markdown } from '@/components/markdown';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTenant } from '@/src/TenantProvider';

export default function PlayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { tenant, error, findWork } = useTenant();

  const loading = !tenant && !error;
  const play = id ? findWork(id) : undefined;

  if (loading) {
    return (
      <View style={styles.centered}>
        <GradientBackground />
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (!play) {
    return (
      <View style={styles.centered}>
        <GradientBackground />
        <ThemedText style={{ color: colors.muted }}>Play not found.</ThemedText>
        <ThemedText onPress={() => router.back()} style={[styles.backLink, { color: colors.tint }]}>
          ← Go back
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <GradientBackground />
      <GlassHeader
        onBack={() => router.back()}
        title={play.title}
        titleStyle={styles.headerTitle}
        titleNumberOfLines={2}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Excerpt hidden for now — kept for future use
        {play.excerpt && (
          <GlassCard style={styles.excerptBox}>
            <ThemedText style={[styles.sectionLabel, { color: colors.muted }]}>EXCERPT</ThemedText>
            <Markdown body={play.excerpt} lineHeight={26} />
          </GlassCard>
        )}
        */}
        {play.body ? (
          <>
            <ThemedText style={[styles.sectionLabel, { color: colors.muted }]}>
              FULL TEXT
            </ThemedText>
            <GlassCard style={styles.textCard}>
              <Markdown body={play.body} fontSize={16} lineHeight={26} />
            </GlassCard>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLink: {
    marginTop: 12,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  excerptBox: {
    padding: 16,
    marginBottom: 20,
  },
  textCard: {
    padding: 16,
  },
});
