/**
 * AI Chat Hook
 * Manages chat state and handles streaming AI responses
 * NOW SUPPORTS: Persistence and sending full context
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { streamAIChat } from "../services/ai-chat.service";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  timestamp: Date;
}

export interface UseAIChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

const STORAGE_KEY = "room_master_chat_history";

export function useAIChat(): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentAssistantMsgId = useRef<string | null>(null);
  const isLoadedRef = useRef(false);

  // Load persistence on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Convert timestamp strings back to Date objects
            const hydrated = parsed.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
            setMessages(hydrated);
            return;
          }
        }

        // Seed with welcome message if no history or empty history
        const welcomeMessage: ChatMessage = {
          id: "welcome-message",
          role: "assistant",
          content:
            "### Welcome to Room Master! 🏨\n\nI'm your **AI concierge**. I can help you with:\n\n* Checking room availability 🛏️\n* Finding the best deals 🏷️\n* Managing your bookings 📅\n\n**How can I help you today?**",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      } catch (e) {
        console.error("Failed to load chat history", e);
      } finally {
        isLoadedRef.current = true;
      }
    }
    loadHistory();
  }, []);

  // Save persistence when messages change
  // We use a debounce or just save every time since chat volume is low
  useEffect(() => {
    if (!isLoadedRef.current) return; // Don't save empty state over storage on init

    async function saveHistory() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error("Failed to save chat history", e);
      }
    }
    saveHistory();
  }, [messages]);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      setError(null);
      setIsLoading(true);

      // Generate unique IDs for messages
      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `assistant-${Date.now() + 1}`;
      currentAssistantMsgId.current = assistantMsgId;

      // Add user message immediately
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };

      // Add placeholder for assistant message
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        isStreaming: true,
        timestamp: new Date(),
      };

      // Create new history for UI
      const newHistory = [...messages, userMsg, assistantMsg];
      setMessages(newHistory);

      // Prepare context for API:
      // Exclude the empty assistant message and map to simplified format
      // Note: We need to include the NEW user message but NOT the empty assistant holder
      const apiContext = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        await streamAIChat(apiContext, {
          onChunk: (chunk) => {
            // Update the assistant message with each chunk
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            );
          },
          onComplete: (fullText) => {
            // Mark streaming as complete
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, content: fullText, isStreaming: false }
                  : msg
              )
            );
            setIsLoading(false);
            currentAssistantMsgId.current = null;
          },
          onError: (err) => {
            setError(err.message);
            // Remove the empty assistant message on error
            setMessages((prev) =>
              prev.filter((msg) => msg.id !== assistantMsgId)
            );
            setIsLoading(false);
            currentAssistantMsgId.current = null;
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        // Remove the empty assistant message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMsgId));
        setIsLoading(false);
        currentAssistantMsgId.current = null;
      }
    },
    [isLoading, messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    currentAssistantMsgId.current = null;
    AsyncStorage.removeItem(STORAGE_KEY).catch((e) =>
      console.error("Failed to clear chat history", e)
    );
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    clearError,
  };
}
