import React, { useEffect, useState } from "react";

const styles = {
  container: {
    padding: '2.5rem 1.5rem',
    maxWidth: 900,
    margin: '0 auto',
    minHeight: '100vh',
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  background: '#f3f4f6'
  },
  title: { fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: 1, marginBottom: 18 },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    borderRadius: '0.7rem',
    overflow: 'hidden',
    boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
  border: '1px solid rgba(2,6,23,0.06)',
  background: '#f3f4f6',
  },
  thead: { background: 'linear-gradient(90deg,#06b6d4 0%,#0284c7 100%)', color: '#fff' },
  th: { padding: '10px 8px', textAlign: 'left', fontWeight: 700 },
  td: { padding: '8px 8px', color: '#0f172a' },
  rowEven: { background: '#f3f4f6' },
  rowOdd: { background: '#f3f4f6' },
  empty: { color: '#334155', fontWeight: 500, fontSize: 16 }
};

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
    <div style={styles.container}>
      <h2 style={styles.title}>Today's Routine ({today})</h2>
      {loading ? (
        <div style={{ color: "#4f8fc0", fontWeight: 600, fontSize: 18 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "#d32f2f", fontWeight: 600, fontSize: 16 }}>{error}</div>
      ) : routines.length === 0 ? (
        <div style={{ color: "#23395d", fontWeight: 500, fontSize: 16 }}>No routine for today.</div>
      ) : (
        <>
          <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Flight</th>
              <th style={styles.th}>From</th>
              <th style={styles.th}>To</th>
              <th style={styles.th}>Remarks</th>
              <th style={styles.th}>Staff In Charge</th>
              <th style={styles.th}>Supervisor</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const totalPages = Math.max(1, Math.ceil(routines.length / pageSize));
              const startIdx = (page - 1) * pageSize;
              const displayed = routines.slice(startIdx, startIdx + pageSize);
              return displayed.map((item, idx) => (
                <tr key={startIdx + idx} style={(startIdx + idx) % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td style={styles.td}>
                  {item.sta || '-'}{item.eta ? <span style={{ color: '#64748b' }}> / {item.eta}</span> : ''}{item.ata ? <span style={{ color: '#64748b' }}> / {item.ata}</span> : ''}
                </td>
                <td style={styles.td}>{item.flight}</td>
                <td style={styles.td}>{item.from}</td>
                <td style={styles.td}>{item.to}</td>
                <td style={styles.td}>{item.remarks}</td>
                <td style={styles.td}>{item.employeeID}</td>
                <td style={styles.td}>{item.supervisor}</td>
              </tr>
              ))
            })()}
          </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', background: '#f3f4f6', cursor: 'pointer' }}>Prev</button>
          <div style={{ fontWeight: 700 }}>{page} / {Math.max(1, Math.ceil(routines.length / pageSize))}</div>
          <button onClick={() => setPage(p => Math.min(Math.max(1, Math.ceil(routines.length / pageSize)), p + 1))} disabled={page === Math.max(1, Math.ceil(routines.length / pageSize))} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', background: '#f3f4f6', cursor: 'pointer' }}>Next</button>
        </div>
        </>
      )}
    </div>
  );
}
