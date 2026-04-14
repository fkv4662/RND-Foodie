import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

export default function CCP() {
  const navigate = useNavigate();

  const ccpItems = [
    { icon: "🍞", label: "Rational oven", path: "/rational-oven" },
    { icon: "🧊", label: "Testo fridge", path: "/testo-fridge" },
    { icon: "📄", label: "Manual Entry", path: "/hot-food-check" },
    { icon: "📋", label: "CCP Logs", path: "/ccp-logs" },
  ];

  return (
    <DashboardLayout title="CCP">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "40px",
          justifyItems: "center",
          marginTop: "40px",
        }}
      >
        {ccpItems.map((item) => (
          <div
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "30px 20px",
              width: "200px",
              textAlign: "center",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <div style={{ fontSize: "80px", marginBottom: "15px" }}>
              {item.icon}
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}