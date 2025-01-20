import { NextFunction, Request, Response } from "express";
import cron from "node-cron";
import Notification from "../models/notification.model";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";

// Get user's notifications
export const getNotifications = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?._id) {
        return next(new ErrorHandler("User not authenticated", 401));
      }

      const notifications = await Notification.find({
        userId: req.user._id,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Update notification status
export const updateNotification = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?._id) {
        return next(new ErrorHandler("User not authenticated", 401));
      }

      const notification = await Notification.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }

      notification.status = "read";
      await notification.save();

      // Get updated list of notifications
      const notifications = await Notification.find({
        userId: req.user._id,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Helper function to create a notification
export const createNotification = async ({
  userId,
  title,
  message,
  type,
}: {
  userId: string;
  title: string;
  message: string;
  type?: "comment" | "like" | "follow";
}) => {
  try {
    await Notification.create({
      userId,
      title,
      message,
      type,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Delete old notifications using cron
cron.schedule("0 0 0 * * *", async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await Notification.deleteMany({
    status: "read",
    createdAt: { $lt: thirtyDaysAgo },
  });
  console.log("Deleted old read notifications");
});
