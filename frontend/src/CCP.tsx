import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

export default function CCP() {
  const navigate = useNavigate();

  const cardStyle = {
    borderRadius: "28px",
    padding: "28px",
    minHeight: "320px",
    boxShadow: "0 22px 45px rgba(15, 60, 85, 0.14)",
    border: "1px solid rgba(15, 107, 149, 0.16)",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    cursor: "pointer",
  };

  return (
    <DashboardLayout title="CCP">
      <div
        style={{
          maxWidth: "1180px",
          padding: "10px 8px 28px",
          borderRadius: "34px",
          background:
            "radial-gradient(circle at top left, rgba(230, 126, 34, 0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(91, 192, 235, 0.12), transparent 32%)",
        }}
      >
        <section
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fcff 100%)",
            borderRadius: "30px",
            border: "1px solid #bfd6e2",
            boxShadow: "0 18px 45px rgba(15, 60, 85, 0.12)",
            padding: "28px 30px",
            marginBottom: "22px",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.12em", color: "#0f6b95", marginBottom: "8px" }}>
            CRITICAL CONTROL POINTS
          </div>
          <div style={{ fontSize: "34px", fontWeight: 800, color: "#13242d", marginBottom: "10px" }}>
            Monitor your temperature-critical workflows
          </div>
          <div style={{ maxWidth: "760px", color: "#526671", fontSize: "15px", lineHeight: 1.6 }}>
            Choose the area you want to check or record. Each workflow keeps a focused view of monitoring, alerts, and the evidence your team needs for food safety compliance.
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "18px" }}>
            <div style={{ background: "#eef8fd", color: "#0f6b95", borderRadius: "999px", padding: "10px 14px", fontWeight: 700, fontSize: "13px" }}>
              Oven cooking records
            </div>
            <div style={{ background: "#eef8fd", color: "#0f6b95", borderRadius: "999px", padding: "10px 14px", fontWeight: 700, fontSize: "13px" }}>
              Fridge monitoring
            </div>
            <div style={{ background: "#eef8fd", color: "#0f6b95", borderRadius: "999px", padding: "10px 14px", fontWeight: 700, fontSize: "13px" }}>
              Alerts and evidence
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          <article
            style={{
              ...cardStyle,
              background: "linear-gradient(180deg, #fff7ef 0%, #ffffff 100%)",
            }}
            onClick={() => navigate("/rational-oven")}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "18px" }}>
                <div style={{ fontSize: "86px", lineHeight: 1 }}>🍞</div>
                <div style={{ background: "rgba(230, 126, 34, 0.12)", color: "#b05b12", borderRadius: "999px", padding: "8px 12px", fontWeight: 700, fontSize: "12px" }}>
                  MANUAL ENTRY
                </div>
              </div>

              <div style={{ fontSize: "30px", fontWeight: 800, color: "#1d2830", marginBottom: "8px" }}>
                Rational oven
              </div>
              <div style={{ color: "#5d686f", fontSize: "15px", lineHeight: 1.6, marginBottom: "18px" }}>
                Record start and finish temperatures for cooked food, review oven alerts, and keep a clear audit trail for hot food checks.
              </div>

              <div style={{ display: "grid", gap: "10px", color: "#33424b", fontSize: "14px", lineHeight: 1.5 }}>
                <div>Start and finish temperature logging</div>
                <div>Alert-focused monitoring for unsafe results</div>
                <div>Fast manual entry for kitchen staff</div>
              </div>
            </div>

            <div style={{ marginTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#b05b12", fontWeight: 800, fontSize: "14px" }}>Open oven workflow</div>
              <div style={{ fontSize: "28px", color: "#1e2d35" }}>→</div>
            </div>
          </article>

          <article
            style={{
              ...cardStyle,
              background: "linear-gradient(180deg, #effbff 0%, #ffffff 100%)",
            }}
            onClick={() => navigate("/testo-fridge")}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "18px" }}>
                <div style={{ fontSize: "86px", lineHeight: 1 }}>🧊</div>
                <div style={{ background: "rgba(91, 192, 235, 0.18)", color: "#167ca1", borderRadius: "999px", padding: "8px 12px", fontWeight: 700, fontSize: "12px" }}>
                  SENSOR + MANUAL
                </div>
              </div>

              <div style={{ fontSize: "30px", fontWeight: 800, color: "#1d2830", marginBottom: "8px" }}>
                Testo fridge
              </div>
              <div style={{ color: "#5d686f", fontSize: "15px", lineHeight: 1.6, marginBottom: "18px" }}>
                Review imported fridge readings, capture manual temperature entries, and focus quickly on cold-chain alerts that need action.
              </div>

              <div style={{ display: "grid", gap: "10px", color: "#33424b", fontSize: "14px", lineHeight: 1.5 }}>
                <div>Cloud and manual fridge readings</div>
                <div>Alert filtering for temperature breaches</div>
                <div>Cold storage evidence in one place</div>
              </div>
            </div>

            <div style={{ marginTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#167ca1", fontWeight: 800, fontSize: "14px" }}>Open fridge workflow</div>
              <div style={{ fontSize: "28px", color: "#1e2d35" }}>→</div>
            </div>
          </article>
        </section>
      </div>
    </DashboardLayout>
  );
}