import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import cloudinary from "cloudinary";
import Community from "../models/community.model";
import User from "../models/user.model";
import {
  CreateCommunityParams,
  GetCommunitiesParams,
  UpdateCommunityInfoParams,
} from "../@types";
import Thread from "../models/thread.model";
import { FilterQuery, Types } from "mongoose";
import Notification from "../models/notification.model";

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

// Community Details
export const getCommunityDetails = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const communityDetails = await Community.findById(id).populate([
        "createdBy",
        {
          path: "members",
          model: User,
          select: "name username avatar _id id",
        },
      ]);

      res.status(201).json({
        success: true,
        communityDetails,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Community Post
export const getCommunityPosts = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const communityPosts = await Community.findById(id).populate({
        path: "threads",
        model: Thread,
        populate: [
          {
            path: "author",
            model: User,
            select: "name avatar id", // Select the "name" and "_id" fields from the "User" model
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "avatar _id", // Select the "name" and "_id" fields from the "User" model
            },
          },
        ],
      });

      res.status(201).json({
        success: true,
        communityPosts,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Communities
export const getCommunities = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        searchString = "",
        pageNumber = 1,
        pageSize = 20,
        sortBy = "desc",
      } = req.query as unknown as GetCommunitiesParams;
      // Calculate the number of communities to skip based on the page number and page size.
      const skipAmount = (pageNumber - 1) * pageSize;

      // Create a case-insensitive regular expression for the provided search string.
      const regex = new RegExp(searchString, "i");

      // Create an initial query object to filter communities.
      const query: FilterQuery<typeof Community> = {};

      // If the search string is not empty, add the $or operator to match either username or name fields.
      if (searchString.trim() !== "") {
        query.$or = [
          { username: { $regex: regex } },
          { name: { $regex: regex } },
        ];
      }

      // Define the sort options for the fetched communities based on createdAt field and provided sort order.
      const sortOptions = { createdAt: sortBy };

      // Create a query to fetch the communities based on the search and sort criteria.
      const communitiesQuery = Community.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize)
        .populate("members");

      // Count the total number of communities that match the search criteria (without pagination).
      const totalCommunitiesCount = await Community.countDocuments(query);

      const communities = await communitiesQuery.exec();

      // Check if there are more communities beyond the current page.
      const isNext = totalCommunitiesCount > skipAmount + communities.length;

      res.status(201).json({
        success: true,
        communities,
        isNext,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Add member to community
export const addMemberToCommunity = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { communityId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return next(new ErrorHandler("Authentication required", 401));
      }

      // Find the community by its unique id
      const community = await Community.findById(communityId).populate(
        "createdBy",
        "name _id"
      );
      if (!community) {
        return next(new ErrorHandler("Community not found", 404));
      }

      // Find the user by their unique id
      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Convert members array to string array for comparison
      const memberIds = community.members.map((member: any) =>
        member instanceof Types.ObjectId ? member.toString() : member
      );

      // Check if the user is already a member of the community
      if (memberIds.includes(userId.toString())) {
        return next(
          new ErrorHandler("User is already a member of the community", 400)
        );
      }

      // Use atomic updates instead of save() operations
      await Promise.all([
        Community.findByIdAndUpdate(
          communityId,
          {
            $addToSet: { members: userId },
          },
          { new: true }
        ),
        User.findByIdAndUpdate(
          userId,
          {
            $addToSet: { communities: communityId },
          },
          { new: true }
        ),
      ]);

      await Notification.create({
        userId: community.createdBy._id.toString(),
        title: "New Community Member",
        message: `${user.name} has joined your community "${community.name}"`,
        type: "follow",
      });

      // Fetch updated community to return in response
      const updatedCommunity = await Community.findById(communityId)
        .populate("members", "name username avatar")
        .populate("createdBy", "name username");

      res.status(201).json({
        success: true,
        message: "Successfully joined community!",
        updatedCommunity,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Remove member to community
export const removeMemberFromCommunity = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { communityId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return next(new ErrorHandler("Authentication required", 401));
      }

      // Find the community
      const community = await Community.findById(communityId);
      if (!community) {
        return next(new ErrorHandler("Community not found", 404));
      }

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Check if user is actually a member
      const memberIds = community.members.map((member: any) =>
        member instanceof Types.ObjectId ? member.toString() : member
      );

      if (!memberIds.includes(userId.toString())) {
        return next(
          new ErrorHandler("User is not a member of this community", 400)
        );
      }

      // Check if user is the creator of the community
      if (community.createdBy.toString() === userId.toString()) {
        return next(
          new ErrorHandler("Community creator cannot leave the community", 400)
        );
      }

      // Remove member from community and remove community from user's communities
      await Promise.all([
        Community.findByIdAndUpdate(
          communityId,
          {
            $pull: { members: userId },
          },
          { new: true }
        ),
        User.findByIdAndUpdate(
          userId,
          {
            $pull: { communities: communityId },
          },
          { new: true }
        ),
      ]);

      // Fetch updated community to return in response
      const updatedCommunity = await Community.findById(communityId)
        .populate("members", "name username avatar")
        .populate("createdBy", "name username");

      res.status(200).json({
        success: true,
        message: "Successfully left community",
        community: updatedCommunity,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Update Community
export const updateCommunity = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, username, bio, avatar } = req.body;
      const { communityId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return next(new ErrorHandler("Authentication required", 401));
      }

      const community = await Community.findById(communityId);

      if (!community) {
        return next(new ErrorHandler("Community not found", 400));
      }

      // Check if the logged-in user is the creator of the community
      if (community.createdBy.toString() !== userId.toString()) {
        return next(
          new ErrorHandler(
            "Only the community creator can update this community",
            403
          )
        );
      }

      if (name) community.name = name;
      if (username) community.username = username;
      if (bio) community.bio = bio;

      if (avatar && avatar !== community.avatar?.url) {
        if (community.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(community.avatar.public_id);
        }
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "community",
          width: 150,
        });
        community.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await community.save();

      res.status(200).json({
        success: true,
        community,
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

// Delete community
export const deleteCommunity = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { communityId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return next(new ErrorHandler("Authentication required", 401));
      }

      // Find the community
      const community = await Community.findById(communityId);

      if (!community) {
        return next(new ErrorHandler("Community not found", 404));
      }

      // Check if logged-in user is the creator
      if (community.createdBy.toString() !== userId.toString()) {
        return next(
          new ErrorHandler(
            "Only the community creator can delete this community",
            403
          )
        );
      }

      // Delete community image from cloudinary if it exists
      if (community.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(community.avatar.public_id);
      }

      // Delete all threads associated with the community
      await Thread.deleteMany({ community: communityId });

      // Find all users who are part of the community
      const communityUsers = await User.find({ communities: communityId });

      // Remove the community from the 'communities' array for each user
      const updateUserPromises = communityUsers.map((user) => {
        return User.findByIdAndUpdate(user._id, {
          $pull: {
            communities: communityId,
            communitiesCreated: communityId,
          },
        });
      });

      // Execute all user updates and delete the community
      await Promise.all([
        ...updateUserPromises,
        Community.findByIdAndDelete(communityId),
      ]);

      res.status(200).json({
        success: true,
        message: "Community and all associated data deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
