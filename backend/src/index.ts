import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db";
import routes from "./routes";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/v1", routes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log(`Server running on port ${PORT}`);
    console.log("PostgreSQL connected successfully");
  } catch (err) {
    console.error("Database connection error:", err);
  }
});
