import React, { useEffect, useState } from "react";

export default function UserMaintenance() {
  const [users, setUsers] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editUser, setEditUser] = useState({});
  const [adding, setAdding] = useState(false);
  const [addUser, setAddUser] = useState({
    employeeID: "",
    name: "",
    password: "",
    permission: "Staff",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:8080/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(
          (err && err.message === "Failed to fetch")
            ? "Network error: Unable to reach backend."
            : (err.message || "Failed to load users.")
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [successMsg]);

  // Edit user
  const handleEdit = (idx) => {
    setEditingIdx(idx);
    setEditUser({ ...users[idx] });
    setSuccessMsg("");
  };

  const handleEditChange = (field, value) => {
    setEditUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/${editUser.employeeID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editUser),
        }
      );
      if (!res.ok) throw new Error("Failed to update user");
      setSuccessMsg("User updated successfully.");
      setEditingIdx(null);
      setEditUser({});
    } catch (err) {
      setError(err.message || "Failed to update user.");
    }
  };

  const handleEditCancel = () => {
    setEditingIdx(null);
    setEditUser({});
  };

  // Add user
  const handleAddUser = async () => {
    setAdding(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addUser),
      });
      if (!res.ok) throw new Error("Failed to add user");
      setSuccessMsg("User added successfully.");
      setAddUser({
        employeeID: "",
        name: "",
        password: "",
        permission: "Staff",
      });
    } catch (err) {
      setError(err.message || "Failed to add user.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      style={{
        padding: "2.5rem 2rem",
        maxWidth: 900,
        margin: "0 auto",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#23395d",
          letterSpacing: 1,
          marginBottom: 18,
        }}
      >
        User Maintenance
      </h2>
      {loading ? (
        <div style={{ color: "#4f8fc0", fontWeight: 600, fontSize: 18 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "#d32f2f", fontWeight: 600, fontSize: 16 }}>{error}</div>
      ) : (
        <>
          {successMsg && (
            <div
              style={{
                color: "#388e3c",
                background: "#e8f5e9",
                border: "1.5px solid #a5d6a7",
                borderRadius: 7,
                padding: "10px 0",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: 0.5,
                textAlign: "center",
                maxWidth: 400,
                margin: "0 auto 18px auto",
              }}
            >
              {successMsg}
            </div>
          )}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              borderRadius: "0.7rem",
              overflow: "hidden",
              boxShadow: "0 2px 8px 0 rgba(36,50,77,0.08)",
              border: "1.5px solid #4f8fc0",
              background: "#fff",
              marginBottom: 24,
            }}
          >
            <thead
              style={{
                background: "linear-gradient(90deg, #4f8fc0 0%, #23395d 100%)",
                color: "#fff",
              }}
            >
              <tr>
                <th style={{ padding: "10px 8px", textAlign: "left" }}>Employee ID</th>
                <th style={{ padding: "10px 8px", textAlign: "left" }}>Name</th>
                <th style={{ padding: "10px 8px", textAlign: "left" }}>Password</th>
                <th style={{ padding: "10px 8px", textAlign: "left" }}>Permission</th>
                <th style={{ padding: "10px 8px", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) =>
                editingIdx === idx ? (
                  <tr key={user.employeeID} style={{ background: "#f3f8fc" }}>
                    <td style={{ padding: "8px 8px" }}>{user.employeeID}</td>
                    <td style={{ padding: "8px 8px" }}>
                      <input
                        value={editUser.name}
                        onChange={e => handleEditChange("name", e.target.value)}
                        style={{ width: 100 }}
                      />
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      <input
                        value={editUser.password}
                        onChange={e => handleEditChange("password", e.target.value)}
                        style={{ width: 100 }}
                      />
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      <select
                        value={editUser.permission}
                        onChange={e => handleEditChange("permission", e.target.value)}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      <button onClick={handleEditSave} style={{ marginRight: 8 }}>Save</button>
                      <button onClick={handleEditCancel}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={user.employeeID}>
                    <td style={{ padding: "8px 8px" }}>{user.employeeID}</td>
                    <td style={{ padding: "8px 8px" }}>{user.name}</td>
                    <td style={{ padding: "8px 8px" }}>{user.password}</td>
                    <td style={{ padding: "8px 8px" }}>{user.permission}</td>
                    <td style={{ padding: "8px 8px" }}>
                      <button onClick={() => handleEdit(idx)}>Edit</button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          <div
            style={{
              background: "#f3f8fc",
              border: "1.5px solid #4f8fc0",
              borderRadius: 7,
              padding: "18px 18px 10px 18px",
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            <h4 style={{ fontWeight: 700, color: "#23395d", marginBottom: 10 }}>Add New User</h4>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input
                placeholder="Employee ID"
                value={addUser.employeeID}
                onChange={e => setAddUser(u => ({ ...u, employeeID: e.target.value }))}
                style={{ width: 90 }}
              />
              <input
                placeholder="Name"
                value={addUser.name}
                onChange={e => setAddUser(u => ({ ...u, name: e.target.value }))}
                style={{ width: 90 }}
              />
              <input
                placeholder="Password"
                value={addUser.password}
                onChange={e => setAddUser(u => ({ ...u, password: e.target.value }))}
                style={{ width: 90 }}
              />
              <select
                value={addUser.permission}
                onChange={e => setAddUser(u => ({ ...u, permission: e.target.value }))}
                style={{ width: 90 }}
              >
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
              </select>
              <button onClick={handleAddUser} disabled={adding}>
                {adding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
