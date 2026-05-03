import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStyles } from '../../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../contexts/AppContext';
import { Flame } from 'lucide-react-native';
import { getTierConfig } from '../../utils/tiers';

export function Header() {
    const insets = useSafeAreaInsets();
    const { score, tier, stats } = useApp();
    const tierConfig = getTierConfig(tier);
    const styles = useStyles(createStyles);


    return (
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>VeritasLearn</Text>
                </View>

                {/* Score & Tier Display */}
                <View style={styles.scoreDisplayContainer}>
                    <View style={styles.streakContainer}>
                        <Flame size={16} color="#ef4444" />
                        <Text style={styles.streakText}>{stats.currentStreak}</Text>
                    </View>
                    
                    <View style={styles.tierScoreContainer}>
                        <Text style={styles.tierIcon}>{tierConfig.icon}</Text>
                        <View>
                            <Text style={styles.scoreText}>{score.toLocaleString()} XP</Text>
                            <Text style={styles.tierName}>{tierConfig.name}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    headerContainer: {
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    scoreDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.errorBg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    streakText: {
        marginLeft: 4,
        fontWeight: 'bold',
        color: colors.error,
    },
    tierScoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tierIcon: {
        fontSize: 18,
    },
    scoreText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: colors.text,
    },
    tierName: {
        fontSize: 10,
        color: colors.textMuted,
        textTransform: 'uppercase',
    },
});
