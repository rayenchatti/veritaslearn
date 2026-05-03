import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { TierType, Message, UserStats, Activity, Question } from '../types';
import { getTier } from '../utils/tiers';
import { saveScore, loadScore, saveActivities, loadActivities } from '../utils/storage';
import { DEMO_STATS } from '../utils/mockData';
import { supabase } from '../services/supabase';
import { fetchUserStats } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'sb-nyrnbrvbmxyurejdorvm-auth-token';

interface AppState {
    score: number;
    tier: TierType;
    stats: UserStats;
    activities: Activity[];
    messages: Message[];
    currentQuiz: Question[] | null;
    isQuizActive: boolean;
    scorePopup: { show: boolean; points: number } | null;
    isLoadingStore: boolean;
}

interface AppContextType extends AppState {
    addScore: (points: number, reason: string) => void;
    addMessage: (message: Message) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    clearMessages: () => void;
    setQuiz: (questions: Question[] | null) => void;
    setQuizActive: (active: boolean) => void;
    updateStats: (updates: Partial<UserStats>) => void;
    showScorePopup: (points: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [score, setScore] = useState<number>(0);
    const [tier, setTier] = useState<TierType>(getTier(0));
    const [stats, setStats] = useState<UserStats>(DEMO_STATS);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentQuiz, setCurrentQuiz] = useState<Question[] | null>(null);
    const [isQuizActive, setIsQuizActive] = useState(false);
    const [scorePopup, setScorePopup] = useState<{ show: boolean; points: number } | null>(null);
    const [isLoadingStore, setIsLoadingStore] = useState(true);

    // Initial load: try Supabase first, fall back to AsyncStorage
    useEffect(() => {
        async function fetchInitialData() {
            try {
                const loadedScore = await loadScore();
                setScore(loadedScore);
                setTier(getTier(loadedScore));

                const loadedActivities = await loadActivities();
                setActivities(loadedActivities as Activity[]);

                // Try to load real stats from Supabase if logged in
                // Read session from AsyncStorage directly to avoid ES256 JWT crash
                let userId: string | null = null;
                try {
                    const raw = await AsyncStorage.getItem(STORAGE_KEY);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        userId = parsed?.user?.id ?? null;
                    }
                } catch {}

                if (userId) {
                    const serverStats = await fetchUserStats(userId);
                    if (serverStats) {
                        setStats(serverStats);
                        setScore(serverStats.totalXP ?? loadedScore);
                        setTier(getTier(serverStats.totalXP ?? loadedScore));
                    }
                }
            } finally {
                setIsLoadingStore(false);
            }
        }
        fetchInitialData();
    }, []);

    // Persist score changes
    useEffect(() => {
        if (!isLoadingStore) {
            saveScore(score);
            setTier(getTier(score));
        }
    }, [score, isLoadingStore]);

    // Persist activities
    useEffect(() => {
        if (!isLoadingStore) {
            saveActivities(activities);
        }
    }, [activities, isLoadingStore]);

    const showScorePopup = useCallback((points: number) => {
        setScorePopup({ show: true, points });
        setTimeout(() => setScorePopup(null), 2000);
    }, []);

    const addScore = useCallback((points: number, reason: string) => {
        setScore(prev => prev + points);
        const newActivity: Activity = {
            id: Date.now().toString(),
            type: points > 0 ? 'quiz_pass' : 'copy',
            description: reason,
            points,
            timestamp: new Date(),
        };
        setActivities(prev => [newActivity, ...prev].slice(0, 20));

        if (points > 0) {
            showScorePopup(points);
        }
    }, [showScorePopup]);

    const addMessage = useCallback((message: Message) => {
        setMessages(prev => [...prev, message]);
    }, []);

    const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
        setMessages(prev =>
            prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg)
        );
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    const setQuiz = useCallback((questions: Question[] | null) => {
        setCurrentQuiz(questions);
    }, []);

    const setQuizActive = useCallback((active: boolean) => {
        setIsQuizActive(active);
    }, []);

    const updateStats = useCallback((updates: Partial<UserStats>) => {
        setStats(prev => ({ ...prev, ...updates }));
    }, []);

    return (
        <AppContext.Provider
            value={{
                score,
                tier,
                stats,
                activities,
                messages,
                currentQuiz,
                isQuizActive,
                scorePopup,
                isLoadingStore,
                addScore,
                addMessage,
                updateMessage,
                clearMessages,
                setQuiz,
                setQuizActive,
                updateStats,
                showScorePopup,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
