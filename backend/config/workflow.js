/**
 * Maps each request type to the ordered list of approver roles
 * that must act on it before it is considered fully approved.
 *
 * Simple   (1 step):  LEAVE, LAB_ACCESS, ASSIGNMENT_EXT, LIBRARY_EXT
 * Medium   (2 steps): FEE_CONCESSION, CERTIFICATE, SCHOLARSHIP, COURSE_CHANGE, EXAM_REEVAL
 * Complex  (3 steps): PROJECT, EQUIPMENT, RESEARCH, INDUSTRIAL_VISIT
 */
const WORKFLOW_MAP = {
  // Simple
  LEAVE:            ['COORDINATOR'],
  LAB_ACCESS:       ['COORDINATOR'],
  ASSIGNMENT_EXT:   ['COORDINATOR'],
  LIBRARY_EXT:      ['COORDINATOR'],
  // Medium
  FEE_CONCESSION:   ['COORDINATOR', 'HOD'],
  CERTIFICATE:      ['COORDINATOR', 'HOD'],
  SCHOLARSHIP:      ['COORDINATOR', 'HOD'],
  COURSE_CHANGE:    ['COORDINATOR', 'HOD'],
  EXAM_REEVAL:      ['COORDINATOR', 'HOD'],
  // Complex
  PROJECT:          ['COORDINATOR', 'HOD', 'DIRECTOR'],
  EQUIPMENT:        ['COORDINATOR', 'HOD', 'DIRECTOR'],
  RESEARCH:         ['COORDINATOR', 'HOD', 'DIRECTOR'],
  INDUSTRIAL_VISIT: ['COORDINATOR', 'HOD', 'DIRECTOR'],
  // Other
  OTHER:            ['COORDINATOR', 'HOD', 'DIRECTOR'],
}

module.exports = { WORKFLOW_MAP }
