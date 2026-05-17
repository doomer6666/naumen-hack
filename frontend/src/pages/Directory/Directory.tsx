import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Mail,
  Phone,
  Send,
  Network,
  Users,
  Loader2,
} from "lucide-react";
import apiClient from "../../api/client";
import "./Directory.css";

type RelationType = "mentor" | "hr" | "lead" | "colleague";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  responsibility: string;
  email: string;
  phone: string;
  telegram: string;
  relation: RelationType;
}

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Все");

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const res = await apiClient.get("/directory/users");
        setEmployees(res.data);
      } catch (err) {
        console.error("Ошибка загрузки справочника:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, []);

  const departments = useMemo(() => {
    const depts = new Set(employees.map((e) => e.department).filter(Boolean));
    return ["Все", ...Array.from(depts)];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept =
        activeFilter === "Все" || emp.department === activeFilter;
      return matchesSearch && matchesDept;
    });
  }, [searchQuery, activeFilter, employees]);

  const groupedEmployees = useMemo(() => {
    const groups: Record<string, Employee[]> = {};
    filteredEmployees.forEach((emp) => {
      const dept = emp.department || "Без отдела";
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(emp);
    });
    return groups;
  }, [filteredEmployees]);

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}
      >
        <Loader2 size={48} className="spinner" />
      </div>
    );
  }

  return (
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
          {departments.map((dept) => (
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
        Object.entries(groupedEmployees).map(([department, emps]) => (
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
                ({emps.length})
              </span>
            </h2>

            <div className="employee-grid">
              {emps.map((emp) => (
                <div key={emp.id} className="widget employee-card">
                  {emp.relation !== "colleague" && (
                    <div
                      className={`task-tag relation-badge ${RELATIONS_MAP[emp.relation as RelationType]?.className}`}
                    >
                      {RELATIONS_MAP[emp.relation as RelationType]?.label}
                    </div>
                  )}

                  <div className="employee-header">
                    <div className="avatar employee-avatar">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="employee-title-wrap">
                      <h3 className="employee-name">{emp.name}</h3>
                      <span className="employee-role">{emp.position}</span>
                    </div>
                  </div>

                  {emp.responsibility && (
                    <div className="employee-responsibility">
                      <strong>Зона ответственности:</strong>
                      <br />
                      {emp.responsibility}
                    </div>
                  )}

                  <div className="employee-contacts">
                    {emp.telegram && (
                      <a
                        href={`https://t.me/${emp.telegram.replace("@", "")}`}
                        className="contact-item"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Send size={16} /> {emp.telegram}
                      </a>
                    )}
                    {emp.email && (
                      <a href={`mailto:${emp.email}`} className="contact-item">
                        <Mail size={16} /> {emp.email}
                      </a>
                    )}
                    {emp.phone && (
                      <a
                        href={`tel:${emp.phone.replace(/\s+/g, "")}`}
                        className="contact-item"
                      >
                        <Phone size={16} /> {emp.phone}
                      </a>
                    )}
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
  );
};

export default DirectoryPage;
