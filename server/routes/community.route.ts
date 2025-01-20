import express from "express";
import { createCommunity } from "../controllers/community.controller";
import { isAuthenticated } from "../middleware/auth";

const communityRouter = express.Router();

communityRouter.post("/create-community", isAuthenticated, createCommunity);

export default communityRouter;
