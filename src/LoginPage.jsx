import React, { useState } from "react";
import "./App.css";

export default function LoginPage({ onLogin }) {
  const [employeeID, setEmployeeID] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeID || !password) {
      setError("Please enter both Employee ID and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeID, password }),
        credentials: "include", // optional, if backend uses cookies/session
      });
      const text = await res.text();
      if (res.ok) {
        onLogin(employeeID);
      } else {
        setError(text || "Invalid Employee ID or password.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="app-container"
      style={{
        background:
          "linear-gradient(135deg, #e0f2fe 0%, #c7d2fe 100%)",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 370,
          width: "100%",
          animation: "fadeInUp 0.7s",
          boxShadow:
            "0 12px 32px 0 rgba(16, 112, 202, 0.10), 0 1.5px 4px 0 rgba(16, 112, 202, 0.08)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png"
            alt="FlightOps Logo"
            style={{
              width: 64,
              height: 64,
              margin: "0 auto",
              display: "block",
            }}
          />
        </div>
        <h2 className="title" style={{ letterSpacing: 1 }}>
          FlightOps Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Employee ID"
              value={employeeID}
              onChange={(e) => setEmployeeID(e.target.value)}
              className="input"
              style={{
                marginBottom: 14,
                padding: 10,
                width: "100%",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                fontSize: 16,
                background: "#f8fafc",
              }}
              disabled={loading}
              autoFocus
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              style={{
                marginBottom: 14,
                padding: 10,
                width: "100%",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                fontSize: 16,
                background: "#f8fafc",
              }}
              disabled={loading}
            />
          </div>
          {error && (
            <div
              style={{
                color: "#dc2626",
                background: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: 5,
                marginBottom: 14,
                padding: "8px 0",
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              padding: "10px 0",
              width: "100%",
              background:
                "linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 17,
              border: "none",
              borderRadius: 6,
              boxShadow: "0 2px 8px 0 rgba(37,99,235,0.10)",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
            disabled={loading}
          >
            {loading ? (
              <span>
                <span
                  className="loader"
                  style={{
                    display: "inline-block",
                    width: 18,
                    height: 18,
                    border: "2.5px solid #fff",
                    borderTop: "2.5px solid #2563eb",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    marginRight: 8,
                    verticalAlign: "middle",
                  }}
                />{" "}
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <div
          style={{
            marginTop: 24,
            fontSize: 13,
            color: "#64748b",
          }}
        >
          © 2025 FlightOps. All rights reserved.
        </div>
      </div>
      <style>
        {`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        `}
      </style>
    </div>
  );
}