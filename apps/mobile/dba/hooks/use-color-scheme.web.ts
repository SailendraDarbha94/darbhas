import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the
 * client side for web. Normalizes RN 0.86's 'unspecified' away, like the
 * native hook.
 */
export function useColorScheme(): 'light' | 'dark' | null {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const scheme = useRNColorScheme();
  const normalized = scheme === 'dark' ? 'dark' : scheme === 'light' ? 'light' : null;

  return hasHydrated ? normalized : 'light';
}
