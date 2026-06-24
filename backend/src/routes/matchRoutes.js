const express = require('express');
const {
  getMatches, getTodayMatches, getMatch, createMatch, updateMatch, deleteMatch,
} = require('../controllers/matchController');
const { protect, authorize, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getMatches);
router.get('/today', protect, getTodayMatches);
router.get('/:id', protect, getMatch);
router.post('/', protect, authorize('admin'), requirePermission('matches.create'), createMatch);
router.put('/:id', protect, authorize('admin'), requirePermission('matches.update'), updateMatch);
router.delete('/:id', protect, authorize('admin'), requirePermission('matches.delete'), deleteMatch);

module.exports = router;
