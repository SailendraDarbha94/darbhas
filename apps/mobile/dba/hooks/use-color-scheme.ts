import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * RN 0.86's ColorSchemeName includes 'unspecified'; normalize to the two
 * schemes our theme tokens actually have.
 */
export function useColorScheme(): 'light' | 'dark' | null {
  const scheme = useRNColorScheme();
  return scheme === 'dark' ? 'dark' : scheme === 'light' ? 'light' : null;
}
