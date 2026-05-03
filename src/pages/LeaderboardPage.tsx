import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { Header } from '../components/shared/Header';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { fetchLeaderboard, LeaderboardRow } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getTierConfig, getTier } from '../utils/tiers';


export function LeaderboardPage() {
    const styles = useStyles(createStyles);
    const { colors } = useTheme();
    const { user } = useAuth();
    const [board, setBoard] = useState<LeaderboardRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadLeaderboard() {
            try {
                setLoading(true);
                const rows = await fetchLeaderboard(user?.id ?? '');
                setBoard(rows);
            } catch {
                setError('Could not load leaderboard. Please try again.');
            } finally {
                setLoading(false);
            }
        }
        loadLeaderboard();
    }, [user]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.pageTitle}>Leaderboard</Text>
                    <Text style={styles.pageSubtitle}>Top learners ranked by XP earned</Text>
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading leaderboard…</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centered}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : board.length === 0 ? (
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>🏆 No scores yet — be the first to earn XP!</Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {board.map((entry) => {
                            const tier = getTier(entry.totalXP);
                            const tierConfig = getTierConfig(tier);
                            const initials = entry.displayName.slice(0, 2).toUpperCase();

                            return (
                                <View
                                    key={entry.userId}
                                    style={[
                                        styles.listItem,
                                        entry.isCurrentUser && styles.listItemCurrentUser,
                                    ]}
                                >
                                    <View style={styles.rankContainer}>
                                        <Text style={[styles.rankText, entry.rank <= 3 && styles.rankTopText]}>
                                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                                        </Text>
                                    </View>

                                    <View style={styles.avatarContainer}>
                                        <Text style={styles.avatarText}>{initials}</Text>
                                    </View>

                                    <View style={styles.infoContainer}>
                                        <Text style={[styles.nameText, entry.isCurrentUser && styles.textPrimary]}>
                                            {entry.displayName}{entry.isCurrentUser ? ' (You)' : ''}
                                        </Text>
                                        <View style={styles.tierContainer}>
                                            <Text style={styles.tierIcon}>{tierConfig.icon}</Text>
                                            <Text style={styles.tierName}>{tierConfig.name}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.scoreContainer}>
                                        <Text style={styles.scoreText}>{entry.totalXP.toLocaleString()}</Text>
                                        <Text style={styles.xpText}>XP</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
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
    headerTitleContainer: { marginBottom: 20 },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    pageSubtitle: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: 4,
    },
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        color: colors.textMuted,
        fontSize: 14,
    },
    errorText: {
        color: colors.error,
        textAlign: 'center',
        fontSize: 14,
    },
    emptyText: {
        color: colors.textMuted,
        textAlign: 'center',
        fontSize: 16,
    },
    listContainer: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    listItemCurrentUser: {
        backgroundColor: colors.surfaceHighlight,
    },
    rankContainer: { width: 40 },
    rankText: {
        fontWeight: 'bold',
        color: colors.textMuted,
        fontSize: 14,
    },
    rankTopText: {
        fontSize: 18,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primaryHover,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 14,
    },
    infoContainer: { flex: 1 },
    nameText: {
        fontWeight: 'bold',
        color: colors.text,
        fontSize: 15,
        marginBottom: 2,
    },
    textPrimary: { color: colors.primary },
    tierContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    tierIcon: { fontSize: 12 },
    tierName: { fontSize: 12, color: colors.textMuted },
    scoreContainer: { alignItems: 'flex-end' },
    scoreText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: colors.text,
    },
    xpText: { fontSize: 12, color: colors.textMuted },
});
