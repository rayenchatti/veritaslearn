// Tier types
export enum TierType {
    SEEKER = 'SEEKER',
    EXPLORER = 'EXPLORER',
    SCHOLAR = 'SCHOLAR',
    MASTER = 'MASTER',
    LEGEND = 'LEGEND',
    TITAN = 'TITAN'
}

// Tier configuration
export interface TierConfig {
    name: string;
    minScore: number;
    maxScore: number;
    icon: string;
    color: string;
    gradient: string;
}

export const TIER_CONFIG: Record<TierType, TierConfig> = {
    [TierType.SEEKER]: {
        name: 'Seeker',
        minScore: 0,
        maxScore: 499,
        icon: '🌱',
        color: 'text-green-500',
        gradient: 'tier-seeker'
    },
    [TierType.EXPLORER]: {
        name: 'Explorer',
        minScore: 500,
        maxScore: 1199,
        icon: '🔍',
        color: 'text-blue-500',
        gradient: 'tier-explorer'
    },
    [TierType.SCHOLAR]: {
        name: 'Scholar',
        minScore: 1200,
        maxScore: 2499,
        icon: '📚',
        color: 'text-purple-500',
        gradient: 'tier-scholar'
    },
    [TierType.MASTER]: {
        name: 'Master',
        minScore: 2500,
        maxScore: 4999,
        icon: '⚡',
        color: 'text-yellow-500',
        gradient: 'tier-master'
    },
    [TierType.LEGEND]: {
        name: 'Legend',
        minScore: 5000,
        maxScore: 9999,
        icon: '👑',
        color: 'text-gray-400',
        gradient: 'tier-legend'
    },
    [TierType.TITAN]: {
        name: 'Titan',
        minScore: 10000,
        maxScore: Infinity,
        icon: '🌟',
        color: 'text-pink-500',
        gradient: 'tier-titan'
    }
};

// Message types
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    locked: boolean;
    timestamp: Date;
    unlocked?: boolean;
    humanizedContent?: string;
    studyData?: any;
    quizCompleted?: boolean;
}

// Quiz types
export interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    timeLimit: number;
}

export interface QuizState {
    questions: Question[];
    currentQuestionIndex: number;
    answers: (number | null)[];
    score: number;
    isComplete: boolean;
    startTime: Date | null;
}

// User types
export interface UserStats {
    questionsAnswered: number;
    quizPassRate: number;
    currentStreak: number;
    aiRelianceDecrease: number;
    totalStudyTime: number;
}

export interface User {
    id: string;
    name: string;
    score: number;
    tier: TierType;
    stats: UserStats;
    createdAt: Date;
}

// Score event
export interface ScoreEvent {
    points: number;
    reason: string;
    timestamp: Date;
}

// Leaderboard entry
export interface LeaderboardEntry {
    rank: number;
    name: string;
    university?: string;
    tier: TierType;
    score: number;
    avatar: string;
    isCurrentUser?: boolean;
}

// Conversation
export interface Conversation {
    id: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

// Activity log
export interface Activity {
    id: string;
    type: 'quiz_pass' | 'quiz_fail' | 'copy' | 'question';
    description: string;
    points: number;
    timestamp: Date;
}
