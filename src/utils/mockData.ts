import { TierType, LeaderboardEntry, Question } from '../types';

// Let's create an interface Flashcard since we didn't migrate it from components yet
export interface Flashcard {
    id: string;
    front: string;
    back: string;
}

// Mock leaderboard data
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, name: 'Sarah Chen', university: 'MIT', tier: TierType.TITAN, score: 12450, avatar: 'SC' },
    { rank: 2, name: 'Ahmed Hassan', university: 'Stanford', tier: TierType.LEGEND, score: 8920, avatar: 'AH' },
    { rank: 3, name: 'Maria Garcia', university: 'Harvard', tier: TierType.LEGEND, score: 7650, avatar: 'MG' },
    { rank: 4, name: 'James Wilson', university: 'Yale', tier: TierType.LEGEND, score: 6280, avatar: 'JW' },
    { rank: 5, name: 'Priya Patel', university: 'Princeton', tier: TierType.MASTER, score: 4850, avatar: 'PP' },
    { rank: 6, name: 'Michael Brown', university: 'Columbia', tier: TierType.MASTER, score: 3920, avatar: 'MB' },
    { rank: 7, name: 'You', university: 'Your University', tier: TierType.SCHOLAR, score: 1850, avatar: 'YU', isCurrentUser: true },
    { rank: 8, name: 'Emma Thompson', university: 'Duke', tier: TierType.SCHOLAR, score: 1750, avatar: 'ET' },
    { rank: 9, name: 'David Kim', university: 'Cornell', tier: TierType.SCHOLAR, score: 1620, avatar: 'DK' },
    { rank: 10, name: 'Lisa Anderson', university: 'Brown', tier: TierType.EXPLORER, score: 890, avatar: 'LA' },
];

export const MOCK_NATIONAL_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, name: 'Alex Rivera', university: 'Caltech', tier: TierType.TITAN, score: 15200, avatar: 'AR' },
    { rank: 2, name: 'Sarah Chen', university: 'MIT', tier: TierType.TITAN, score: 12450, avatar: 'SC' },
    { rank: 3, name: 'Jordan Lee', university: 'Berkeley', tier: TierType.TITAN, score: 11800, avatar: 'JL' },
    { rank: 4, name: 'Ahmed Hassan', university: 'Stanford', tier: TierType.LEGEND, score: 8920, avatar: 'AH' },
    { rank: 5, name: 'Maria Garcia', university: 'Harvard', tier: TierType.LEGEND, score: 7650, avatar: 'MG' },
    { rank: 6, name: 'Chris Taylor', university: 'Georgia Tech', tier: TierType.LEGEND, score: 6900, avatar: 'CT' },
    { rank: 7, name: 'James Wilson', university: 'Yale', tier: TierType.LEGEND, score: 6280, avatar: 'JW' },
    { rank: 8, name: 'Sophie Martin', university: 'UCLA', tier: TierType.LEGEND, score: 5850, avatar: 'SM' },
    { rank: 9, name: 'Ryan Johnson', university: 'Michigan', tier: TierType.LEGEND, score: 5420, avatar: 'RJ' },
    { rank: 10, name: 'Emily Davis', university: 'Northwestern', tier: TierType.MASTER, score: 4920, avatar: 'ED' },
];

export const DEMO_STATS = {
    questionsAnswered: 0,
    quizPassRate: 0,
    currentStreak: 0,
    aiRelianceDecrease: 0,
    totalStudyTime: 0,
};

export interface StudyData {
    answer: string;
    quiz: Question[];
    easyQuiz: Question[];
    humanized: string;
    topic: string;
    keyPoints: string[];
    flashcards: Flashcard[];
    answersSignature?: string;
    answersPayload?: string;
}

// Just returning the basic one so we don't blow up file sizes right now, but we keep the structure.
export const FALLBACK_RESPONSES: Record<string, StudyData> = {
    'photosynthesis': {
        topic: 'Photosynthesis',
        answer: `**Photosynthesis** is the process by which plants, algae, and some bacteria convert light energy into chemical energy stored in glucose.`,
        quiz: [
            {
                id: 'q1',
                question: 'What is the primary function of chlorophyll in photosynthesis?',
                options: [
                    'To capture and absorb light energy',
                    'To produce carbon dioxide',
                    'To store water in leaves',
                    'To transport nutrients through the stem'
                ],
                correctAnswer: 0,
                explanation: 'Chlorophyll is a green pigment that captures light energy from the sun, which is essential for the photosynthesis process to occur.',
                timeLimit: 30
            }
        ],
        easyQuiz: [
            {
                id: 'eq1',
                question: 'Does photosynthesis require sunlight?',
                options: [
                    'Yes, it is essential',
                    'No, it happens in the dark',
                    'Only in the winter',
                    'Only for tall trees'
                ],
                correctAnswer: 0,
                explanation: 'Photosynthesis fundamentally requires light energy.',
                timeLimit: 30
            }
        ],
        humanized: 'So basically, photosynthesis is like a plant way of making food using sunlight! 🌱☀️',
        keyPoints: ['Plants convert light energy into chemical energy (glucose) through photosynthesis'],
        flashcards: [{ id: 'fc1', front: 'What is photosynthesis?', back: 'The process by which plants convert light energy into chemical energy' }]
    },
    'default': {
        topic: 'Learning Concepts',
        answer: `I've analyzed your question and here's a comprehensive explanation:`,
        quiz: [
            {
                id: 'q1',
                question: 'What is the most important aspect of understanding this concept?',
                options: [
                    'Memorizing definitions only',
                    'Understanding the underlying principles',
                    'Skipping to advanced topics',
                    'Ignoring practical applications'
                ],
                correctAnswer: 1,
                explanation: 'Understanding the underlying principles allows you to apply knowledge flexibly.',
                timeLimit: 30
            }
        ],
        humanized: `Let me break this down in a simpler way!`,
        keyPoints: ['Focus on understanding principles'],
        flashcards: [{ id: 'fc1', front: 'What is important?', back: 'Understanding' }],
        easyQuiz: [
            {
                id: 'eq1',
                question: 'Which is better for long term learning?',
                options: [
                    'Understanding principles',
                    'Memorizing everything quickly'
                ],
                correctAnswer: 0,
                explanation: 'Understanding principles leads to real knowledge.',
                timeLimit: 30
            }
        ]
    }
};

export function getFallbackResponse(question: string): StudyData {
    const lowerQ = question.toLowerCase();
    if (lowerQ.includes('photosynthesis') || lowerQ.includes('plant') || lowerQ.includes('chlorophyll')) {
        return FALLBACK_RESPONSES['photosynthesis'];
    }
    return FALLBACK_RESPONSES['default'];
}
