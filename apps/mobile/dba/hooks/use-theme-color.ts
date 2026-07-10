/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ThemeColors = typeof Colors.light;
// Only the string-valued theme tokens are addressable here; nested objects
// like `glass` must be read from `Colors[scheme]` directly.
type ColorName = { [K in keyof ThemeColors]: ThemeColors[K] extends string ? K : never }[keyof ThemeColors];

export function useThemeColor(props: { light?: string; dark?: string }, colorName: ColorName): string {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  return colorFromProps ?? (Colors[theme][colorName] as string);
}
