const express = require('express');
const { getStandings } = require('../controllers/standingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:tournamentId', protect, getStandings);

module.exports = router;
