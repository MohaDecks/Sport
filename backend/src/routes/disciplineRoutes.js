const express = require('express');
const {
  getInjuries, createInjury, updateInjury,
  getAttendance, createAttendance, bulkAttendance,
  getSuspensions, createSuspension,
  getCoachNotes, createCoachNote,
  getPlayerActivities, createOrUpdateActivity,
  getPlayerCards, getPlayerDiscipline,
} = require('../controllers/disciplineController');
const { protect, authorize, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/injuries', protect, getInjuries);
router.post('/injuries', protect, authorize('admin', 'coach'), createInjury);
router.put('/injuries/:id', protect, authorize('admin', 'coach'), updateInjury);

router.get('/attendance', protect, getAttendance);
router.post('/attendance', protect, authorize('admin', 'coach'), createAttendance);
router.post('/attendance/bulk', protect, authorize('admin', 'coach'), bulkAttendance);

router.get('/suspensions', protect, getSuspensions);
router.post('/suspensions', protect, authorize('admin'), requirePermission('discipline.manage'), createSuspension);

router.get('/notes', protect, getCoachNotes);
router.post('/notes', protect, authorize('admin', 'coach'), createCoachNote);

router.get('/activities', protect, getPlayerActivities);
router.post('/activities', protect, authorize('admin', 'coach'), createOrUpdateActivity);

router.get('/cards', protect, getPlayerCards);
router.get('/player/:playerId', protect, getPlayerDiscipline);

module.exports = router;
