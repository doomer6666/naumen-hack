-- Таблица отделов
CREATE TABLE IF NOT EXISTS Departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES Departments(id) ON DELETE SET NULL,
    head_user_id UUID REFERENCES Users(id) ON DELETE SET NULL
);

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('newbie', 'hr', 'mentor', 'admin')),
    department_id UUID REFERENCES Departments(id) ON DELETE SET NULL,
    position VARCHAR(255),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Шаблоны адаптации
CREATE TABLE IF NOT EXISTS Onboarding_Templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_days INTEGER DEFAULT 90,
    created_by UUID REFERENCES Users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true
);

-- Этапы шаблона
CREATE TABLE IF NOT EXISTS Template_Stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES Onboarding_Templates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0,
    start_day INTEGER DEFAULT 0,
    end_day INTEGER DEFAULT 0
);

-- Задачи в шаблоне
CREATE TABLE IF NOT EXISTS Template_Tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID REFERENCES Template_Stages(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'task' CHECK (type IN ('task', 'milestone', 'survey')),
    order_index INTEGER DEFAULT 0,
    is_jira_linked BOOLEAN DEFAULT false,
    jira_issue_type VARCHAR(255)
);

-- Назначенные планы
CREATE TABLE IF NOT EXISTS User_Plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES Onboarding_Templates(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES Users(id) ON DELETE SET NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    current_level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0
);

-- Прогресс пользователя
CREATE TABLE IF NOT EXISTS User_Tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_plan_id UUID REFERENCES User_Plans(id) ON DELETE CASCADE,
    template_task_id UUID REFERENCES Template_Tasks(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'blocked')),
    jira_issue_key VARCHAR(255),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Опросы
CREATE TABLE IF NOT EXISTS Feedback_Surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_rule VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Feedback_Responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    clarity_score INTEGER CHECK (clarity_score >= 1 AND clarity_score <= 5),
    has_access BOOLEAN,
    blockers TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Геймификация
CREATE TABLE IF NOT EXISTS Badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    icon_url VARCHAR(255),
    xp_reward INTEGER DEFAULT 0,
    condition_type VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS User_Badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES Badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);