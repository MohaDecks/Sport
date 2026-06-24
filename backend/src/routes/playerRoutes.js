const express = require('express');
const {
  getPlayers, getPlayer, createPlayer, updatePlayer, deletePlayer,
} = require('../controllers/playerController');
const { protect, authorize, requirePermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', protect, getPlayers);
router.get('/:id', protect, getPlayer);
router.post('/', protect, authorize('admin'), requirePermission('players.create'), upload.single('photo'), createPlayer);
router.put('/:id', protect, authorize('admin'), requirePermission('players.update'), upload.single('photo'), updatePlayer);
router.delete('/:id', protect, authorize('admin'), requirePermission('players.delete'), deletePlayer);

module.exports = router;
