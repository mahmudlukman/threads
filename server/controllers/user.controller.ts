import User, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import { GetUsersParams, UpdateUserParams } from "../@types";
import Thread from "../models/thread.model";
import Community from "../models/community.model";
import mongoose, { FilterQuery } from "mongoose";

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
