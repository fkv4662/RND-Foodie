import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

export default function Tasks() {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Tasks">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* CCP Checks */}
        <div
          onClick={() => navigate("/ccp-checks")}
          style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
        >
          <div style={{ fontSize: "48px" }}>✅</div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "20px" }}>Daily CCP Checks</div>
            <div style={{ color: "#555", marginTop: "5px" }}>Complete daily food safety temperature checks</div>
          </div>
        </div>

        {/* Hot Food Check */}
        <div
          onClick={() => navigate("/hot-food-check")}
          style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
        >
          <div style={{ fontSize: "48px" }}>🔥</div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "20px" }}>Hot Food Check</div>
            <div style={{ color: "#555", marginTop: "5px" }}>Record hot food temperatures manually</div>
          </div>
        </div>

        {/* CCP Logs */}
        <div
          onClick={() => navigate("/ccp-logs")}
          style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
        >
          <div style={{ fontSize: "48px" }}>📋</div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "20px" }}>CCP Logs</div>
            <div style={{ color: "#555", marginTop: "5px" }}>View all sensor and manual temperature logs</div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}