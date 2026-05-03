import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useApp } from '../../contexts/AppContext';
import { MessageBubble } from './MessageBubble';
import { Button } from '../ui/Button';
import { Send, Trash2 } from 'lucide-react-native';
import { generateStudyDataSecure } from '../../services/api';
import { Message } from '../../types';
import { useStyles, useTheme } from '../../theme/ThemeContext';

interface ChatInterfaceProps {
  onTakeQuiz: (messageId: string) => void;
  onCopyAnswer: (messageId: string) => void;
}

export function ChatInterface({ onTakeQuiz, onCopyAnswer }: ChatInterfaceProps) {
  const { messages, addMessage, clearMessages } = useApp();
  const styles = useStyles(createStyles);
  const { colors } = useTheme();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input.trim();



    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      locked: false,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateStudyDataSecure(currentInput, currentInput);

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.answer,
        locked: false, // Answer is immediately visible — lesson first!
        timestamp: new Date(),
        humanizedContent: response.humanized,
        studyData: response,
      };

      addMessage(assistantMessage);
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: error?.message || 'Sorry, I couldn\'t process that. Please try again.',
        locked: false,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (messageId: string) => {
    onCopyAnswer(messageId);
  };

  const suggestedQuestions = ['Explain photosynthesis', "Newton's First Law", 'What is gravity?'];

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.chatBoxContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>AI Learning Assistant</Text>
                        <Text style={styles.headerSubtitle}>Ask any question to start learning</Text>
                    </View>
                    {messages.length > 0 && (
                        <TouchableOpacity style={styles.clearBtn} onPress={clearMessages}>
                            <Trash2 size={16} color={colors.textMuted} />
                            <Text style={styles.clearBtnText}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Messages area */}
                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.messagesArea} 
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={scrollToBottom}
                >
                    {messages.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.iconContainer}>
                                <Send size={28} color={colors.primaryHover} />
                            </View>
                            <Text style={styles.emptyStateTitle}>Start a conversation</Text>
                            <Text style={styles.emptyStateText}>
                                Ask about any topic like "Explain photosynthesis" or "What is Newton's First Law?"
                            </Text>
                            <View style={styles.suggestionsContainer}>
                                {suggestedQuestions.map((q) => (
                                    <TouchableOpacity 
                                        key={q} 
                                        style={styles.suggestionBtn}
                                        onPress={() => setInput(q)}
                                    >
                                        <Text style={styles.suggestionText}>{q}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ) : (
                        messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                role={message.role}
                                content={message.quizCompleted
                                    ? (message.humanizedContent || message.content)
                                    : message.content}
                                hasStudyData={!!message.studyData}
                                quizCompleted={message.quizCompleted ?? false}
                                onTakeQuiz={() => onTakeQuiz(message.id)}
                                onCopyAnswer={() => handleCopyMessage(message.id)}
                            />
                        ))
                    )}

                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <View style={styles.loadingAvatar}>
                                <ActivityIndicator size="small" color={colors.textMuted} />
                            </View>
                            <View style={styles.loadingBubble}>
                                <Text style={styles.loadingText}>Generating lesson...</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Input area */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask a question..."
                        placeholderTextColor={colors.textMuted}
                        editable={!isLoading}
                        onSubmitEditing={handleSubmit}
                    />
                    <Button
                        size="icon"
                        variant="default"
                        onPress={handleSubmit}
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Send size={20} color="#fff" />}
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    chatBoxContainer: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontWeight: '600',
        fontSize: 16,
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: 12,
        color: colors.textMuted,
    },
    clearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    clearBtnText: {
        fontSize: 14,
        color: colors.textMuted,
    },
    messagesArea: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        flexGrow: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 24,
    },
    suggestionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    suggestionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 16,
    },
    suggestionText: {
        fontSize: 12,
        color: colors.text,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    loadingAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.borderLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingBubble: {
        backgroundColor: colors.background,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    loadingText: {
        color: colors.textMuted,
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        gap: 12,
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.text,
    },
});
