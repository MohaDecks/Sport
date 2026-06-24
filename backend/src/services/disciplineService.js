const Player = require('../models/Player');
const Suspension = require('../models/Suspension');

const applyCardSuspensions = async (cards, matchId) => {
  for (const card of cards) {
    const player = await Player.findById(card.player);
    if (!player) continue;

    if (card.type === 'Red') {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      await Suspension.create({
        player: card.player,
        reason: 'Red card - automatic suspension for next match',
        startDate,
        endDate,
        match: matchId,
        type: 'Red Card',
      });
    } else if (card.type === 'Yellow' && player.yellowCards >= 2 && player.yellowCards % 2 === 0) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);

      await Suspension.create({
        player: card.player,
        reason: 'Accumulated yellow cards warning',
        startDate,
        endDate,
        match: matchId,
        type: 'Yellow Accumulation',
      });
    }
  }
};

module.exports = { applyCardSuspensions };
