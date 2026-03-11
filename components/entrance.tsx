import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Platform, StyleProp, ViewStyle } from 'react-native';

import { useReducedMotion } from '../hooks/use-reduced-motion';

interface EntranceProps {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

export function Entrance({ children, delay = 0, distance = 18, style }: EntranceProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      animatedValue.setValue(1);
      return;
    }

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 420,
      delay,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [animatedValue, delay, reducedMotion]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
