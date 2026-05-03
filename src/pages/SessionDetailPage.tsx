import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { ArrowLeft, CheckCircle, XCircle, BookOpen, Lightbulb, CreditCard } from 'lucide-react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { fetchSessionById, ChatSession } from '../services/api';

export function SessionDetailPage({ route, navigation }: any) {
  const { sessionId } = route.params;
  const styles = useStyles(createStyles);
  const { colors } = useTheme();

  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function load() {
      const data = await fetchSessionById(sessionId);
      setSession(data);
      setLoading(false);
    }
    load();
  }, [sessionId]);

  const toggleFlashcard = (index: number) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
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

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Session not found.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasQuiz = session.quiz_score !== null && session.quiz_total !== null;
  const keyPoints = (session.key_points ?? []) as string[];
  const flashcards = (session.flashcards ?? []) as { front: string; back: string }[];
  const date = new Date(session.created_at).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{session.topic}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Date */}
        <Text style={styles.dateText}>{date}</Text>

        {/* Quiz Result Banner */}
        {hasQuiz && (
          <View style={[styles.quizBanner, session.quiz_passed ? styles.passBanner : styles.failBanner]}>
            {session.quiz_passed
              ? <CheckCircle size={20} color={colors.success} />
              : <XCircle size={20} color={colors.error} />
            }
            <View style={{ flex: 1 }}>
              <Text style={[styles.quizBannerTitle, session.quiz_passed ? { color: colors.success } : { color: colors.error }]}>
                {session.quiz_passed ? 'Quiz Passed!' : 'Quiz Failed'}
              </Text>
              <Text style={styles.quizBannerSub}>
                Score: {session.quiz_score}/{session.quiz_total}
                {session.quiz_points > 0 ? ` · +${session.quiz_points} XP` : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Question */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Your Question</Text>
          </View>
          <Text style={styles.questionText}>{session.question}</Text>
        </View>

        {/* AI Answer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lightbulb size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>AI Answer</Text>
          </View>
          <Text style={styles.answerText}>{session.answer}</Text>
        </View>

        {/* Simplified Summary */}
        {session.humanized ? (
          <View style={[styles.section, styles.summarySection]}>
            <Text style={styles.sectionTitle}>✨ Simplified Summary</Text>
            <Text style={styles.summaryText}>{session.humanized}</Text>
          </View>
        ) : null}

        {/* Key Points */}
        {keyPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📌 Key Points</Text>
            {keyPoints.map((point, i) => (
              <View key={i} style={styles.keyPointRow}>
                <View style={styles.bullet} />
                <Text style={styles.keyPointText}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Flashcards */}
        {flashcards.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Flashcards</Text>
            </View>
            <Text style={styles.flashcardHint}>Tap a card to flip it</Text>
            {flashcards.map((card, i) => {
              const isFlipped = flippedCards.has(i);
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.flashcard, isFlipped && styles.flashcardFlipped]}
                  onPress={() => toggleFlashcard(i)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.flashcardLabel}>
                    {isFlipped ? 'ANSWER' : 'QUESTION'}
                  </Text>
                  <Text style={styles.flashcardText}>
                    {isFlipped ? card.back : card.front}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: { color: colors.error, fontSize: 16, marginBottom: 16 },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  backBtnText: { color: '#fff', fontWeight: '600' },

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
    flex: 1,
    textAlign: 'center',
  },

  scrollContent: {
    padding: 20,
  },

  dateText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
  },

  // ── Quiz Banner ──
  quizBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  passBanner: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  failBanner: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  quizBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizBannerSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── Sections ──
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  summarySection: {
    backgroundColor: colors.surfaceHighlight,
  },

  questionText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  answerText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },

  // ── Key Points ──
  keyPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
  },
  keyPointText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },

  // ── Flashcards ──
  flashcardHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
  },
  flashcard: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 80,
  },
  flashcardFlipped: {
    backgroundColor: colors.primary + '14',
    borderColor: colors.primary,
  },
  flashcardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  flashcardText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
