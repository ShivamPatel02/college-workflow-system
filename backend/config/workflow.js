/**
 * STUDENT workflow — requests submitted by STUDENT
 * Simple   (1 step):  LEAVE, LAB_ACCESS, ASSIGNMENT_EXT, LIBRARY_EXT
 * Medium   (2 steps): FEE_CONCESSION, CERTIFICATE, SCHOLARSHIP, COURSE_CHANGE, EXAM_REEVAL
 * Complex  (3 steps): PROJECT, EQUIPMENT, RESEARCH, INDUSTRIAL_VISIT, OTHER
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
  OTHER:            ['COORDINATOR', 'HOD', 'DIRECTOR'],
}

/**
 * COORDINATOR workflow — requests submitted by COORDINATOR
 * Coordinator cannot approve their own request, so starts at HOD.
 * Simple (1 step):  LEAVE, LAB_ACCESS        → HOD only
 * Others (2 steps): everything else           → HOD → DIRECTOR
 */
const COORDINATOR_WORKFLOW_MAP = {
  LEAVE:            ['HOD'],
  LAB_ACCESS:       ['HOD'],
  EQUIPMENT:        ['HOD', 'DIRECTOR'],
  COURSE_CHANGE:    ['HOD', 'DIRECTOR'],
  CERTIFICATE:      ['HOD', 'DIRECTOR'],
  RESEARCH:         ['HOD', 'DIRECTOR'],
  INDUSTRIAL_VISIT: ['HOD', 'DIRECTOR'],
  PROJECT:          ['HOD', 'DIRECTOR'],
  OTHER:            ['HOD', 'DIRECTOR'],
}

/**
 * HOD workflow — requests submitted by HOD
 * HOD cannot approve their own request, so starts at DIRECTOR.
 * All types → DIRECTOR only
 */
const HOD_WORKFLOW_MAP = {
  LEAVE:            ['DIRECTOR'],
  LAB_ACCESS:       ['DIRECTOR'],
  EQUIPMENT:        ['DIRECTOR'],
  COURSE_CHANGE:    ['DIRECTOR'],
  CERTIFICATE:      ['DIRECTOR'],
  RESEARCH:         ['DIRECTOR'],
  INDUSTRIAL_VISIT: ['DIRECTOR'],
  PROJECT:          ['DIRECTOR'],
  OTHER:            ['DIRECTOR'],
}

/**
 * Returns the correct workflow map for a given submitter role.
 */
function getWorkflowMap(submitterRole) {
  if (submitterRole === 'COORDINATOR') return COORDINATOR_WORKFLOW_MAP
  if (submitterRole === 'HOD')         return HOD_WORKFLOW_MAP
  return WORKFLOW_MAP // STUDENT (default)
}

module.exports = { WORKFLOW_MAP, COORDINATOR_WORKFLOW_MAP, HOD_WORKFLOW_MAP, getWorkflowMap }
