import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HookScreen } from '../screens/HookScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { CalculatingScreen } from '../screens/CalculatingScreen';
import { FreeRevealScreen } from '../screens/FreeRevealScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { FullRevealScreen } from '../screens/FullRevealScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { theme } from '../lib/theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: theme.accent,
          background: theme.bg,
          card: theme.bg,
          text: theme.text,
          border: theme.border,
          notification: theme.accent,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Hook" component={HookScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Calculating" component={CalculatingScreen} />
        <Stack.Screen name="FreeReveal" component={FreeRevealScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="FullReveal" component={FullRevealScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
