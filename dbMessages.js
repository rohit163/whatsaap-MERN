import mongoose from "mongoose";

const whatsaapSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  recieved: Boolean,
});

export default mongoose.model("messagecontents", whatsaapSchema);
