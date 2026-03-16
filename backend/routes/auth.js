const router = require("express").Router()
const bcrypt = require("bcrypt")
const { query } = require("../db")

router.post("/login", async (req, res) => {
  const { username, password } = req.body

  try {
    const rows = await query(
      "SELECT id, username, name, password, role, department FROM users WHERE username = ?",
      [username]
    )

    const user = rows[0]

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
    }

    return res.json({ success: true })
  } catch (err) {
    return res.status(401).json({ error: "Invalid credentials" })
  }
})

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("connect.sid")
    return res.json({ success: true })
  })
})

router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" })
  }
  return res.json(req.session.user)
})

module.exports = router
