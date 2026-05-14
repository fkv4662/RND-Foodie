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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
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
        headers: {
          "Content-Type": "application/json",
        },
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
      <div style={cardStyle}>
        {/* FOODIE ICON */}
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
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const cardStyle: React.CSSProperties = {
  width: "400px",
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  padding: "40px",
  border: "1px solid #eee",
};

const logoStyle: React.CSSProperties = {
  fontSize: "58px",
  textAlign: "center",
  marginBottom: "10px",
};

const cardTitleStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "10px",
  fontSize: "34px",
  fontWeight: "bold",
};

const subTextStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#666",
  marginBottom: "28px",
  fontSize: "15px",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const inputStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "15px",
  outline: "none",
};

const loginButtonStyle: React.CSSProperties = {
  background: "#4CAF2A",
  color: "#fff",
  border: "none",
  padding: "16px",
  borderRadius: "10px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "8px",
};

const switchButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#1f2bff",
  cursor: "pointer",
  fontWeight: "bold",
  marginTop: "10px",
};