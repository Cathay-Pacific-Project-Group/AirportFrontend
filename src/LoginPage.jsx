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
      // Make sure your backend is running at http://localhost:8080
      // If your backend runs on a different port, update the URL below.
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
      setError(
        (err && err.message === "Failed to fetch")
          ? "Network error: Unable to reach backend. Is the backend running at http://localhost:8080?"
          : `Network error. Please check if the backend server is running at http://localhost:8080. (${err.message})`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="app-container"
      style={{
        background:
          "linear-gradient(135deg, #4f8fc0 0%, #23395d 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 400,
          width: "100%",
          animation: "fadeInUp 0.7s",
          boxShadow:
            "0 12px 32px 0 rgba(123, 31, 43, 0.15), 0 1.5px 4px 0 rgba(183, 28, 28, 0.10)",
          border: "1.5px solid #7b1f2b",
          background: "rgba(255,255,255,0.97)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="WorldWide Staff System Logo"
            style={{
              width: 72,
              height: 72,
              margin: "0 auto",
              display: "block",
              borderRadius: "50%",
              border: "3px solid #b71c1c",
              background: "#fff5f5",
              boxShadow: "0 2px 8px 0 rgba(123,31,43,0.10)",
            }}
          />
        </div>
        <h2
          className="title"
          style={{
            letterSpacing: 1,
            color: "#7b1f2b",
            fontWeight: 800,
            fontSize: "2.1rem",
            marginBottom: 8,
            textShadow: "0 2px 8px #f8bbd0, 0 1px 0 #fff",
          }}
        >
          WorldWide Staff System
        </h2>
        <div
          style={{
            color: "#b71c1c",
            fontWeight: 500,
            fontSize: 15,
            marginBottom: 18,
            letterSpacing: 0.5,
          }}
        >
          Please sign in to continue
        </div>
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
                padding: 12,
                width: "100%",
                border: "1.5px solid #b71c1c",
                borderRadius: 7,
                fontSize: 17,
                background: "#fff5f5",
                color: "#7b1f2b",
                fontWeight: 500,
                outline: "none",
                boxShadow: "0 1px 4px 0 rgba(183,28,28,0.06)",
                transition: "border 0.2s",
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
                padding: 12,
                width: "100%",
                border: "1.5px solid #b71c1c",
                borderRadius: 7,
                fontSize: 17,
                background: "#fff5f5",
                color: "#7b1f2b",
                fontWeight: 500,
                outline: "none",
                boxShadow: "0 1px 4px 0 rgba(183,28,28,0.06)",
                transition: "border 0.2s",
              }}
              disabled={loading}
            />
          </div>
          {error && (
            <div
              style={{
                color: "#b71c1c",
                background: "#ffebee",
                border: "1.5px solid #ef9a9a",
                borderRadius: 6,
                marginBottom: 14,
                padding: "10px 0",
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: 0.5,
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              padding: "12px 0",
              width: "100%",
              background:
                "linear-gradient(90deg, #7b1f2b 0%, #b71c1c 100%)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              border: "none",
              borderRadius: 7,
              boxShadow: "0 2px 8px 0 rgba(123,31,43,0.10)",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              marginTop: 2,
              marginBottom: 2,
              letterSpacing: 1,
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
                    borderTop: "2.5px solid #b71c1c",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    marginRight: 8,
                    verticalAlign: "middle",
                  }}
                />{" "}
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <div
          style={{
            marginTop: 28,
            fontSize: 13,
            color: "#7b1f2b",
            fontWeight: 500,
            letterSpacing: 1,
            opacity: 0.85,
          }}
        >
          © 2025 WorldWide Staff System. All rights reserved.
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