import React, { useState } from "react";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";

function App() {
  // Track login state and username
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // Handle login success
  const handleLogin = (user) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  // Handle logout
  const handleLogout = () => {
    setUsername("");
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoggedIn ? (
        <Dashboard username={username} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;