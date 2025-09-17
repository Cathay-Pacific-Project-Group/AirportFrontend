import React, { useEffect, useState } from "react";

const styles = {
  container: { padding: '2.5rem 1.5rem', maxWidth: 900, margin: '0 auto', minHeight: '100vh', fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' },
  title: { fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: 1, marginBottom: 18 },
  table: { width: '100%', borderCollapse: 'collapse', borderRadius: '0.7rem', overflow: 'hidden', boxShadow: '0 6px 20px rgba(2,6,23,0.06)', border: '1px solid rgba(2,6,23,0.06)', background: '#f3f4f6', marginBottom: 24 },
  thead: { background: 'linear-gradient(90deg,#06b6d4 0%,#0284c7 100%)', color: '#fff' },
  th: { padding: '10px 8px', textAlign: 'left' },
  td: { padding: '8px 8px' },
  addCard: { background: '#f3f4f6', border: '1px solid rgba(2,6,23,0.04)', borderRadius: 10, padding: 16, maxWidth: 520, margin: '0 auto' },
  input: { padding: 8, borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)' },
  btn: { padding: '8px 14px', borderRadius: 8, border: 'none', background: '#0284c7', color: '#fff', fontWeight: 700 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2,6,23,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 },
  modal: { background: '#f3f4f6', borderRadius: 12, padding: 18, minWidth: 360, boxShadow: '0 12px 48px rgba(2,6,23,0.25)' },
  pagination: { display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  pageBtn: { padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', background: '#f3f4f6', cursor: 'pointer', fontWeight: 700 },
};

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const displayedUsers = users.slice(startIdx, startIdx + pageSize);

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
  // close modal after successful add
  setShowAddModal(false);
    } catch (err) {
      setError(err.message || "Failed to add user.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>User Maintenance</h2>
      {loading ? (
        <div style={{ color: "#4f8fc0", fontWeight: 600, fontSize: 18 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "#d32f2f", fontWeight: 600, fontSize: 16 }}>{error}</div>
      ) : (
        <>
          {successMsg && (
            <div
              style={{
                color: "#0f5132",
                background: "#e6f4ef",
                border: "1px solid rgba(15,23,42,0.04)",
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
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Password</th>
                <th style={styles.th}>Permission</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user, idx) => {
                const globalIdx = startIdx + idx;
                return (globalIdx === editingIdx) ? (
                  <tr key={user.employeeID} style={{ background: "#f3f4f6" }}>
                    <td style={{ padding: "8px 8px" }}>{user.employeeID}</td>
                    <td style={{ padding: "8px 8px" }}>
                      <input
                        value={editUser.name}
                        onChange={e => handleEditChange("name", e.target.value)}
                        style={{ ...styles.input, width: 140 }}
                      />
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      <input
                        value={editUser.password}
                        onChange={e => handleEditChange("password", e.target.value)}
                        style={{ ...styles.input, width: 140 }}
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
                      <button onClick={handleEditSave} style={{ marginRight: 8, ...styles.btn }}>Save</button>
                      <button onClick={handleEditCancel} style={{ ...styles.btn, background: '#94a3b8' }}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={user.employeeID}>
                    <td style={{ padding: "8px 8px" }}>{user.employeeID}</td>
                    <td style={{ padding: "8px 8px" }}>{user.name}</td>
                    <td style={{ padding: "8px 8px" }}>{user.password}</td>
                    <td style={{ padding: "8px 8px" }}>{user.permission}</td>
                    <td style={{ padding: "8px 8px" }}>
                      <button onClick={() => handleEdit(globalIdx)} style={{ ...styles.btn }}>Edit</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div />
            <div>
              <button onClick={() => setShowAddModal(true)} style={{ ...styles.btn }}>Add New User</button>
            </div>
          </div>

          {/* Pagination */}
          <div style={styles.pagination}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn}>Prev</button>
            <div style={{ fontWeight: 700 }}>{page} / {totalPages}</div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={styles.pageBtn}>Next</button>
          </div>

          {/* Add User Modal */}
          {showAddModal && (
            <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
              <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <h4 style={{ fontWeight: 700, color: '#23395d', marginBottom: 10 }}>Add New User</h4>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <input placeholder="Employee ID" value={addUser.employeeID} onChange={e => setAddUser(u => ({ ...u, employeeID: e.target.value }))} style={{ ...styles.input, width: 120 }} />
                  <input placeholder="Name" value={addUser.name} onChange={e => setAddUser(u => ({ ...u, name: e.target.value }))} style={{ ...styles.input, width: 120 }} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <input placeholder="Password" value={addUser.password} onChange={e => setAddUser(u => ({ ...u, password: e.target.value }))} style={{ ...styles.input, width: 120 }} />
                  <select value={addUser.permission} onChange={e => setAddUser(u => ({ ...u, permission: e.target.value }))} style={{ ...styles.input, width: 120 }}>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowAddModal(false)} style={{ ...styles.pageBtn }}>Cancel</button>
                  <button onClick={handleAddUser} disabled={adding} style={{ ...styles.btn }}>{adding ? 'Adding...' : 'Add'}</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
