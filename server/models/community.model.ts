import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICommunity extends Document {
  username: {
    type: string;
    unique: true;
    required: true;
  };
  name: {
    type: string;
    required: true;
  };
  image?: {
    public_id: string;
    url: string;
  };
  bio: {
    type: string;
  };
  createdBy: {
    type: Schema.Types.ObjectId;
    ref: "User";
  };
  threads: [
    {
      type: Schema.Types.ObjectId;
      ref: "Thread";
    }
  ];
  members: {
    [x: string]: any;
    type: Schema.Types.ObjectId;
    ref: "User";
  };
}

const CommunitySchema: Schema<ICommunity> = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, "Please enter a username"],
    },
    name: {
      type: String,
      required: [true, "Please enter a name"],
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    bio: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    threads: [
      {
        type: Schema.Types.ObjectId,
        ref: "Thread",
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Community: Model<ICommunity> = mongoose.model(
  "Community",
  CommunitySchema
);
export default Community;
