import express, { NextFunction } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { Request, Response } from "express";
import { ErrorMiddleware } from "./middleware/error";
import authRouter from "./routes/auth.route";
import threadRouter from "./routes/thread.route";
import userRouter from "./routes/user.route";
// import eventRouter from "./routes/event.route";
// import orderRouter from "./routes/order.route";
import dotenv from "dotenv";

dotenv.config();

//body parser

app.use(express.json({ limit: "50mb" }));

//cookie parser

app.use(cookieParser());

//cors=>cross origin resource sharing

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

//routes
app.use(
  "/api/v1",
  authRouter,
  threadRouter,
  userRouter
  //   eventRouter,
  //   orderRouter
);

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Evently API",
  });
});

//testing route
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

//unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
