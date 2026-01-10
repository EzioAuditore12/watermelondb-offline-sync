import env from "./env.js";
import app from "./app.js";
import { connectDB } from "./db/index.js";
connectDB().then(() => app.listen(env.PORT, () => {
    console.log(`server running at http://localhost:${env.PORT}`);
}));
