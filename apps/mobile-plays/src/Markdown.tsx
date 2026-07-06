import { Text, View } from "react-native";
import { theme } from "./theme";

/**
 * Tiny markdown renderer good enough for play scripts:
 * headings (#, ##, ###), *italic stage directions*, blank-line paragraphs.
 */
export function Markdown({ body }: { body: string }) {
  const blocks = body.replace(/\r\n/g, "\n").split(/\n\s*\n/);

  return (
    <View style={{ gap: 14 }}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const heading = /^(#{1,3})\s+(.*)$/s.exec(trimmed);
        if (heading) {
          const level = heading[1].length;
          return (
            <Text
              key={i}
              style={{
                color: theme.text,
                fontSize: level === 1 ? 26 : level === 2 ? 21 : 18,
                fontWeight: "700",
                marginTop: i === 0 ? 0 : 10,
              }}
            >
              {heading[2]}
            </Text>
          );
        }

        const isStageDirection = /^\*[^*]+\*$/.test(trimmed);
        return (
          <Text
            key={i}
            style={{
              color: isStageDirection ? theme.muted : theme.text,
              fontStyle: isStageDirection ? "italic" : "normal",
              fontSize: 16,
              lineHeight: 26,
            }}
          >
            {trimmed.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1")}
          </Text>
        );
      })}
    </View>
  );
}
