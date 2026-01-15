/**
 * AI Chat Screen
 * Chat interface with streaming AI responses and Markdown rendering
 */

import { ChatMessage, useAIChat } from "@/src/hooks/useAIChat";
import { useAuthCheck } from "@/src/hooks/useAuth";
import { useRouter } from "expo-router";
import { ArrowLeft, MessageCircle, Send, Trash2, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";

// Markdown styles for AI responses
const markdownStyles = StyleSheet.create({
  body: {
    color: "#1a1a1a",
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginTop: 12,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 19,
    fontWeight: "600",
    color: "#222",
    marginTop: 10,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    marginVertical: 4,
  },
  strong: {
    fontWeight: "700",
  },
  em: {
    fontStyle: "italic",
  },
  link: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  blockquote: {
    backgroundColor: "#f3f4f6",
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    paddingLeft: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  code_inline: {
    backgroundColor: "#f3f4f6",
    color: "#e83e8c",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: "#1e293b",
    color: "#e2e8f0",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  fence: {
    backgroundColor: "#1e293b",
    color: "#e2e8f0",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  list_item: {
    marginVertical: 2,
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    marginVertical: 8,
  },
  thead: {
    backgroundColor: "#f9fafb",
  },
  th: {
    padding: 8,
    fontWeight: "600",
  },
  td: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  hr: {
    backgroundColor: "#e5e7eb",
    height: 1,
    marginVertical: 12,
  },
});

// Animated Thinking Indicator
const ThinkingIndicator = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0.4)).current;

  const messages = [
    "Thinking...",
    "Gathering relevant data...",
    "Analyzing your request...",
    "Formulating response...",
    "Checking data integrity...",
  ];

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.Text style={[styles.thinkingText, { opacity }]}>
      {messages[msgIndex]}
    </Animated.Text>
  );
};

export default function AIChatScreen() {
  const router = useRouter();
  const { data: authData } = useAuthCheck();
  const { messages, isLoading, error, sendMessage, clearMessages, clearError } =
    useAIChat();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Check authentication
  useEffect(() => {
    if (authData && !authData.isAuthenticated) {
      router.replace("/login");
    }
  }, [authData, router]);

  // Auto-scroll to bottom when new messages arrive or content updates
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    if (inputText.trim() && !isLoading) {
      const messageToSend = inputText.trim();
      setInputText("");
      Keyboard.dismiss();
      sendMessage(messageToSend);
    }
  }, [inputText, isLoading, sendMessage]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {isUser ? (
          <Text style={styles.userText}>{item.content}</Text>
        ) : (
          <View style={styles.markdownContainer}>
            {!item.content && item.isStreaming ? (
              <ThinkingIndicator />
            ) : (
              <>
                <Markdown style={markdownStyles}>
                  {item.content || " "}
                </Markdown>
                {item.isStreaming && <Text style={styles.cursor}>▊</Text>}
              </>
            )}
          </View>
        )}
      </View>
    );
  }, []);

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <MessageCircle size={64} color="#007AFF" strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>RoomMaster AI Assistant</Text>
        <Text style={styles.emptyText}>
          Ask me anything about rooms, bookings, promotions, or hotel services!
        </Text>
        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionTitle}>Try asking:</Text>
          {[
            "What rooms are available this weekend?",
            "Show me rooms with ocean view",
            "What promotions are available?",
          ].map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionButton}
              onPress={() => {
                setInputText(suggestion);
              }}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <MessageCircle size={20} color="#007AFF" />
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={clearMessages}
          disabled={messages.length === 0}
        >
          <Trash2 size={22} color={messages.length === 0 ? "#ccc" : "#666"} />
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.errorDismiss}>
            <X size={18} color="#c62828" />
          </TouchableOpacity>
        </View>
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.messageList,
          messages.length === 0 && styles.messageListEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
            maxLength={2000}
            editable={!isLoading}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#fecaca",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    padding: 4,
    marginLeft: 8,
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  messageListEmpty: {
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  userText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  markdownContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  cursor: {
    color: "#007AFF",
    fontSize: 16,
    marginLeft: 2,
    opacity: 0.8,
  },
  thinkingText: {
    color: "#666",
    fontSize: 15,
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  suggestionContainer: {
    width: "100%",
    alignItems: "stretch",
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  suggestionButton: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  suggestionText: {
    color: "#007AFF",
    fontSize: 14,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: "#f3f4f6",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: "#1a1a1a",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
});
