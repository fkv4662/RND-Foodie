import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

type TaskItem = {
  icon: string;
  title: string;
  description: string;
  path: string;
};

export default function Tasks() {
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("user");
  const user = savedUser ? JSON.parse(savedUser) : null;
  const role = user?.role;

  const tasks: TaskItem[] = [
    {
      icon: "✅",
      title: "Daily CCP Checks",
      description: "Complete daily food safety temperature checks",
      path: "/ccp-checks",
    },
    {
      icon: "🔥",
      title: "Hot Food Check",
      description: "Record hot food temperatures manually",
      path: "/hot-food-check",
    },
    {
      icon: "📋",
      title: "CCP Logs",
      description: "View all sensor and manual temperature logs",
      path: "/ccp-logs",
    },
  ];

  const visibleTasks =
    role === "AUDITOR"
      ? tasks.filter((task) => task.path === "/ccp-logs")
      : tasks;

  return (
    <DashboardLayout title="Tasks">
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {visibleTasks.map((task) => (
          <div
            key={task.title}
            onClick={() => navigate(task.path)}
            style={taskCardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: "52px" }}>{task.icon}</div>

            <div>
              <div style={{ fontWeight: 700, fontSize: "22px" }}>
                {task.title}
              </div>
              <div style={{ color: "#555", marginTop: "6px", fontSize: "15px" }}>
                {task.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

const taskCardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "22px",
  borderRadius: "10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "22px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.14)",
  transition: "0.2s",
};