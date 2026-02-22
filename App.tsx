
import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppProvider, useApp } from 'app/context/AppContext';
import { StatusBar } from 'expo-status-bar';


// Ekranlar
import { OnboardingPage } from 'app/auth/onboarding/OnboardingPage';
import { GoalSettingPage } from './app/screens/GoalSettingPage';
import { TimerPage } from './app/screens/TimerPage';
import { SessionComplatePage } from './app/screens/SessionComplatePage';
import { DailySummaryPage } from './app/screens/DailySummaryPage';
import { SettingsPage } from 'app/screens/SettingPage';
import { DashboardPage } from 'app/screens/DashboardPage/DashboardPage';
import { InsightsPage } from 'app/screens/InsightsPage/InsightsPage';
import { SplashPage } from 'app/screens/SplashPage/SplashPage';

import './global.css';

export type RootStackParamList = {
  OnboardingPage: undefined;
  GoalSettings: undefined;
  TimerPage: undefined;
  SessionComplate: undefined;
  DailySummary: undefined;
  SettingsPage: undefined;
  DashboardPage: undefined;
  InsightsPage: undefined;
  SplashPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  // Contexte eklediğimiz isFirstLaunch bilgisini kullanıyoruz
  const { isFirstLaunch } = useApp();

  // Veri yüklenme kontrolü (AsyncStorage'dan sonuç gelene kadar bekler)
  if (isFirstLaunch === null) {
    return <View className="flex-1 bg-[#0a0d0a]" />;
  }

  return (
    <Stack.Navigator initialRouteName="SplashPage" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashPage" component={SplashPage} />
      <Stack.Screen name="OnboardingPage" component={OnboardingPage} />
      <Stack.Screen name="GoalSettings" component={GoalSettingPage} />
      <Stack.Screen name="TimerPage" component={TimerPage} />
      <Stack.Screen name="DashboardPage" component={DashboardPage} />
      <Stack.Screen name="SessionComplate" component={SessionComplatePage} />
      <Stack.Screen name="DailySummary" component={DailySummaryPage} />
      <Stack.Screen name="SettingsPage" component={SettingsPage} />
      <Stack.Screen name="InsightsPage" component={InsightsPage} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;