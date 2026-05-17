import React, { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  Search,
  MoreVertical,
  Trash2,
  CalendarDays,
  ArrowDownAZ,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/client";
import "./HrTemplates.css";

interface Template {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  is_active: boolean;
  created_at: string;
}

type SortType = "date" | "alpha";

const HrTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState<SortType>("date");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await apiClient.get("/hr/templates");
      setTemplates(res.data);
    } catch (err) {
      console.error("Ошибка загрузки шаблонов:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Вы уверены, что хотите удалить шаблон?")) return;
    try {
      await apiClient.delete(`/hr/templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Ошибка удаления шаблона");
    }
    setOpenMenuId(null);
  };

  const filteredTemplates = templates
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortType === "alpha") return a.name.localeCompare(b.name);
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) setOpenMenuId(null);
    };
    if (openMenuId)
      setTimeout(
        () => document.addEventListener("click", handleClickOutside),
        0,
      );
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader2 size={40} className="spinner" />
      </div>
    );
  }

  return (
    <div className="hr-templates">
      <div className="hr-templates-header">
        <h1 className="page-title">Шаблоны адаптации</h1>
        <button
          className="hr-btn-primary"
          onClick={() => navigate("/hr/templates/new/edit")}
        >
          <Plus size={18} /> Создать шаблон
        </button>
      </div>

      <div className="widget">
        <div className="hr-templates-toolbar">
          <div className="hr-templates-search">
            <Search size={18} color="var(--nau-gray)" />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hr-input"
            />
          </div>
          <div className="hr-sort-group">
            <span className="widget-subtitle" style={{ marginRight: "8px" }}>
              Сортировка:
            </span>
            <button
              className={`hr-sort-btn ${sortType === "date" ? "active" : ""}`}
              onClick={() => setSortType("date")}
            >
              <CalendarDays size={16} />
            </button>
            <button
              className={`hr-sort-btn ${sortType === "alpha" ? "active" : ""}`}
              onClick={() => setSortType("alpha")}
            >
              <ArrowDownAZ size={16} />
            </button>
          </div>
        </div>

        <div className="hr-template-list">
          {filteredTemplates.length === 0 ? (
            <div className="hr-empty-state">
              <p>Шаблоны не найдены</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="hr-template-item"
                onClick={() => navigate(`/hr/templates/${template.id}/edit`)}
              >
                <div className="hr-template-icon">
                  <FileText size={24} />
                </div>
                <div className="hr-template-info">
                  <h4>{template.name}</h4>
                  <div className="hr-template-meta">
                    <span className="task-tag">
                      {template.duration_days} дней
                    </span>
                    <span className="widget-subtitle">
                      {template.is_active ? "Активен" : "Черновик"}
                    </span>
                  </div>
                </div>
                <div className="hr-template-actions">
                  <span className="widget-subtitle">
                    Обновлен:{" "}
                    {template.created_at
                      ? new Date(template.created_at).toLocaleDateString(
                          "ru-RU",
                        )
                      : "—"}
                  </span>
                  <div className="hr-menu-wrapper">
                    <button
                      className="hr-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(
                          openMenuId === template.id ? null : template.id,
                        );
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === template.id && (
                      <div
                        className="hr-dropdown-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="hr-dropdown-item danger"
                          onClick={(e) => handleDelete(e, template.id)}
                        >
                          <Trash2 size={14} /> Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HrTemplates;
