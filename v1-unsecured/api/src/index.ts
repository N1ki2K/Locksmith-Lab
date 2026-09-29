import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import { db } from "./database.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            status: "ok",
            database: "connected"
        });
    }
    catch (error){
        console.error(error);
        res.status(500).json({
        status: "error",
        database: "disconected"
        });
    };
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
    console.log(`API running at port ${port}`);
});
