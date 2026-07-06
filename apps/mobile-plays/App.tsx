import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import type { TenantWithWorks, Work } from "@darbha/types";
import { fetchTenant } from "./src/api";
import { Markdown } from "./src/Markdown";
import { theme } from "./src/theme";

export default function App() {
  const [tenant, setTenant] = useState<TenantWithWorks | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [openPlay, setOpenPlay] = useState<Work | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setTenant(await fetchTenant());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {openPlay ? (
        <PlayReader play={openPlay} onBack={() => setOpenPlay(null)} />
      ) : (
        <PlayList
          tenant={tenant}
          error={error}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onOpen={setOpenPlay}
          onRetry={load}
        />
      )}
    </SafeAreaView>
  );
}

function PlayList({
  tenant,
  error,
  refreshing,
  onRefresh,
  onOpen,
  onRetry,
}: {
  tenant: TenantWithWorks | null;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  onOpen: (play: Work) => void;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={onRetry} style={styles.retryButton}>
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

  return (
    <FlatList
      data={tenant.works}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
      }
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.kicker}>PLAYS BY</Text>
          <Text style={styles.title}>{tenant.displayName}</Text>
          {tenant.tagline ? <Text style={styles.tagline}>{tenant.tagline}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>No plays published yet — pull to refresh.</Text>
      }
      renderItem={({ item }) => (
        <Pressable onPress={() => onOpen(item)} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.excerpt ? <Text style={styles.cardExcerpt}>{item.excerpt}</Text> : null}
          <Text style={styles.cardCta}>Read &rarr;</Text>
        </Pressable>
      )}
    />
  );
}

function PlayReader({ play, onBack }: { play: Work; onBack: () => void }) {
  return (
    <View style={styles.reader}>
      <Pressable onPress={onBack} style={styles.backButton} hitSlop={12}>
        <Text style={styles.backLabel}>&larr; All plays</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.readerContent}>
        <Text style={styles.readerTitle}>{play.title}</Text>
        <Markdown body={play.body} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingTop: RNStatusBar.currentHeight ?? 0,
  },
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
  listContent: { padding: 20, gap: 14 },
  header: { paddingVertical: 24, alignItems: "center" },
  kicker: { color: theme.accent, letterSpacing: 3, fontSize: 12, fontWeight: "700" },
  title: { color: theme.text, fontSize: 32, fontWeight: "700", marginTop: 8 },
  tagline: { color: theme.muted, fontStyle: "italic", marginTop: 6, fontSize: 15 },
  emptyText: { color: theme.muted, textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
  },
  cardTitle: { color: theme.text, fontSize: 20, fontWeight: "700" },
  cardExcerpt: { color: theme.muted, marginTop: 6, lineHeight: 22 },
  cardCta: { color: theme.accent, marginTop: 12, fontWeight: "600" },
  reader: { flex: 1 },
  backButton: { paddingHorizontal: 20, paddingVertical: 12 },
  backLabel: { color: theme.accent, fontSize: 15, fontWeight: "600" },
  readerContent: { paddingHorizontal: 20, paddingBottom: 48 },
  readerTitle: { color: theme.text, fontSize: 28, fontWeight: "700", marginBottom: 18 },
});
