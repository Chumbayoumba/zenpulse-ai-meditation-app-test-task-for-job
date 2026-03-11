import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { AffirmationResult, SubscriptionPlan } from '../lib/types';

const STORAGE_KEYS = {
  subscribed: 'zenpulse:isSubscribed',
  plan: 'zenpulse:selectedPlan',
  affirmation: 'zenpulse:lastAffirmation',
} as const;

interface ZenPulseContextValue {
  hydrated: boolean;
  isSubscribed: boolean;
  selectedPlan: SubscriptionPlan;
  lastAffirmation: AffirmationResult | null;
  storageError: string | null;
  setSelectedPlan: (plan: SubscriptionPlan) => Promise<void>;
  activatePremium: (plan: SubscriptionPlan) => Promise<void>;
  storeAffirmation: (affirmation: AffirmationResult) => Promise<void>;
}

const ZenPulseContext = createContext<ZenPulseContextValue | null>(null);

function parseStoredAffirmation(rawValue: string | null) {
  if (!rawValue) {
    return {
      affirmation: null,
      corrupted: false,
    } as const;
  }

  try {
    return {
      affirmation: JSON.parse(rawValue) as AffirmationResult,
      corrupted: false,
    } as const;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        affirmation: null,
        corrupted: true,
      } as const;
    }

    throw error;
  }
}

export function ZenPulseProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedPlan, setSelectedPlanState] = useState<SubscriptionPlan>('yearly');
  const [lastAffirmation, setLastAffirmation] = useState<AffirmationResult | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const [storedSubscribed, storedPlan, storedAffirmation] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.subscribed),
          AsyncStorage.getItem(STORAGE_KEYS.plan),
          AsyncStorage.getItem(STORAGE_KEYS.affirmation),
        ]);
        const parsedAffirmation = parseStoredAffirmation(storedAffirmation);

        if (parsedAffirmation.corrupted) {
          await AsyncStorage.removeItem(STORAGE_KEYS.affirmation);
        }

        if (!active) {
          return;
        }

        setIsSubscribed(storedSubscribed === 'true');
        setSelectedPlanState(storedPlan === 'monthly' ? 'monthly' : 'yearly');
        setLastAffirmation(parsedAffirmation.affirmation);
        setStorageError(
          parsedAffirmation.corrupted ? 'Stored affirmation data was corrupted and has been reset on this device.' : null,
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setStorageError(error instanceof Error ? error.message : 'We could not restore local app data.');
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const setSelectedPlan = async (plan: SubscriptionPlan) => {
    await AsyncStorage.setItem(STORAGE_KEYS.plan, plan);
    setSelectedPlanState(plan);
    setStorageError(null);
  };

  const activatePremium = async (plan: SubscriptionPlan) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.subscribed, 'true'],
      [STORAGE_KEYS.plan, plan],
    ]);

    setIsSubscribed(true);
    setSelectedPlanState(plan);
    setStorageError(null);
  };

  const storeAffirmation = async (affirmation: AffirmationResult) => {
    setLastAffirmation(affirmation);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.affirmation, JSON.stringify(affirmation));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('The affirmation was generated, but local saving failed. It will stay visible until the app reloads.');
      }

      throw new Error('The affirmation was generated, but local saving failed. It will stay visible until the app reloads.');
    }
  };

  const value = useMemo(
    () => ({
      hydrated,
      isSubscribed,
      selectedPlan,
      lastAffirmation,
      storageError,
      setSelectedPlan,
      activatePremium,
      storeAffirmation,
    }),
    [hydrated, isSubscribed, lastAffirmation, selectedPlan, storageError],
  );

  return <ZenPulseContext.Provider value={value}>{children}</ZenPulseContext.Provider>;
}

export function useZenPulse() {
  const context = useContext(ZenPulseContext);

  if (!context) {
    throw new Error('useZenPulse must be used inside ZenPulseProvider.');
  }

  return context;
}
