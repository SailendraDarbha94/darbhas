import { Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type MarkdownProps = {
  body: string;
  /** e.g. 'TeluguFont' for Telugu verse; omit for the system font. */
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
};

/**
 * Tiny markdown renderer good enough for poems and play scripts:
 * headings (#, ##, ###), *italic stage directions*, blank-line paragraphs.
 * Defensive about input: non-string bodies are coerced instead of crashing
 * (the original DBA play screen threw on array content).
 */
export function Markdown({ body, fontFamily, fontSize = 16, lineHeight = 26 }: MarkdownProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const text = typeof body === 'string' ? body : Array.isArray(body) ? (body as string[]).join('\n') : String(body ?? '');
  const blocks = text.replace(/\r\n/g, '\n').replace(/\\n/g, '\n').split(/\n\s*\n/);

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
                color: colors.text,
                fontFamily,
                fontSize: level === 1 ? fontSize + 10 : level === 2 ? fontSize + 5 : fontSize + 2,
                fontWeight: '700',
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
              color: isStageDirection ? colors.muted : colors.text,
              fontStyle: isStageDirection ? 'italic' : 'normal',
              fontFamily,
              fontSize,
              lineHeight,
            }}
          >
            {trimmed.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1')}
          </Text>
        );
      })}
    </View>
  );
}
