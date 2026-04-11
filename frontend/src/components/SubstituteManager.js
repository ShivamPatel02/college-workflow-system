import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"

export default function SubstituteManager() {
  const [coordinators, setCoordinators] = useState([])
  const [substitutes, setSubstitutes]   = useState([])
  const [absentId, setAbsentId]         = useState("")
  const [substituteId, setSubstituteId] = useState("")
  const [loading, setLoading]           = useState(false)
  const [message, setMessage]           = useState("")
  const nav = useNavigate()

  const load = async () => {
    try {
      const [coordRes, subRes] = await Promise.all([
        api.get("/substitutes/coordinators"),
        api.get("/substitutes"),
      ])
      setCoordinators(coordRes.data)
      setSubstitutes(subRes.data)
    } catch {
      nav("/")
    }
  }

  useEffect(() => { load() }, [])

  const assign = async () => {
    if (!absentId || !substituteId) {
      setMessage("Please select both absent coordinator and substitute.")
      return
    }
    setLoading(true)
    try {
      await api.post("/substitutes", {
        absent_coordinator_id: parseInt(absentId),
        substitute_id: parseInt(substituteId),
      })
      setMessage("✅ Substitute assigned successfully.")
      setAbsentId("")
      setSubstituteId("")
      load()
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const remove = async (absentCoordId) => {
    try {
      await api.delete(`/substitutes/${absentCoordId}`)
      setMessage("✅ Substitute removed.")
      load()
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.error || err.message))
    }
  }

  return (
    <div className="pa-page">
      <div className="pa-topbar">
        <Link to="/dashboard" className="pa-back-btn">← 🏠 Back to Dashboard</Link>
      </div>

      <div className="pa-header">
        <div>
          <h1>👥 Substitute Coordinator Manager</h1>
          <p>Assign a substitute when a coordinator is absent</p>
        </div>
        <Link to="/dashboard" className="pa-dash-btn">🏠 Dashboard</Link>
      </div>

      <div className="pa-body">

        {/* Assign form */}
        <div className="rd-info-card" style={{ marginBottom: "24px" }}>
          <div className="rd-card-heading">➕ Assign Substitute</div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "12px" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                Absent Coordinator
              </label>
              <select
                value={absentId}
                onChange={e => setAbsentId(e.target.value)}
                className="cr-select"
              >
                <option value="">Select absent coordinator...</option>
                {coordinators.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.username})</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                Substitute Coordinator
              </label>
              <select
                value={substituteId}
                onChange={e => setSubstituteId(e.target.value)}
                className="cr-select"
              >
                <option value="">Select substitute...</option>
                {coordinators
                  .filter(c => c.id !== parseInt(absentId))
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.username})</option>
                  ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                className="cr-submit"
                onClick={assign}
                disabled={loading}
                style={{ margin: 0, padding: "10px 24px" }}
              >
                {loading ? "Assigning..." : "✅ Assign"}
              </button>
            </div>
          </div>

          {message && (
            <p style={{ marginTop: "12px", color: message.startsWith("✅") ? "#38ef7d" : "#ff6b6b", fontSize: "14px" }}>
              {message}
            </p>
          )}
        </div>

        {/* Current substitutes */}
        <div className="rd-info-card">
          <div className="rd-card-heading">📋 Current Substitutes</div>

          {substitutes.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "12px", fontSize: "14px" }}>
              No substitutes assigned currently.
            </p>
          ) : (
            <div className="pa-table-wrap" style={{ marginTop: "12px" }}>
              <table className="pa-table">
                <thead>
                  <tr>
                    <th>Absent Coordinator</th>
                    <th>Substitute</th>
                    <th>Assigned On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {substitutes.map(s => (
                    <tr key={s.id}>
                      <td>
                        <span style={{ color: "#ff6b6b" }}>🔴 {s.absent_name}</span>
                        <br />
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{s.absent_username}</span>
                      </td>
                      <td>
                        <span style={{ color: "#38ef7d" }}>🟢 {s.substitute_name}</span>
                        <br />
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{s.substitute_username}</span>
                      </td>
                      <td style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                        {new Date(s.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                      <td>
                        <button
                          className="pa-btn-reject"
                          onClick={() => remove(s.absent_coordinator_id)}
                        >
                          ✖ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
