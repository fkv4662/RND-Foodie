import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#d9d9d9",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          background: "#000",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 28px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "56px",
            fontWeight: 400,
            letterSpacing: "1px",
          }}
        >
          FOODIE CONTROL PLAN
        </h1>

        <button
          onClick={logout}
          style={{
            width: "88px",
            height: "88px",
            borderRadius: "50%",
            border: "1px solid #333",
            background: "#000",
            color: "#fff",
            fontSize: "42px",
            cursor: "pointer",
          }}
          title="Logout"
        >
          ⎋
        </button>
      </div>

      {/* Top Nav */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "8px 24px 0 24px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "92px",
            textAlign: "center",
            color: "#fff",
            fontSize: "42px",
          }}
        >
          🏠
          <div style={{ color: "#000", fontSize: "18px", marginTop: "4px" }}>
            HOME
          </div>
        </div>

        {["SCHEDULE", "NOTIFICATIONS", "ACCOUNT", "SUPPORT"].map((item) => (
          <button
            key={item}
            style={{
              background: "#000",
              color: "#fff",
              border: "none",
              padding: "18px 34px",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
              minWidth: "170px",
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", padding: "0 24px 24px 24px" }}>
        {/* Left Sidebar */}
        <div
          style={{
            width: "98px",
            background: "#000",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "18px",
            gap: "18px",
            minHeight: "540px",
          }}
        >
          <SidebarItem icon="🌡️" label="CCP" />
          <SidebarItem icon="📋" label="DIARY" />
          <SidebarItem icon="📄" label="Tasks" />
          <SidebarItem icon="🚚" label="Delivery" />
          <SidebarItem icon="⚙️" label="ADMIN" />
        </div>

        {/* Main Panel */}
        <div
          style={{
            flex: 1,
            background: "#d9d9d9",
            minHeight: "540px",
            borderLeft: "6px solid #d9d9d9",
          }}
        >
          <div style={{ padding: "24px" }}>
            <h2 style={{ marginTop: 0, fontSize: "28px" }}>Home</h2>
            <p style={{ fontSize: "18px" }}>
              Welcome to Foodie Control Plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label }: { icon: string; label: string }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (label === "CCP") navigate("/ccp");
    // Add more navigation logic for other sidebar items if needed
  };
  return (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        cursor: "pointer",
      }}
      onClick={handleClick}
    >
      <div
        style={{
          fontSize: "36px",
          marginBottom: "8px",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: "16px",
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>
    </div>
  );
}