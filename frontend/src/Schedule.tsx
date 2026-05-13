import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";

type LoggedInUser = {
  id: number;
  username: string;
  email: string;
  role: string;
};

type ScheduleTask = {
  id: number;
  title: string;
  scheduledTime: string;
  dayOfWeek: number | null;
  recurrenceType: "WEEKLY" | "DAILY";
  assignedUserId: number | null;
  assignedLabel: string;
  assignToEveryone: boolean;
  occurrenceDate: string;
  completed: boolean;
  completedAt: string | null;
  completedBy: string | null;
};

type ScheduleDay = {
  dayOfWeek: number;
  occurrenceDate: string;
  tasks: ScheduleTask[];
};

type ScheduleResponse = {
  success: boolean;
  weekStart: string;
  weekEnd: string;
  canManage: boolean;
  schedule: ScheduleDay[];
  recurringTasks: Array<{
    id: number;
    title: string;
    scheduledTime: string;
    assignedLabel: string;
    recurrenceType: "DAILY" | "WEEKLY";
  }>;
};

type UserOption = {
  id: number;
  username: string;
  email: string;
  role: string;
};

type TaskFormState = {
  title: string;
  scheduledTime: string;
  recurrenceType: "WEEKLY" | "DAILY";
  dayOfWeek: string;
  assignmentMode: "EVERYONE" | "USER";
  assignedUserId: string;
};

const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const defaultForm = {
  title: "",
  scheduledTime: "08:00",
  recurrenceType: "WEEKLY" as "WEEKLY" | "DAILY",
  dayOfWeek: "0",
  assignmentMode: "EVERYONE" as "EVERYONE" | "USER",
  assignedUserId: "",
};

function buildFormFromTask(task: ScheduleTask): TaskFormState {
  return {
    title: task.title,
    scheduledTime: task.scheduledTime,
    recurrenceType: task.recurrenceType,
    dayOfWeek: task.dayOfWeek !== null ? String(task.dayOfWeek) : "0",
    assignmentMode: task.assignToEveryone ? "EVERYONE" : "USER",
    assignedUserId: task.assignedUserId !== null ? String(task.assignedUserId) : "",
  };
}

function getStoredUser(): LoggedInUser | null {
  const savedUser = localStorage.getItem("user");
  return savedUser ? JSON.parse(savedUser) : null;
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const offset = (day + 6) % 7;

  next.setDate(next.getDate() - offset);
  next.setHours(0, 0, 0, 0);

  return next;
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWeekRange(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatDayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export default function Schedule() {
  const user = getStoredUser();
  const canManage = user?.role === "MANAGER";

  const [weekStart, setWeekStart] = useState(formatIsoDate(startOfWeek(new Date())));
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<ScheduleResponse["recurringTasks"]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState("");
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);

  const loadSchedule = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/schedule/week?weekStart=${weekStart}`, {
        headers: getAuthHeaders(),
      });
      const data: ScheduleResponse = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data && "message" in data ? String((data as never as { message?: string }).message || "Failed to load schedule") : "Failed to load schedule");
        setScheduleDays([]);
        setRecurringTasks([]);
        return;
      }

      setScheduleDays(data.schedule);
      setRecurringTasks(data.recurringTasks);
      setMessage("");
    } catch {
      setMessage("Failed to load schedule");
      setScheduleDays([]);
      setRecurringTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!canManage) {
      return;
    }

    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [weekStart]);

  useEffect(() => {
    loadUsers();
  }, []);

  const moveWeek = (offset: number) => {
    const next = new Date(`${weekStart}T00:00:00`);
    next.setDate(next.getDate() + offset * 7);
    setWeekStart(formatIsoDate(startOfWeek(next)));
  };

  const canToggleTaskCompletion = (task: ScheduleTask) => {
    if (canManage) {
      return true;
    }

    if (task.assignToEveryone) {
      return true;
    }

    return task.assignedUserId === user?.id;
  };

  const getTaskAppearance = (task: ScheduleTask) => {
    if (task.assignToEveryone) {
      return {
        background: task.completed ? "#f2ede3" : "#fff3d6",
        borderLeftColor: task.completed ? "#8b6b2f" : "#c69214",
      };
    }

    if (task.assignedUserId === user?.id) {
      return {
        background: task.completed ? "#e9f1ff" : "#dceaff",
        borderLeftColor: task.completed ? "#2d5fbc" : "#0b5db7",
      };
    }

    return {
      background: task.completed ? "#f3f3f3" : "#ffffff",
      borderLeftColor: task.completed ? "#6f6f6f" : "#000000",
    };
  };

  const handleToggleCompletion = async (task: ScheduleTask) => {
    if (!canToggleTaskCompletion(task)) {
      alert("You can only mark your own tasks or Everyone tasks as done");
      return;
    }

    try {
      const response = await fetch(`/api/schedule/tasks/${task.id}/completion`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          occurrenceDate: task.occurrenceDate,
          completed: !task.completed,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to update task");
        return;
      }

      await loadSchedule();
    } catch {
      alert("Failed to update task");
    }
  };

  const handleCreateTask = async () => {
    if (!form.title.trim()) {
      alert("Task title is required");
      return;
    }

    if (form.assignmentMode === "USER" && !form.assignedUserId) {
      alert("Choose a registered user or Everyone");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/schedule/tasks", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: form.title,
          scheduledTime: form.scheduledTime,
          recurrenceType: form.recurrenceType,
          dayOfWeek: form.recurrenceType === "WEEKLY" ? Number(form.dayOfWeek) : null,
          assignToEveryone: form.assignmentMode === "EVERYONE",
          assignedUserId: form.assignmentMode === "USER" ? Number(form.assignedUserId) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to create task");
        return;
      }

      setShowAddModal(false);
      setForm(defaultForm);
      await loadSchedule();
    } catch {
      alert("Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (task: ScheduleTask) => {
    setEditingTask(task);
    setForm(buildFormFromTask(task));
    setShowAddModal(true);
  };

  const handleDeleteTask = async (task: ScheduleTask) => {
    const confirmed = window.confirm(`Delete task "${task.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/schedule/tasks/${task.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to delete task");
        return;
      }

      await loadSchedule();
    } catch {
      alert("Failed to delete task");
    }
  };

  const handleSaveTask = async () => {
    if (!form.title.trim()) {
      alert("Task title is required");
      return;
    }

    if (form.assignmentMode === "USER" && !form.assignedUserId) {
      alert("Choose a registered user or Everyone");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(editingTask ? `/api/schedule/tasks/${editingTask.id}` : "/api/schedule/tasks", {
        method: editingTask ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: form.title,
          scheduledTime: form.scheduledTime,
          recurrenceType: form.recurrenceType,
          dayOfWeek: form.recurrenceType === "WEEKLY" ? Number(form.dayOfWeek) : null,
          assignToEveryone: form.assignmentMode === "EVERYONE",
          assignedUserId: form.assignmentMode === "USER" ? Number(form.assignedUserId) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || `Failed to ${editingTask ? "update" : "create"} task`);
        return;
      }

      setShowAddModal(false);
      setEditingTask(null);
      setForm(defaultForm);
      await loadSchedule();
    } catch {
      alert(`Failed to ${editingTask ? "update" : "create"} task`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Schedule">
      <div style={{ display: "grid", gap: "18px" }}>
        <div style={toolbarStyle}>
          <div>
            <div style={{ fontSize: "13px", letterSpacing: "0.08em", fontWeight: 800, color: "#505050", marginBottom: "6px" }}>
              WEEKLY TASK BOARD
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800 }}>{formatWeekRange(weekStart)}</div>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => moveWeek(-1)} style={secondaryButtonStyle}>
              Previous Week
            </button>
            <button type="button" onClick={() => setWeekStart(formatIsoDate(startOfWeek(new Date())))} style={secondaryButtonStyle}>
              This Week
            </button>
            <button type="button" onClick={() => moveWeek(1)} style={secondaryButtonStyle}>
              Next Week
            </button>
            {canManage && (
              <button type="button" onClick={() => setShowAddModal(true)} style={primaryButtonStyle}>
                + Add Task
              </button>
            )}
          </div>
        </div>

        {!canManage && (
          <div style={infoBannerStyle}>
            Staff can view tasks and mark them done or not done. Only managers can add new schedule tasks.
          </div>
        )}

        <div style={legendPanelStyle}>
          <div style={{ fontWeight: 800, color: "#222" }}>Task colors</div>
          <div style={legendItemsStyle}>
            <div style={legendItemStyle}>
              <span style={{ ...legendSwatchStyle, background: "#fff3d6", borderColor: "#c69214" }} />
              Everyone task
            </div>
            <div style={legendItemStyle}>
              <span style={{ ...legendSwatchStyle, background: "#dceaff", borderColor: "#0b5db7" }} />
              Assigned to you
            </div>
            <div style={legendItemStyle}>
              <span style={{ ...legendSwatchStyle, background: "#ffffff", borderColor: "#000000" }} />
              Assigned to others
            </div>
          </div>
        </div>

        {message && <div style={errorBannerStyle}>{message}</div>}

        {loading ? (
          <div style={emptyPanelStyle}>Loading schedule...</div>
        ) : (
          <div style={boardGridStyle}>
            {scheduleDays.map((day) => (
              <section key={day.occurrenceDate} style={dayCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 800 }}>{dayLabels[day.dayOfWeek]}</h3>
                  <div style={{ fontSize: "13px", color: "#575757", fontWeight: 700 }}>{formatDayDate(day.occurrenceDate)}</div>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  {day.tasks.length === 0 ? (
                    <div style={emptyDayStyle}>No tasks are scheduled</div>
                  ) : (
                    day.tasks.map((task) => (
                      <div
                        key={`${task.id}-${task.occurrenceDate}`}
                        style={{
                          ...taskRowStyle,
                          background: getTaskAppearance(task).background,
                          borderLeftColor: getTaskAppearance(task).borderLeftColor,
                        }}
                      >
                        <div style={{ display: "grid", gap: "6px", minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ fontWeight: 700, fontSize: "14px", color: "#151515" }}>
                              {task.scheduledTime} - {task.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "#4f4f4f", fontWeight: 700 }}>
                              Assigned: {task.assignedLabel}
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {task.assignToEveryone && <span style={everyoneBadgeStyle}>Everyone</span>}
                              {task.recurrenceType === "DAILY" && <span style={dailyBadgeStyle}>Daily</span>}
                              {task.completed && (
                                <span style={doneBadgeStyle}>
                                  Done{task.completedBy ? ` by ${task.completedBy}` : ""}
                                </span>
                              )}
                            </div>


                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                              {canManage && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleEditClick(task)}
                                    style={managerActionButtonStyle}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTask(task)}
                                    style={deleteButtonStyle}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => handleToggleCompletion(task)}
                                disabled={!canToggleTaskCompletion(task)}
                                title={!canToggleTaskCompletion(task) ? "Only managers can complete tasks assigned to other users" : undefined}
                                style={{
                                  ...toggleButtonStyle,
                                  background: !canToggleTaskCompletion(task)
                                    ? "#f2f2f2"
                                    : task.completed
                                      ? "#ebf7ef"
                                      : "#fff",
                                  color: !canToggleTaskCompletion(task)
                                    ? "#8a8a8a"
                                    : task.completed
                                      ? "#1f8f53"
                                      : "#222",
                                  borderColor: !canToggleTaskCompletion(task)
                                    ? "#dddddd"
                                    : task.completed
                                      ? "#bfe0cc"
                                      : "#c9c9c9",
                                  cursor: !canToggleTaskCompletion(task) ? "not-allowed" : "pointer",
                                }}
                              >
                                {task.completed ? "Mark Not Done" : "Mark Done"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

        <section style={recurringPanelStyle}>
          <h3 style={{ margin: "0 0 14px", fontSize: "24px", fontWeight: 800 }}>Recurring Tasks</h3>
          {recurringTasks.length === 0 ? (
            <div style={emptyDayStyle}>No recurring daily tasks are set up yet.</div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {recurringTasks.map((task) => (
                <div key={task.id} style={recurringRowStyle}>
                  <div style={{ fontWeight: 700 }}>{task.title}</div>
                  <div style={{ color: "#444", fontWeight: 600 }}>{task.scheduledTime}</div>
                  <div style={{ color: "#555" }}>Assigned to {task.assignedLabel}</div>
                  <div style={dailyBadgeStyle}>Every day</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showAddModal && canManage && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
              <div>
                <div style={{ fontSize: "12px", letterSpacing: "0.08em", fontWeight: 800, color: "#5f5f5f", marginBottom: "6px" }}>
                  MANAGER ACTION
                </div>
                <h3 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>{editingTask ? "Edit Schedule Task" : "Add Schedule Task"}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTask(null);
                  setForm(defaultForm);
                }}
                style={closeButtonStyle}
              >
                Close
              </button>
            </div>

            <div style={{ display: "grid", gap: "14px" }}>
              <label style={fieldLabelStyle}>
                Task name
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  style={inputStyle}
                  placeholder="Hot food temperature check"
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <label style={fieldLabelStyle}>
                  Time
                  <input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(event) => setForm((current) => ({ ...current, scheduledTime: event.target.value }))}
                    style={inputStyle}
                  />
                </label>

                <label style={fieldLabelStyle}>
                  Availability
                  <select
                    value={form.recurrenceType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        recurrenceType: event.target.value as "WEEKLY" | "DAILY",
                      }))
                    }
                    style={inputStyle}
                  >
                    <option value="WEEKLY">Weekly on one day</option>
                    <option value="DAILY">Automatically available every day</option>
                  </select>
                </label>
              </div>

              {form.recurrenceType === "WEEKLY" && (
                <label style={fieldLabelStyle}>
                  Day
                  <select
                    value={form.dayOfWeek}
                    onChange={(event) => setForm((current) => ({ ...current, dayOfWeek: event.target.value }))}
                    style={inputStyle}
                  >
                    {dayLabels.map((dayLabel, index) => (
                      <option key={dayLabel} value={String(index)}>
                        {dayLabel}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <label style={fieldLabelStyle}>
                  Assign task to
                  <select
                    value={form.assignmentMode}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        assignmentMode: event.target.value as "EVERYONE" | "USER",
                        assignedUserId: event.target.value === "EVERYONE" ? "" : current.assignedUserId,
                      }))
                    }
                    style={inputStyle}
                  >
                    <option value="EVERYONE">Everyone</option>
                    <option value="USER">Specific registered user</option>
                  </select>
                </label>

                <label style={fieldLabelStyle}>
                  Registered user
                  <select
                    value={form.assignedUserId}
                    onChange={(event) => setForm((current) => ({ ...current, assignedUserId: event.target.value }))}
                    style={{ ...inputStyle, opacity: form.assignmentMode === "USER" ? 1 : 0.6 }}
                    disabled={form.assignmentMode !== "USER"}
                  >
                    <option value="">Choose user</option>
                    {users.map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.username} ({option.role})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "22px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTask(null);
                  setForm(defaultForm);
                }}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>
              <button type="button" onClick={handleSaveTask} style={primaryButtonStyle} disabled={saving}>
                {saving ? "Saving..." : editingTask ? "Save Changes" : "Save Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const toolbarStyle: React.CSSProperties = {
  background: "#f7f7f7",
  borderRadius: "14px",
  padding: "18px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const boardGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: "16px",
};

const legendPanelStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  padding: "12px 16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  display: "flex",
  gap: "14px",
  alignItems: "center",
  flexWrap: "wrap",
};

const legendItemsStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  flexWrap: "wrap",
  alignItems: "center",
};

const legendItemStyle: React.CSSProperties = {
  display: "inline-flex",
  gap: "8px",
  alignItems: "center",
  color: "#444",
  fontWeight: 600,
};

const legendSwatchStyle: React.CSSProperties = {
  width: "16px",
  height: "16px",
  borderRadius: "4px",
  border: "2px solid #000",
  display: "inline-block",
};

const dayCardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "14px",
  padding: "16px",
  boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
};

const taskRowStyle: React.CSSProperties = {
  background: "#f5f5f5",
  borderRadius: "10px",
  padding: "12px 12px 12px 14px",
  borderLeft: "5px solid #000",
};

const recurringPanelStyle: React.CSSProperties = {
  background: "#f7f7f7",
  borderRadius: "14px",
  padding: "18px 20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const recurringRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(180px, 2fr) minmax(110px, 1fr) minmax(160px, 1.4fr) auto",
  gap: "12px",
  alignItems: "center",
  padding: "12px 14px",
  borderRadius: "10px",
  background: "#fff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const emptyPanelStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "14px",
  padding: "28px",
  textAlign: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  color: "#555",
};

const emptyDayStyle: React.CSSProperties = {
  background: "#f2f2f2",
  color: "#5d5d5d",
  borderRadius: "10px",
  padding: "14px",
  fontWeight: 600,
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#000",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "#fff",
  color: "#111",
  border: "1px solid #c7c7c7",
  padding: "12px 16px",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
};

const toggleButtonStyle: React.CSSProperties = {
  border: "1px solid #c9c9c9",
  padding: "8px 12px",
  borderRadius: "999px",
  fontWeight: 700,
  cursor: "pointer",
};

const managerActionButtonStyle: React.CSSProperties = {
  background: "#fff",
  color: "#111",
  border: "1px solid #c9c9c9",
  padding: "8px 12px",
  borderRadius: "999px",
  fontWeight: 700,
  cursor: "pointer",
};

const deleteButtonStyle: React.CSSProperties = {
  background: "#fff4f4",
  color: "#a53030",
  border: "1px solid #e5baba",
  padding: "8px 12px",
  borderRadius: "999px",
  fontWeight: 700,
  cursor: "pointer",
};

const everyoneBadgeStyle: React.CSSProperties = {
  background: "#ece7ff",
  color: "#4b2db8",
  borderRadius: "999px",
  padding: "5px 10px",
  fontSize: "12px",
  fontWeight: 800,
};

const dailyBadgeStyle: React.CSSProperties = {
  background: "#e8f3ff",
  color: "#0b5db7",
  borderRadius: "999px",
  padding: "5px 10px",
  fontSize: "12px",
  fontWeight: 800,
};

const doneBadgeStyle: React.CSSProperties = {
  background: "#ebf7ef",
  color: "#1f8f53",
  borderRadius: "999px",
  padding: "5px 10px",
  fontSize: "12px",
  fontWeight: 800,
};

const infoBannerStyle: React.CSSProperties = {
  background: "#fff",
  borderLeft: "6px solid #000",
  borderRadius: "12px",
  padding: "14px 16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const errorBannerStyle: React.CSSProperties = {
  background: "#fff4f4",
  color: "#a53030",
  borderLeft: "6px solid #d13b3b",
  borderRadius: "12px",
  padding: "14px 16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1000,
};

const modalCardStyle: React.CSSProperties = {
  width: "min(720px, 100%)",
  background: "#fff",
  borderRadius: "16px",
  padding: "22px",
  boxShadow: "0 18px 44px rgba(0,0,0,0.24)",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "grid",
  gap: "8px",
  fontWeight: 700,
  color: "#1e1e1e",
};

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid #c7c7c7",
  fontSize: "14px",
};

const closeButtonStyle: React.CSSProperties = {
  background: "transparent",
  color: "#333",
  border: "1px solid #c7c7c7",
  padding: "10px 14px",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
};