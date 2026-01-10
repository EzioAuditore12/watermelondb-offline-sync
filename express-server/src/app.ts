import { createApp } from "./lib/create-app";
import router from "./routes/index.route";

const app = createApp();

app.use(router);

export default app;
