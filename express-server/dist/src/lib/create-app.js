import cors from "cors";
import express from "express";
import logger from "../middlewares/winston-logger.js";
export function createRouter() {
    return express.Router({
        strict: false,
    });
}
export function createApp() {
    const app = express();
    app.use(cors({
        origin: "*",
    }));
    app.use((req, _, next) => {
        logger.info(`${req.method} ${req.url}`);
        next();
    });
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    return app;
}
