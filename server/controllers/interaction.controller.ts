import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import Thread from "../models/thread.model";
import Interaction from "../models/interaction.model";

// view question
export const viewQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { threadId } = req.params;

      // Update view count for the question
      await Thread.findByIdAndUpdate(threadId, { $inc: { views: 1 } });

      if (userId) {
        const existingInteraction = await Interaction.findOne({
          user: userId,
          action: "view",
          thread: threadId,
        });

        if (existingInteraction)
          return next(new ErrorHandler("User has already viewed", 400));

        // Create interaction
        await Interaction.create({
          user: userId,
          action: "view",
          thread: threadId,
        });
      }

      res
        .status(200)
        .json({ success: true, message: "Thread view successfully" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
