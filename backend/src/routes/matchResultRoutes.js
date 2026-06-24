const express = require('express');
const { getMatchResult, createOrUpdateResult } = require('../controllers/matchResultController');
const { protect, authorize, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/:matchId', protect, getMatchResult);
router.post('/:matchId', protect, authorize('admin'), requirePermission('matches.results'), createOrUpdateResult);
router.put('/:matchId', protect, authorize('admin'), requirePermission('matches.results'), createOrUpdateResult);

module.exports = router;
