import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Question } from '../../types';
import { Button } from '../ui/Button';
import { CheckCircle, XCircle, ChevronRight, Clock } from 'lucide-react-native';
import { useStyles, useTheme } from '../../theme/ThemeContext';

interface QuizInterfaceProps {
    questions: Question[];
    onComplete: (score: number, totalQuestions: number, userAnswers: number[]) => void;
}

export function QuizInterface({ questions, onComplete }: QuizInterfaceProps) {
    const styles = useStyles(createStyles);
    const { colors } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 30);
    const [timerActive, setTimerActive] = useState(true);

    // Guard against double-firing onComplete (e.g. double-tap on See Results)
    const hasCompletedRef = useRef(false);

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

    const handleTimeUp = useCallback(() => {
        if (!isAnswered) {
            setIsAnswered(true);
            setTimerActive(false);
        }
    }, [isAnswered]);

    useEffect(() => {
        if (timerActive && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timerActive && timeLeft === 0) {
            handleTimeUp();
            if (selectedAnswer === null) {
              setUserAnswers(prev => [...prev, -1]); // -1 represents missed/timeout
            }
        }
    }, [timerActive, timeLeft, handleTimeUp, selectedAnswer]);

    if (!currentQuestion) return null;

    const progress = ((currentIndex + 1) / questions.length) * 100;

    const handleSelectAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;

        setIsAnswered(true);
        setTimerActive(false);
        setUserAnswers(prev => [...prev, selectedAnswer]);

        if (selectedAnswer === currentQuestion.correctAnswer) {
            setCorrectAnswers(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setTimeLeft(questions[currentIndex + 1].timeLimit);
            setTimerActive(true);
        } else {
            // Quiz complete — guard against double-tap
            if (hasCompletedRef.current) return;
            hasCompletedRef.current = true;
            onComplete(correctAnswers, questions.length, userAnswers);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Progress header */}
            <View style={styles.progressHeader}>
                <View style={styles.progressTextRow}>
                    <Text style={styles.progressTextMain}>Question {currentIndex + 1} of {questions.length}</Text>
                    <Text style={styles.progressTextSub}>{correctAnswers} correct so far</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
                <Clock size={16} color={timeLeft < 10 ? colors.error : colors.textMuted} />
                <Text style={[styles.timerText, timeLeft < 10 && styles.timerTextDanger]}>
                    00:{timeLeft.toString().padStart(2, '0')}
                </Text>
            </View>

            {/* Question */}
            <View style={styles.questionCard}>
                <Text style={styles.questionText}>{currentQuestion.question}</Text>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrectAnswer = index === currentQuestion.correctAnswer;

                        let cardStyle: any[] = [styles.optionCard];
                        let textStyle: any[] = [styles.optionText];
                        let letterBgStyle: any[] = [styles.letterBg];
                        let letterTextStyle: any[] = [styles.letterText];

                        if (isAnswered) {
                            if (isCorrectAnswer) {
                                cardStyle.push(styles.optionCorrectBg);
                                textStyle.push(styles.textCorrect);
                                letterBgStyle.push(styles.bgCorrect);
                                letterTextStyle.push(styles.textWhite);
                            } else if (isSelected && !isCorrectAnswer) {
                                cardStyle.push(styles.optionWrongBg);
                                textStyle.push(styles.textWrong);
                                letterBgStyle.push(styles.bgWrong);
                                letterTextStyle.push(styles.textWhite);
                            } else {
                                cardStyle.push(styles.optionDisabled);
                            }
                        } else if (isSelected) {
                            cardStyle.push(styles.optionSelectedBg);
                            textStyle.push(styles.textSelected);
                            letterBgStyle.push(styles.bgSelected);
                            letterTextStyle.push(styles.textWhite);
                        }

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleSelectAnswer(index)}
                                disabled={isAnswered}
                                activeOpacity={0.7}
                                style={cardStyle}
                            >
                                <View style={letterBgStyle}>
                                    <Text style={letterTextStyle}>{String.fromCharCode(65 + index)}</Text>
                                </View>
                                <Text style={[textStyle, { flex: 1 }]}>{option}</Text>
                                
                                {isAnswered && isCorrectAnswer && (
                                    <CheckCircle size={20} color={colors.success} />
                                )}
                                {isAnswered && isSelected && !isCorrectAnswer && (
                                    <XCircle size={20} color={colors.error} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Explanation */}
            {isAnswered && (
                <View style={[styles.explanationBox, isCorrect ? styles.explanationBoxCorrect : styles.explanationBoxWrong]}>
                    <View style={styles.explanationHeader}>
                        {isCorrect ? (
                            <>
                                <CheckCircle size={20} color={colors.success} />
                                <Text style={styles.explanationTitleCorrect}>Correct!</Text>
                            </>
                        ) : (
                            <>
                                <XCircle size={20} color={colors.error} />
                                <Text style={styles.explanationTitleWrong}>
                                    {selectedAnswer === null ? "Time's up!" : 'Incorrect'}
                                </Text>
                            </>
                        )}
                    </View>
                    <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
                {!isAnswered ? (
                    <Button onPress={handleSubmit} disabled={selectedAnswer === null}>
                        Submit Answer
                    </Button>
                ) : (
                    <Button onPress={handleNext}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.nextBtnText}>
                                {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                            </Text>
                            <ChevronRight size={18} color="#ffffff" style={{ marginLeft: 4 }} />
                        </View>
                    </Button>
                )}
            </View>
        </ScrollView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        padding: 20,
    },
    content: {
        paddingBottom: 24,
    },
    progressHeader: {
        marginBottom: 16,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressTextMain: {
        fontWeight: '500',
        color: colors.text,
    },
    progressTextSub: {
        color: colors.textMuted,
        fontSize: 12,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: colors.borderLight,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primaryHover,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 16,
    },
    timerText: {
        color: colors.textMuted,
        fontWeight: 'bold',
    },
    timerTextDanger: {
        color: colors.error,
    },
    questionCard: {
        backgroundColor: colors.surfaceHighlight,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        gap: 12,
    },
    optionSelectedBg: {
        borderColor: colors.primaryHover,
        backgroundColor: colors.surfaceHighlight,
    },
    optionCorrectBg: {
        borderColor: colors.success,
        backgroundColor: colors.successBg,
    },
    optionWrongBg: {
        borderColor: colors.error,
        backgroundColor: colors.errorBg,
    },
    optionDisabled: {
        opacity: 0.6,
    },
    letterBg: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.borderLight, // equivalent to f3f4f6 originally
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgSelected: { backgroundColor: colors.primaryHover },
    bgCorrect: { backgroundColor: colors.success },
    bgWrong: { backgroundColor: colors.error },
    letterText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.textMuted,
    },
    textWhite: { color: '#ffffff' }, // typically want to maintain high contrast with the primary background
    optionText: {
        fontSize: 15,
        color: colors.text,
    },
    textSelected: { color: colors.primary },
    textCorrect: { color: colors.successBorder },
    textWrong: { color: colors.errorBorder },
    explanationBox: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
    },
    explanationBoxCorrect: {
        backgroundColor: colors.successBg,
        borderColor: colors.successBorder,
    },
    explanationBoxWrong: {
        backgroundColor: colors.errorBg,
        borderColor: colors.errorBorder,
    },
    explanationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    explanationTitleCorrect: {
        fontWeight: 'bold',
        color: colors.successBorder, // dark green
    },
    explanationTitleWrong: {
        fontWeight: 'bold',
        color: colors.errorBorder, // dark red
    },
    explanationText: {
        fontSize: 14,
        color: colors.textMuted,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    nextBtnText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
});
