import env from "./env";

import app from "./app";

import { connectDB } from "./db";

connectDB().then(() =>
  app.listen(env.PORT, () => {
    console.log(`server running at http://localhost:${env.PORT}`);
  })
);
