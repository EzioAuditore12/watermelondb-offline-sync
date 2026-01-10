import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logger = createLogger({
	level: "info",
	format: format.combine(
		format.colorize(),
		format.timestamp(),
		format.printf(
			({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`,
		),
	),
	transports: [
		new transports.Console(),
		new DailyRotateFile({
			filename: "public/logs/application-%DATE%.log",
			datePattern: "YYYY-MM-DD",
			zippedArchive: true,
			maxSize: "20m",
			maxFiles: "14d",
		}),
	],
});

export default logger;