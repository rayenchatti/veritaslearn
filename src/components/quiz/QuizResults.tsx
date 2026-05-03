import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../ui/Button';
import { Trophy, Star, RefreshCcw, ArrowRight, CheckCircle, XCircle, Sparkles } from 'lucide-react-native';
import { useStyles, useTheme } from '../../theme/ThemeContext';

interface QuizResultsProps {
    score: number;
    totalQuestions: number;
    pointsEarned: number;
    onRetry?: () => void;
    onContinue: () => void;
    isRetry?: boolean;
}

export function QuizResults({
    score,
    totalQuestions,
    pointsEarned,
    onRetry,
    onContinue,
    isRetry = false
}: QuizResultsProps) {
    const styles = useStyles(createStyles);
    const { colors } = useTheme();
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70;

    // Prevent double-tap on Continue / Retry
    const actionTakenRef = useRef(false);

    const safeOnContinue = useCallback(() => {
        if (actionTakenRef.current) return;
        actionTakenRef.current = true;
        onContinue();
    }, [onContinue]);

    const safeOnRetry = useCallback(() => {
        if (!onRetry || actionTakenRef.current) return;
        actionTakenRef.current = true;
        onRetry();
    }, [onRetry]);

    return (
        <View style={styles.container}>
            {/* Result icon */}
            <View style={[styles.iconCircle, passed ? styles.iconCircleSuccess : styles.iconCircleDanger]}>
                {passed ? <Trophy size={48} color="#ffffff" /> : <RefreshCcw size={48} color="#ffffff" />}
            </View>

            {/* Result message */}
            <View style={styles.messageBox}>
                <Text style={[styles.title, passed ? styles.textSuccess : styles.textWarning]}>
                    {passed ? 'Congratulations!' : 'Almost there!'}
                </Text>
                <Text style={styles.subtitle}>
                    {passed ? "You've proven your understanding!" : "You need 70% to pass. Try again!"}
                </Text>
            </View>

            {/* Score display */}
            <View style={styles.scoreBox}>
                <Text style={styles.scoreTextMain}>{score}/{totalQuestions}</Text>
                <Text style={styles.scoreTextSub}>{percentage}% correct</Text>

                {passed && (
                    <View style={styles.pointsPill}>
                        <Star size={16} color="#eab308" />
                        <Text style={styles.pointsPillText}>+{pointsEarned} points earned!</Text>
                        {!isRetry && <Sparkles size={16} color="#eab308" />}
                    </View>
                )}
            </View>

            {/* Question breakdown */}
            <View style={styles.breakdownRow}>
                {Array.from({ length: totalQuestions }).map((_, i) => (
                    <View key={i} style={[styles.dot, i < score ? styles.dotSuccess : styles.dotDanger]}>
                        {i < score ? <CheckCircle size={20} color={colors.success} /> : <XCircle size={20} color={colors.error} />}
                    </View>
                ))}
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
                {!passed && onRetry && (
                    <Button variant="outline" onPress={safeOnRetry} style={styles.marginRight}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <RefreshCcw size={16} color={colors.primaryHover} style={{ marginRight: 6 }} />
                            <Text style={{ color: colors.primaryHover }}>Try Again (30 pts)</Text>
                        </View>
                    </Button>
                )}
                
                <Button onPress={safeOnContinue} style={passed ? styles.bgSuccess : {}}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>
                            {passed ? 'View Unlocked Answer' : 'Continue Anyway'}
                        </Text>
                        <ArrowRight size={16} color="#ffffff" style={{ marginLeft: 6 }} />
                    </View>
                </Button>
            </View>

            {/* Encouraging message */}
            <Text style={styles.footerText}>
                {passed
                    ? '🌟 Your humanized answer and study materials are now available!'
                    : "💪 Don't give up! Understanding takes practice."}
            </Text>
        </View>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircleSuccess: {
        backgroundColor: colors.success,
    },
    iconCircleDanger: {
        backgroundColor: colors.error,
    },
    messageBox: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    textSuccess: { color: colors.success },
    textWarning: { color: '#ea580c' }, // or use colors.error
    subtitle: {
        color: colors.textMuted,
        fontSize: 16,
    },
    scoreBox: {
        backgroundColor: colors.surfaceHighlight, // usually light gray or tinted bg
        borderRadius: 16,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        marginBottom: 24,
    },
    scoreTextMain: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    scoreTextSub: {
        color: colors.textMuted,
        marginBottom: 16,
    },
    pointsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.successBg,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    pointsPillText: {
        color: colors.successBorder, // dark green
        fontWeight: 'bold',
        fontSize: 14,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    dot: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotSuccess: {
        backgroundColor: colors.successBg,
    },
    dotDanger: {
        backgroundColor: colors.errorBg,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    marginRight: {
        marginRight: 10,
    },
    bgSuccess: {
        backgroundColor: colors.success,
    },
    footerText: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
    },
});
