import express from "express";
import { viewThread } from "../controllers/interaction.controller";
import { isAuthenticated } from "../middleware/auth";

const interactionRouter = express.Router();

interactionRouter.get("/view-thread/:threadId", isAuthenticated, viewThread);

export default interactionRouter;
