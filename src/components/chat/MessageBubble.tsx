import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bot, User, Brain, Copy, CheckCircle } from 'lucide-react-native';
import { useStyles, useTheme } from '../../theme/ThemeContext';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    hasStudyData?: boolean;
    quizCompleted?: boolean;
    onTakeQuiz?: () => void;
    onCopyAnswer?: () => void;
}

export function MessageBubble({
    role,
    content,
    hasStudyData = false,
    quizCompleted = false,
    onTakeQuiz,
    onCopyAnswer,
}: MessageBubbleProps) {
    const styles = useStyles(createStyles);
    const { colors } = useTheme();
    const isUser = role === 'user';

    return (
        <View style={[styles.container, isUser ? styles.containerUser : styles.containerAssistant]}>
            {/* Avatar */}
            <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarAssistant]}>
                {isUser ? (
                    <User color="#ffffff" size={18} />
                ) : (
                    <Bot color={colors.text} size={18} />
                )}
            </View>

            {/* Message content */}
            <View style={styles.bubbleWrapper}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
                    <View>
                        {content.split('\n').map((line, i) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                                return <Text key={i} style={[styles.text, isUser ? styles.textUser : styles.textAssistant, styles.boldText]}>{line.slice(2, -2)}</Text>;
                            }
                            if (line.startsWith('- ')) {
                                return <Text key={i} style={[styles.text, isUser ? styles.textUser : styles.textAssistant, styles.listItem]}>• {line.slice(2)}</Text>;
                            }
                            if (line.startsWith('> ')) {
                                return <Text key={i} style={[styles.text, styles.blockquote]}>{line.slice(2)}</Text>;
                            }
                            return (
                                <Text key={i} style={[styles.text, isUser ? styles.textUser : styles.textAssistant, line.trim() === '' ? styles.emptyLine : null]}>
                                    {line}
                                </Text>
                            );
                        })}
                    </View>
                </View>

                {/* Action buttons — shown below AI lesson messages */}
                {!isUser && hasStudyData && (
                    <View style={styles.actionRow}>
                        {quizCompleted ? (
                            <View style={styles.completedBadge}>
                                <CheckCircle size={16} color={colors.successBorder} />
                                <Text style={styles.completedText}>Quiz Completed ✓</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.quizBtn}
                                activeOpacity={0.8}
                                onPress={onTakeQuiz}
                            >
                                <Brain size={16} color="#ffffff" />
                                <Text style={styles.quizBtnText}>Take Quiz</Text>
                                <View style={styles.pointsPill}>
                                    <Text style={styles.pointsPillText}>+50 pts</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.copyBtn}
                            activeOpacity={0.8}
                            onPress={onCopyAnswer}
                        >
                            <Copy size={16} color={colors.textMuted} />
                            <Text style={styles.copyBtnText}>Copy</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    containerUser: {
        flexDirection: 'row-reverse',
    },
    containerAssistant: {
        flexDirection: 'row',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarUser: {
        backgroundColor: colors.primaryHover,
    },
    avatarAssistant: {
        backgroundColor: colors.borderLight,
    },
    bubbleWrapper: {
        maxWidth: '80%',
        flexShrink: 1,
    },
    bubble: {
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    bubbleUser: {
        backgroundColor: colors.primaryHover,
    },
    bubbleAssistant: {
        backgroundColor: colors.background,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
    },
    textUser: {
        color: '#ffffff',
    },
    textAssistant: {
        color: colors.text,
    },
    boldText: {
        fontWeight: 'bold',
    },
    listItem: {
        marginLeft: 8,
    },
    blockquote: {
        borderLeftWidth: 2,
        borderLeftColor: colors.primary,
        paddingLeft: 12,
        fontStyle: 'italic',
        color: colors.textMuted,
        marginVertical: 8,
    },
    emptyLine: {
        height: 8,
    },
    // ── Action buttons row ──────────────────────────
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        paddingLeft: 4,
    },
    quizBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryHover,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        shadowColor: colors.primaryHover,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    quizBtnText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 13,
    },
    pointsPill: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    pointsPillText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.borderLight,
        gap: 4,
    },
    copyBtnText: {
        color: colors.textMuted,
        fontSize: 13,
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.successBg,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    completedText: {
        color: colors.successBorder,
        fontSize: 13,
        fontWeight: '600',
    },
});
