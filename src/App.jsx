import React, { useState } from "react";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import HomePage from "./HomePage";
import UserMaintenance from "./UserMaintenance";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState("home");

  // Handle login success
  const handleLogin = async (user) => {
    setUsername(user);
    setIsLoggedIn(true);
    // Fetch permission to determine admin
    try {
      const res = await fetch(`http://localhost:8080/api/permission?employeeID=${user}`);
      const data = await res.json();
      setIsAdmin(data.permission === "Admin");
    } catch {
      setIsAdmin(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUsername("");
    setIsLoggedIn(false);
    setPage("home");
    setIsAdmin(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left Navigation Panel */}
      <nav
        style={{
          width: 210,
          background: "linear-gradient(135deg, #23395d 0%, #4f8fc0 100%)",
          color: "#fff",
          padding: "2.5rem 1.2rem 1.2rem 1.2rem",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          boxShadow: "2px 0 12px 0 rgba(36,50,77,0.10)",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 30, letterSpacing: 1 }}>
          <span role="img" aria-label="logo">🛫</span> Staff System
        </div>
        <button
          onClick={() => setPage("home")}
          style={{
            background: page === "home" ? "#fff" : "transparent",
            color: page === "home" ? "#23395d" : "#fff",
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            borderRadius: 7,
            padding: "12px 0",
            marginBottom: 2,
            cursor: "pointer",
            transition: "background 0.2s",
            letterSpacing: 1,
          }}
        >
          Home
        </button>
        <button
          onClick={() => setPage("dashboard")}
          style={{
            background: page === "dashboard" ? "#fff" : "transparent",
            color: page === "dashboard" ? "#23395d" : "#fff",
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            borderRadius: 7,
            padding: "12px 0",
            marginBottom: 2,
            cursor: "pointer",
            transition: "background 0.2s",
            letterSpacing: 1,
          }}
        >
          Dashboard
        </button>
        {isAdmin && (
          <button
            onClick={() => setPage("user")}
            style={{
              background: page === "user" ? "#fff" : "transparent",
              color: page === "user" ? "#23395d" : "#fff",
              fontWeight: 700,
              fontSize: 16,
              border: "none",
              borderRadius: 7,
              padding: "12px 0",
              marginBottom: 2,
              cursor: "pointer",
              transition: "background 0.2s",
              letterSpacing: 1,
            }}
          >
            User Maintenance
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={handleLogout}
          style={{
            background: "#d32f2f",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            borderRadius: 7,
            padding: "12px 0",
            marginTop: 10,
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          Logout
        </button>
      </nav>
      {/* Main Content */}
      <div style={{ flex: 1, minHeight: "100vh" }}>
        {page === "home" && (
          <HomePage username={username} isAdmin={isAdmin} />
        )}
        {page === "dashboard" && (
          <Dashboard username={username} onLogout={handleLogout} />
        )}
        {page === "user" && isAdmin && (
          <UserMaintenance username={username} />
        )}
      </div>
    </div>
  );
}

export default App;