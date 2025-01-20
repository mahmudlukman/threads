import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import cloudinary from "cloudinary";
import Community from "../models/community.model";
import User from "../models/user.model";
import { CreateCommunityParams } from "../@types";

// Create community
export const createCommunity = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, username, bio } = req.body as CreateCommunityParams;
      let image = req.body.image;
      const userId = req.user?._id;

      if (!userId) {
        return next(new ErrorHandler("Authentication required", 401));
      }

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Check if community username already exists
      const existingCommunity = await Community.findOne({ username });
      if (existingCommunity) {
        return next(new ErrorHandler("Community username already exists", 400));
      }

      if (image) {
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "community",
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

      // Create new community
      const newCommunity = await Community.create({
        name,
        username,
        bio,
        image,
        createdBy: userId,
        members: [userId], // Add creator as first member
      });

      // Update User model
      await User.findByIdAndUpdate(userId, {
        $push: {
          communities: newCommunity._id,
          communitiesCreated: newCommunity._id,
        },
      });

      res.status(201).json({
        success: true,
        message: "Community created successfully!",
        community: newCommunity,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
