import mongoose from "mongoose";
import "dotenv/config.js";

const connect = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
      process.exit(1);
    });
};

export default connect;
