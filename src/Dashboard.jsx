import React, { useEffect, useState } from "react";

// Example API endpoint: http://localhost:8080/api/routine?employeeID=xxx
function Dashboard({ username: employeeID = "", onLogout }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editRoutine, setEditRoutine] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(""); // Optional: success message

  // Fetch permission and initial routines
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch permission info (now returns { permission: ... })
        const permRes = await fetch(
          `http://localhost:8080/api/permission?employeeID=${employeeID}`
        );
        if (!permRes.ok) throw new Error("Failed to get permission info");
        const perm = await permRes.json();
        const admin = perm.permission === "Admin";
        setIsAdmin(admin);

        const routineUrl = `http://localhost:8080/api/routine?employeeID=${employeeID}`;
        const res = await fetch(routineUrl);
        if (!res.ok) throw new Error("Failed to fetch routine data");
        const data = await res.json();
        setRoutines(data);
      } catch (err) {
        setError(
          (err && err.message === "Failed to fetch")
            ? "Network error: Unable to reach backend. Is the backend running at http://localhost:8080?"
            : (err.message || "Failed to load data.")
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeID]);

  // Start editing a row
  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditRoutine({ ...routines[idx] });
    setSuccessMsg(""); // Clear success message on edit
  };

  // Cancel editing
  const handleCancel = () => {
    setEditIdx(null);
    setEditRoutine(null);
    setSuccessMsg(""); // Clear success message on cancel
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      // Use JobID as the key for the PUT endpoint
      const res = await fetch(
        `http://localhost:8080/api/routine/${editRoutine.JobID}?employeeID=${employeeID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editRoutine),
        }
      );
      if (!res.ok) throw new Error("Failed to save routine.");
      // Update local state
      const updated = [...routines];
      updated[editIdx] = editRoutine;
      setRoutines(updated);
      setEditIdx(null);
      setEditRoutine(null);
      setSuccessMsg("Routine saved successfully."); // Optional: show success
    } catch (err) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // Handle input change
  const handleChange = (field, value) => {
    setEditRoutine((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div
      className="min-h-screen px-2 py-8 font-sans"
      style={{
        background: "linear-gradient(135deg, #4f8fc0 0%, #23395d 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center mb-8"
        style={{
          background: "rgba(255,255,255,0.96)",
          borderRadius: "1rem",
          boxShadow: "0 6px 24px 0 rgba(123,31,43,0.13)",
          border: "2px solid #7b1f2b",
          padding: "1.2rem 2rem",
        }}
      >
        <h1
          className="text-3xl font-extrabold tracking-wide"
          style={{
            color: "#7b1f2b",
            letterSpacing: 2,
            textShadow: "0 2px 8px #f8bbd0, 0 1px 0 #fff",
          }}
        >
          Welcome, {employeeID} {isAdmin ? "(Admin)" : ""}
        </h1>
        <button
          onClick={onLogout}
          style={{
            padding: "10px 28px",
            background: "linear-gradient(90deg, #b71c1c 0%, #7b1f2b 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 17,
            boxShadow: "0 2px 8px 0 rgba(123,31,43,0.10)",
            cursor: "pointer",
            transition: "background 0.2s, transform 0.1s",
            letterSpacing: 1,
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          background: "rgba(255,255,255,0.98)",
          borderRadius: "1.1rem",
          boxShadow: "0 10px 32px 0 rgba(123,31,43,0.13)",
          border: "2px solid #7b1f2b",
          padding: "2.2rem 1.5rem 2rem 1.5rem",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold"
            style={{
              color: "#b71c1c",
              letterSpacing: 1,
              textShadow: "0 1px 4px #f8bbd0",
            }}
          >
            {isAdmin ? "All Employees' Routine Table" : "My Duty Routine"}
          </h2>
        </div>
        {loading ? (
          <div className="text-center py-8 text-lg" style={{ color: "#7b1f2b" }}>
            Loading...
          </div>
        ) : error ? (
          <div className="text-center py-8" style={{ color: "#b71c1c", fontWeight: 600 }}>
            {error}
          </div>
        ) : routines.length === 0 ? (
          <div className="text-center py-8" style={{ color: "#7b1f2b" }}>
            No routine found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            {successMsg && (
              <div
                className="mb-4"
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
                  margin: "0 auto",
                }}
              >
                {successMsg}
              </div>
            )}
            <table
              className="min-w-full text-sm"
              style={{
                borderRadius: "0.7rem",
                overflow: "hidden",
                boxShadow: "0 2px 8px 0 rgba(123,31,43,0.08)",
                border: "1.5px solid #b71c1c",
                background: "#fff",
              }}
            >
              <thead
                style={{
                  background: "linear-gradient(90deg, #b71c1c 0%, #7b1f2b 100%)",
                  color: "#fff",
                }}
              >
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">SN</th>
                  <th className="px-4 py-3 text-left font-semibold">Flight</th>
                  <th className="px-4 py-3 text-left font-semibold">From</th>
                  <th className="px-4 py-3 text-left font-semibold">To</th>
                  <th className="px-4 py-3 text-left font-semibold">STA</th>
                  <th className="px-4 py-3 text-left font-semibold">ETA</th>
                  <th className="px-4 py-3 text-left font-semibold">ATA</th>
                  <th className="px-4 py-3 text-left font-semibold">Remarks</th>
                  <th className="px-4 py-3 text-left font-semibold">Staff In Charge</th>
                  <th className="px-4 py-3 text-left font-semibold">Supervisor</th>
                  <th className="px-4 py-3 text-left font-semibold">JobID</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routines.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      background: idx % 2 === 0 ? "#fff5f5" : "#fbe9e7",
                      borderBottom: "1px solid #f8bbd0",
                    }}
                  >
                    {editIdx === idx ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            value={editRoutine.date}
                            onChange={(e) => handleChange("date", e.target.value)}
                            className="border rounded px-2 py-1 w-24"
                            style={{ border: "1.5px solid #b71c1c", background: "#fff" }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editRoutine.sn}
                            disabled
                            className="border rounded px-2 py-1 w-16 bg-gray-100 text-gray-500"
                            style={{ border: "1.5px solid #b71c1c" }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editRoutine.flight}
                            onChange={(e) => handleChange("flight", e.target.value)}
                            className="border rounded px-2 py-1 w-20"
                            style={{ border: "1.5px solid #b71c1c", background: "#fff" }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editRoutine.from}
                            onChange={(e) => handleChange("from", e.target.value)}
                            className="border rounded px-2 py-1 w-16"
                            style={{ border: "1.5px solid #b71c1c", background: "#fff" }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editRoutine.to}
                            onChange={(e) => handleChange("to", e.target.value)}
                            className="border rounded px-2 py-1 w-16"
                            style={{ border: "1.5px solid #b71c1c", background: "#fff" }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editRoutine.sta}
                            onChange={(e) => handleChange("sta", e.target.value)}
                            className="border rounded px-2 py-1 w-16"
                            style={{ border: "1.5px solid #b71c1c", background: "#fff" }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editRoutine.eta}
                            onChange={(e) => handleChange("eta", e.target.value)}
                            className="border rounded px-2 py-1 w-16"
                            style={{ border: "1.5px solid #b71c1c", background: "#fff" }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editRoutine.ata}
                            onChange={(e) => handleChange("ata", e.target.value)}
                            className="border rounded px-2 py-1 w-16"
                            style={{ border: "1.5px solid #b71c1c", background: "#fff" }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editRoutine.remarks}
                            onChange={(e) => handleChange("remarks", e.target.value)}
                            className="border rounded px-2 py-1 w-24"
                            style={{ border: "1.5px solid #b71c1c", background: "#fff" }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editRoutine.employeeID}
                            onChange={(e) => handleChange("employeeID", e.target.value)}
                            className="border rounded px-2 py-1 w-20"
                            style={{ border: "1.5px solid #b71c1c", background: "#fff" }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editRoutine.supervisor}
                            onChange={(e) => handleChange("supervisor", e.target.value)}
                            className="border rounded px-2 py-1 w-20"
                            style={{ border: "1.5px solid #b71c1c", background: "#fff" }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editRoutine.JobID}
                            disabled
                            className="border rounded px-2 py-1 w-20 bg-gray-100 text-gray-500"
                            style={{ border: "1.5px solid #b71c1c" }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                              marginRight: 8,
                              padding: "7px 18px",
                              background: "linear-gradient(90deg, #7b1f2b 0%, #b71c1c 100%)",
                              color: "#fff",
                              border: "none",
                              borderRadius: 7,
                              fontWeight: 700,
                              fontSize: 15,
                              boxShadow: "0 2px 8px 0 rgba(123,31,43,0.10)",
                              cursor: saving ? "not-allowed" : "pointer",
                              transition: "background 0.2s",
                              letterSpacing: 1,
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={saving}
                            style={{
                              padding: "7px 18px",
                              background: "#f8bbd0",
                              color: "#7b1f2b",
                              border: "none",
                              borderRadius: 7,
                              fontWeight: 700,
                              fontSize: 15,
                              boxShadow: "0 2px 8px 0 rgba(123,31,43,0.10)",
                              cursor: saving ? "not-allowed" : "pointer",
                              transition: "background 0.2s",
                              letterSpacing: 1,
                            }}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2">{item.date}</td>
                        <td className="px-4 py-2">{item.sn}</td>
                        <td className="px-4 py-2">{item.flight}</td>
                        <td className="px-4 py-2">{item.from}</td>
                        <td className="px-4 py-2">{item.to}</td>
                        <td className="px-4 py-2">{item.sta}</td>
                        <td className="px-4 py-2">{item.eta}</td>
                        <td className="px-4 py-2">{item.ata}</td>
                        <td className="px-4 py-2">{item.remarks}</td>
                        <td className="px-4 py-2">{item.employeeID}</td>
                        <td className="px-4 py-2">{item.supervisor}</td>
                        <td className="px-4 py-2">{item.JobID}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleEdit(idx)}
                            style={{
                              padding: "7px 18px",
                              background: "linear-gradient(90deg, #b71c1c 0%, #7b1f2b 100%)",
                              color: "#fff",
                              border: "none",
                              borderRadius: 7,
                              fontWeight: 700,
                              fontSize: 15,
                              boxShadow: "0 2px 8px 0 rgba(123,31,43,0.10)",
                              cursor: "pointer",
                              transition: "background 0.2s",
                              letterSpacing: 1,
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="mt-10 text-center text-xs"
        style={{
          color: "#7b1f2b",
          letterSpacing: 1,
          fontWeight: 500,
          opacity: 0.85,
        }}
      >
        © 2025 WorldWide Staff System. All rights reserved.
      </footer>
    </div>
  );
}

export default Dashboard;