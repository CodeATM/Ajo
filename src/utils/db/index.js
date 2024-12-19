import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const NODE_ENV = process.env.NODE_ENV || "dev";

const URL =
  NODE_ENV === "prod" ? process.env.PROD_MONGODB_URL : process.env.MONGODB_URL;

console.log(URL);

const connectDb = async () => {
  try {
    await mongoose.connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Database connected successfully (${NODE_ENV} environment)`);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit the process with a failure code
  }
};

export default connectDb;
