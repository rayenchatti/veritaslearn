import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, Platform,
  TouchableOpacity, TextInput, ActivityIndicator, Alert, Image,
  KeyboardAvoidingView,
} from 'react-native';
import { Camera, ArrowLeft, Check } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { fetchProfile, updateProfile, uploadAvatar } from '../services/api';

export function EditProfilePage({ navigation }: any) {
  const { user } = useAuth();
  const styles = useStyles(createStyles);
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      const profile = await fetchProfile(user.id);
      if (profile) {
        setFullName(profile.full_name ?? '');
        setUsername(profile.username ?? '');
        setBio(profile.bio ?? '');
        setPhone(profile.phone ?? '');
        setAvatarUrl(profile.avatar_url);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handlePickImage = async () => {
    if (!user) return;

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.8,
      });

      if (result.didCancel || !result.assets?.[0]) return;

      const asset = result.assets[0];
      if (!asset.uri) return;

      setUploading(true);
      const uploadResult = await uploadAvatar(
        user.id,
        asset.uri,
        asset.type ?? 'image/jpeg'
      );
      setUploading(false);

      if (uploadResult.url) {
        setAvatarUrl(uploadResult.url);
      } else {
        Alert.alert('Upload Failed', uploadResult.error ?? 'Could not upload image.');
      }
    } catch (err: any) {
      setUploading(false);
      Alert.alert('Error', err.message ?? 'Could not pick image.');
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Basic validation
    if (username.trim().length > 0 && username.trim().length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters.');
      return;
    }

    setSaving(true);
    const result = await updateProfile(user.id, {
      full_name: fullName.trim() || null,
      username: username.trim() || null,
      bio: bio.trim() || null,
      phone: phone.trim() || null,
    });
    setSaving(false);

    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error ?? 'Could not save changes.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const initials = (fullName || username || 'U').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerBtn, styles.saveBtn]}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Check size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Avatar picker */}
          <TouchableOpacity style={styles.avatarSection} onPress={handlePickImage} activeOpacity={0.7}>
            <View style={styles.avatarWrapper}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.cameraOverlay}>
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Camera size={16} color="#fff" />
                )}
              </View>
            </View>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>

          {/* Form fields */}
          <View style={styles.formSection}>
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your full name"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                maxLength={100}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="your_username"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                maxLength={30}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself…"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{bio.length}/200</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={20}
              />
            </View>
          </View>

          {/* Email (read-only) */}
          <View style={styles.readOnlySection}>
            <Text style={styles.label}>Email (cannot be changed)</Text>
            <View style={[styles.input, styles.readOnlyInput]}>
              <Text style={styles.readOnlyText}>{user?.email ?? ''}</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.primaryHover,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // ── Avatar ──
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primaryHover,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },

  // ── Form ──
  formSection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  textArea: {
    height: 80,
    paddingTop: 12,
    paddingBottom: 12,
  },
  charCount: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },

  // ── Read-only ──
  readOnlySection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  readOnlyInput: {
    justifyContent: 'center',
    backgroundColor: colors.borderLight,
    borderColor: colors.borderLight,
  },
  readOnlyText: {
    fontSize: 15,
    color: colors.textMuted,
  },
});
