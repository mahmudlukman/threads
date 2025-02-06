import express from "express";
import {
  addMemberToCommunity,
  createCommunity,
  deleteCommunity,
  getCommunities,
  getCommunityDetails,
  getCommunityPosts,
  removeMemberFromCommunity,
  updateCommunity,
} from "../controllers/community.controller";
import { isAuthenticated } from "../middleware/auth";

const communityRouter = express.Router();

communityRouter.post("/create-community", isAuthenticated, createCommunity);
communityRouter.get("/community/:id", isAuthenticated, getCommunityDetails);
communityRouter.get("/community-posts/:id", isAuthenticated, getCommunityPosts);
communityRouter.get("/communities", isAuthenticated, getCommunities);
communityRouter.put(
  "/community/join/:communityId",
  isAuthenticated,
  addMemberToCommunity
);
communityRouter.put(
  "/community/leave/:communityId",
  isAuthenticated,
  removeMemberFromCommunity
);
communityRouter.put(
  "/update-community/:communityId",
  isAuthenticated,
  updateCommunity
);
communityRouter.delete(
  "/delete-community/:communityId",
  isAuthenticated,
  deleteCommunity
);

export default communityRouter;
