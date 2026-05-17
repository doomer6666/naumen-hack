-- Для UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
        CHECK (role IN ('newbie', 'hr', 'mentor', 'admin')),
    department_id UUID,
    position VARCHAR(255),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- DEPARTMENTS
-- =========================
CREATE TABLE IF NOT EXISTS Departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID,
    head_user_id UUID
);

-- =========================
-- FK AFTER CREATE
-- =========================

ALTER TABLE Users
ADD CONSTRAINT fk_users_department
FOREIGN KEY (department_id)
REFERENCES Departments(id)
ON DELETE SET NULL;

ALTER TABLE Departments
ADD CONSTRAINT fk_departments_parent
FOREIGN KEY (parent_id)
REFERENCES Departments(id)
ON DELETE SET NULL;

ALTER TABLE Departments
ADD CONSTRAINT fk_departments_head
FOREIGN KEY (head_user_id)
REFERENCES Users(id)
ON DELETE SET NULL;

-- =========================
-- ONBOARDING TEMPLATES
-- =========================
CREATE TABLE IF NOT EXISTS Onboarding_Templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_days INTEGER DEFAULT 90,
    created_by UUID REFERENCES Users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true
);

-- =========================
-- TEMPLATE STAGES
-- =========================
CREATE TABLE IF NOT EXISTS Template_Stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES Onboarding_Templates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0,
    start_day INTEGER DEFAULT 0,
    end_day INTEGER DEFAULT 0
);

-- =========================
-- TEMPLATE TASKS
-- =========================
CREATE TABLE IF NOT EXISTS Template_Tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID REFERENCES Template_Stages(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'task'
        CHECK (type IN ('task', 'milestone', 'survey')),
    order_index INTEGER DEFAULT 0,
    is_jira_linked BOOLEAN DEFAULT false,
    jira_issue_type VARCHAR(255)
);

-- =========================
-- USER PLANS
-- =========================
CREATE TABLE IF NOT EXISTS User_Plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES Onboarding_Templates(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'done', 'blocked'))
);