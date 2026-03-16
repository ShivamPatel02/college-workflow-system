import React, { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"

export default function Login() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const nav = useNavigate()

  const clearError = () => {
    if (error) setError("")
  }

  const login = async () => {

    if (!username || !password) {
      setError("Invalid username or password. Please try again.")
      return
    }

    setLoading(true)
    setError("")

    try {

      const res = await api.post("/auth/login", { username, password })

      if (res.data.success) {
        nav("/dashboard")
      }

    } catch {
      setError("Invalid username or password. Please try again.")
    } finally {
      setLoading(false)
    }

  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      login()
    }
  }

  return (
    <div className="app-container">

      <div className="card">

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "44px", marginBottom: "10px" }}>🎓</div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800 }}>BTech College Workflow</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "6px" }}>Sign in to your account</p>
        </div>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => { setUsername(e.target.value); clearError() }}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => { setPassword(e.target.value); clearError() }}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <button className="btn" onClick={login} disabled={loading}>
          {loading ? "⏳ Signing in..." : "🔐 Sign In"}
        </button>

        {error && (
          <p className="error-message">{error}</p>
        )}

        {/* Demo Users Panel */}
        <div className="demo-panel">
          <p className="demo-title">Demo Users (Password: 123)</p>
          <p><span className="demo-label">Students:</span> <span className="demo-users">student_cse, student_ece</span></p>
          <p><span className="demo-label">Coordinators:</span> <span className="demo-users">coordinator_cse, coordinator_ece</span></p>
          <p><span className="demo-label">HODs:</span> <span className="demo-users">hod_cse, hod_ece</span></p>
          <p><span className="demo-label">Director:</span> <span className="demo-users">director</span></p>
        </div>

      </div>

    </div>
  )

}
