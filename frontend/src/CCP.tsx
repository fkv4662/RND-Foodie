import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

export default function CCP() {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="CCP">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "60px",
          marginTop: "40px",
        }}
      >
        <div
          style={{ textAlign: "center", cursor: "pointer" }}
          onClick={() => navigate("/rational-oven")}
        >
          <div style={{ fontSize: "120px", color: "#e67e22" }}>🍞</div>
          <div style={{ fontSize: "32px", marginTop: "12px" }}>
            Rational oven
          </div>
        </div>

        <div
          style={{ textAlign: "center", cursor: "pointer" }}
          onClick={() => navigate("/testo-fridge")}
        >
          <div style={{ fontSize: "120px", color: "#5bc0eb" }}>🧊</div>
          <div style={{ fontSize: "32px", marginTop: "12px" }}>
            Testo fridge
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}