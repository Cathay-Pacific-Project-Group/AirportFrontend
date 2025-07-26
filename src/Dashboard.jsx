import React, { useEffect, useState } from "react";

// Example API endpoint: http://localhost:8080/api/routine?employeeID=xxx
function Dashboard({ username: employeeID = "", onLogout }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

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

        // Always call /api/routine?employeeID=...
        const routineUrl = `http://localhost:8080/api/routine?employeeID=${employeeID}`;
        const res = await fetch(routineUrl);
        if (!res.ok) throw new Error("Failed to fetch routine data");
        const data = await res.json();
        setRoutines(data);
      } catch (err) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeID]);

  return (
    <div
      className="min-h-screen px-6 py-8 font-sans"
      style={{
        background: "linear-gradient(135deg, #e0f2fe 0%, #c7d2fe 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-emerald-100 p-4 rounded-lg shadow-lg border-b-4 border-emerald-400">
        <h1 className="text-2xl font-bold text-emerald-800 tracking-wide drop-shadow">
          Welcome, {employeeID} {isAdmin ? "(Admin)" : ""}
        </h1>
        <button
          onClick={onLogout}
          className="px-5 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-150 font-semibold"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-emerald-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-emerald-700">
            {isAdmin ? "All Employees' Routine Table" : "My Duty Routine"}
          </h2>
        </div>
        {loading ? (
          <div className="text-center py-8 text-lg text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : routines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No routine found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gradient-to-r from-emerald-100 to-blue-100">
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
                </tr>
              </thead>
              <tbody>
                {routines.map((item, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50 border-b transition">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-xs text-gray-400 tracking-wide">
        <span style={{ letterSpacing: 1 }}>
          © 2025 FlightOps. All rights reserved.
        </span>
      </footer>
    </div>
  );
}

export default Dashboard;