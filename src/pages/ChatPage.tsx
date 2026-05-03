import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Header } from '../components/shared/Header';
import { ChatInterface } from '../components/chat/ChatInterface';
import { QuizInterface } from '../components/quiz/QuizInterface';
import { QuizResults } from '../components/quiz/QuizResults';
import { StudyMaterials } from '../components/quiz/StudyMaterials';
import { Dialog } from '../components/ui/Dialog';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { getFallbackResponse, StudyData } from '../utils/mockData';
import { submitQuizToBackend, saveSession } from '../services/api';
import { Question } from '../types';
import { useStyles } from '../theme/ThemeContext';

type ModalState = 'closed' | 'quiz' | 'results' | 'study';

export function ChatPage() {
    const { messages, updateMessage, addScore, updateStats, stats } = useApp();
    const { user } = useAuth();
    const styles = useStyles(createStyles);
    const [modalState, setModalState] = useState<ModalState>('closed');
    const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
    const [currentStudyData, setCurrentStudyData] = useState<StudyData | null>(null);
    const [quizScore, setQuizScore] = useState({ correct: 0, total: 0, points: 0 });
    const [isRetry, setIsRetry] = useState(false);
    const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

    // ── Ref-based guard to guarantee exactly ONE save per quiz flow ──
    // Using a ref instead of state because setState is async/batched —
    // double-tapping a button can call the handler twice before the
    // state update from the first call takes effect.
    const sessionSavedRef = useRef(false);
    const pendingSessionRef = useRef<{
        finalScore: number; finalTotal: number; finalPoints: number; finalPassed: boolean;
    } | null>(null);

    // ── Take Quiz: go directly to quiz (no gate modal) ──────────
    const handleTakeQuiz = useCallback((messageId: string) => {
        setCurrentMessageId(messageId);
        const assistantMessage = messages.find(m => m.id === messageId);

        let studyData: StudyData | null = null;
        if (assistantMessage && assistantMessage.studyData) {
            studyData = assistantMessage.studyData;
        } else {
            const messageIndex = messages.findIndex(m => m.id === messageId);
            if (messageIndex > 0) {
                const userQuestion = messages[messageIndex - 1].content;
                studyData = getFallbackResponse(userQuestion);
            }
        }

        if (studyData) {
            setCurrentStudyData(studyData);
            const questions = studyData.quiz;
            setActiveQuestions(questions);
            setIsRetry(false);
            // Reset save guard for this new quiz flow
            sessionSavedRef.current = false;
            pendingSessionRef.current = null;
            setModalState('quiz');
        }
    }, [messages]);

    // ── Copy Answer: award 0 points ─────────────────────────────
    const handleCopyAnswer = useCallback((messageId: string) => {
        addScore(0, 'Copied AI answer without quiz');
    }, [addScore]);

    // ── Quiz complete handler ───────────────────────────────────
    const handleQuizComplete = useCallback(async (correct: number, total: number, userAnswers: number[]) => {
        let finalScore = correct;
        let finalTotal = total;
        let finalPoints = 0;
        let finalPassed = false;

        try {
            const topic = currentStudyData?.topic ?? 'Unknown';
            const questions = activeQuestions;

            // Submit to backend: server validates, scores, and unlocks chat_access
            const result = await submitQuizToBackend(
                topic, 
                userAnswers, 
                questions, 
                isRetry,
                currentStudyData?.answersSignature,
                currentStudyData?.answersPayload
            );

            finalScore = result.score;
            finalTotal = result.total;
            finalPoints = result.pointsEarned;
            finalPassed = result.passed;

            setQuizScore({ correct: finalScore, total: finalTotal, points: finalPoints });

            if (result.passed && currentMessageId) {
                updateMessage(currentMessageId, { quizCompleted: true, unlocked: true });
                addScore(result.pointsEarned, `Passed quiz${isRetry ? ' (retry)' : ''}: ${result.score}/${result.total} correct`);
                updateStats({
                    questionsAnswered: stats.questionsAnswered + 1,
                    quizPassRate: Math.round(
                        ((stats.quizPassRate * stats.questionsAnswered + 100) / (stats.questionsAnswered + 1))
                    ),
                });
            }
        } catch (err: any) {
            console.error('Quiz submission error:', err);
            setQuizScore({ correct: 0, total, points: 0 });
        }

        // Store result in ref — will be persisted once when user exits results
        pendingSessionRef.current = { finalScore, finalTotal, finalPoints, finalPassed };

        setModalState('results');
    }, [isRetry, currentMessageId, currentStudyData, activeQuestions, updateMessage, addScore, updateStats, stats, user, messages]);

    // ── Persist session exactly once (ref-guarded) ──────────────
    const persistSession = useCallback(() => {
        // Synchronous ref check — immune to React batching / double-taps
        if (sessionSavedRef.current) return;
        if (!user || !currentStudyData || !currentMessageId || !pendingSessionRef.current) return;

        // Mark as saved IMMEDIATELY (synchronous) before the async call
        sessionSavedRef.current = true;
        const pending = pendingSessionRef.current;
        pendingSessionRef.current = null;

        const messageIndex = messages.findIndex(m => m.id === currentMessageId);
        const userQuestion = messageIndex > 0 ? messages[messageIndex - 1]?.content : currentStudyData.topic;

        saveSession(user.id, {
            topic: currentStudyData.topic,
            question: userQuestion ?? currentStudyData.topic,
            answer: currentStudyData.answer,
            humanized: currentStudyData.humanized,
            key_points: currentStudyData.keyPoints,
            flashcards: currentStudyData.flashcards,
            quiz_score: pending.finalScore,
            quiz_total: pending.finalTotal,
            quiz_passed: pending.finalPassed,
            quiz_points: pending.finalPoints,
        }).catch(err => console.warn('Failed to save session:', err));
    }, [user, currentStudyData, currentMessageId, messages]);

    const handleRetry = useCallback(() => {
        if (currentStudyData) {
            setActiveQuestions(currentStudyData.easyQuiz);
        }
        setIsRetry(true);
        // Don't reset sessionSavedRef here — the retry's handleQuizComplete
        // will overwrite pendingSessionRef with the new result
        setModalState('quiz');
    }, [currentStudyData]);

    const handleContinue = useCallback(() => {
        // Save session to history exactly once
        persistSession();

        if (quizScore.points > 0 && currentStudyData) {
            setModalState('study');
        } else {
            setModalState('closed');
            setCurrentStudyData(null);
            setCurrentMessageId(null);
        }
    }, [quizScore.points, currentStudyData, persistSession]);

    const handleCloseStudy = useCallback(() => {
        setModalState('closed');
        setCurrentStudyData(null);
        setCurrentMessageId(null);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.main}>
                <ChatInterface
                    onTakeQuiz={handleTakeQuiz}
                    onCopyAnswer={handleCopyAnswer}
                />
            </View>

            {/* Quiz Modal */}
            <Dialog open={modalState === 'quiz'} onClose={() => {}}>
                {currentStudyData && (
                    <QuizInterface
                        questions={activeQuestions}
                        onComplete={handleQuizComplete}
                    />
                )}
            </Dialog>

            {/* Results Modal */}
            <Dialog open={modalState === 'results'} onClose={() => {}}>
                <QuizResults
                    score={quizScore.correct}
                    totalQuestions={quizScore.total}
                    pointsEarned={quizScore.points}
                    onRetry={quizScore.points === 0 ? handleRetry : undefined}
                    onContinue={handleContinue}
                    isRetry={isRetry}
                />
            </Dialog>

            {/* Study Materials Modal */}
            <Dialog open={modalState === 'study'} onClose={handleCloseStudy}>
                {currentStudyData && (
                    <StudyMaterials
                        topic={currentStudyData.topic}
                        summary={currentStudyData.humanized}
                        keyPoints={currentStudyData.keyPoints}
                        flashcards={currentStudyData.flashcards}
                    />
                )}
            </Dialog>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    main: {
        flex: 1,
        paddingTop: 16,
    },
});
