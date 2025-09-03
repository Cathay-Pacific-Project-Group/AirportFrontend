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
  const [exporting, setExporting] = useState(false); // Export loading state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addRoutine, setAddRoutine] = useState({
    date: "",
    sn: "",
    flight: "",
    from: "",
    to: "",
    sta: "",
    eta: "",
    ata: "",
    remarks: "",
    employeeID: "",
    supervisor: "",
  });
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  // Search and Sort states
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("asc");

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

        // Construct search and sort parameters
        const params = new URLSearchParams({
          employeeID,
        });
        if (search) params.append("search", search);
        if (sortBy) params.append("sortBy", sortBy);
        if (order) params.append("order", order);
        const routineUrl = `http://localhost:8080/api/routine?${params.toString()}`;
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
  }, [employeeID, search, sortBy, order]);

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

  // Export to Excel
  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:8080/api/routine/export?employeeID=${employeeID}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to export routine.");
      const blob = await res.blob();
      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "routine.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Failed to export routine.");
    } finally {
      setExporting(false);
    }
  };

  // Add routine (admin only)
  const handleAddRoutine = async () => {
    setAdding(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:8080/api/routine/import?employeeID=${employeeID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addRoutine),
        }
      );
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to add routine.");
      setShowAddModal(false);
      setAddRoutine({
        date: "",
        sn: "",
        flight: "",
        from: "",
        to: "",
        sta: "",
        eta: "",
        ata: "",
        remarks: "",
        employeeID: "",
        supervisor: "",
      });
      setSuccessMsg("Routine added successfully.");
      // Refresh table
      setLoading(true);
      const routineUrl = `http://localhost:8080/api/routine?employeeID=${employeeID}`;
      const res2 = await fetch(routineUrl);
      const data = await res2.json();
      setRoutines(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to add routine.");
    } finally {
      setAdding(false);
    }
  };

  // Import Excel (admin only)
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `http://localhost:8080/api/routine/import/excel?employeeID=${employeeID}`,
        {
          method: "POST",
          body: formData,
        }
      );
      // If backend returns error, show message
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Import endpoint not found. Please check backend implementation.");
        }
        throw new Error("Failed to import routine. (Check if Excel time columns are in HH:mm:ss format)");
      }
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to import routine.");
      setSuccessMsg("Excel imported successfully.");
      // Refresh table
      setLoading(true);
      const routineUrl = `http://localhost:8080/api/routine?employeeID=${employeeID}`;
      const res2 = await fetch(routineUrl);
      const data = await res2.json();
      setRoutines(data);
      setLoading(false);
    } catch (err) {
      setError(
        (err && err.message === "Failed to fetch")
          ? "Network error: Unable to reach backend or backend does not support Excel import. Is the backend running and does it have /api/routine/import/excel?"
          : (err.message || "Failed to import routine. If importing time columns, make sure they are in HH:mm:ss format.")
      );
    } finally {
      setImporting(false);
      e.target.value = ""; // reset file input
    }
  };

  // Delete routine (admin only)
  const handleDeleteRoutine = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this routine?")) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:8080/api/routine/${jobId}?employeeID=${employeeID}`,
        { method: "DELETE" }
      );
      // If backend returns error, show message
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Delete endpoint not found. Please check backend implementation.");
        }
        throw new Error("Failed to delete routine.");
      }
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to delete routine.");
      setSuccessMsg("Routine deleted successfully.");
      // Refresh table
      setLoading(true);
      const routineUrl = `http://localhost:8080/api/routine?employeeID=${employeeID}`;
      const res2 = await fetch(routineUrl);
      const data = await res2.json();
      setRoutines(data);
      setLoading(false);
    } catch (err) {
      setError(
        (err && err.message === "Failed to fetch")
          ? "Network error: Unable to reach backend or backend does not support DELETE. Is the backend running and does it have DELETE /api/routine/{jobId}?employeeID=...?"
          : (err.message || "Failed to delete routine.")
      );
    } finally {
      setSaving(false);
    }
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

      {/* Export & Add & Import Buttons */}
      <div style={{ marginBottom: 18, textAlign: "right", display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            padding: "9px 22px",
            background: "linear-gradient(90deg, #43a047 0%, #388e3c 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            fontWeight: 700,
            fontSize: 16,
            boxShadow: "0 2px 8px 0 rgba(67,160,71,0.10)",
            cursor: exporting ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            letterSpacing: 1,
          }}
        >
          {exporting ? "Exporting..." : "Export to Excel"}
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: "9px 22px",
                background: "linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                fontWeight: 700,
                fontSize: 16,
                boxShadow: "0 2px 8px 0 rgba(33,150,243,0.10)",
                cursor: adding ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                letterSpacing: 1,
              }}
            >
              Add Routine
            </button>
            <label style={{ position: "relative" }}>
              <input
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleImportExcel}
                disabled={importing}
              />
              <span
                style={{
                  display: "inline-block",
                  padding: "9px 22px",
                  background: "linear-gradient(90deg, #388e3c 0%, #43a047 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 7,
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: "0 2px 8px 0 rgba(67,160,71,0.10)",
                  cursor: importing ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  letterSpacing: 1,
                  userSelect: "none",
                }}
              >
                {importing ? "Importing..." : "Import Excel"}
              </span>
            </label>
          </>
        )}
      </div>

      {/* Add Routine Modal (admin only) */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(36, 50, 77, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "2rem 2.5rem",
              boxShadow: "0 8px 32px rgba(36,50,77,0.18)",
              minWidth: 340,
              maxWidth: 400,
            }}
          >
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#23395d", marginBottom: 18, letterSpacing: 1 }}>
              Add New Routine
            </h3>
            <div style={{ color: "#1976d2", fontSize: 13, marginBottom: 10, fontWeight: 500 }}>
              <div>Sample format:</div>
              <ul style={{ margin: "6px 0 0 18px", padding: 0, fontSize: 12 }}>
                <li>Date: <span style={{ color: "#388e3c" }}>2024-07-01</span></li>
                <li>STA/ETA/ATA: <span style={{ color: "#388e3c" }}>HH:mm:ss (e.g. 08:30:00)</span></li>
                <li>SN/Flight/From/To/Remarks/Staff In Charge/Supervisor: <span style={{ color: "#388e3c" }}>Text</span></li>
              </ul>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input placeholder="Date (e.g. 2024-07-01)" value={addRoutine.date} onChange={e => setAddRoutine(r => ({ ...r, date: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: "1px solid #4f8fc0" }} />
              <input placeholder="SN" value={addRoutine.sn} onChange={e => setAddRoutine(r => ({ ...r, sn: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: "1px solid #4f8fc0" }} />
              <input placeholder="Flight" value={addRoutine.flight} onChange={e => setAddRoutine(r => ({ ...r, flight: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: "1px solid #4f8fc0" }} />
              <input placeholder="From" value={addRoutine.from} onChange={e => setAddRoutine(r => ({ ...r, from: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: "1px solid #4f8fc0" }} />
              <input placeholder="To" value={addRoutine.to} onChange={e => setAddRoutine(r => ({ ...r, to: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: "1px solid #4f8fc0" }} />
              <input placeholder="STA (e.g. 08:30:00)" value={addRoutine.sta} onChange={e => setAddRoutine(r => ({ ...r, sta: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: "1px solid #4f8fc0" }} />
              <input placeholder="ETA (e.g. 08:45:00)" value={addRoutine.eta} onChange={e => setAddRoutine(r => ({ ...r, eta: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: "1px solid #4f8fc0" }} />
              <input placeholder="ATA (e.g. 08:50:00)" value={addRoutine.ata} onChange={e => setAddRoutine(r => ({ ...r, ata: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: "1px solid #4f8fc0" }} />
              <input placeholder="Remarks" value={addRoutine.remarks} onChange={e => setAddRoutine(r => ({ ...r, remarks: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: "1px solid #4f8fc0" }} />
              <input placeholder="Staff In Charge" value={addRoutine.employeeID} onChange={e => setAddRoutine(r => ({ ...r, employeeID: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: "1px solid #4f8fc0" }} />
              <input placeholder="Supervisor" value={addRoutine.supervisor} onChange={e => setAddRoutine(r => ({ ...r, supervisor: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: "1px solid #4f8fc0" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 22 }}>
              <button
                onClick={handleAddRoutine}
                disabled={adding}
                style={{
                  padding: "9px 22px",
                  background: "linear-gradient(90deg, #43a047 0%, #388e3c 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 7,
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: "0 2px 8px 0 rgba(67,160,71,0.10)",
                  cursor: adding ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  letterSpacing: 1,
                }}
              >
                {adding ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={adding}
                style={{
                  padding: "9px 22px",
                  background: "#eee",
                  color: "#23395d",
                  border: "none",
                  borderRadius: 7,
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: "0 2px 8px 0 rgba(36,50,77,0.10)",
                  cursor: adding ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  letterSpacing: 1,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
          {/* Search Box */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: "7px 12px",
                borderRadius: 6,
                border: "1.5px solid #b71c1c",
                fontSize: 15,
                minWidth: 120,
                outline: "none"
              }}
            />
          </div>
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
                  <th className="px-4 py-3 text-left font-semibold" style={{cursor:'pointer'}} onClick={() => { setSortBy('date'); setOrder(order === 'asc' && sortBy==='date' ? 'desc' : 'asc'); }}>
                    Date {sortBy==='date' ? (order==='asc'?'▲':'▼') : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{cursor:'pointer'}} onClick={() => { setSortBy('sn'); setOrder(order === 'asc' && sortBy==='sn' ? 'desc' : 'asc'); }}>
                    SN {sortBy==='sn' ? (order==='asc'?'▲':'▼') : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{cursor:'pointer'}} onClick={() => { setSortBy('flight'); setOrder(order === 'asc' && sortBy==='flight' ? 'desc' : 'asc'); }}>
                    Flight {sortBy==='flight' ? (order==='asc'?'▲':'▼') : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{cursor:'pointer'}} onClick={() => { setSortBy('from'); setOrder(order === 'asc' && sortBy==='from' ? 'desc' : 'asc'); }}>
                    From {sortBy==='from' ? (order==='asc'?'▲':'▼') : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{cursor:'pointer'}} onClick={() => { setSortBy('to'); setOrder(order === 'asc' && sortBy==='to' ? 'desc' : 'asc'); }}>
                    To {sortBy==='to' ? (order==='asc'?'▲':'▼') : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{cursor:'pointer'}} onClick={() => { setSortBy('sta'); setOrder(order === 'asc' && sortBy==='sta' ? 'desc' : 'asc'); }}>
                    STA {sortBy==='sta' ? (order==='asc'?'▲':'▼') : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{cursor:'pointer'}} onClick={() => { setSortBy('eta'); setOrder(order === 'asc' && sortBy==='eta' ? 'desc' : 'asc'); }}>
                    ETA {sortBy==='eta' ? (order==='asc'?'▲':'▼') : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{cursor:'pointer'}} onClick={() => { setSortBy('ata'); setOrder(order === 'asc' && sortBy==='ata' ? 'desc' : 'asc'); }}>
                    ATA {sortBy==='ata' ? (order==='asc'?'▲':'▼') : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{cursor:'pointer'}} onClick={() => { setSortBy('remarks'); setOrder(order === 'asc' && sortBy==='remarks' ? 'desc' : 'asc'); }}>
                    Remarks {sortBy==='remarks' ? (order==='asc'?'▲':'▼') : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{cursor:'pointer'}} onClick={() => { setSortBy('employeeID'); setOrder(order === 'asc' && sortBy==='employeeID' ? 'desc' : 'asc'); }}>
                    Staff In Charge {sortBy==='employeeID' ? (order==='asc'?'▲':'▼') : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{cursor:'pointer'}} onClick={() => { setSortBy('supervisor'); setOrder(order === 'asc' && sortBy==='supervisor' ? 'desc' : 'asc'); }}>
                    Supervisor {sortBy==='supervisor' ? (order==='asc'?'▲':'▼') : ''}
                  </th>
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
                        <td className="px-4 py-2" style={{ display: "flex", gap: 8 }}>
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
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteRoutine(item.JobID)}
                              style={{
                                padding: "7px 18px",
                                background: "linear-gradient(90deg, #d32f2f 0%, #b71c1c 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 7,
                                fontWeight: 700,
                                fontSize: 15,
                                boxShadow: "0 2px 8px 0 rgba(211,47,47,0.10)",
                                cursor: "pointer",
                                transition: "background 0.2s",
                                letterSpacing: 1,
                              }}
                            >
                              Delete
                            </button>
                          )}
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