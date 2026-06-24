const Standing = require('../models/Standing');

const updateStandings = async (tournamentId, matchId, homeScore, awayScore, homeTeamId, awayTeamId) => {
  const homeStanding = await Standing.findOne({ tournament: tournamentId, team: homeTeamId });
  const awayStanding = await Standing.findOne({ tournament: tournamentId, team: awayTeamId });

  if (!homeStanding || !awayStanding) return;

  homeStanding.played += 1;
  awayStanding.played += 1;
  homeStanding.goalsFor += homeScore;
  homeStanding.goalsAgainst += awayScore;
  awayStanding.goalsFor += awayScore;
  awayStanding.goalsAgainst += homeScore;

  if (homeScore > awayScore) {
    homeStanding.won += 1;
    homeStanding.points += 3;
    awayStanding.lost += 1;
  } else if (homeScore < awayScore) {
    awayStanding.won += 1;
    awayStanding.points += 3;
    homeStanding.lost += 1;
  } else {
    homeStanding.drawn += 1;
    awayStanding.drawn += 1;
    homeStanding.points += 1;
    awayStanding.points += 1;
  }

  homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;
  awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;

  await homeStanding.save();
  await awayStanding.save();
};

module.exports = { updateStandings };
