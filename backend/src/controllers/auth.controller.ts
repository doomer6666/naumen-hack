import { Response } from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/authMiddleware";

const CORPORATE_DOMAIN = `@${process.env.CORPORATE_DOMAIN || "naumen.ru"}`;

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  position: string;
  password_hash: string;
}

const generateToken = (id: string, role: string, email: string): string => {
  return jwt.sign(
    { id, role, email },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "24h" },
  );
};

// Регистрация
export const register = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { email, password, full_name, role, position } = req.body;

  try {
    if (!email.endsWith(CORPORATE_DOMAIN)) {
      res.status(403).json({
        message: `Регистрация доступна только для почты ${CORPORATE_DOMAIN}`,
      });
      return;
    }

    const userCheck = await pool.query(
      "SELECT id FROM Users WHERE email = $1",
      [email],
    );
    if (userCheck.rows.length > 0) {
      res
        .status(400)
        .json({ message: "Пользователь с такой почтой уже существует" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Используем name вместо full_name
    const result = await pool.query<UserRow>(
      `INSERT INTO Users (email, password_hash, name, role, position) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, name, role`,
      [email, passwordHash, full_name, role || "newbie", position || ""],
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role, user.email);

    res.status(201).json({
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Ошибка сервера при регистрации" });
  }
};

// Вход
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email.endsWith(CORPORATE_DOMAIN)) {
      res.status(403).json({
        message: `Вход разрешен только с корпоративной почтой ${CORPORATE_DOMAIN}`,
      });
      return;
    }

    const result = await pool.query<UserRow>(
      "SELECT * FROM Users WHERE email = $1",
      [email],
    );
    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ message: "Неверный email или пароль" });
      return;
    }
    
    const isMatch = password === user.password_hash;
    if (!isMatch) {
      res.status(401).json({ message: "Неверный email или пароль" });
      return;
    }

    const token = generateToken(user.id, user.role, user.email);

    res.json({
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Ошибка сервера при входе" });
  }
};

// Получение профиля
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Просто name, без full_name и без AS
    const result = await pool.query<UserRow>(
      "SELECT id, email, name, role, position, avatar_url, department_id FROM Users WHERE id = $1",
      [req.user?.id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
