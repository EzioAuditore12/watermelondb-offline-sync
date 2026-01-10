import mongoose from "mongoose";

import env from "@/env";
import logger from "@/middlewares/winston-logger";

export const connectDB = async () => {
  try {
    mongoose.connect(env.DATABASE_URL);
    logger.log({ level: "debug", message: "MongoDB connected" });
  } catch (error) {
    console.log("MONODB conntection Failed", error);
    process.exit(1);
  }
};
