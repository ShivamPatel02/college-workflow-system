const router = require('express').Router()
const auth = require('../middleware/auth')
const requireRole = require('../middleware/role')
const { query } = require('../db')

// ─── GET /api/substitutes — get current substitute for HOD's department ───────
router.get('/', auth, requireRole('HOD'), async (req, res) => {
  try {
    const rows = await query(
      `SELECT s.*,
        COALESCE(a.name, a.username) AS absent_name,
        a.username AS absent_username,
        COALESCE(b.name, b.username) AS substitute_name,
        b.username AS substitute_username
       FROM substitutes s
       JOIN users a ON a.id = s.absent_coordinator_id
       JOIN users b ON b.id = s.substitute_id
       WHERE s.department = ?`,
      [req.user.department]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /api/substitutes/coordinators — list coordinators in HOD's dept ─────
router.get('/coordinators', auth, requireRole('HOD'), async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, username, COALESCE(name, username) AS name
       FROM users
       WHERE role = 'COORDINATOR' AND department = ?`,
      [req.user.department]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── POST /api/substitutes — HOD assigns a substitute ────────────────────────
router.post('/', auth, requireRole('HOD'), async (req, res) => {
  const { absent_coordinator_id, substitute_id } = req.body

  if (!absent_coordinator_id || !substitute_id) {
    return res.status(400).json({ error: 'absent_coordinator_id and substitute_id are required' })
  }

  if (absent_coordinator_id === substitute_id) {
    return res.status(400).json({ error: 'Absent coordinator and substitute cannot be the same person' })
  }

  try {
    // Verify both users are coordinators in HOD's department
    const [absent] = await query(
      `SELECT id FROM users WHERE id = ? AND role = 'COORDINATOR' AND department = ?`,
      [absent_coordinator_id, req.user.department]
    )
    if (!absent) {
      return res.status(400).json({ error: 'Absent coordinator not found in your department' })
    }

    const [substitute] = await query(
      `SELECT id FROM users WHERE id = ? AND role = 'COORDINATOR' AND department = ?`,
      [substitute_id, req.user.department]
    )
    if (!substitute) {
      return res.status(400).json({ error: 'Substitute not found in your department' })
    }

    // Insert or replace (UNIQUE KEY on absent_coordinator_id handles duplicates)
    await query(
      `INSERT INTO substitutes (absent_coordinator_id, substitute_id, assigned_by, department)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE substitute_id = ?, assigned_by = ?, created_at = NOW()`,
      [absent_coordinator_id, substitute_id, req.user.id, req.user.department,
       substitute_id, req.user.id]
    )

    res.json({ success: true, message: 'Substitute assigned successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── DELETE /api/substitutes/:absentId — HOD removes a substitute ────────────
router.delete('/:absentId', auth, requireRole('HOD'), async (req, res) => {
  try {
    await query(
      `DELETE FROM substitutes WHERE absent_coordinator_id = ? AND department = ?`,
      [req.params.absentId, req.user.department]
    )
    res.json({ success: true, message: 'Substitute removed' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
