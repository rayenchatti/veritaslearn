import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Linking } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'sb-nyrnbrvbmxyurejdorvm-auth-token';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Read the stored session directly from AsyncStorage.
 * This avoids supabase.auth.getSession() which internally tries
 * to verify the JWT with ES256 — unsupported in React Native.
 */
async function readStoredSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // supabase-js stores the session object directly
    if (parsed?.access_token && parsed?.user) {
      return parsed as Session;
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load existing session from AsyncStorage (no JWT verification)
    readStoredSession().then((storedSession) => {
      if (storedSession) {
        setSession(storedSession);
        setUser(storedSession.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Deep Link Handler Function
    const handleDeepLink = async (event: { url: string }) => {
      try {
        const { url } = event;
        if (!url) return;

        // Supabase passes tokens as hash fragments
        // Swap # for ? to easily parse URL params
        const formattedUrl = new URL(url.replace('#', '?'));
        const access_token = formattedUrl.searchParams.get('access_token');
        const refresh_token = formattedUrl.searchParams.get('refresh_token');

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) {
            console.error('Deep link session error:', error.message);
          }
        }
      } catch (err) {
        console.error('Failed to parse deep link URL', err);
      }
    };

    // App already open
    const subscriptionLinking = Linking.addEventListener('url', handleDeepLink);

    // App launched cold from link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.unsubscribe();
      subscriptionLinking.remove();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signUp = async (email: string, password: string, username?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: username ? { username } : undefined,
        emailRedirectTo: 'veritaslearn://login-callback',
      },
    });
    if (error) throw new Error(error.message);
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
