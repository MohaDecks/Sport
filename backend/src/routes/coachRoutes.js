const express = require('express');
const {
  getCoaches, getCoach, createCoach, updateCoach, deleteCoach,
} = require('../controllers/coachController');
const { protect, authorize, requirePermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', protect, getCoaches);
router.get('/:id', protect, getCoach);
router.post('/', protect, authorize('admin'), requirePermission('coaches.create'), upload.single('profile'), createCoach);
router.put('/:id', protect, authorize('admin'), requirePermission('coaches.update'), upload.single('profile'), updateCoach);
router.delete('/:id', protect, authorize('admin'), requirePermission('coaches.delete'), deleteCoach);

module.exports = router;
