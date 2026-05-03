import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Copy, Brain, X, Check, Star, FileText, Zap } from 'lucide-react-native';
import { useStyles, useTheme } from '../../theme/ThemeContext';

interface ComprehensionGateProps {
    open: boolean;
    onClose: () => void;
    onCopy: () => void;
    onLearn: () => void;
}

export function ComprehensionGate({ open, onClose, onCopy, onLearn }: ComprehensionGateProps) {
    const styles = useStyles(createStyles);
    const { colors } = useTheme();

    return (
        <Dialog open={open} onClose={onClose}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Make Your Choice</Text>
                    <Text style={styles.subtitle}>How do you want to use this AI-generated answer?</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Path B - Understand & Learn (Recommended first on mobile) */}
                    <View style={styles.cardGreen}>
                        <View style={styles.badgeRecommended}>
                            <Text style={styles.badgeRecommendedText}>Recommended</Text>
                        </View>
                        <View style={styles.badgePoints}>
                            <Text style={styles.badgePointsText}>+50 pts</Text>
                        </View>

                        <View style={styles.cardContent}>
                            <View style={styles.iconContainerGreen}>
                                <Brain size={28} color={colors.successBorder} />
                            </View>

                            <Text style={styles.cardTitleGreen}>Understand & Learn</Text>

                            <View style={styles.list}>
                                <View style={styles.listItem}>
                                    <Check size={16} color={colors.successBorder} />
                                    <Text style={styles.listItemTextGreen}>Take comprehension quiz</Text>
                                </View>
                                <View style={styles.listItem}>
                                    <Star size={16} color="#eab308" />
                                    <Text style={[styles.listItemTextGreen, styles.fontMedium]}>Earn 50 points if pass (70%+)</Text>
                                </View>
                                <View style={styles.listItem}>
                                    <Zap size={16} color={colors.successBorder} />
                                    <Text style={styles.listItemTextGreen}>Get humanized answer in your style</Text>
                                </View>
                                <View style={styles.listItem}>
                                    <FileText size={16} color={colors.successBorder} />
                                    <Text style={styles.listItemTextGreen}>Bonus: Flashcards + Study Guide</Text>
                                </View>
                            </View>

                            <Button onPress={onLearn} style={styles.btnGreen}>
                                <Text style={styles.btnTextWhite}>Prove Understanding</Text>
                            </Button>
                        </View>
                    </View>

                    {/* Path A - Just Copy */}
                    <View style={styles.cardRed}>
                        <View style={styles.badgeQuick}>
                            <Text style={styles.badgeQuickText}>Quick Path</Text>
                        </View>

                        <View style={styles.cardContent}>
                            <View style={styles.iconContainerRed}>
                                <Copy size={28} color={colors.error} />
                            </View>

                            <Text style={styles.cardTitleRed}>Just Copy</Text>

                            <View style={styles.list}>
                                <View style={styles.listItem}>
                                    <X size={16} color={colors.errorBorder} />
                                    <Text style={styles.listItemTextRed}>Copy without understanding</Text>
                                </View>
                                <View style={styles.listItem}>
                                    <X size={16} color={colors.errorBorder} />
                                    <Text style={styles.listItemTextRed}>0 points earned</Text>
                                </View>
                                <View style={styles.listItem}>
                                    <X size={16} color={colors.errorBorder} />
                                    <Text style={styles.listItemTextRed}>Plain AI text only</Text>
                                </View>
                                <View style={styles.listItem}>
                                    <X size={16} color={colors.errorBorder} />
                                    <Text style={styles.listItemTextRed}>No study materials</Text>
                                </View>
                            </View>

                            <Button variant="outline" onPress={onCopy} style={styles.btnRedOutline}>
                                <Text style={styles.btnTextRed}>Copy Anyway</Text>
                            </Button>
                        </View>
                    </View>
                </ScrollView>
                
                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>💡 Your choice matters. Building real understanding leads to lasting knowledge.</Text>
                </View>
            </View>
        </Dialog>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        maxHeight: '95%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
    },
    cardGreen: {
        position: 'relative',
        backgroundColor: colors.successBg,
        borderWidth: 2,
        borderColor: colors.successBorder, // maybe lighter like 86efac
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        marginTop: 10,
    },
    cardRed: {
        position: 'relative',
        backgroundColor: colors.errorBg,
        borderWidth: 2,
        borderColor: colors.errorBorder,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        marginTop: 10,
    },
    badgeRecommended: {
        position: 'absolute',
        top: -12,
        left: 16,
        backgroundColor: colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeRecommendedText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.successBorder,
    },
    badgePoints: {
        position: 'absolute',
        top: -12,
        right: 16,
        backgroundColor: colors.success,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgePointsText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    badgeQuick: {
        position: 'absolute',
        top: -12,
        left: 16,
        backgroundColor: colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeQuickText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.errorBorder,
    },
    cardContent: {
        alignItems: 'center',
    },
    iconContainerGreen: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.successBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainerRed: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.errorBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitleGreen: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.successBorder,
        marginBottom: 16,
    },
    cardTitleRed: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.errorBorder,
        marginBottom: 16,
    },
    list: {
        width: '100%',
        marginBottom: 16,
        gap: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    listItemTextGreen: {
        fontSize: 13,
        color: colors.successBorder,
    },
    listItemTextRed: {
        fontSize: 13,
        color: colors.errorBorder,
    },
    fontMedium: {
        fontWeight: '600',
    },
    btnGreen: {
        width: '100%',
        backgroundColor: colors.success,
    },
    btnTextWhite: {
        color: '#ffffff',
        fontWeight: '600',
    },
    btnRedOutline: {
        width: '100%',
        borderColor: colors.errorBorder,
    },
    btnTextRed: {
        color: colors.errorBorder,
        fontWeight: '600',
    },
    footer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
    },
});
