CREATE TABLE IF NOT EXISTS Users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'newbie',
  position VARCHAR(255),
  department VARCHAR(100),
  phone VARCHAR(50),
  telegram VARCHAR(100),
  responsibility TEXT
);

CREATE TABLE IF NOT EXISTS Templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Template_Stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES Templates(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Template_Tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES Template_Stages(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  jira_summary TEXT,
  order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS User_Plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES Templates(id),
  mentor_id UUID REFERENCES Users(id),
  status VARCHAR(50) DEFAULT 'in_progress',
  total_xp INT DEFAULT 0,
  current_level INT DEFAULT 1,
  start_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS User_Tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plan_id UUID REFERENCES User_Plans(id) ON DELETE CASCADE,
  template_task_id UUID REFERENCES Template_Tasks(id),
  status VARCHAR(50) DEFAULT 'pending',
  jira_issue_key VARCHAR(100),
  mentor_comment TEXT,
  completed_at TIMESTAMP
);

ALTER TABLE User_Tasks DROP CONSTRAINT IF EXISTS user_tasks_status_check;
ALTER TABLE User_Tasks ADD CONSTRAINT user_tasks_status_check CHECK (status IN ('pending', 'in_progress', 'in_review', 'done'));

CREATE TABLE IF NOT EXISTS Feedback_Responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
  mood_score INT CHECK (mood_score >= 1 AND mood_score <= 10)
);

CREATE TABLE IF NOT EXISTS Badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50) DEFAULT 'award',
  xp_reward INT DEFAULT 0,
  condition_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS User_Badges (
  user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES Badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- === ДАННЫЕ ===
INSERT INTO Templates (id, name) VALUES ('44444444-4444-4444-4444-444444444444', 'Java Developer Onboarding') ON CONFLICT (id) DO NOTHING;
INSERT INTO Template_Stages (id, template_id, title, order_index) VALUES 
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Неделя 1: Введение', 1),
('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'Неделя 2: Разработка', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO Template_Tasks (id, stage_id, title, jira_summary) VALUES
('77777777-7777-7777-7777-777777777771', '55555555-5555-5555-5555-555555555555', 'Ознакомиться с регламентом', 'Onboarding: Ознакомиться с регламентом'),
('77777777-7777-7777-7777-777777777772', '55555555-5555-5555-5555-555555555555', 'Настроить окружение', 'Onboarding: Настроить окружение'),
('77777777-7777-7777-7777-777777777773', '66666666-6666-6666-6666-666666666666', 'Написать первый эндпоинт', 'Onboarding: Написать первый эндпоинт'),
('77777777-7777-7777-7777-777777777774', '66666666-6666-6666-6666-666666666666', 'Пройти код-ревью', 'Onboarding: Пройти код-ревью')
ON CONFLICT (id) DO NOTHING;

INSERT INTO Badges (id, name, icon, xp_reward, condition_type) VALUES
('a8a1a3b2-4d2d-4f1a-8c9b-6e2c3d4e5f6a', 'Первый шаг', 'target', 20, 'task_count_1'),
('b1c2d3e4-5f6a-4b7c-8d9e-0f1e2d3c4b5a', 'Спринт-мастер', 'rocket', 100, 'tasks_all_done'),
('c5d6e7f8-9a0b-4c1d-8e2f-1a2b3c4d5e6f', 'За качество', 'award', 50, 'manual'),
('d9e0f1a2-b3c4-4d5e-9f6a-7b8c9d0e1f2a', 'За инициативу', 'zap', 50, 'manual')
ON CONFLICT (id) DO NOTHING;

-- 10 моковых сотрудников (без паролей, они только для аналитики)
INSERT INTO Users (name, email, role, position, department) VALUES
('Дмитрий Волков', 'd.volkov@mock.test', 'newbie', 'Frontend Dev', 'Разработка'),
('Анна Морозова', 'a.morozova@mock.test', 'newbie', 'Backend Dev', 'Разработка'),
('Сергей Лебедев', 's.lebedev@mock.test', 'newbie', 'QA Engineer', 'Тестирование'),
('Ольга Соколова', 'o.sokolova@mock.test', 'newbie', 'Analyst', 'Аналитика'),
('Андрей Козлов', 'a.kozlov@mock.test', 'newbie', 'DevOps', 'Инфраструктура'),
('Елена Новикова', 'e.novikova@mock.test', 'newbie', 'UX Designer', 'Дизайн'),
('Павел Федоров', 'p.fedorov@mock.test', 'newbie', 'Frontend Dev', 'Разработка'),
('Марина Петрова', 'm.petrova@mock.test', 'newbie', 'Backend Dev', 'Разработка'),
('Иван Егоров', 'i.egorov@mock.test', 'newbie', 'QA Engineer', 'Тестирование'),
('Екатерина Смирнова', 'e.smirnova@mock.test', 'newbie', 'PM', 'Менеджмент')
ON CONFLICT DO NOTHING;

-- Планы, задачи, пульс для моковых
INSERT INTO User_Plans (user_id, template_id, mentor_id, status, total_xp, current_level)
SELECT u.id, '44444444-4444-4444-4444-444444444444', NULL, 'in_progress', (random() * 100)::int, 1
FROM Users u WHERE u.role = 'newbie' AND NOT EXISTS (SELECT 1 FROM User_Plans up WHERE up.user_id = u.id);

INSERT INTO User_Tasks (user_plan_id, template_task_id, status)
SELECT p.id, tt.id, 'pending'
FROM User_Plans p
JOIN Template_Tasks tt ON tt.stage_id IN (SELECT id FROM Template_Stages WHERE template_id = '44444444-4444-4444-4444-444444444444')
WHERE NOT EXISTS (SELECT 1 FROM User_Tasks ut WHERE ut.user_plan_id = p.id);

UPDATE User_Tasks SET status = 'done', completed_at = NOW() WHERE status = 'pending' AND random() < 0.6;

INSERT INTO Feedback_Responses (user_id, mood_score)
SELECT u.id, (4 + (random() * 6)::int)::int
FROM Users u WHERE u.role = 'newbie' AND NOT EXISTS (SELECT 1 FROM Feedback_Responses fr WHERE fr.user_id = u.id);

UPDATE Feedback_Responses SET mood_score = 2 WHERE id IN (
    SELECT fr.id FROM Feedback_Responses fr JOIN Users u ON fr.user_id = u.id WHERE u.role = 'newbie' ORDER BY random() LIMIT 2
);