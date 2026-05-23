import type { Request, Response, NextFunction } from 'express';
import { geminiService } from '../services/gemini.service';
import type { StudyPlanRequest, ApiResponse, StudyPlan, DifficultyLevel } from '../types/index';

// ─────────────────────────────────────────────────────────────────────────────
// Planner Controller
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/planner/generate
 * Validates the request body and delegates to the Gemini service.
 */
export const generateStudyPlan = async (
  req: Request<object, ApiResponse<StudyPlan>, StudyPlanRequest>,
  res: Response<ApiResponse<StudyPlan>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { subject, timeframeDays, currentLevel } = req.body;

    // ── Input Validation ──────────────────────────────────────────────────────
    const errors: string[] = [];

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      errors.push('subject: Required string field is missing or empty.');
    }

    if (timeframeDays === undefined || timeframeDays === null) {
      errors.push('timeframeDays: Required numeric field is missing.');
    } else if (typeof timeframeDays !== 'number' || !Number.isInteger(timeframeDays)) {
      errors.push('timeframeDays: Must be an integer.');
    } else if (timeframeDays < 1 || timeframeDays > 365) {
      errors.push('timeframeDays: Must be between 1 and 365.');
    }

    const validLevels: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
    if (!currentLevel || !validLevels.includes(currentLevel as DifficultyLevel)) {
      errors.push(`currentLevel: Must be one of ${validLevels.join(', ')}.`);
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: errors.join(' | '),
      });
      return;
    }

    // ── Delegate to Service ───────────────────────────────────────────────────
    console.log(`[Planner] Generating plan: "${subject}" | ${timeframeDays} days | ${currentLevel}`);
    const startTime = Date.now();

    const studyPlan = await geminiService.generateStudyPlan(
      subject.trim(),
      timeframeDays,
      currentLevel as DifficultyLevel
    );

    const duration = Date.now() - startTime;
    console.log(`[Planner] Plan generated successfully in ${duration}ms`);

    res.status(200).json({
      success: true,
      data: studyPlan,
      message: `Study plan generated in ${duration}ms`,
    });
  } catch (error: unknown) {
    next(error); // Pass to global error handler
  }
};
