// SDK 56+: expo-router vendors react-navigation; use its bottom-tabs module.
import { useBottomTabBarHeight } from 'expo-router/build/react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { GlassHeader } from '@/components/glass-header';
import { GradientBackground } from '@/components/gradient-background';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTenant } from '@/src/TenantProvider';

/** Flatten an excerpt (may carry real or escaped newlines) into a 3-line preview. */
function flattenExcerpt(text: string): string {
  return text.replace(/\\n/g, ' ').replace(/\n/g, ' ');
}

export default function PoemsScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { tenant, error, refreshing, refresh } = useTenant();

  const loading = !tenant && !error;
  const poems = tenant?.works.filter((w) => w.type === 'poem') ?? [];

  return (
    <View style={styles.screen}>
      <GradientBackground />
      <GlassHeader title="Poems" subtitle="Works of Darbha Babu Rao" />
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 24 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.tint} />
        }
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.tint} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <ThemedText style={[styles.errorText, { color: colors.muted }]}>{error}</ThemedText>
            <TouchableOpacity
              onPress={() => void refresh()}
              style={[styles.retryButton, { backgroundColor: colors.tint }]}
            >
              <ThemedText style={styles.retryLabel}>Try again</ThemedText>
            </TouchableOpacity>
          </View>
        ) : poems.length === 0 ? (
          <ThemedText style={[styles.empty, { color: colors.muted }]}>No poems found.</ThemedText>
        ) : (
          poems.map((poem) => (
            <TouchableOpacity
              key={poem.id}
              activeOpacity={0.85}
              onPress={() => router.push(`/poem/${poem.id}`)}
            >
              <GlassCard style={styles.card}>
                <ThemedText style={styles.cardTitle}>{poem.title}</ThemedText>
                {poem.excerpt ? (
                  <ThemedText
                    numberOfLines={3}
                    style={[styles.cardExcerpt, { color: colors.muted }]}
                  >
                    {flattenExcerpt(poem.excerpt)}
                  </ThemedText>
                ) : null}
                <View style={[styles.cardFooter, { borderTopColor: colors.glass.border }]}>
                  <ThemedText style={[styles.readMore, { color: colors.tint }]}>
                    Read More →
                  </ThemedText>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  center: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 16,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryLabel: {
    color: '#fff',
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    fontFamily: 'TeluguFont',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  cardExcerpt: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'TeluguFont',
    paddingHorizontal: 16,
  },
  cardFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
  },
});
