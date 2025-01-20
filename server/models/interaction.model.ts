import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInteraction extends Document {
  user: Schema.Types.ObjectId; // reference to user
  action: string;
  thread: Schema.Types.ObjectId; // reference to question
}

const InteractionSchema: Schema<IInteraction> = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    thread: { type: Schema.Types.ObjectId, ref: "Thread" },
  },
  { timestamps: true }
);

const Interaction: Model<IInteraction> = mongoose.model(
  "Interaction",
  InteractionSchema
);
export default Interaction;
