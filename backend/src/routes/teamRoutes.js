const express = require('express');
const {
  getTeams, getTeam, createTeam, updateTeam, deleteTeam,
} = require('../controllers/teamController');
const { protect, authorize, requirePermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', protect, getTeams);
router.get('/:id', protect, getTeam);
router.post('/', protect, authorize('admin'), requirePermission('teams.create'), upload.single('logo'), createTeam);
router.put('/:id', protect, authorize('admin'), requirePermission('teams.update'), upload.single('logo'), updateTeam);
router.delete('/:id', protect, authorize('admin'), requirePermission('teams.delete'), deleteTeam);

module.exports = router;
