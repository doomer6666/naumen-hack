import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import {
  getDirectoryUsers,
  getDirectoryTree,
} from "../controllers/directory.controller";
import { getMyPlan, updateMyTask } from "../controllers/plan.controller";
import {
  getNextFeedback,
  submitFeedback,
} from "../controllers/feedback.controller";
import {
  getLeaderboard,
  getMyProgress,
} from "../controllers/gamification.controller";
import {
  getAnalytics,
  getTemplates,
  createTemplate,
  assignPlan,
  getFeedbacks,
  hrUpdateTask,
  getEmployees,
  deleteTemplate,
  updateMentor,
  getEmployeePlan,
  getTemplateById,
  updateTemplate,
} from "../controllers/hr.controller";
import {
  jiraWebhook,
  jiraConnect,
} from "../controllers/integration.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getMyMentees,
  getPendingReviews,
  reviewTask,
} from "../controllers/mentor.controller";
import {
  getAvailableBadges,
  getMyBadges,
} from "../controllers/badge.controller";

const router = Router();

//Auth
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

//Directory
router.get("/directory/users", authMiddleware, getDirectoryUsers);
router.get("/directory/tree", authMiddleware, getDirectoryTree);

//Employee Plans
router.get("/plans/my", authMiddleware, getMyPlan);
router.patch("/plans/my/tasks/:taskId", authMiddleware, updateMyTask);

//Feedback
router.get("/feedback/next", authMiddleware, getNextFeedback);
router.post("/feedback/submit", authMiddleware, submitFeedback);

//Gamification
router.get("/gamification/my-progress", authMiddleware, getMyProgress);
router.get("/gamification/leaderboard", authMiddleware, getLeaderboard);
router.get("/badges/available", authMiddleware, getAvailableBadges);
router.get("/badges/my", authMiddleware, getMyBadges);

//HR Panel
router.get("/hr/analytics", authMiddleware, getAnalytics);
router.get("/hr/templates", authMiddleware, getTemplates);
router.post("/hr/users/:id/assign-plan", authMiddleware, assignPlan);
router.patch("/hr/users/:id/plan/tasks/:taskId", authMiddleware, hrUpdateTask);
router.get("/hr/feedbacks", authMiddleware, getFeedbacks);
router.get("/hr/employees", authMiddleware, getEmployees);
router.delete("/hr/templates/:id", authMiddleware, deleteTemplate);
router.get("/hr/employees/:id/plan", authMiddleware, getEmployeePlan);
router.patch("/hr/employees/:id/plan", authMiddleware, updateMentor);
router.post("/hr/templates", authMiddleware, createTemplate);
router.get("/hr/templates/:id", authMiddleware, getTemplateById);
router.put("/hr/templates/:id", authMiddleware, updateTemplate);

//Integration
router.post("/webhooks/jira", jiraWebhook);
router.get("/integrations/jira/connect", authMiddleware, jiraConnect);

// === Mentor ===
router.get("/mentor/my-mentees", authMiddleware, getMyMentees);
router.post("/mentor/tasks/:taskId/review", authMiddleware, reviewTask);
router.get("/mentor/reviews", authMiddleware, getPendingReviews);

export default router;
