import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import type { StudyPlanRequest, StudyPlan, DifficultyLevel, DailyPlan, DailyTask } from '../types/index';

// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI Service
// ─────────────────────────────────────────────────────────────────────────────

class GeminiService {
  private readonly model: GenerativeModel;
  private readonly generationConfig: GenerationConfig;

  constructor() {
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set. Please configure it in your .env file.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    this.generationConfig = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    };

    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: this.generationConfig,
    });
  }

  /**
   * Generates a comprehensive, structured study plan using the Gemini AI model.
   * Enforces strict JSON output format via system instructions.
   *
   * @param subject - The topic/subject to study (e.g., "Machine Learning", "React")
   * @param timeframeDays - Number of days for the study plan (1-365)
   * @param currentLevel - Learner's current proficiency level
   * @returns A fully typed StudyPlan object
   * @throws Error with descriptive message if generation fails
   */
  async generateStudyPlan(
    subject: string,
    timeframeDays: number,
    currentLevel: DifficultyLevel
  ): Promise<StudyPlan> {
    // Input validation
    if (!subject || subject.trim().length === 0) {
      throw new Error('Subject cannot be empty.');
    }
    if (timeframeDays < 1 || timeframeDays > 365) {
      throw new Error('Timeframe must be between 1 and 365 days.');
    }
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(currentLevel)) {
      throw new Error('Invalid difficulty level. Must be Beginner, Intermediate, or Advanced.');
    }

    const safeSubject = subject.trim().substring(0, 100);
    const today = new Date();

    const prompt = this.buildPrompt(safeSubject, timeframeDays, currentLevel, today);

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;

      if (!response) {
        throw new Error('No response received from Gemini API.');
      }

      const rawText = response.text();

      if (!rawText || rawText.trim().length === 0) {
        throw new Error('Empty response received from Gemini API.');
      }

      // Parse and validate the JSON response
      const parsedPlan = this.parseAndValidateResponse(rawText, safeSubject, timeframeDays, currentLevel);
      return parsedPlan;
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Re-throw known errors with context
        if (error.message.includes('API_KEY') || error.message.includes('quota') || error.message.includes('rate')) {
          throw new Error(`Gemini API authentication/quota error: ${error.message}`);
        }
        if (error.message.includes('JSON') || error.message.includes('parse')) {
          throw new Error(`Failed to parse AI response as valid JSON: ${error.message}`);
        }
        throw new Error(`Study plan generation failed: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while generating the study plan.');
    }
  }

  /**
   * Builds the structured prompt with strict JSON schema instructions.
   */
  private buildPrompt(
    subject: string,
    timeframeDays: number,
    currentLevel: DifficultyLevel,
    startDate: Date
  ): string {
    const dateStr = startDate.toISOString().split('T')[0] ?? startDate.toDateString();

    return `You are an expert educational curriculum designer and AI tutor. Create a comprehensive, personalized study plan.

STRICT REQUIREMENTS:
- Output ONLY valid JSON matching the exact schema below
- No markdown, no code blocks, no extra text
- Generate exactly ${timeframeDays} daily plans
- Each day must have 2-4 specific, actionable tasks
- Tasks must be progressive and build on previous days

INPUT:
- Subject: "${subject}"
- Duration: ${timeframeDays} days
- Current Level: ${currentLevel}
- Start Date: ${dateStr}

REQUIRED JSON SCHEMA (output this exact structure):
{
  "subject": "string",
  "timeframeDays": number,
  "currentLevel": "Beginner" | "Intermediate" | "Advanced",
  "overallGoal": "string (compelling description of what they'll achieve)",
  "weeklyMilestones": ["milestone1", "milestone2", ...],
  "dailyPlans": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "theme": "string (day's learning theme)",
      "dailyGoal": "string (what they'll accomplish today)",
      "totalEstimatedMinutes": number,
      "tasks": [
        {
          "taskId": "string (unique, e.g. 'day1-task1')",
          "title": "string",
          "description": "string (detailed, actionable description)",
          "estimatedMinutes": number,
          "resourceType": "reading" | "video" | "practice" | "project" | "review",
          "priority": "high" | "medium" | "low"
        }
      ]
    }
  ],
  "tips": ["tip1", "tip2", "tip3", "tip4", "tip5"]
}

Generate a highly personalized, practical study plan for ${currentLevel} learners studying "${subject}" for ${timeframeDays} days. Ensure tasks are specific, actionable, and appropriately paced for ${currentLevel} level.`;
  }

  /**
   * Parses raw JSON text and validates it conforms to the StudyPlan schema.
   * Falls back gracefully and adds missing fields where possible.
   */
  private parseAndValidateResponse(
    rawText: string,
    subject: string,
    timeframeDays: number,
    currentLevel: DifficultyLevel
  ): StudyPlan {
    let parsed: unknown;

    try {
      // Try direct parse first
      parsed = JSON.parse(rawText);
    } catch {
      // Attempt to extract JSON from possible surrounding text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract valid JSON from AI response.');
      }
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error('AI response contains malformed JSON that could not be repaired.');
      }
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('AI response is not a valid JSON object.');
    }

    const obj = parsed as Record<string, unknown>;

    // Validate and coerce the structure
    const studyPlan: StudyPlan = {
      subject: typeof obj['subject'] === 'string' ? obj['subject'] : subject,
      timeframeDays: typeof obj['timeframeDays'] === 'number' ? obj['timeframeDays'] : timeframeDays,
      currentLevel: this.validateLevel(obj['currentLevel']) ?? currentLevel,
      overallGoal: typeof obj['overallGoal'] === 'string' ? obj['overallGoal'] : `Master ${subject} in ${timeframeDays} days`,
      weeklyMilestones: Array.isArray(obj['weeklyMilestones'])
        ? (obj['weeklyMilestones'] as unknown[]).filter((m): m is string => typeof m === 'string')
        : [],
      dailyPlans: this.validateDailyPlans(obj['dailyPlans']),
      tips: Array.isArray(obj['tips'])
        ? (obj['tips'] as unknown[]).filter((t): t is string => typeof t === 'string')
        : [],
      generatedAt: new Date().toISOString(),
    };

    if (studyPlan.dailyPlans.length === 0) {
      throw new Error('AI generated a study plan with no daily plans. Please try again.');
    }

    return studyPlan;
  }

  private validateLevel(level: unknown): DifficultyLevel | null {
    if (level === 'Beginner' || level === 'Intermediate' || level === 'Advanced') {
      return level;
    }
    return null;
  }

  private validateDailyPlans(rawPlans: unknown): DailyPlan[] {
    if (!Array.isArray(rawPlans)) return [];

    return rawPlans
      .filter((plan): plan is Record<string, unknown> => typeof plan === 'object' && plan !== null)
      .map((plan, index) => ({
        day: typeof plan['day'] === 'number' ? plan['day'] : index + 1,
        date: typeof plan['date'] === 'string' ? plan['date'] : '',
        theme: typeof plan['theme'] === 'string' ? plan['theme'] : `Day ${index + 1}`,
        dailyGoal: typeof plan['dailyGoal'] === 'string' ? plan['dailyGoal'] : '',
        totalEstimatedMinutes: typeof plan['totalEstimatedMinutes'] === 'number' ? plan['totalEstimatedMinutes'] : 60,
        tasks: this.validateTasks(plan['tasks']),
      }));
  }

  private validateTasks(rawTasks: unknown): DailyTask[] {
    if (!Array.isArray(rawTasks)) return [];

    return rawTasks
      .filter((task): task is Record<string, unknown> => typeof task === 'object' && task !== null)
      .map((task, index) => ({
        taskId: typeof task['taskId'] === 'string' ? task['taskId'] : `task-${index}`,
        title: typeof task['title'] === 'string' ? task['title'] : 'Study Task',
        description: typeof task['description'] === 'string' ? task['description'] : '',
        estimatedMinutes: typeof task['estimatedMinutes'] === 'number' ? task['estimatedMinutes'] : 30,
        resourceType: this.validateResourceType(task['resourceType']),
        priority: this.validatePriority(task['priority']),
      }));
  }

  private validateResourceType(type: unknown): DailyTask['resourceType'] {
    const validTypes = ['reading', 'video', 'practice', 'project', 'review'] as const;
    if (typeof type === 'string' && validTypes.includes(type as (typeof validTypes)[number])) {
      return type as DailyTask['resourceType'];
    }
    return 'reading';
  }

  private validatePriority(priority: unknown): DailyTask['priority'] {
    if (priority === 'high' || priority === 'medium' || priority === 'low') {
      return priority;
    }
    return 'medium';
  }
}

// Singleton instance
export const geminiService = new GeminiService();

export type { StudyPlanRequest };
