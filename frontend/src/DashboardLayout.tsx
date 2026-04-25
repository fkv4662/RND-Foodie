import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

type DashboardLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export default function DashboardLayout({
  title,
  children,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const topButtons = [
    { label: "SCHEDULE", path: "/schedule" },
    { label: "NOTIFICATIONS", path: "/notifications" },
    { label: "ACCOUNT", path: "/account" },
    { label: "SUPPORT", path: "/support" },
  ];

  const sideButtons = [
    { icon: "🏠", label: "HOME", path: "/dashboard" },
    { icon: "🌡️", label: "CCP", path: "/ccp" },
    { icon: "📋", label: "DIARY", path: "/diary" },
    { icon: "📝", label: "Tasks", path: "/tasks" },
    { icon: "🚚", label: "Delivery", path: "/delivery" },
    { icon: "⚙️", label: "ADMIN", path: "/admin" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#d9d9d9",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          height: "100px",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(34px, 4.5vw, 58px)",
            fontWeight: 500,
            letterSpacing: "1px",
          }}
        >
          FOODIE CONTROL PLAN
        </h1>

        <button
          onClick={logout}
          title="Logout"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "1px solid #333",
            background: "#000",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ⎋
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "110px 1fr",
          minHeight: "calc(100vh - 88px)",
        }}
      >
        <aside
          style={{
            background: "#000",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "22px",
            padding: "24px 8px",
            boxSizing: "border-box",
          }}
        >
          {sideButtons.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <div
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  textAlign: "center",
                  width: "100%",
                  cursor: "pointer",
                  padding: "12px 6px",
                  borderRadius: "10px",
                  transition: "0.2s",
                  background: isActive ? "#444" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "#333";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div style={{ fontSize: "38px", marginBottom: "8px" }}>
                  {item.icon}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.2,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </aside>

        <main
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              padding: "12px 14px",
              boxSizing: "border-box",
            }}
          >
            {topButtons.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  background: location.pathname === item.path ? "#333" : "#000",
                  color: "#fff",
                  border: "none",
                  padding: "25px 30px",
                  minWidth: "190px",
                  fontSize: "29px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#333";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    location.pathname === item.path ? "#333" : "#000";
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div
            style={{
              flex: 1,
              padding: "20px",
              boxSizing: "border-box",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "36px",
                fontWeight: 600,
              }}
            >
              {title}
            </h2>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}