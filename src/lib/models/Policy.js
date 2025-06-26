import { Schema, model, models } from "mongoose";

const PolicySchema = new Schema({
  userId: { type: String, required: true },
  limit: { type: Number, required: true },
  priority: { type: String, required: true },
});

const Policy = models.Policy || model("Policy", PolicySchema);

export default Policy;
