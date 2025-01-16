import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  addCommentToThread,
  createThread,
  getThreads,
} from "../controllers/thread.controller";
const threadRouter = express.Router();

threadRouter.post("/create-thread", isAuthenticated, createThread);
threadRouter.get("/threads", isAuthenticated, getThreads);
threadRouter.post("/comment", isAuthenticated, addCommentToThread);

export default threadRouter;
