import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Markdown } from "../../src/Markdown";
import { useTenant } from "../../src/TenantProvider";
import { theme } from "../../src/theme";

export default function WorkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { findWork } = useTenant();
  const work = id ? findWork(id) : undefined;

  if (!work) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.missing}>Work not found.</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backLabel}>← Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
        <Text style={styles.backLabel}>← Back</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{work.title}</Text>
        <Markdown body={work.body} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  missing: { color: theme.muted, fontSize: 16 },
  backButton: { paddingHorizontal: 20, paddingVertical: 12 },
  backLabel: { color: theme.accent, fontSize: 15, fontWeight: "600" },
  content: { paddingHorizontal: 20, paddingBottom: 48 },
  title: { color: theme.text, fontSize: 28, fontWeight: "700", marginBottom: 18 },
});
