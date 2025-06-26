import { Schema, model, models } from "mongoose";

const UserPolicySchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  ipRange: { type: String, required: true },
  limit: { type: Number, required: true },
  priority: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UserPolicy = models.UserPolicy || model("UserPolicy", UserPolicySchema);

export default UserPolicy;
