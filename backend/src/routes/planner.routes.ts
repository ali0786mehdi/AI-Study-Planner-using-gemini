import { Router } from 'express';
import { generateStudyPlan } from '../controllers/planner.controller';

// ─────────────────────────────────────────────────────────────────────────────
// Planner Router
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

/**
 * @route   POST /api/planner/generate
 * @desc    Generate an AI-powered study plan
 * @access  Public (Rate limited in production)
 * @body    { subject: string, timeframeDays: number, currentLevel: 'Beginner' | 'Intermediate' | 'Advanced' }
 */
router.post('/generate', generateStudyPlan);

/**
 * @route   GET /api/planner/health
 * @desc    Health check for the planner service
 * @access  Public
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Planner service is operational',
    timestamp: new Date().toISOString(),
  });
});

export default router;
