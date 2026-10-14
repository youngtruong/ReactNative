import React, { useEffect } from 'react';
import { AppState, Platform, View, ActivityIndicator } from 'react-native';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Icon as Ionicons } from './components/Icon';
import { StatusBar } from 'react-native';
import { AppStateProvider, useAppState } from './hooks/useAppState';
import { useTheme } from './theme';
import WeatherScreen from './screens/WeatherScreen';
import PlacesScreen from './screens/PlacesScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
export type Tabs = {
  Weather: undefined;
  Places: undefined;
  Settings: undefined;
  Profile: undefined;
};
const Tab = createBottomTabNavigator<Tabs>();
export const client = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: true, retry: 1 } },
});
onlineManager.setEventListener(setOnline =>
  NetInfo.addEventListener(state =>
    setOnline(
      state.isConnected !== false && state.isInternetReachable !== false,
    ),
  ),
);
function Navigation() {
  const t = useTheme();
  const { ready } = useAppState();
  useEffect(() => {
    const listener = AppState.addEventListener('change', s => {
      if (Platform.OS !== 'web') focusManager.setFocused(s === 'active');
    });
    return () => listener.remove();
  }, []);
  if (!ready)
    return (
      <View
        style={{ flex: 1, backgroundColor: t.bg, justifyContent: 'center' }}
      >
        <ActivityIndicator color={t.accent} />
      </View>
    );
  return (
    <>
      <StatusBar barStyle={t.dark ? 'light-content' : 'dark-content'} />
      <NavigationContainer
        theme={{
          ...(t.dark ? DarkTheme : DefaultTheme),
          colors: {
            ...(t.dark ? DarkTheme : DefaultTheme).colors,
            background: t.bg,
            card: t.card,
            text: t.text,
            primary: t.accent,
            border: t.border,
          },
        }}
      >
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: t.accent,
            tabBarInactiveTintColor: t.muted,
            tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border },
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={
                  route.name === 'Weather'
                    ? 'partly-sunny-outline'
                    : route.name === 'Places'
                    ? 'location-outline'
                    : route.name === 'Profile'
                    ? 'person-outline'
                    : 'options-outline'
                }
                size={size}
                color={color}
              />
            ),
          })}
        >
          <Tab.Screen
            name="Weather"
            component={WeatherScreen}
            options={{ title: 'Thời tiết' }}
          />
          <Tab.Screen
            name="Places"
            component={PlacesScreen}
            options={{ title: 'Địa điểm' }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Cài đặt' }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Hồ sơ' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <AppStateProvider>
          <Navigation />
        </AppStateProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
