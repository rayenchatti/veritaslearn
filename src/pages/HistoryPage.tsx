import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, Platform,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Clock, BookOpen, CheckCircle, XCircle, Trash2 } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { fetchSessions, deleteSession, ChatSession } from '../services/api';

export function HistoryPage({ navigation }: any) {
  const { user } = useAuth();
  const styles = useStyles(createStyles);
  const { colors } = useTheme();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchSessions(user.id);
      setSessions(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Reload when navigating back
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSessions();
    });
    return unsubscribe;
  }, [navigation, loadSessions]);

  const handleDelete = (session: ChatSession) => {
    Alert.alert('Delete Session', `Delete "${session.topic}" from history?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSession(session.id);
          setSessions(prev => prev.filter(s => s.id !== session.id));
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderSession = ({ item }: { item: ChatSession }) => {
    const passed = item.quiz_passed;
    const hasQuiz = item.quiz_score !== null && item.quiz_total !== null;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('SessionDetail', { sessionId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.topicRow}>
            <BookOpen size={16} color={colors.primary} />
            <Text style={styles.topicText} numberOfLines={1}>{item.topic}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.questionText} numberOfLines={2}>{item.question}</Text>

        <View style={styles.cardFooter}>
          {hasQuiz && (
            <View style={[styles.badge, passed ? styles.passBadge : styles.failBadge]}>
              {passed
                ? <CheckCircle size={12} color={colors.success} />
                : <XCircle size={12} color={colors.error} />
              }
              <Text style={[styles.badgeText, passed ? styles.passText : styles.failText]}>
                {item.quiz_score}/{item.quiz_total} {passed ? 'Passed' : 'Failed'}
              </Text>
            </View>
          )}

          {item.quiz_points > 0 && (
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{item.quiz_points} XP</Text>
            </View>
          )}

          <View style={{ flex: 1 }} />
          <View style={styles.dateRow}>
            <Clock size={12} color={colors.textMuted} />
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading history…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>Learning History</Text>
        <Text style={styles.pageSubtitle}>
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIcon}>
            <BookOpen size={32} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete a learning session with a quiz to see it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          renderItem={renderSession}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadSessions();
          }}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: { marginTop: 12, color: colors.textMuted, fontSize: 14 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // ── Session Card ──
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  topicText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
  },
  questionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  passBadge: {
    backgroundColor: colors.successBg,
  },
  failBadge: {
    backgroundColor: colors.errorBg,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  passText: { color: colors.success },
  failText: { color: colors.error },
  xpBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryHover,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
