/**
 * api.js — SilentChat API utility
 * All communication with the FastAPI backend is centralized here.
 * Never call Ollama directly from the frontend.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Check if the backend is reachable.
 * Calls GET /health and returns true if successful.
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Send a chat message to the backend.
 * @param {string} message - The current user message
 * @param {Array} history - Previous messages [{role, content}, ...]
 * @returns {Promise<{reply: string, model: string}>}
 */
export async function sendChatMessage(message, history) {
  let response;

  try {
    response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: history.map(({ role, content }) => ({ role, content })),
      }),
      signal: AbortSignal.timeout(120000), // 2-minute timeout for long responses
    });
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('Request timed out. The model may be taking too long to respond.');
    }
    throw new Error(
      'Cannot reach the SilentChat backend. Make sure it is running on ' + BASE_URL,
    );
  }

  if (response.status === 422) {
    let detail = 'Invalid request format.';
    try {
      const body = await response.json();
      if (body.detail) {
        detail =
          typeof body.detail === 'string'
            ? body.detail
            : JSON.stringify(body.detail);
      }
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(`Validation error: ${detail}`);
  }

  if (response.status === 503) {
    throw new Error(
      'The AI model is not available. Make sure Ollama is running and the model is loaded.',
    );
  }

  if (!response.ok) {
    let errorMessage = `Server error (${response.status})`;
    try {
      const body = await response.json();
      if (body.detail) {
        errorMessage = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(errorMessage);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Received a malformed response from the backend.');
  }

  if (typeof data.reply !== 'string') {
    throw new Error(
      'Unexpected response format from backend: missing "reply" field.',
    );
  }

  return {
    reply: data.reply,
    model: data.model || 'unknown',
  };
}
