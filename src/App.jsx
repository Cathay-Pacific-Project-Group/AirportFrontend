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
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

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

  // Toggle navigation collapse
  const toggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      {/* Left Navigation Panel */}
      <nav
        style={{
          width: isNavCollapsed ? 70 : 210,
          background: "linear-gradient(135deg, #23395d 0%, #4f8fc0 100%)",
          color: "#fff",
          padding: isNavCollapsed ? "2.5rem 0.5rem 1.2rem 0.5rem" : "2.5rem 1.2rem 1.2rem 1.2rem",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          boxShadow: "2px 0 12px 0 rgba(36,50,77,0.10)",
          transition: "width 0.3s ease, padding 0.3s ease",
          position: "fixed", 
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1000,
          overflowY: "auto", 
          overflowX: "hidden",
          borderRadius: "0 15px 15px 0",
          flexShrink: 0,
        }}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={toggleNav}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            zIndex: 10,
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(255,255,255,0.3)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(255,255,255,0.2)";
          }}
        >
          {isNavCollapsed ? "→" : "←"}
        </button>

        <div style={{ 
          fontWeight: 800, 
          fontSize: isNavCollapsed ? 18 : 22, 
          marginBottom: 30, 
          letterSpacing: 1,
          textAlign: isNavCollapsed ? "center" : "left",
          transition: "all 0.3s ease",
          whiteSpace: "nowrap",
          overflow: "hidden"
        }}>
          <span role="img" aria-label="logo">🛫</span> 
          {!isNavCollapsed && " Staff System"}
        </div>
        
        <button
          onClick={() => setPage("home")}
          style={{
            background: page === "home" ? "#fff" : "transparent",
            color: page === "home" ? "#23395d" : "#fff",
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            borderRadius: "10px", 
            padding: "12px 0",
            marginBottom: 2,
            cursor: "pointer",
            transition: "all 0.2s ease",
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: isNavCollapsed ? "center" : "flex-start",
            paddingLeft: isNavCollapsed ? 0 : 15,
          }}
          title="Home"
          onMouseOver={(e) => {
            if (page !== "home") {
              e.target.style.background = "rgba(255,255,255,0.1)";
            }
          }}
          onMouseOut={(e) => {
            if (page !== "home") {
              e.target.style.background = "transparent";
            }
          }}
        >
          <span style={{ marginRight: isNavCollapsed ? 0 : 10 }}>🏠</span>
          {!isNavCollapsed && "Home"}
        </button>
        
        <button
          onClick={() => setPage("dashboard")}
          style={{
            background: page === "dashboard" ? "#fff" : "transparent",
            color: page === "dashboard" ? "#23395d" : "#fff",
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            borderRadius: "10px",
            padding: "12px 0",
            marginBottom: 2,
            cursor: "pointer",
            transition: "all 0.2s ease",
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: isNavCollapsed ? "center" : "flex-start",
            paddingLeft: isNavCollapsed ? 0 : 15,
          }}
          title="Dashboard"
          onMouseOver={(e) => {
            if (page !== "dashboard") {
              e.target.style.background = "rgba(255,255,255,0.1)";
            }
          }}
          onMouseOut={(e) => {
            if (page !== "dashboard") {
              e.target.style.background = "transparent";
            }
          }}
        >
          <span style={{ marginRight: isNavCollapsed ? 0 : 10 }}>📊</span>
          {!isNavCollapsed && "Dashboard"}
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
              borderRadius: "10px", 
              padding: "12px 0",
              marginBottom: 2,
              cursor: "pointer",
              transition: "all 0.2s ease",
              letterSpacing: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: isNavCollapsed ? "center" : "flex-start",
              paddingLeft: isNavCollapsed ? 0 : 15,
            }}
            title="User Maintenance"
            onMouseOver={(e) => {
              if (page !== "user") {
                e.target.style.background = "rgba(255,255,255,0.1)";
              }
            }}
            onMouseOut={(e) => {
              if (page !== "user") {
                e.target.style.background = "transparent";
              }
            }}
          >
            <span style={{ marginRight: isNavCollapsed ? 0 : 10 }}>👥</span>
            {!isNavCollapsed && "User Maintenance"}
          </button>
        )}
        
        <div style={{ flex: 1 }} />
        
        <div style={{
          padding: isNavCollapsed ? "10px 0" : "10px 15px",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          marginTop: 10,
          textAlign: isNavCollapsed ? "center" : "left",
          overflow: "hidden",
          whiteSpace: "nowrap",
          borderRadius: "8px", 
          background: "rgba(0,0,0,0.1)", 
        }}>
          {!isNavCollapsed && (
            <div style={{ fontSize: 14, marginBottom: 5, opacity: 0.8 }}>
              Role:
            </div>
          )}
          <div style={{ 
            fontWeight: 600, 
            fontSize: isNavCollapsed ? 12 : 14,
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {isNavCollapsed ? isAdmin ? "AD" : "US" : isAdmin ? "Admin" : "User"}
          </div>
          <br/>
          {!isNavCollapsed && (
            <div style={{ fontSize: 14, marginBottom: 5, opacity: 0.8 }}>
              Logged in as:
            </div>
          )}
          <div style={{ 
            fontWeight: 600, 
            fontSize: isNavCollapsed ? 12 : 14,
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {isNavCollapsed ? username.substring(0, 3).toUpperCase() : username}
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            background: "#d32f2f",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            borderRadius: "10px", 
            padding: "12px 0",
            marginTop: 10,
            cursor: "pointer",
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: isNavCollapsed ? "center" : "flex-start",
            paddingLeft: isNavCollapsed ? 0 : 15,
            transition: "all 0.2s ease",
          }}
          title="Logout"
          onMouseOver={(e) => {
            e.target.style.background = "#b71c1c";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#d32f2f";
          }}
        >
          <span style={{ marginRight: isNavCollapsed ? 0 : 10 }}>🚪</span>
          {!isNavCollapsed && "Logout"}
        </button>
      </nav>
      
      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        minHeight: "100vh",
        overflow: "auto",
        marginLeft: isNavCollapsed ? 70 : 210, 
        transition: "margin-left 0.3s ease",
        padding: "20px",
        boxSizing: "border-box",
      }}>
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