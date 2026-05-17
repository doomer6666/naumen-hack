import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db";
import routes from "./routes";
import fs from "fs";
import path from "path";

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
  const seedDatabase = async () => {
    try {
      const sql = fs.readFileSync(path.join(process.cwd(), "init.sql"), "utf8");
      await pool.query(sql);
      console.log("База данных успешно инициализирована (таблицы и моки)");
    } catch (err) {
      console.error("Ошибка инициализации базы:", err);
    }
  };
  seedDatabase();
});
