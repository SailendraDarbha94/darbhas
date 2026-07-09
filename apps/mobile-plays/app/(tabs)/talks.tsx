import { SafeAreaView } from "react-native-safe-area-context";
import { WorkList } from "../../src/WorkList";
import { theme } from "../../src/theme";

export default function TalksScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={["top"]}>
      <WorkList type="talk" title="ప్రసంగాలు" subtitle="Talks" />
    </SafeAreaView>
  );
}
