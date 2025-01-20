import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  status: "unread" | "read";
  type?: "comment" | "like" | "follow";
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
    type: {
      type: String,
      enum: ["comment", "like", "follow"],
    },
  },
  { timestamps: true }
);

const Notification: Model<INotification> = mongoose.model(
  "Notification",
  notificationSchema
);
export default Notification;
