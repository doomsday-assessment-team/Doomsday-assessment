import express, { Request, Response, NextFunction } from "express";
import { loginUser } from "../repositories/login.user";
import { validateParamsWithMessage } from "../utils/parameter-validation";
import { ErrorResponse } from "../types/error-response";
import { transformAssessmentHistoryDetails } from "../services/user.service";
import { getUserAssessmentSummaries } from "../repositories/user.repository";

const router = express.Router();

router.get("/me", (req, res) => {
  const user = req.user;
  res.json({ user });
});

router.get("/roles", (req, res) => {
  const roles = req.user?.roles;
  res.json(roles);
});

router.post("/login", async (req, res) => {
  if (req.user) {
    const result = await loginUser(
      req.user?.given_name,
      req.user?.family_name,
      req.user?.google_subject
    );
    res.status(200).send(result);
    return;
  }

  res
    .status(401)
    .json({ error: "Unauthorized: Could not log in successfully." });
});

router.get(
  "/assessment-summary",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationError = validateParamsWithMessage(req.query, [
        { name: "scenario", type: "number", required: false },
        { name: "difficulty", type: "number", required: false },
        { name: "start_date", type: "string", required: false },
        { name: "end_date", type: "string", required: false },
        { name: "order_by", type: "boolean", required: false },
      ]);

      if (validationError) {
        const errorResponse: ErrorResponse = {
          error: "ValidationError",
          message: validationError,
        };
        res.status(400).json(errorResponse);
      } else {
        const userId = req.user?.user_id;
        if (!userId) {
          res.status(400).json({
            error: "ValidationError",
            message: "User does not exist in database",
          });
        } else {
          const scenario = req.query.scenario
            ? Number(req.query.scenario)
            : undefined;
          const difficulty = req.query.difficulty
            ? Number(req.query.difficulty)
            : undefined;
          const startDate = req.query.start_date as string | undefined;
          const endDate = req.query.end_date as string | undefined;
          const orderBy = req.query.order_by as boolean | undefined;

          const result = await getUserAssessmentSummaries(
            userId,
            scenario,
            difficulty,
            startDate,
            endDate
          );
          res.json(result);
        }
      }
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/assessment-details",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationError = validateParamsWithMessage(req.query, [
        { name: "history_id", type: "number", required: true },
      ]);

      if (validationError) {
        const errorResponse: ErrorResponse = {
          error: "ValidationError",
          message: validationError,
        };
        res.status(400).json(errorResponse);
      } else {
        const userId = req.user?.user_id;
        if (!userId) {
          res.status(400).json({
            error: "ValidationError",
            message: "User does not exist in database",
          });
        } else {
          const historyId = Number(req.query.history_id);
          const result = await transformAssessmentHistoryDetails(historyId);
          res.json(result);
        }
      }
    } catch (error) {
      next(error);
    }
  }
);

router.get('/get-ip', async (req, res) => {
  res.send({ ip: req.ip });
});

export default router;
