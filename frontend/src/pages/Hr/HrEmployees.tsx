/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import apiClient from "../../api/client";
import "./HrEmployees.css";

export const HrEmployees: React.FC = () => {
  const [search, setSearch] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assigningUser, setAssigningUser] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get("/hr/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    setAssigningUser(user);
    setIsAssignOpen(true);
    setSelectedTemplate("");
    setSelectedMentor(user.mentor_id || "");
    try {
      const [tempRes, dirRes] = await Promise.all([
        apiClient.get("/hr/templates"),
        apiClient.get("/directory/users"),
      ]);
      setTemplates(tempRes.data);
      setMentors(
        dirRes.data.filter((u: any) => u.role !== "newbie" && u.id !== user.id),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async () => {
    if (!selectedTemplate || !assigningUser) return;
    setAssigning(true);
    try {
      const res = await apiClient.post(
        `/hr/users/${assigningUser.id}/assign-plan`,
        {
          template_id: selectedTemplate,
          mentor_id: selectedMentor || null,
        },
      );
      const jiraCount = res.data.jira_tickets_created || 0;
      alert(`План успешно назначен!\nСоздано тикетов в Jira: ${jiraCount}`);
      setIsAssignOpen(false);
      fetchEmployees();
    } catch (err: any) {
      alert(
        `Ошибка: ${err.response?.data?.message || "Не удалось назначить план"}`,
      );
    } finally {
      setAssigning(false);
    }
  };

  const getStatusConfig = (status: string | null) => {
    if (status === "completed")
      return {
        label: "Завершил",
        icon: <CheckCircle size={14} />,
        className: "status-completed",
      };
    if (status === "in_progress")
      return {
        label: "Адаптируется",
        icon: <Clock size={14} />,
        className: "status-adapting",
      };
    return {
      label: "Нет плана",
      icon: <AlertCircle size={14} />,
      className: "status-delayed",
    };
  };

  if (loading)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader2 size={40} className="spinner" />
      </div>
    );

  return (
    <div className="hr-employees">
      <div className="hr-employees-header">
        <h1 className="page-title">Управление сотрудниками</h1>
        <button
          className="hr-btn-primary"
          onClick={() => setIsInviteOpen(true)}
        >
          <UserPlus size={18} /> Пригласить
        </button>
      </div>

      {isInviteOpen && (
        <div className="widget hr-invite-form">
          <div className="hr-invite-header">
            <h3>Отправить инвайт</h3>
            <button
              className="hr-icon-btn"
              onClick={() => setIsInviteOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(`Инвайт отправлен на: ${inviteEmail}`);
              setIsInviteOpen(false);
            }}
            className="hr-invite-body"
          >
            <div className="hr-templates-search">
              <Mail size={18} color="var(--nau-gray)" />
              <input
                type="email"
                placeholder="email@naumen.ru"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="hr-input"
                required
              />
            </div>
            <button type="submit" className="hr-btn-primary">
              Отправить
            </button>
          </form>
        </div>
      )}

      {isAssignOpen && assigningUser && (
        <div className="widget hr-invite-form">
          <div className="hr-invite-header">
            <h3>Назначить план: {assigningUser.name}</h3>
            <button
              className="hr-icon-btn"
              onClick={() => setIsAssignOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div
            className="hr-invite-body"
            style={{ flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                className="widget-subtitle"
                style={{ display: "block", marginBottom: "8px" }}
              >
                Шаблон адаптации *
              </label>
              <select
                className="hr-input"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                style={{ width: "100%", padding: "10px" }}
              >
                <option value="" disabled>
                  Выберите шаблон
                </option>
                {templates.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.title || "Шаблон"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="widget-subtitle"
                style={{ display: "block", marginBottom: "8px" }}
              >
                Наставник
              </label>
              <select
                className="hr-input"
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                style={{ width: "100%", padding: "10px" }}
              >
                <option value="">Не назначать</option>
                {mentors.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="hr-btn-primary"
              onClick={handleAssign}
              disabled={!selectedTemplate || assigning}
            >
              {assigning ? <Loader2 size={18} className="spinner" /> : null}{" "}
              {assigning ? "Создаем тикеты Jira..." : "Назначить план"}
            </button>
          </div>
        </div>
      )}

      <div className="widget">
        <div className="hr-templates-search">
          <Search size={18} color="var(--nau-gray)" />
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="hr-input"
          />
        </div>
        <div className="hr-emp-table">
          <div className="hr-emp-table-header">
            <span>Сотрудник</span>
            <span>Статус</span>
            <span>Наставник</span>
            <span>Действия</span>
          </div>
          {employees
            .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
            .map((emp) => {
              const status = getStatusConfig(emp.plan_status);
              return (
                <div
                  key={emp.id}
                  className="hr-emp-row"
                  style={{ cursor: emp.plan_status ? "pointer" : "default" }}
                  onClick={() =>
                    emp.plan_status
                      ? (window.location.href = `/hr/employees/${emp.id}/plan`)
                      : undefined
                  }
                >
                  <div className="hr-emp-user">
                    <div className="avatar">{emp.name.charAt(0)}</div>
                    <div className="hr-emp-info">
                      <h4>{emp.name}</h4>
                      <p>
                        {emp.position || "—"} · {emp.email}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`task-tag ${status.className}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>
                  <div className="hr-emp-mentor">{emp.mentor_name || "—"}</div>
                  <div>
                    <button
                      className="hr-btn-primary"
                      style={{ padding: "6px 12px", fontSize: "13px" }}
                      onClick={(e) => openAssignModal(e, emp)}
                    >
                      {emp.plan_status ? "Переназначить" : "Назначить план"}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default HrEmployees;
