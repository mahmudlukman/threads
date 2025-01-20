import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  getActivity,
  getLoggedInUser,
  getSavedThreads,
  getUserById,
  getUsers,
  getUserThreads,
  toggleSaveThread,
  updateUser,
} from "../controllers/user.controller";
const userRouter = express.Router();

userRouter.get("/me", isAuthenticated, getLoggedInUser);
userRouter.get("/get-user/:userId", isAuthenticated, getUserById);
userRouter.put("/update-user", isAuthenticated, updateUser);
userRouter.get("/user-threads/:userId", isAuthenticated, getUserThreads);
userRouter.get("/get-activity/:userId", isAuthenticated, getActivity);
userRouter.get("/get-users", isAuthenticated, getUsers);
userRouter.post(
  "/toggle-save-thread/:threadId",
  isAuthenticated,
  toggleSaveThread
);
userRouter.get("/saved-thread/:userId", isAuthenticated, getSavedThreads);

export default userRouter;
