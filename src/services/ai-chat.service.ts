/**
 * AI Chat Service
 * Handles streaming AI chat communication with the backend
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetch as expoFetch } from "expo/fetch";
import { API_BASE_URL } from "../constants/config";

export interface StreamOptions {
  onChunk: (chunk: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

export interface ChatMessagePayload {
  role: "user" | "assistant";
  content: string;
}

/**
 * Get authentication token from storage
 */
async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem("accessToken");
}

/**
 * Send a message to the AI chat and stream the response
 * Uses expo/fetch for proper streaming support in React Native
 */
export async function streamAIChat(
  messages: ChatMessagePayload[],
  options: StreamOptions
): Promise<void> {
  const token = await getAuthToken();

  if (!token) {
    options.onError(new Error("Not authenticated. Please log in."));
    return;
  }

  try {
    const response = await expoFetch(`${API_BASE_URL}/customer/ai/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Request failed with status ${response.status}`
      );
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        options.onComplete(fullText);
        break;
      }

      // Decode the chunk and append to full text
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      options.onChunk(chunk);
    }
  } catch (error) {
    options.onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Non-streaming fallback: Waits for the complete response
 * Use this if streaming doesn't work in your environment
 */
export async function sendAIChatMessage(
  messages: ChatMessagePayload[]
): Promise<string> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Not authenticated. Please log in.");
  }

  const response = await expoFetch(`${API_BASE_URL}/customer/ai/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Request failed with status ${response.status}`
    );
  }

  return response.text();
}
