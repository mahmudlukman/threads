import User, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import {
  GetSavedThreadParams,
  GetUsersParams,
  UpdateUserParams,
} from "../@types";
import Thread from "../models/thread.model";
import Community from "../models/community.model";
import mongoose, { FilterQuery } from "mongoose";
import Notification from "../models/notification.model";

// get logged in user
export const getLoggedInUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const user = await User.findById(userId).select("-password");
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getUserById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select("-password").populate({
        path: "communities",
        model: "Community",
      });

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update user
export const updateUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, username, bio, avatar }: UpdateUserParams = req.body;
      const userId = req.user?._id;
      const user = await User.findById(userId);

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }

      if (name) user.name = name;
      if (username) user.username = username;
      if (bio) user.bio = bio;

      if (avatar && avatar !== user.avatar?.url) {
        if (user.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatar",
          width: 150,
        });
        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        if (error.keyValue.username) {
          return next(
            new ErrorHandler(
              "Username already exists. Use a different one!",
              400
            )
          );
        }
      }
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getUserThreads = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      // Find all threads authored by the user with the given userId
      const threads = await User.findById(userId).populate({
        path: "threads",
        model: Thread,
        populate: [
          {
            path: "community",
            model: Community,
            select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "name avatar id", // Select the "name" and "_id" fields from the "User" model
            },
          },
        ],
      });
      res.status(200).json({ success: true, threads });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getUsers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const {
        searchString = "",
        pageNumber = 1,
        pageSize = 20,
        sortBy = "desc",
      } = req.query as GetUsersParams;

      // Calculate the number of users to skip based on the page number and page size.
      const skipAmount = (pageNumber - 1) * pageSize;

      // Create a case-insensitive regular expression for the provided search string.
      const regex = new RegExp(searchString, "i");

      // Create an initial query object to filter users.
      const query: FilterQuery<typeof User> = {
        id: { $ne: userId }, // Exclude the current user from the results.
      };

      // If the search string is not empty, add the $or operator to match either username or name fields.
      if (searchString.trim() !== "") {
        query.$or = [
          { username: { $regex: regex } },
          { name: { $regex: regex } },
        ];
      }

      // Define the sort options for the fetched users based on createdAt field and provided sort order.
      const sortOptions = { createdAt: sortBy };

      const usersQuery = User.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);

      // Count the total number of users that match the search criteria (without pagination).
      const totalUsersCount = await User.countDocuments(query);

      const users = await usersQuery.exec();

      // Check if there are more users beyond the current page.
      const isNext = totalUsersCount > skipAmount + users.length;

      res.status(200).json({ success: true, users, isNext });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getActivity = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
      }

      // Find all threads created by the user
      const userThreads = await Thread.find({ author: userId });

      // Collect all the child thread ids (replies) from the 'children' field of each user thread
      const childThreadIds = userThreads.reduce<mongoose.Types.ObjectId[]>(
        (acc, userThread) => {
          return acc.concat(userThread.children);
        },
        []
      );

      // Find and return the child threads (replies) excluding the ones created by the same user
      const replies = await Thread.find({
        _id: { $in: childThreadIds },
        author: { $ne: new mongoose.Types.ObjectId(userId) },
      }).populate({
        path: "author",
        model: User,
        select: "name avatar _id",
      });

      res.status(200).json({
        success: true,
        replies,
        totalReplies: replies.length,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// toggle Save Thread
export const toggleSaveThread = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { threadId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      const isThreadSaved = user.saved.includes(threadId as any);

      if (isThreadSaved) {
        // remove question from saved
        await User.findByIdAndUpdate(
          userId,
          { $pull: { saved: threadId } },
          { new: true }
        );
      } else {
        // add question to saved
        await User.findByIdAndUpdate(
          userId,
          { $addToSet: { saved: threadId } },
          { new: true }
        );
      }

      res.status(200).json({ success: true, message: "Toggle Successful" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get Saved Questions
export const getSavedThreads = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const {
        page = 1,
        pageSize = 20,
        searchQuery,
      } = req.query as GetSavedThreadParams;

      const skipAmount = (page - 1) * pageSize;

      const query: FilterQuery<typeof Thread> = searchQuery
        ? { title: { $regex: new RegExp(searchQuery, "i") } }
        : {};

      const user = await User.findById(userId).populate({
        path: "saved",
        match: query,
        options: {
          skip: skipAmount,
          limit: pageSize + 1,
        },
        populate: {
          path: "author",
          model: User,
          select: "_id userId name avatar",
        },
      });

      const isNext = user?.saved && user.saved.length > pageSize;

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const savedQuestions = user.saved;

      res
        .status(200)
        .json({ success: true, questions: savedQuestions, isNext });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Follow a user
export const followUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userToFollowId = req.params.id;
      const currentUserId = req.user?._id;

      if (!currentUserId) {
        return next(new ErrorHandler("Not authenticated", 401));
      }

      if (userToFollowId === currentUserId.toString()) {
        return next(new ErrorHandler("You cannot follow yourself", 400));
      }

      // Find both users
      const userToFollow = await User.findById(userToFollowId);
      const currentUser = await User.findById(currentUserId);

      if (!userToFollow || !currentUser) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Check if already following
      const isFollowing = userToFollow.followers.includes(currentUserId);
      if (isFollowing) {
        return next(
          new ErrorHandler("You are already following this user", 400)
        );
      }

      try {
        // Add to followers and following arrays
        await User.findByIdAndUpdate(
          userToFollowId,
          { $push: { followers: currentUserId } },
          { new: true }
        );

        await User.findByIdAndUpdate(
          currentUserId,
          { $push: { following: userToFollowId } },
          { new: true }
        );

        // Create notification
        await Notification.create({
          userId: userToFollowId,
          title: "New Follower",
          message: `${currentUser.name} started following you`,
          type: "follow",
        });

        res.status(200).json({
          success: true,
          message: `You are now following ${userToFollow.name}`,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Unfollow a user
export const unfollowUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userToUnfollowId = req.params.id;
      const currentUserId = req.user?._id;

      if (!currentUserId) {
        return next(new ErrorHandler("Not authenticated", 401));
      }

      if (userToUnfollowId === currentUserId.toString()) {
        return next(new ErrorHandler("You cannot unfollow yourself", 400));
      }

      // Find both users
      const userToUnfollow = await User.findById(userToUnfollowId);
      const currentUser = await User.findById(currentUserId);

      if (!userToUnfollow || !currentUser) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Check if actually following
      const isFollowing = userToUnfollow.followers.includes(currentUserId);
      if (!isFollowing) {
        return next(new ErrorHandler("You are not following this user", 400));
      }

      try {
        // Remove from followers and following arrays
        await User.findByIdAndUpdate(
          userToUnfollowId,
          { $pull: { followers: currentUserId } },
          { new: true }
        );

        await User.findByIdAndUpdate(
          currentUserId,
          { $pull: { following: userToUnfollowId } },
          { new: true }
        );

        res.status(200).json({
          success: true,
          message: `You have unfollowed ${userToUnfollow.name}`,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Get user's followers
export const getFollowers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id || req.user?._id;

      if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
      }

      const user = await User.findById(userId)
        .populate("followers", "name email avatar")
        .select("followers");

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      res.status(200).json({
        success: true,
        followers: user.followers,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Get users being followed
export const getFollowing = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id || req.user?._id;

      if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
      }

      const user = await User.findById(userId)
        .populate("following", "name email avatar")
        .select("following");

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      res.status(200).json({
        success: true,
        following: user.following,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
