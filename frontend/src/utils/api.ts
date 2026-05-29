import type { StudyPlanRequest, StudyPlan, ApiResponse } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// API Utility — Clean fetch abstraction for the Study Planner backend
// ─────────────────────────────────────────────────────────────────────────────


const BASE_URL = import.meta.env['VITE_API_URL'] ?? 'https://ai-study-planner-using-gemini-production.up.railway.app';

/**
 * Network-safe fetch wrapper with typed response, timeout, and error handling.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000); // 2 min timeout for AI calls

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    // Parse JSON regardless of status code to get error messages
    const data = await response.json() as ApiResponse<T>;

    if (!response.ok) {
      return {
        success: false,
        error: data.error ?? `HTTP ${response.status}`,
        message: data.message ?? `Request failed with status ${response.status}`,
      };
    }

    return data;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        error: 'RequestTimeout',
        message: 'The request timed out. The AI is taking too long. Please try again.',
      };
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'NetworkError',
        message: `Network Error: Could not connect to the server at ${BASE_URL}. Check console for CORS or network issues.`,
      };
    }

    const message = error instanceof Error ? error.message : 'An unknown network error occurred.';
    return {
      success: false,
      error: 'UnknownError',
      message,
    };
  }
}

/**
 * Generates a study plan by posting the request to the backend AI endpoint.
 */
export async function generateStudyPlan(
  request: StudyPlanRequest
): Promise<ApiResponse<StudyPlan>> {
  return apiFetch<StudyPlan>('/api/planner/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Checks backend health status.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const result = await apiFetch<{ message: string }>('/api/health');
    return result.success;
  } catch {
    return false;
  }
}
