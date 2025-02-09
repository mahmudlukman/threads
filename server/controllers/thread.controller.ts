import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import {
  addCommentToThreadParams,
  CreateThreadParams,
  DeleteThreadParams,
  GetAllChildThreadsParams,
  GetAllThreadsByIdParams,
  GetAllThreadsParams,
} from "../@types";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import cloudinary from "cloudinary";
import Community from "../models/community.model";
import mongoose from "mongoose";
import Notification from "../models/notification.model";

const populateThread = (query: any) => {
  return query
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });
};

// Separate recursive function to fetch child threads
async function fetchDescendantThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads: any[] = [];
  for (const childThread of childThreads) {
    const descendants = await fetchDescendantThreads(
      (childThread._id as mongoose.Types.ObjectId).toString()
    );
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

// CREATE
export const createThread = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id;
      const { text, communityId } = req.body as CreateThreadParams;
      let image = req.body.image;

      const author = await User.findById(userId);
      if (!author) {
        return next(new ErrorHandler("Author not found", 404));
      }
      if (image) {
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "thread",
          width: 800,
          height: 500,
          crop: "fill",
          quality: 90,
        });
        image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const communityIdObject = await Community.findOne(
        { id: communityId },
        { _id: 1 }
      );
      const newThread = await Thread.create({
        text,
        author: userId,
        community: communityIdObject,
        image,
      });
      // Update User model
      await User.findByIdAndUpdate(author, {
        $push: { threads: newThread._id },
      });

      if (communityIdObject) {
        // Update Community model
        await Community.findByIdAndUpdate(communityIdObject, {
          $push: { threads: newThread._id },
        });
      }
      res.status(201).json({
        success: true,
        newThread,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// GET ALL THREADS
export const getThreads = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit = 6, page } = req.query as unknown as GetAllThreadsParams;

      const skipAmount = (Number(page) - 1) * limit;
      const conditions = { parentId: { $in: [null, undefined] } };

      // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
      const threadsQuery = Thread.find(conditions)
        .sort({ createdAt: "desc" })
        .skip(skipAmount)
        .limit(+limit);

      const threads = await populateThread(threadsQuery);
      const eventsCount = await Thread.countDocuments(conditions);

      res.status(200).json({
        success: true,
        threads,
        totalPages: Math.ceil(eventsCount / limit),
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// GET ALL CHILD THREADS
export const getAllChildThreads = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { threadId } = req.query as GetAllChildThreadsParams;

      if (!threadId) {
        return next(new ErrorHandler("Thread ID is required", 400));
      }

      // Fetch the original thread
      const originalThread = await Thread.findById(threadId);
      if (!originalThread) {
        return next(new ErrorHandler("Thread not found", 404));
      }

      // Get all descendant threads
      const descendantThreads = await fetchDescendantThreads(threadId);

      res.status(200).json({
        success: true,
        thread: originalThread,
        descendants: descendantThreads,
        totalDescendants: descendantThreads.length,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// GET THREAD BY ID
export const getThreadById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { threadId } = req.params as GetAllThreadsByIdParams;

      if (!threadId) {
        throw new Error("Thread not found");
      }

      const thread = await Thread.findById(threadId)
        .populate({
          path: "author",
          model: User,
          select: "_id id name image",
        }) // Populate the author field with _id and username
        .populate({
          path: "community",
          model: Community,
          select: "_id id name image",
        }) // Populate the community field with _id and name
        .populate({
          path: "children", // Populate the children field
          populate: [
            {
              path: "author", // Populate the author field within children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
            {
              path: "children", // Populate the children field within children
              model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
              populate: {
                path: "author", // Populate the author field within nested children
                model: User,
                select: "_id id name parentId image", // Select only _id and username fields of the author
              },
            },
          ],
        })
        .exec();

      res.status(200).json({
        success: true,
        thread,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
// DELETE THREAD
export const deleteThread = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { threadId } = req.params as DeleteThreadParams;

      // Find the thread to be deleted (the main thread)
      const mainThread = await Thread.findById(threadId).populate(
        "author community"
      );

      if (!mainThread) {
        throw new Error("Thread not found");
      }

      // Fetch all child threads and their descendants recursively
      const descendantThreads = await fetchDescendantThreads(threadId);

      // Get all descendant thread IDs including the main thread ID and child thread IDs
      const descendantThreadIds = [
        threadId,
        ...descendantThreads.map((thread) => thread._id),
      ];

      // Extract the authorIds and communityIds to update User and Community models respectively
      const uniqueAuthorIds = new Set(
        [
          ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
          mainThread.author?._id?.toString(),
        ].filter((id) => id !== undefined)
      );

      const uniqueCommunityIds = new Set(
        [
          ...descendantThreads.map((thread) =>
            thread.community?._id?.toString()
          ), // Use optional chaining to handle possible undefined values
          mainThread.community?._id?.toString(),
        ].filter((id) => id !== undefined)
      );

      // Recursively delete child threads and their descendants
      await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

      // Update User model
      await User.updateMany(
        { _id: { $in: Array.from(uniqueAuthorIds) } },
        { $pull: { threads: { $in: descendantThreadIds } } }
      );

      // Update Community model
      await Community.updateMany(
        { _id: { $in: Array.from(uniqueCommunityIds) } },
        { $pull: { threads: { $in: descendantThreadIds } } }
      );

      res.status(200).json({
        success: true,
        message: "Thread deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// COMMENT ON THREAD
export const addCommentToThread = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentText } = req.body;
      const { threadId, userId } =
        req.query as unknown as addCommentToThreadParams;

      // Find the original thread by its ID
      const originalThread = await Thread.findById(threadId);

      if (!originalThread) {
        throw new Error("Thread not found");
      }

      // Get the user making the comment
      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Create the new comment thread
      const commentThread = new Thread({
        text: commentText,
        author: userId,
        parentId: threadId, // Set the parentId to the original thread's ID
      });

      // Save the comment thread to the database
      const comment = await commentThread.save();

      // Add the comment thread's ID to the original thread's children array
      originalThread.children.push(comment._id as mongoose.Types.ObjectId);

      // Save the updated original thread to the database
      await originalThread.save();

      // Create notification for the thread author
      // Only create notification if commenter is not the thread author
      if (originalThread.author._id.toString() !== userId) {
        await Notification.create({
          userId: originalThread.author._id,
          title: "New Comment",
          message: `${
            user.name
          } commented on your thread: "${originalThread.text.substring(0, 30)}${
            originalThread.text.length > 30 ? "..." : ""
          }"`,
          type: "comment",
        });
      }

      res.status(200).json({
        success: true,
        comment,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// LIKE THREAD
export const likeThread = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { threadId } = req.params;

      if (!userId) {
        return next(new ErrorHandler("User not authenticated", 401));
      }

      // Find thread and populate author for notification
      const thread = await Thread.findById(threadId)
        .populate('author');

      if (!thread) {
        return next(new ErrorHandler("Thread not found", 404));
      }

      const userIdString = userId.toString();
      const isLiked = thread.likes.includes(userIdString);

      // Get user info for notification
      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      let action: 'liked' | 'unliked' = 'liked';
      
      // Update likes array
      if (isLiked) {
        thread.likes = thread.likes.filter(id => id !== userIdString);
        action = 'unliked';
      } else {
        thread.likes.push(userIdString);
        action = 'liked';
      }

      // Update thread atomically using findOneAndUpdate
      const updatedThread = await Thread.findOneAndUpdate(
        { _id: threadId },
        { $set: { likes: thread.likes }},
        { 
          new: true,
          runValidators: true 
        }
      ).populate('author');

      if (!updatedThread) {
        return next(new ErrorHandler("Failed to update thread", 500));
      }

      // Send notification only for likes (not unlikes) and if the liker isn't the author
      if (action === 'liked' && thread.author._id.toString() !== userIdString) {
        await Notification.create({
          userId: thread.author._id,
          title: "New Like",
          message: `${user.name} liked your thread: "${thread.text.substring(0, 30)}${thread.text.length > 30 ? '...' : ''}"`,
          type: "like"
        });
      }

      res.status(200).json({
        success: true,
        thread: updatedThread,
        action
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
