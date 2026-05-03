import 'react-native-url-polyfill/auto';
import * as Keychain from 'react-native-keychain';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase credentials. Add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file.'
  );
}

const STORAGE_KEY = 'sb-nyrnbrvbmxyurejdorvm-auth-token';

const SecureStorage = {
  getItem: async (key: string) => {
    try {
      const creds = await Keychain.getGenericPassword({ service: key });
      return creds ? creds.password : null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await Keychain.setGenericPassword(key, value, { service: key });
    } catch (e) {
      console.error('SecureStore set error:', e);
    }
  },
  removeItem: async (key: string) => {
    try {
      await Keychain.resetGenericPassword({ service: key });
    } catch (e) {
      console.error('SecureStore remove error:', e);
    }
  }
};

const customFetch = async (url: RequestInfo, options?: RequestInit) => {
  let token = SUPABASE_ANON_KEY;
  try {
    const raw = await SecureStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.access_token) {
        token = parsed.access_token;
      }
    }
  } catch {}

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`
  };

  if (options?.headers) {
    if (typeof (options.headers as any).entries === 'function') {
      for (const [key, value] of (options.headers as any).entries()) {
        if (key.toLowerCase() !== 'authorization') {
          headers[key] = value;
        }
      }
    } else {
      for (const [key, value] of Object.entries(options.headers)) {
        if (key.toLowerCase() !== 'authorization') {
          headers[key] = String(value);
        }
      }
    }
  }

  return fetch(url, { ...options, headers });
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for React Native
  },
  global: {
    fetch: customFetch,
  },
});
