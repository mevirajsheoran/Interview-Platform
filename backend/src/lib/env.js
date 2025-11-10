import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    NODE_ENV: process.env.NODE_ENV
}