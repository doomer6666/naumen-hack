import pool from "./src/config/db";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    //"password123"
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("password123", salt);

    await pool.query(
      `
      INSERT INTO Users (email, password_hash, name, role, position) 
      VALUES 
        ('ivan@naumen.ru', $1, 'Иван Смирнов', 'newbie', 'Java Разработчик'),
        ('elena@naumen.ru', $1, 'Елена Иванова', 'hr', 'HR Менеджер'),
        ('alexey@naumen.ru', $1, 'Алексей Петров', 'mentor', 'Senior Разработчик')
      ON CONFLICT (email) DO NOTHING;
    `,
      [hash],
    );

    console.log("Пользователи успешно созданы!");
  } catch (error) {
    console.error("Ошибка при создании:", error);
  } finally {
    process.exit(0);
  }
}

seed();
