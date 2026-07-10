// SDK 56+: expo-router vendors react-navigation; use its bottom-tabs module.
import { useBottomTabBarHeight } from 'expo-router/build/react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function SectionCard({ children }: PropsWithChildren) {
  return <GlassCard>{children}</GlassCard>;
}

function InfoRow({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
  const colors = Colors[useColorScheme() ?? 'light'];

  return (
    <View
      style={[
        styles.infoRow,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.glass.border,
        },
      ]}
    >
      <ThemedText style={[styles.infoLabel, { color: colors.muted }]}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </View>
  );
}

function LinkRow({
  label,
  onPress,
  isLast = false,
}: {
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  const colors = Colors[useColorScheme() ?? 'light'];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.linkRow,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.glass.border,
        },
      ]}
    >
      <ThemedText style={[styles.linkLabel, { color: colors.tint }]}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#C1440E', dark: '#2C1C14' }}
      headerImage={
        <View style={styles.headerCenter}>
          <View style={[styles.bubble, { borderColor: colors.glass.border }]}>
            <BlurView
              intensity={30}
              tint={colors.glass.tint}
              experimentalBlurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, styles.bubbleFill]} />
            <ThemedText style={styles.bubbleText}>DBR</ThemedText>
          </View>
        </View>
      }
    >
      <View style={[styles.content, { paddingBottom: tabBarHeight + 24 }]}>
        <ThemedText style={styles.name}>Darbha Babu Rao</ThemedText>
        <ThemedText style={[styles.roles, { color: colors.muted }]}>
          Educator · Scholar · Poet · Playwright
        </ThemedText>

        <SectionCard>
          <InfoRow label="DATE OF BIRTH" value="9th February, 1946" />
          <InfoRow label="PLACE OF BIRTH" value="Bapatla, Andhra Pradesh" />
          <InfoRow label="FATHER" value="Late Sri Darbha Lakshmi Narayana Sastry" />
          <InfoRow label="MOTHER" value="Late Smt. Darbha Jwala Annapurna Visalakshi" isLast />
        </SectionCard>

        <ThemedText style={[styles.sectionHeading, { color: colors.tint }]}>Education</ThemedText>
        <SectionCard>
          <InfoRow label="ELEMENTARY" value="Mamillapalli Sitaramaiah Elementary School, Bapatla" />
          <InfoRow label="HIGH SCHOOL" value="Board/Municipal High School, Bapatla" />
          <InfoRow label="PRE-UNIVERSITY" value="VRS & YRN College of Arts and Science, Chirala" />
          <InfoRow label="B.COM" value="C S R Sarma College, Ongole" />
          <InfoRow label="M.COM" value="Andhra University, Visakhapatnam" isLast />
        </SectionCard>

        <ThemedText style={[styles.sectionHeading, { color: colors.tint }]}>Career</ThemedText>
        <SectionCard>
          <InfoRow label="1998 – 2004" value="Head of Department of Commerce" />
          <InfoRow label="INSTITUTION" value="The Bapatla College of Arts & Sciences, Bapatla" />
          <InfoRow
            label="RETIRED 2004"
            value="Vice-Principal, The Bapatla College of Arts & Sciences"
            isLast
          />
        </SectionCard>

        <ThemedText style={[styles.sectionHeading, { color: colors.tint }]}>
          Literary Works
        </ThemedText>
        <SectionCard>
          <LinkRow label="📜 Browse Poems" onPress={() => router.push('/(tabs)/poems')} />
          <LinkRow label="🎭 Browse Plays" onPress={() => router.push('/(tabs)/plays')} />
          <LinkRow
            label="🔒 Privacy Policy"
            onPress={() =>
              Linking.openURL('https://darbha-baburao-web-dashboard.vercel.app/privacy')
            }
          />
          <LinkRow
            label="📋 Terms & Conditions"
            onPress={() => Linking.openURL('https://darbha-baburao-web-dashboard.vercel.app/terms')}
            isLast
          />
        </SectionCard>

        <ThemedText style={[styles.footer, { color: colors.muted }]}>
          © 2026 Darbha Babu Rao. All rights reserved.
        </ThemedText>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  bubbleFill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  bubbleText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  content: {
    paddingHorizontal: 16,
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  roles: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
  },
  infoRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  linkRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});
