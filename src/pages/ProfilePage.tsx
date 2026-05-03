import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Switch, Alert, Image,
} from 'react-native';
import { Mail, Phone, Edit3, LogOut, Trash2, Lock, Bell, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { fetchProfile, fetchUserStats, updateProfile, deleteUserAccount, UserProfile } from '../services/api';
import { supabase } from '../services/supabase';
import { getTierConfig, getTier } from '../utils/tiers';

export function ProfilePage({ navigation }: any) {
  const { user, signOut } = useAuth();
  const styles = useStyles(createStyles);
  const { colors, isDark, toggleTheme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<{
    questionsAnswered: number;
    quizPassRate: number;
    currentStreak: number;
    totalXP: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProfileData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const [profileData, statsData] = await Promise.all([
        fetchProfile(user.id),
        fetchUserStats(user.id),
      ]);

      setProfile(profileData);
      if (statsData) {
        setStats({
          questionsAnswered: statsData.questionsAnswered,
          quizPassRate: statsData.quizPassRate,
          currentStreak: statsData.currentStreak,
          totalXP: statsData.totalXP ?? 0,
        });
      }
    } catch {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Reload when returning from EditProfile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfileData();
    });
    return unsubscribe;
  }, [navigation, loadProfileData]);

  const handleToggleNotifications = async (value: boolean) => {
    if (!user || !profile) return;
    setProfile(prev => prev ? { ...prev, notifications_enabled: value } : null);
    await updateProfile(user.id, { notifications_enabled: value });
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: 'veritaslearn://login-callback',
      });
      if (error) throw error;
      Alert.alert('Password Reset', 'A password reset email has been sent to your inbox.');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not send reset email.');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This action is permanent. All your data, quiz history, and progress will be deleted forever. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const result = await deleteUserAccount();
            setDeleting(false);
            if (!result.success) {
              Alert.alert('Error', result.error ?? 'Could not delete account.');
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadProfileData}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const email = user?.email ?? '';
  const displayName = profile?.full_name || profile?.username || email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();
  const tier = getTier(stats?.totalXP ?? 0);
  const tierConfig = getTierConfig(tier);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ─── Profile Header ─────────────────────────── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>{tierConfig.icon}</Text>
            </View>
          </View>

          <Text style={styles.displayName}>{displayName}</Text>
          {profile?.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}
          {profile?.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : null}

          {/* Contact info */}
          <View style={styles.contactRow}>
            <Mail size={14} color={colors.textMuted} />
            <Text style={styles.contactText}>{email}</Text>
          </View>
          {profile?.phone ? (
            <View style={styles.contactRow}>
              <Phone size={14} color={colors.textMuted} />
              <Text style={styles.contactText}>{profile.phone}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <Edit3 size={16} color="#fff" />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Stats Section ─────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.questionsAnswered ?? 0}</Text>
              <Text style={styles.statLabel}>Quizzes Taken</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.quizPassRate ?? 0}%</Text>
              <Text style={styles.statLabel}>Pass Rate</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.currentStreak ?? 0} 🔥</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.totalXP ?? 0}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
          </View>
          <View style={styles.tierRow}>
            <Text style={styles.tierIcon}>{tierConfig.icon}</Text>
            <Text style={styles.tierName}>{tierConfig.name} Tier</Text>
          </View>
        </View>

        {/* ─── Settings Section ─────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Bell size={18} color={colors.text} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={profile?.notifications_enabled ?? true}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primaryHover }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              {isDark
                ? <View><Text style={{ fontSize: 18 }}>☀️</Text></View>
                : <View><Text style={{ fontSize: 18 }}>🌙</Text></View>
              }
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryHover }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ─── Account Actions ────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.actionRow} onPress={handleChangePassword} activeOpacity={0.6}>
            <View style={styles.settingLeft}>
              <Lock size={18} color={colors.text} />
              <Text style={styles.settingLabel}>Change Password</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleSignOut} activeOpacity={0.6}>
            <View style={styles.settingLeft}>
              <LogOut size={18} color={colors.error} />
              <Text style={[styles.settingLabel, { color: colors.error }]}>Sign Out</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ─── Danger Zone ────────────────────────── */}
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDeleteAccount}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Trash2 size={16} color="#fff" />
                <Text style={styles.deleteBtnText}>Delete Account</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.dangerNote}>
            This permanently deletes your account and all associated data.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: { marginTop: 12, color: colors.textMuted, fontSize: 14 },
  errorText: { color: colors.error, textAlign: 'center', fontSize: 15, marginBottom: 16 },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  retryBtnText: { color: '#fff', fontWeight: '600' },

  // ── Profile Header ──
  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.primaryHover,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryHover,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  tierBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  tierBadgeText: { fontSize: 14 },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryHover,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  editProfileBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // ── Sections ──
  section: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },

  // ── Stats ──
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryHover,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
  },
  tierIcon: { fontSize: 18 },
  tierName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  // ── Settings ──
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: colors.text,
  },

  // ── Actions ──
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  // ── Danger ──
  dangerSection: {
    borderWidth: 1,
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorBg,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.error,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dangerNote: {
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
    opacity: 0.8,
  },
});
