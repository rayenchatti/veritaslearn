import React from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MessageSquare, LayoutDashboard, Trophy, User, Clock, Sun, Moon } from 'lucide-react-native';

import { ThemeProvider, useTheme, useStyles } from './src/theme/ThemeContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AppProvider } from './src/contexts/AppContext';

import { AuthPage } from './src/pages/AuthPage';
import { LandingPage } from './src/pages/LandingPage';
import { ChatPage } from './src/pages/ChatPage';
import { DashboardPage } from './src/pages/DashboardPage';
import { LeaderboardPage } from './src/pages/LeaderboardPage';
import { ProfilePage } from './src/pages/ProfilePage';
import { EditProfilePage } from './src/pages/EditProfilePage';
import { HistoryPage } from './src/pages/HistoryPage';
import { SessionDetailPage } from './src/pages/SessionDetailPage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  const { colors, isDark, toggleTheme } = useTheme();

  const ThemeToggleBtn = () => (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{ marginRight: 16, padding: 6 }}
      activeOpacity={0.7}
    >
      {isDark
        ? <Sun size={20} color={colors.text} />
        : <Moon size={20} color={colors.text} />
      }
    </TouchableOpacity>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <ThemeToggleBtn />,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
      }}
    >
      <Tab.Screen
        name="Learn"
        component={ChatPage}
        options={{ tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardPage}
        options={{ tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardPage}
        options={{ tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} /> }}
      />
      <Tab.Screen
        name="History"
        component={HistoryPage}
        options={{ tabBarIcon: ({ color, size }) => <Clock color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePage}
        options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

// Auth-gated root navigator — shows auth screen if no session
function RootNavigator() {
  const { user, loading } = useAuth();
  const styles = useStyles(createStyles);
  const { colors, isDark } = useTheme();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.error,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? (
        // Authenticated: show app
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={LandingPage} />
          <Stack.Screen name="MainTab" component={MainTabNavigator} />
          <Stack.Screen name="EditProfile" component={EditProfilePage} />
          <Stack.Screen name="SessionDetail" component={SessionDetailPage} />
        </Stack.Navigator>
      ) : (
        // Not authenticated: show auth screen
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthPage} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <RootNavigator />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default App;
