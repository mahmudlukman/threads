import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { CreateThreadParams, GetAllThreadsParams } from "../@types";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import cloudinary from "cloudinary";
import Community from "../models/community.model";

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

// GET ALL EVENTS
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
