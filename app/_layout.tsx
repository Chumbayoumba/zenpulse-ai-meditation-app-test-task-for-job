import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { colors } from '../lib/theme';
import { useZenPulse, ZenPulseProvider } from '../providers/zen-pulse-provider';

function RootNavigator() {
  const { hydrated } = useZenPulse();

  if (!hydrated) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.plumDeep} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="paywall" />
        <Stack.Screen name="meditations" />
        <Stack.Screen
          name="affirmation"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ZenPulseProvider>
        <RootNavigator />
      </ZenPulseProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
