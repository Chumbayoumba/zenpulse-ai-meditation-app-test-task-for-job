import { Redirect } from 'expo-router';

import { useZenPulse } from '../providers/zen-pulse-provider';

export default function IndexScreen() {
  const { hydrated, isSubscribed } = useZenPulse();

  if (!hydrated) {
    return null;
  }

  return <Redirect href={isSubscribed ? '/meditations' : '/paywall'} />;
}
