/**
 * Department middleware
 * - DIRECTOR: always passes (can act on any department)
 * - STUDENT: always passes (scoping handled separately)
 * - COORDINATOR / HOD: req.requestDept must match req.user.department
 *
 * Route handlers are responsible for setting req.requestDept after
 * fetching the request from the DB.
 */
module.exports = function(req, res, next) {
  const role = req.user && req.user.role;

  if (role === 'DIRECTOR' || role === 'STUDENT') {
    return next();
  }

  if (role === 'COORDINATOR' || role === 'HOD') {
    if (req.requestDept !== req.user.department) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  }

  // Unknown role — deny by default
  return res.status(403).json({ error: 'Forbidden' });
};
