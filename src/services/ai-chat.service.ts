/**
 * AI Chat Service
 * Handles streaming AI chat communication with the backend
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
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
 * Uses XMLHttpRequest for reliable streaming on React Native
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

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/customer/ai/chat`);

    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Accept", "text/event-stream");
    xhr.setRequestHeader("Cache-Control", "no-cache");

    let lastIndex = 0;
    let fullText = "";
    let buffer = "";

    xhr.onprogress = () => {
      // Get the new part of the response
      const response = xhr.responseText;
      const newContent = response.substring(lastIndex);
      lastIndex = response.length;

      // Add to buffer
      buffer += newContent;

      // Process complete lines
      const lines = buffer.split("\n");
      // The last element is either empty (if ended with \n) or incomplete line
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;

        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          if (data === "[DONE]") {
            // End of stream
            xhr.abort();
            options.onComplete(fullText);
            resolve();
            return;
          }

          try {
            // The backend sends content as a JSON string to preserve newlines
            let chunk = data;
            try {
              if (data.startsWith('"')) {
                chunk = JSON.parse(data);
              }
            } catch (jsonError) {
              // If it's not valid JSON, treat as raw text (fallback)
              console.warn(
                "Failed to parse chunk as JSON, using raw",
                jsonError
              );
            }

            fullText += chunk;
            options.onChunk(chunk);
          } catch (e) {
            console.warn("Error processing chunk:", e);
          }
        }
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // If we finished without seeing [DONE], treating as success
        if (buffer.startsWith("data: ") && buffer.length > 6) {
          // Try to process remaining buffer if it looks like data
          const data = buffer.slice(6);
          if (data !== "[DONE]") {
            fullText += data;
            options.onChunk(data);
          }
        }
        options.onComplete(fullText);
        resolve();
      } else {
        const error = new Error(`Request failed with status ${xhr.status}`);
        options.onError(error);
        reject(error);
      }
    };

    xhr.onerror = () => {
      const error = new Error("Network request failed");
      options.onError(error);
      reject(error);
    };

    xhr.send(JSON.stringify({ messages }));
  });
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

  const response = await fetch(`${API_BASE_URL}/customer/ai/chat`, {
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
