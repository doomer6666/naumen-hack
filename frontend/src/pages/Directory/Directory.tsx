import React, { useState, useMemo } from "react";
import { Search, Mail, Phone, Send, Network, Users } from "lucide-react";
import "./Directory.css";

type RelationType = "mentor" | "hr" | "lead" | "colleague";

interface Employee {
  id: string;
  fullName: string;
  role: string;
  department: string;
  responsibility: string;
  email: string;
  phone: string;
  telegram: string;
  relation: RelationType;
  avatarLetter: string;
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    fullName: "Анна Смирнова",
    role: "HR Business Partner",
    department: "HR отдел",
    responsibility:
      "Адаптация новичков, performance review, решение административных вопросов.",
    email: "asmirnova@naumen.ru",
    phone: "+7 999 123-45-67",
    telegram: "@anna_hr",
    relation: "hr",
    avatarLetter: "А",
  },
  {
    id: "2",
    fullName: "Евгений Попов",
    role: "Senior Frontend Developer",
    department: "Frontend",
    responsibility: "Архитектура клиентской части, дизайн-система, код-ревью.",
    email: "epopov@naumen.ru",
    phone: "+7 999 765-43-21",
    telegram: "@evgeny_dev",
    relation: "mentor",
    avatarLetter: "Е",
  },
  {
    id: "3",
    fullName: "Мария Иванова",
    role: "Team Lead",
    department: "Frontend",
    responsibility:
      "Управление командой фронтенда, планирование спринтов, технический роадмап.",
    email: "mivanova@naumen.ru",
    phone: "+7 999 000-11-22",
    telegram: "@maria_lead",
    relation: "lead",
    avatarLetter: "М",
  },
  {
    id: "4",
    fullName: "Дмитрий Соколов",
    role: "Backend Developer",
    department: "Backend",
    responsibility: "Разработка микросервисов на Java/Spring, интеграции.",
    email: "dsokolov@naumen.ru",
    phone: "+7 900 111-22-33",
    telegram: "@dsokolov",
    relation: "colleague",
    avatarLetter: "Д",
  },
  {
    id: "5",
    fullName: "Елена Кузнецова",
    role: "UI/UX Designer",
    department: "Дизайн",
    responsibility:
      "Проектирование интерфейсов, пользовательские исследования.",
    email: "ekuznetsova@naumen.ru",
    phone: "+7 900 444-55-66",
    telegram: "@lena_design",
    relation: "colleague",
    avatarLetter: "Е",
  },
];

const DEPARTMENTS = ["Все", "Frontend", "Backend", "Дизайн", "HR отдел"];

const RELATIONS_MAP: Record<
  RelationType,
  { label: string; className: string }
> = {
  mentor: { label: "Ваш ментор", className: "mentor" },
  hr: { label: "Ваш HR", className: "hr" },
  lead: { label: "Тимлид", className: "lead" },
  colleague: { label: "", className: "" },
};

export const DirectoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Все");

  const filteredEmployees = useMemo(() => {
    return mockEmployees.filter((emp) => {
      const matchesSearch =
        emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept =
        activeFilter === "Все" || emp.department === activeFilter;
      return matchesSearch && matchesDept;
    });
  }, [searchQuery, activeFilter]);

  const groupedEmployees = useMemo(() => {
    const groups: Record<string, Employee[]> = {};
    filteredEmployees.forEach((emp) => {
      if (!groups[emp.department]) groups[emp.department] = [];
      groups[emp.department].push(emp);
    });
    return groups;
  }, [filteredEmployees]);

  return (
    <>
      <div className="directory-container">
        <div className="directory-header">
          <h1 className="page-title">Кто есть кто</h1>
          <p className="page-subtitle">Структура команды и контакты коллег</p>
        </div>

        <div className="controls-panel">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Поиск по имени или роли..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters-wrapper">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                className={`filter-chip ${activeFilter === dept ? "active" : ""}`}
                onClick={() => setActiveFilter(dept)}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(groupedEmployees).length > 0 ? (
          Object.entries(groupedEmployees).map(([department, employees]) => (
            <div key={department} className="department-group">
              <h2 className="department-title">
                <Network size={20} color="var(--nau-gray)" />
                {department}
                <span
                  style={{
                    fontSize: "14px",
                    color: "var(--nau-gray)",
                    fontWeight: "normal",
                    marginLeft: "8px",
                  }}
                >
                  ({employees.length})
                </span>
              </h2>

              <div className="employee-grid">
                {employees.map((emp) => (
                  <div key={emp.id} className="widget employee-card">
                    {emp.relation !== "colleague" && (
                      <div
                        className={`task-tag relation-badge ${RELATIONS_MAP[emp.relation].className}`}
                      >
                        {RELATIONS_MAP[emp.relation].label}
                      </div>
                    )}

                    <div className="employee-header">
                      <div className="avatar employee-avatar">
                        {emp.avatarLetter}
                      </div>
                      <div className="employee-title-wrap">
                        <h3 className="employee-name">{emp.fullName}</h3>
                        <span className="employee-role">{emp.role}</span>
                      </div>
                    </div>

                    <div className="employee-responsibility">
                      <strong>Зона ответственности:</strong>
                      <br />
                      {emp.responsibility}
                    </div>

                    <div className="employee-contacts">
                      <a
                        href={`https://t.me/${emp.telegram.replace("@", "")}`}
                        className="contact-item"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Send size={16} /> {emp.telegram}
                      </a>
                      <a href={`mailto:${emp.email}`} className="contact-item">
                        <Mail size={16} /> {emp.email}
                      </a>
                      <a
                        href={`tel:${emp.phone.replace(/\s+/g, "")}`}
                        className="contact-item"
                      >
                        <Phone size={16} /> {emp.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Users
              size={48}
              color="var(--nau-border)"
              style={{ marginBottom: 16 }}
            />
            <h3>Ничего не найдено</h3>
            <p>Попробуйте изменить параметры поиска или фильтр.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DirectoryPage;
