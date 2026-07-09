import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { WorkType } from "@darbha/types";
import { useTenant } from "./TenantProvider";
import { theme } from "./theme";

const EMPTY_LABELS: Partial<Record<WorkType, string>> = {
  poem: "No poems published yet — pull to refresh.",
  talk: "No talks published yet — pull to refresh.",
};

export function WorkList({ type, title, subtitle }: { type: WorkType; title: string; subtitle?: string }) {
  const router = useRouter();
  const { tenant, error, refreshing, refresh } = useTenant();

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={() => void refresh()} style={styles.retryButton}>
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (!tenant) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  const works = tenant.works.filter((w) => w.type === type);

  return (
    <FlatList
      data={works}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={theme.accent} />
      }
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.kicker}>THE WRITING OF</Text>
          <Text style={styles.author}>{tenant.displayName}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>{EMPTY_LABELS[type] ?? "Nothing published yet."}</Text>
      }
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/work/${item.id}`)} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.excerpt ? <Text style={styles.cardExcerpt}>{item.excerpt}</Text> : null}
          <Text style={styles.cardCta}>Read →</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorText: { color: theme.muted, textAlign: "center", fontSize: 16, lineHeight: 24 },
  retryButton: {
    marginTop: 16,
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryLabel: { color: theme.bg, fontWeight: "700" },
  listContent: { padding: 20, gap: 14, paddingBottom: 32 },
  header: { paddingVertical: 20, alignItems: "center" },
  kicker: { color: theme.accent, letterSpacing: 3, fontSize: 12, fontWeight: "700" },
  author: { color: theme.muted, fontSize: 14, marginTop: 6 },
  title: { color: theme.text, fontSize: 28, fontWeight: "700", marginTop: 8 },
  subtitle: { color: theme.muted, fontStyle: "italic", marginTop: 6, fontSize: 15, textAlign: "center" },
  emptyText: { color: theme.muted, textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    marginBottom: 14,
  },
  cardTitle: { color: theme.text, fontSize: 20, fontWeight: "700" },
  cardExcerpt: { color: theme.muted, marginTop: 6, lineHeight: 22 },
  cardCta: { color: theme.accent, marginTop: 12, fontWeight: "600" },
});
