import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"

const STUDENT_REQUEST_TYPES = [
  {
    group: "📋 Simple Requests (Coordinator Only)",
    options: [
      { value: "LEAVE",              label: "🏖️ Leave Request" },
      { value: "ASSIGNMENT_EXT",     label: "📚 Assignment Extension" },
      { value: "LAB_ACCESS",         label: "🔬 Lab Access Request" },
      { value: "LIBRARY_EXT",        label: "📖 Library Book Extension" },
    ]
  },
  {
    group: "📝 Medium Requests (Coordinator → HOD)",
    options: [
      { value: "FEE_CONCESSION",     label: "💰 Fee Concession" },
      { value: "CERTIFICATE",        label: "📜 Transfer Certificate" },
      { value: "SCHOLARSHIP",        label: "🎓 Scholarship Application" },
      { value: "COURSE_CHANGE",      label: "🔄 Course Change Request" },
      { value: "EXAM_REEVAL",        label: "📊 Exam Re-evaluation" },
    ]
  },
  {
    group: "🚀 Complex Requests (Coordinator → HOD → Director)",
    options: [
      { value: "PROJECT",            label: "🚀 Major Project Approval" },
      { value: "EQUIPMENT",          label: "🔧 Equipment Purchase Request" },
      { value: "RESEARCH",           label: "🔭 Research Proposal" },
      { value: "INDUSTRIAL_VISIT",   label: "🏭 Industrial Visit Approval" },
    ]
  },
  {
    group: "📌 Other",
    options: [
      { value: "OTHER",              label: "📌 Other Request" },
    ]
  },
]

const TEACHER_REQUEST_TYPES = [
  {
    group: "📋 Simple Requests (HOD Only)",
    options: [
      { value: "LEAVE",              label: "🏖️ Leave Request" },
      { value: "LAB_ACCESS",         label: "🔬 Lab Access Request" },
    ]
  },
  {
    group: "📝 Medium Requests (HOD → Director)",
    options: [
      { value: "EQUIPMENT",          label: "🔧 Equipment Purchase Request" },
      { value: "COURSE_CHANGE",      label: "🔄 Course / Syllabus Change" },
      { value: "CERTIFICATE",        label: "📜 Experience Certificate" },
    ]
  },
  {
    group: "🚀 Complex Requests (HOD → Director)",
    options: [
      { value: "RESEARCH",           label: "🔭 Research Proposal" },
      { value: "INDUSTRIAL_VISIT",   label: "🏭 Industrial Visit Approval" },
      { value: "PROJECT",            label: "🚀 Major Project / Lab Setup" },
    ]
  },
  {
    group: "📌 Other",
    options: [
      { value: "OTHER",              label: "📌 Other Request" },
    ]
  },
]

const DEPARTMENTS = ["CSE","ECE","MECH","CIVIL","EEE","IT"]

const PRIORITIES = [
  { value: "LOW",    label: "🟢 Low" },
  { value: "MEDIUM", label: "🟡 Medium" },
  { value: "HIGH",   label: "🔴 High" },
  { value: "URGENT", label: "🚨 Urgent" },
]

export default function CreateRequest() {

  const [user, setUser]               = useState(null)
  const [requestType, setRequestType] = useState("")
  const [department, setDepartment]   = useState("")
  const [priority, setPriority]       = useState("MEDIUM")
  const [description, setDescription] = useState("")
  const [title, setTitle]             = useState("")
  const [file, setFile]               = useState(null)
  const [loading, setLoading]         = useState(false)

  const nav = useNavigate()

  useEffect(() => {
    api.get("/auth/me")
      .then(res => {
        setUser(res.data)
        setDepartment(res.data.department)
      })
      .catch(() => nav("/"))
  }, [nav])

  const submit = async () => {
    if (!requestType || !department || !description || !title) {
      alert("Please fill in all required fields")
      return
    }
    setLoading(true)
    try {
      const form = new FormData()
      form.append("title", title)
      form.append("description", description)
      form.append("type", requestType)
      form.append("priority", priority)
      if (file) form.append("document", file)
      await api.post("/requests", form)
      alert("✅ Request submitted successfully!")
      nav("/requests")
    } catch (err) {
      alert("❌ " + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cr-page">

      {/* Header */}
      <div className="cr-header">
        <div className="cr-header-left">
          <h1>✨ Submit New Request</h1>
        </div>
        <Link to="/dashboard" className="cr-dashboard-btn">🏠 Dashboard</Link>
      </div>

      <div className="cr-body">

        {/* Submitting as */}
        <div className="cr-user-bar">
          <span className="cr-user-avatar">👤</span>
          <span><strong>Submitting as:</strong> {user ? `${user.name || user.username} (${user.role} - ${user.department})` : "..."}</span>
        </div>

        {/* Request Type */}
        <div className="cr-field">
          <label>📋 Request Type <span className="cr-required">*</span></label>
          <select value={requestType} onChange={e => setRequestType(e.target.value)} className="cr-select">
            <option value="">Select request type...</option>
            {(user && ["COORDINATOR","HOD"].includes(user.role) ? TEACHER_REQUEST_TYPES : STUDENT_REQUEST_TYPES).map(group => (
              <optgroup key={group.group} label={group.group}>
                {group.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="cr-field">
          <label>📝 Title <span className="cr-required">*</span></label>
          <input
            className="cr-input"
            type="text"
            placeholder="Enter a brief title for your request..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Target Department */}
        <div className="cr-field">
          <label>🏢 Target Department <span className="cr-required">*</span></label>
          <select value={department} onChange={e => setDepartment(e.target.value)} className="cr-select">
            <option value="">Select department...</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="cr-field">
          <label>🚩 Priority Level</label>
          <div className="cr-priority-grid">
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                className={`cr-priority-btn ${priority === p.value ? "cr-priority-active" : ""}`}
                onClick={() => setPriority(p.value)}
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="cr-field">
          <label>📄 Request Details <span className="cr-required">*</span></label>
          <textarea
            className="cr-textarea"
            placeholder="Please provide detailed information about your request. Include relevant dates, amounts, justifications, and any supporting information..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
          />
        </div>

        {/* File */}
        <div className="cr-field">
          <label>📎 Attach Document <span style={{color:"#aaa",fontWeight:"400"}}>(Optional)</span></label>
          <input type="file" className="cr-file" onChange={e => setFile(e.target.files[0])} />
          {file && <p style={{color:"#a78bfa",fontSize:"13px",marginTop:"6px"}}>📎 {file.name}</p>}
        </div>

        <button className="cr-submit" onClick={submit} disabled={loading}>
          {loading ? "Submitting..." : "✅ Submit Request"}
        </button>

      </div>
    </div>
  )
}
