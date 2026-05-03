import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
  Platform, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { Brain, Sun, Moon } from 'lucide-react-native';

type Mode = 'login' | 'register';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const styles = useStyles(createStyles);
  const { colors, isDark, toggleTheme } = useTheme();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, username.trim() || undefined);
        setSuccessMsg(
          '✉️ Check your email! We sent you a verification link. Click it to activate your account, then sign in here.'
        );
        setMode('login');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Theme toggle — top right corner */}
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme} activeOpacity={0.7}>
        {isDark
          ? <Sun size={22} color={colors.text} />
          : <Moon size={22} color={colors.text} />
        }
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Brain size={32} color="#fff" />
            </View>
            <Text style={styles.appName}>VeritasLearn</Text>
            <Text style={styles.tagline}>Learn. Prove it. Unlock AI.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </Text>

            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {successMsg && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            )}

            {mode === 'register' && (
              <View style={styles.field}>
                <Text style={styles.label}>Username (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="e.g. john_doe"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoComplete={mode === 'login' ? 'password' : 'new-password'}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
                setSuccessMsg(null);
              }}
              activeOpacity={0.6}
              hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            >
              <Text style={styles.toggleText}>
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <Text style={styles.toggleLink}>
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  flex: { flex: 1 },
  themeToggle: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 36 : 16,
    right: 20,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryHover,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: colors.errorBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  errorText: { color: colors.error, fontSize: 13 },
  successBanner: {
    backgroundColor: colors.successBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  successText: { color: colors.success, fontSize: 13 },
  field: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surfaceHighlight,
  },
  submitBtn: {
    height: 50,
    backgroundColor: colors.primaryHover,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primaryHover,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleBtn: { marginTop: 24, paddingVertical: 8, alignItems: 'center' },
  toggleText: { fontSize: 14, color: colors.textMuted },
  toggleLink: { color: colors.primary, fontWeight: '600' },
});
