import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const navigate = useNavigate();

  // ================= LOGIN =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/dashboard");
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch {
      alert("Login failed");
    }
  };

  // ================= REGISTER =================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regName,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Registration successful!");

        setShowRegister(false);
        setEmail(regEmail);
        setPassword("");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>FOODIE CONTROL PLAN</h1>
      </div>

      {/* LOGIN CARD */}
      <div style={cardStyle}>
        <div style={logoStyle}>🍽️</div>

        <h2 style={cardTitleStyle}>
          {showRegister ? "Create Account" : "FOODIE"}
        </h2>

        <p style={subTextStyle}>
          {showRegister
            ? "Create a new FOODIE account"
            : "Access Food Control Production"}
        </p>

        {!showRegister ? (
          <form onSubmit={handleSubmit} style={formStyle}>
            <input
              style={inputStyle}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              style={inputStyle}
              type="password"
              placeholder="your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button style={loginButtonStyle} type="submit">
              LOG IN →
            </button>

            <button
              type="button"
              style={switchButtonStyle}
              onClick={() => setShowRegister(true)}
            >
              Create an account
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={formStyle}>
            <input
              style={inputStyle}
              type="text"
              placeholder="username"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
            />

            <input
              style={inputStyle}
              type="email"
              placeholder="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />

            <input
              style={inputStyle}
              type="password"
              placeholder="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />

            <button style={loginButtonStyle} type="submit">
              REGISTER →
            </button>

            <button
              type="button"
              style={switchButtonStyle}
              onClick={() => setShowRegister(false)}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

// ================= STYLES =================

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#ffffff",
};

const headerStyle: React.CSSProperties = {
  background: "#000",
  padding: "28px 40px",
};

const titleStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: "56px",
  fontWeight: "bold",
  margin: 0,
};

const cardStyle: React.CSSProperties = {
  width: "400px",
  margin: "90px auto",
  background: "#fff",
  borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  padding: "36px",
  border: "1px solid #ddd",
};

const logoStyle: React.CSSProperties = {
  fontSize: "50px",
  textAlign: "center",
};

const cardTitleStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "10px",
  fontSize: "32px",
};

const subTextStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#666",
  marginBottom: "24px",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const inputStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px",
};

const loginButtonStyle: React.CSSProperties = {
  background: "#4CAF2A",
  color: "#fff",
  border: "none",
  padding: "16px",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
};

const switchButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#1f2bff",
  cursor: "pointer",
  fontWeight: "bold",
  marginTop: "10px",
};