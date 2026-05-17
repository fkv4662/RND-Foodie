import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type DashboardLayoutProps = {
  title: string;
  children: React.ReactNode;
};

type LoggedInUser = {
  id: number;
  username: string;
  email: string;
  role: string;
};

export default function DashboardLayout({
  title,
  children,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const user: LoggedInUser | null = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const topButtons = [
    { label: "SCHEDULE", path: "/schedule" },
    { label: "NOTIFICATIONS", path: "/notifications" },
    { label: "ACCOUNT", path: "/account" },
    { label: "SUPPORT", path: "/support" },
  ];

  // ONLY SHOW TOP BUTTONS ON HOME/SCHEDULE PAGE
  const showTopButtons =
  location.pathname === "/schedule" ||
  location.pathname === "/notifications" ||
  location.pathname === "/account" ||
  location.pathname === "/support";

  const sideButtons = [
    { icon: "🏠", label: "HOME", path: "/schedule" },
    { icon: "🌡️", label: "CCP", path: "/ccp" },
    { icon: "📋", label: "DIARY", path: "/diary" },
    { icon: "📝", label: "Tasks", path: "/tasks" },
    { icon: "🚚", label: "Delivery", path: "/delivery" },
    ...(user?.role === "MANAGER"
      ? [{ icon: "⚙️", label: "ADMIN", path: "/admin" }]
      : []),
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#d9d9d9",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* TOP HEADER */}
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

        {/* USER ICON */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              border: "1px solid #333",
              background: "#fff",
              color: "#000",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {user?.username?.slice(0, 2).toUpperCase() || "👤"}
          </button>

          {userMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "72px",
                right: 0,
                width: "210px",
                background: "#fff",
                color: "#000",
                borderRadius: "8px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                overflow: "hidden",
                zIndex: 999,
              }}
            >
              <div
                style={{
                  padding: "14px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {user?.username || "User"}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {user?.role || "No role"}
                </div>
              </div>

              <button
                onClick={logout}
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "none",
                  background: "#fff",
                  color: "#e74c3c",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PAGE LAYOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "135px 1fr",
          minHeight: "calc(100vh - 100px)",
        }}
      >
        {/* LEFT SIDEBAR */}
        <aside
          style={{
            background: "#000",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "26px",
            padding: "28px 10px",
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
                  padding: "14px 8px",
                  borderRadius: "12px",
                  background: isActive ? "#444" : "transparent",
                }}
              >
                <div style={{ fontSize: "46px", marginBottom: "10px" }}>
                  {item.icon}
                </div>

                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </aside>

        {/* MAIN */}
        <main style={{ display: "flex", flexDirection: "column" }}>
          {showTopButtons && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                padding: "12px 14px",
              }}
            >
              {topButtons.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  style={{
                    background:
                      location.pathname === item.path ? "#fff" : "#000",
                    color:
                      location.pathname === item.path ? "#111" : "#fff",
                    border:
                      location.pathname === item.path
                        ? "2px solid #111"
                        : "none",
                    padding: "25px 30px",
                    minWidth: "190px",
                    fontSize: "29px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* PAGE CONTENT */}
          <div style={{ flex: 1, padding: "20px" }}>
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