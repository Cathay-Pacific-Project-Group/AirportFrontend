import React, { useEffect, useState } from "react";

function getTodayStr() {
  // Use local date, not UTC
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function HomePage({ username, isAdmin }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const today = getTodayStr();

  useEffect(() => {
    const fetchToday = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `http://localhost:8080/api/routine?employeeID=${username}`
        );
        if (!res.ok) throw new Error("Failed to fetch routine data");
        const data = await res.json();
        setRoutines(data.filter(r => r.date && r.date.startsWith(today)));
      } catch (err) {
        setError(
          (err && err.message === "Failed to fetch")
            ? "Network error: Unable to reach backend."
            : (err.message || "Failed to load data.")
        );
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
  }, [username]);

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
        Today's Routine ({today})
      </h2>
      {loading ? (
        <div style={{ color: "#4f8fc0", fontWeight: 600, fontSize: 18 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "#d32f2f", fontWeight: 600, fontSize: 16 }}>{error}</div>
      ) : routines.length === 0 ? (
        <div style={{ color: "#23395d", fontWeight: 500, fontSize: 16 }}>No routine for today.</div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            borderRadius: "0.7rem",
            overflow: "hidden",
            boxShadow: "0 2px 8px 0 rgba(36,50,77,0.08)",
            border: "1.5px solid #4f8fc0",
            background: "#fff",
          }}
        >
          <thead
            style={{
              background: "linear-gradient(90deg, #4f8fc0 0%, #23395d 100%)",
              color: "#fff",
            }}
          >
            <tr>
              <th style={{ padding: "10px 8px", textAlign: "left" }}>Time</th>
              <th style={{ padding: "10px 8px", textAlign: "left" }}>Flight</th>
              <th style={{ padding: "10px 8px", textAlign: "left" }}>From</th>
              <th style={{ padding: "10px 8px", textAlign: "left" }}>To</th>
              <th style={{ padding: "10px 8px", textAlign: "left" }}>Remarks</th>
              <th style={{ padding: "10px 8px", textAlign: "left" }}>Staff In Charge</th>
              <th style={{ padding: "10px 8px", textAlign: "left" }}>Supervisor</th>
            </tr>
          </thead>
          <tbody>
            {routines.map((item, idx) => (
              <tr
                key={idx}
                style={{
                  background: idx % 2 === 0 ? "#f3f8fc" : "#e3f2fd",
                  borderBottom: "1px solid #bbdefb",
                }}
              >
                <td style={{ padding: "8px 8px" }}>
                  {item.sta || "-"}
                  {item.eta ? <span style={{ color: "#888" }}> / {item.eta}</span> : ""}
                  {item.ata ? <span style={{ color: "#888" }}> / {item.ata}</span> : ""}
                </td>
                <td style={{ padding: "8px 8px" }}>{item.flight}</td>
                <td style={{ padding: "8px 8px" }}>{item.from}</td>
                <td style={{ padding: "8px 8px" }}>{item.to}</td>
                <td style={{ padding: "8px 8px" }}>{item.remarks}</td>
                <td style={{ padding: "8px 8px" }}>{item.employeeID}</td>
                <td style={{ padding: "8px 8px" }}>{item.supervisor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
