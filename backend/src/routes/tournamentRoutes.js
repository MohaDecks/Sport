const express = require('express');
const {
  getTournaments, getTournament, createTournament, updateTournament, deleteTournament,
} = require('../controllers/tournamentController');
const { protect, authorize, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getTournaments);
router.get('/:id', protect, getTournament);
router.post('/', protect, authorize('admin'), requirePermission('tournaments.create'), createTournament);
router.put('/:id', protect, authorize('admin'), requirePermission('tournaments.update'), updateTournament);
router.delete('/:id', protect, authorize('admin'), requirePermission('tournaments.delete'), deleteTournament);

module.exports = router;
