import React, { useState } from "react";
import "./App.css";

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%)',
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  },
  card: {
    maxWidth: 420,
    width: '100%',
    padding: '2rem',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.98)',
    boxShadow: '0 12px 32px rgba(2,6,23,0.08)',
    border: '1px solid rgba(2,6,23,0.04)'
  },
  logo: { width: 72, height: 72, margin: '0 auto', display: 'block', borderRadius: '50%' , background: '#fff', padding: 6},
  title: { letterSpacing: 1, color: '#0f172a', fontWeight: 800, fontSize: '1.9rem', marginBottom: 6 },
  subtitle: { color: '#334155', fontWeight: 500, fontSize: 14, marginBottom: 16 },
  input: { width: '94%', padding: 12, borderRadius: 10, border: '1px solid rgba(15,23,42,0.06)', marginBottom: 12, fontSize: 15 },
  button: { padding: '12px 0', width: '100%', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,#0ea5a4 0%,#0284c7 100%)', color: '#fff', fontWeight: 700, fontSize: 16 }
};

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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ marginBottom: 18 }}>
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Logo" style={styles.logo} />
        </div>
        <h2 style={styles.title}>WorldWide Staff System</h2>
        <div style={styles.subtitle}>Please sign in to continue</div>
        <form onSubmit={handleSubmit}>
          <div>
            <input type="text" placeholder="Employee ID" value={employeeID} onChange={(e) => setEmployeeID(e.target.value)} style={styles.input} disabled={loading} autoFocus />
          </div>
          <div>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} disabled={loading} />
          </div>
          {error && <div style={{ color: '#ef4444', background: '#fff1f2', padding: 10, borderRadius: 8, marginBottom: 12 }}>{error}</div>}
          <button type="submit" style={{ ...styles.button, opacity: loading ? 0.8 : 1 }} disabled={loading}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, border: '2px solid #fff', borderTop: '2px solid rgba(255,255,255,0.6)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: 24, fontSize: 13, color: '#64748b' }}>© 2025 WorldWide Staff System. All rights reserved.</div>
      </div>
      <style>{`@keyframes spin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
    </div>
  );
}