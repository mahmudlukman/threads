import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  followUser,
  getActivity,
  getFollowers,
  getFollowing,
  getLoggedInUser,
  getSavedThreads,
  getUserById,
  getUsers,
  getUserThreads,
  toggleSaveThread,
  unfollowUser,
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
userRouter.put("/follow/:userToFollowId", isAuthenticated, followUser);
userRouter.put("/unfollow/:userToUnfollowId", isAuthenticated, unfollowUser);
userRouter.get("/get-followers/:userId", isAuthenticated, getFollowers);
userRouter.get("/get-following/:userId", isAuthenticated, getFollowing);

export default userRouter;
