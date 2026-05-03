import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BookOpen, Lightbulb, FileText, CheckCircle } from 'lucide-react-native';
import { useStyles, useTheme } from '../../theme/ThemeContext';

export interface FlashcardType {
    id: string;
    front: string;
    back: string;
}

interface StudyMaterialsProps {
    topic: string;
    summary: string;
    keyPoints: string[];
    flashcards: FlashcardType[];
}

function FlashcardItem({ card }: { card: FlashcardType }) {
    const [flipped, setFlipped] = useState(false);
    const styles = useStyles(createStyles);


    return (
        <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => setFlipped(!flipped)}
            style={[styles.flashcard, flipped ? styles.flashcardBack : styles.flashcardFront]}
        >
            <Text style={[styles.flashcardText, flipped ? styles.flashcardTextBack : styles.flashcardTextFront]}>
                {flipped ? card.back : card.front}
            </Text>
            <Text style={styles.flashcardHint}>
                {flipped ? 'Tap to see question' : 'Tap to flip'}
            </Text>
        </TouchableOpacity>
    );
}

export function StudyMaterials({ topic, summary, keyPoints, flashcards }: StudyMaterialsProps) {
    const styles = useStyles(createStyles);
    const { colors } = useTheme();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.unlockedPill}>
                    <CheckCircle size={16} color={colors.successBorder} />
                    <Text style={styles.unlockedText}>Study Materials Unlocked!</Text>
                </View>
                <Text style={styles.title}>{topic}</Text>
            </View>

            {/* Summary card */}
            <View style={styles.card}>
                <View style={[styles.cardHeader, styles.bgBlue]}>
                    <BookOpen size={20} color={colors.primary} />
                    <Text style={styles.cardTitle}>Summary</Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.summaryText}>{summary}</Text>
                </View>
            </View>

            {/* Key points */}
            <View style={styles.card}>
                <View style={[styles.cardHeader, styles.bgYellow]}>
                    <Lightbulb size={20} color="#ca8a04" />
                    <Text style={styles.cardTitle}>Key Points to Remember</Text>
                </View>
                <View style={styles.cardContent}>
                    {keyPoints.map((point, index) => (
                        <View key={index} style={styles.pointItem}>
                            <View style={styles.pointNumber}>
                                <Text style={styles.pointNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.pointText}>{point}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Flashcards */}
            {flashcards.length > 0 && (
                <View style={styles.flashcardsSection}>
                    <Text style={styles.sectionTitle}>Practice Flashcards</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashcardsList}>
                        {flashcards.map(card => (
                            <FlashcardItem key={card.id} card={card} />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Tip */}
            <View style={styles.tipBox}>
                <FileText size={20} color="#9333ea" style={{ marginTop: 2 }} />
                <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Study Tip</Text>
                    <Text style={styles.tipText}>
                        Review these flashcards again tomorrow to strengthen your memory. Spaced repetition is key to long-term retention!
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        maxHeight: '95%',
    },
    content: {
        paddingTop: 10,
        paddingBottom: 30,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    unlockedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.successBg,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        marginBottom: 16,
    },
    unlockedText: {
        color: colors.successBorder, // e.g. #15803d
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
        overflow: 'hidden',
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    bgBlue: { backgroundColor: colors.surfaceHighlight }, // Map to suitable theme colors
    bgYellow: { backgroundColor: colors.surfaceHighlight },
    cardTitle: {
        fontWeight: 'bold',
        color: colors.text,
    },
    cardContent: {
        padding: 16,
    },
    summaryText: {
        color: colors.textMuted,
        lineHeight: 24,
    },
    pointItem: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
        gap: 12,
    },
    pointNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primaryHover,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    pointNumberText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    pointText: {
        flex: 1,
        color: colors.text,
        lineHeight: 22,
    },
    flashcardsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    flashcardsList: {
        gap: 16,
        paddingBottom: 16,
    },
    flashcard: {
        width: 280,
        height: 180,
        borderRadius: 16,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    flashcardFront: {
        backgroundColor: colors.surface,
        borderColor: colors.borderLight,
    },
    flashcardBack: {
        backgroundColor: colors.primaryHover,
        borderColor: colors.primary,
    },
    flashcardText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 24,
    },
    flashcardTextFront: {
        color: colors.text,
        fontWeight: '500',
    },
    flashcardTextBack: {
        color: '#ffffff',
    },
    flashcardHint: {
        position: 'absolute',
        bottom: 16,
        fontSize: 12,
        color: colors.textMuted, // previously 9ca3af, fallback to textMuted
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: colors.surfaceHighlight, // usually light purple, map to highlight
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontWeight: 'bold',
        color: colors.primary, // instead of dark purple
        marginBottom: 4,
    },
    tipText: {
        color: colors.primary, // instead of lighter purple
        fontSize: 14,
        lineHeight: 20,
    },
});
