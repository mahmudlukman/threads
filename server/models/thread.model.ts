import mongoose, { Document, Model, Schema } from "mongoose";

export interface IThread extends Document {
  text: string;
  author: {
    type: Schema.Types.ObjectId;
    ref: "User";
    required: true;
  };
  image?: {
    public_id: string;
    url: string;
  };
  community: {
    type: Schema.Types.ObjectId;
    ref: "Community";
  };
  parentId: string;
  children: {
    type: Schema.Types.ObjectId;
    ref: "Thread";
  };
}

const ThreadSchema: Schema<IThread> = new Schema(
  {
    text: {
      type: String,
      required: [true, "Please enter your message"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
    parentId: {
      type: String,
    },
    children: {
      type: Schema.Types.ObjectId,
      ref: "Thread",
    },
  },
  { timestamps: true }
);

const Thread: Model<IThread> = mongoose.model("Thread", ThreadSchema);
export default Thread;
