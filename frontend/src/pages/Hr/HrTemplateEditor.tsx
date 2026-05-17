/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  GripVertical,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Ticket,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import apiClient from "../../api/client";
import "./HrTemplateEditor.css";

interface Task {
  id: string;
  title: string;
  deadline: string;
  jiraTemplate?: string;
}

interface Stage {
  id: string;
  title: string;
  isOpen: boolean;
  tasks: Task[];
}

const HrTemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [templateName, setTemplateName] = useState("Новый шаблон");
  const [duration, setDuration] = useState(30);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);
  const [draggedTaskInfo, setDraggedTaskInfo] = useState<{
    stageId: string;
    taskId: string;
  } | null>(null);

  useEffect(() => {
    if (!isNew && id) {
      const fetchTemplate = async () => {
        try {
          const res = await apiClient.get(`/hr/templates/${id}`);
          const data = res.data;
          setTemplateName(data.name || "Шаблон");
          setDuration(data.duration_days || 30);

          const mappedStages = (data.stages || []).map((s: any) => ({
            id: s.id,
            title: s.title,
            isOpen: true,
            tasks: (s.tasks || []).map((t: any) => ({
              id: t.id,
              title: t.title,
              deadline: t.description || "",
              jiraTemplate: t.jira_summary || "",
            })),
          }));
          setStages(mappedStages);
        } catch (err) {
          console.error("Ошибка загрузки шаблона:", err);
          alert("Не удалось загрузить шаблон");
        } finally {
          setLoading(false);
        }
      };
      fetchTemplate();
    }
  }, [id, isNew]);

  const toggleStage = (stageId: string) => {
    setStages(
      stages.map((s) => (s.id === stageId ? { ...s, isOpen: !s.isOpen } : s)),
    );
  };

  const addStage = () => {
    setStages([
      ...stages,
      { id: `s${Date.now()}`, title: "Новый этап", isOpen: true, tasks: [] },
    ]);
  };

  const addTask = (stageId: string) => {
    setStages(
      stages.map((s) =>
        s.id === stageId
          ? {
              ...s,
              tasks: [
                ...s.tasks,
                {
                  id: `t${Date.now()}`,
                  title: "Новая задача",
                  deadline: "Название",
                },
              ],
            }
          : s,
      ),
    );
  };

  const updateStageTitle = (stageId: string, newTitle: string) => {
    setStages(
      stages.map((s) => (s.id === stageId ? { ...s, title: newTitle } : s)),
    );
  };

  const updateTaskField = (
    stageId: string,
    taskId: string,
    field: keyof Task,
    value: string,
  ) => {
    setStages(
      stages.map((s) =>
        s.id === stageId
          ? {
              ...s,
              tasks: s.tasks.map((t) =>
                t.id === taskId ? { ...t, [field]: value } : t,
              ),
            }
          : s,
      ),
    );
  };

  const deleteStage = (stageId: string) =>
    setStages(stages.filter((s) => s.id !== stageId));
  const deleteTask = (stageId: string, taskId: string) =>
    setStages(
      stages.map((s) =>
        s.id === stageId
          ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) }
          : s,
      ),
    );

  const isEditing = () =>
    (document.activeElement as HTMLElement)?.tagName === "INPUT";

  const handleStageDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    stageId: string,
  ) => {
    if (isEditing()) {
      e.preventDefault();
      return;
    }
    setDraggedStageId(stageId);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleStageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const handleStageDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetStageId: string,
  ) => {
    e.preventDefault();
    if (!draggedStageId || draggedStageId === targetStageId) return;
    const updatedStages = [...stages];
    const draggedIndex = updatedStages.findIndex(
      (s) => s.id === draggedStageId,
    );
    const targetIndex = updatedStages.findIndex((s) => s.id === targetStageId);
    const [removed] = updatedStages.splice(draggedIndex, 1);
    updatedStages.splice(targetIndex, 0, removed);
    setStages(updatedStages);
    setDraggedStageId(null);
  };

  const handleTaskDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    stageId: string,
    taskId: string,
  ) => {
    if (isEditing()) {
      e.preventDefault();
      return;
    }
    setDraggedTaskInfo({ stageId, taskId });
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  };
  const handleTaskDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.stopPropagation();
  };
  const handleTaskDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetStageId: string,
    targetTaskId: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !draggedTaskInfo ||
      (draggedTaskInfo.stageId === targetStageId &&
        draggedTaskInfo.taskId === targetTaskId)
    )
      return;
    const updatedStages = [...stages].map((s) => ({
      ...s,
      tasks: [...s.tasks],
    }));
    const sourceStage = updatedStages.find(
      (s) => s.id === draggedTaskInfo.stageId,
    );
    const targetStage = updatedStages.find((s) => s.id === targetStageId);
    if (!sourceStage || !targetStage) return;
    const draggedTaskIndex = sourceStage.tasks.findIndex(
      (t) => t.id === draggedTaskInfo.taskId,
    );
    const [draggedTask] = sourceStage.tasks.splice(draggedTaskIndex, 1);
    const targetTaskIndex = targetStage.tasks.findIndex(
      (t) => t.id === targetTaskId,
    );
    targetStage.tasks.splice(targetTaskIndex, 0, draggedTask);
    setStages(updatedStages);
    setDraggedTaskInfo(null);
  };

  const handleSave = async () => {
    if (!templateName.trim()) return;
    setSaving(true);

    const payload = {
      name: templateName,
      description: "",
      duration_days: duration,
      stages: stages.map((s) => ({
        id: s.id,
        title: s.title,
        start_day: 1,
        end_day: 7,
        tasks: s.tasks.map((t) => ({
          title: t.title,
          deadline: t.deadline,
          jiraTemplate: t.jiraTemplate,
        })),
      })),
    };

    try {
      if (isNew) {
        await apiClient.post("/hr/templates", payload);
      } else {
        await apiClient.put(`/hr/templates/${id}`, payload);
      }
      navigate("/hr/templates");
    } catch (err) {
      console.error("Ошибка сохранения:", err);
    } finally {
      setSaving(false);
    }
  };

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
    <div className="hr-template-editor">
      <div className="hr-editor-header">
        <button
          className="hr-icon-btn-lg"
          onClick={() => navigate("/hr/templates")}
        >
          <ArrowLeft size={20} />
        </button>
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="hr-editor-title-input"
          onMouseDown={(e) => e.stopPropagation()}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={16} color="var(--nau-gray)" />
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="hr-editable-input"
              style={{ 
                width: "50px", 
                textAlign: "center", 
                background: "var(--nau-white)",
                borderColor: "var(--nau-border)"
              }}
            />
            <span className="text-gray text-sm">дней</span>
          </div>
          <button
            className="hr-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={18} className="spinner" />
            ) : (
              <Save size={18} />
            )}
            Сохранить
          </button>
        </div>
      </div>

      <div className="hr-editor-stages">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`hr-stage-card ${draggedStageId === stage.id ? "dragging" : ""}`}
            draggable
            onDragStart={(e) => handleStageDragStart(e, stage.id)}
            onDragOver={handleStageDragOver}
            onDrop={(e) => handleStageDrop(e, stage.id)}
          >
            <div
              className="hr-stage-header"
              onClick={() => toggleStage(stage.id)}
            >
              <div
                className="hr-stage-drag"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <GripVertical size={20} color="var(--nau-gray)" />
              </div>
              <div className="hr-stage-info">
                <input
                  type="text"
                  value={stage.title}
                  onChange={(e) => updateStageTitle(stage.id, e.target.value)}
                  className="hr-editable-input hr-editable-stage-title"
                  size={Math.max(stage.title.length, 5)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="hr-stage-subtitle">
                  {stage.tasks.length} задач
                </span>
              </div>
              <div className="hr-stage-actions">
                <button
                  className="hr-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStage(stage.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
                <div className="hr-chevron-btn">
                  {stage.isOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>
            </div>

            {stage.isOpen && (
              <div className="hr-stage-content">
                {stage.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`hr-task-card ${draggedTaskInfo?.taskId === task.id ? "dragging" : ""}`}
                    draggable
                    onDragStart={(e) =>
                      handleTaskDragStart(e, stage.id, task.id)
                    }
                    onDragOver={handleTaskDragOver}
                    onDrop={(e) => handleTaskDrop(e, stage.id, task.id)}
                  >
                    <div className="hr-task-drag">
                      <GripVertical size={16} color="var(--nau-gray)" />
                    </div>
                    <div className="hr-task-content">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) =>
                          updateTaskField(
                            stage.id,
                            task.id,
                            "title",
                            e.target.value,
                          )
                        }
                        className="hr-editable-input hr-editable-task-title"
                        size={Math.max(task.title.length, 5)}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                      <div className="hr-task-meta">
                        <div className="hr-editable-tag-wrapper">
                          <FileText size={12} style={{ flexShrink: 0 }} />
                          <input
                            type="text"
                            value={task.deadline}
                            onChange={(e) =>
                              updateTaskField(
                                stage.id,
                                task.id,
                                "deadline",
                                e.target.value,
                              )
                            }
                            className="hr-editable-input hr-editable-desc"
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div
                          className="hr-editable-tag-wrapper"
                          style={{
                            background: "var(--nau-light-blue, #eef2ff)",
                          }}
                        >
                          <Ticket size={12} style={{ flexShrink: 0 }} />
                          <input
                            type="text"
                            placeholder="Название в Jira"
                            value={task.jiraTemplate || ""}
                            onChange={(e) =>
                              updateTaskField(
                                stage.id,
                                task.id,
                                "jiraTemplate",
                                e.target.value,
                              )
                            }
                            className="hr-editable-input hr-editable-jira"
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      className="hr-icon-btn"
                      onClick={() => deleteTask(stage.id, task.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  className="hr-add-task-btn"
                  onClick={() => addTask(stage.id)}
                >
                  <Plus size={16} />
                  Добавить задачу
                </button>
              </div>
            )}
          </div>
        ))}
        <button className="hr-add-stage-btn" onClick={addStage}>
          <Plus size={20} />
          Добавить этап
        </button>
      </div>
    </div>
  );
};

export default HrTemplateEditor;