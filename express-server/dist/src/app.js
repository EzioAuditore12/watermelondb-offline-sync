import { createApp } from "./lib/create-app.js";
import router from "./routes/index.route.js";
const app = createApp();
app.use(router);
export default app;
