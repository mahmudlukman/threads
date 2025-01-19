import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  getActivity,
  getLoggedInUser,
  getUserById,
  getUsers,
  getUserThreads,
  updateUser,
} from "../controllers/user.controller";
const userRouter = express.Router();

userRouter.get("/me", isAuthenticated, getLoggedInUser);
userRouter.get("/get-user/:userId", isAuthenticated, getUserById);
userRouter.put("/update-user", isAuthenticated, updateUser);
userRouter.get("/user-threads/:userId", isAuthenticated, getUserThreads);
userRouter.get("/get-activity/:userId", isAuthenticated, getActivity);
userRouter.get("/get-users", isAuthenticated, getUsers);

export default userRouter;
