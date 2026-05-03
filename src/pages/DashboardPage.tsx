import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Header } from '../components/shared/Header';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useStyles } from '../theme/ThemeContext';

export function DashboardPage() {
    const { stats, score } = useApp();
    const { user } = useAuth();
    const styles = useStyles(createStyles);

    const displayName = user?.user_metadata?.username as string
        || user?.email?.split('@')[0]
        || '';

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {displayName ? (
                    <Text style={styles.greeting}>👋 Welcome back, {displayName}!</Text>
                ) : null}
                <Text style={styles.pageTitle}>Dashboard</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.questionsAnswered}</Text>
                        <Text style={styles.statLabel}>Questions Answered</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.quizPassRate}%</Text>
                        <Text style={styles.statLabel}>Quiz Pass Rate</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.currentStreak} 🔥</Text>
                        <Text style={styles.statLabel}>Current Streak</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{score}</Text>
                        <Text style={styles.statLabel}>Total XP</Text>
                    </View>
                    <View style={[styles.statCard, { width: '100%' }]}>
                        <Text style={styles.statValue}>{stats.aiRelianceDecrease}%</Text>
                        <Text style={styles.statLabel}>Decrease in AI Reliance</Text>
                    </View>
                </View>

                <View style={styles.placeholderChart}>
                    <Text style={styles.placeholderTitle}>Learning Progress Over Time</Text>
                    <Text style={styles.placeholderSubtitle}>Charts coming in a future update</Text>
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
    container: { flex: 1 },
    content: { padding: 16 },
    greeting: {
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: 4,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        width: '48%',
        backgroundColor: colors.surfaceHighlight,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primaryHover,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
    },
    placeholderChart: {
        height: 200,
        backgroundColor: colors.background,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    placeholderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    placeholderSubtitle: {
        fontSize: 12,
        color: colors.textMuted,
    },
});
