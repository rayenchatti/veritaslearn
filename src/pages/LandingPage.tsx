import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Button } from '../components/ui/Button';
import { ArrowRight, Brain, Copy, CheckCircle, Flame } from 'lucide-react-native';
import { useStyles } from '../theme/ThemeContext';

export function LandingPage({ navigation }: any) {
    const styles = useStyles(createStyles);
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.badgeContainer}>
                        <Flame size={16} color="#ef4444" />
                        <Text style={styles.badgeText}>Stop copying, start learning</Text>
                    </View>
                    <Text style={styles.heroTitle}>Master any topic with</Text>
                    <Text style={styles.heroTitleGradient}>VeritasLearn</Text>
                    <Text style={styles.heroSubtitle}>
                        The AI assistant that makes sure you actually understand the answers before you use them. Build knowledge, not dependency.
                    </Text>
                    <Button size="lg" onPress={() => navigation.navigate('MainTab')} style={styles.ctaButton}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.ctaButtonText}>Get Started For Free</Text>
                            <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
                        </View>
                    </Button>
                </View>

                {/* How It Works Section */}
                <View style={styles.howItWorksSection}>
                    <Text style={styles.sectionTitle}>How It Works</Text>
                    
                    <View style={styles.stepCard}>
                        <View style={styles.stepIconContainer}>
                            <Text style={styles.stepNumber}>1</Text>
                        </View>
                        <Text style={styles.stepTitle}>Ask a Question</Text>
                        <Text style={styles.stepDesc}>Ask anything you want to learn about, just like normal.</Text>
                    </View>

                    <View style={styles.stepCard}>
                        <View style={styles.stepIconContainerRed}>
                            <Copy size={20} color="#ef4444" />
                        </View>
                        <Text style={styles.stepTitle}>Face the Gate</Text>
                        <Text style={styles.stepDesc}>The AI answer is locked. You can copy it, or choose to understand it.</Text>
                    </View>

                    <View style={styles.stepCard}>
                        <View style={styles.stepIconContainerGreen}>
                            <Brain size={20} color="#22c55e" />
                        </View>
                        <Text style={styles.stepTitle}>Prove Understanding</Text>
                        <Text style={styles.stepDesc}>Take a quick 3-question quiz generated from the answer.</Text>
                    </View>

                    <View style={styles.stepCard}>
                        <View style={styles.stepIconContainerPurple}>
                            <CheckCircle size={20} color="#9333ea" />
                        </View>
                        <Text style={styles.stepTitle}>Unlock & Learn</Text>
                        <Text style={styles.stepDesc}>Pass to get points, humanized summaries, and flashcards.</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 40,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.errorBg,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        marginBottom: 24,
    },
    badgeText: {
        color: colors.error,
        fontWeight: '600',
        fontSize: 12,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
    },
    heroTitleGradient: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.primaryHover,
        textAlign: 'center',
        marginBottom: 16,
    },
    heroSubtitle: {
        fontSize: 16,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    ctaButton: {
        width: '100%',
        marginHorizontal: 24,
    },
    ctaButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    howItWorksSection: {
        backgroundColor: colors.background,
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 32,
    },
    stepCard: {
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    stepIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primaryHover,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    stepIconContainerRed: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.errorBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    stepIconContainerGreen: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.successBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    stepIconContainerPurple: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    stepNumber: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    stepDesc: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
});
