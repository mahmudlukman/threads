import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  addCommentToThread,
  createThread,
  deleteThread,
  getAllChildThreads,
  getThreadById,
  getThreads,
  likeThread,
} from "../controllers/thread.controller";
import limiter from "../utils/rateLimiter";
const threadRouter = express.Router();

threadRouter.post("/create-thread", isAuthenticated, createThread);
threadRouter.get("/threads", isAuthenticated, getThreads);
threadRouter.post("/comment", isAuthenticated, addCommentToThread);
threadRouter.get("/child-threads", isAuthenticated, getAllChildThreads);
threadRouter.get("/thread/:threadId", isAuthenticated, getThreadById);
threadRouter.delete("/delete-thread/:threadId", isAuthenticated, deleteThread);
threadRouter.put(
  "/like-thread/:threadId",
  isAuthenticated,
  limiter,
  likeThread
);

export default threadRouter;
