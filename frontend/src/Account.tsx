import { useState } from "react";
import DashboardLayout from "./DashboardLayout";

export default function Account() {
  const savedUser = localStorage.getItem("user");
  const user = savedUser ? JSON.parse(savedUser) : null;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert("Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/users/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Password updated successfully");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.message || "Failed to update password");
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <DashboardLayout title="ACCOUNT">
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>My Account</h2>

        <div style={infoBoxStyle}>
          <InfoRow label="Username" value={user?.username || "Unknown"} />
          <InfoRow label="Email" value={user?.email || "Unknown"} />
          <InfoRow label="Role" value={user?.role || "Unknown"} />
          <InfoRow label="Password" value="********" />
        </div>

        <div style={{ marginTop: "28px" }}>
          <h3>Reset Password</h3>

          <div style={fieldStyle}>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              style={inputStyle}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              style={inputStyle}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button style={buttonStyle} onClick={handleResetPassword}>
            Update Password
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoRowStyle}>
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #cfcfcf",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
  padding: "24px",
  maxWidth: "700px",
};

const infoBoxStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  overflow: "hidden",
};

const infoRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "180px 1fr",
  padding: "14px",
  borderBottom: "1px solid #eee",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  marginBottom: "14px",
};

const labelStyle: React.CSSProperties = {
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  padding: "12px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "14px",
};

const buttonStyle: React.CSSProperties = {
  background: "#1f2bff",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
};