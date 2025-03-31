const Glicko2 = require('glicko2');
const settings = { tau: 0.5, rating: 1500, rd: 200, vol: 0.06 };

class RatingSystem {
  constructor() {
    this.glicko = new Glicko2(settings);
    this.players = new Map();
  }

  registerUser(userId, rating = 1500, rd = 200, vol = 0.06) {
    this.players.set(userId, this.glicko.makePlayer(rating, rd, vol));
  }

  updateRatings(contestResults) {
    const matches = contestResults.map(({ winner, loser }) => [
      this.players.get(winner),
      this.players.get(loser),
      1 // Winner gets 1 point
    ]);
    
    this.glicko.updateRatings(matches);
    
    return Array.from(this.players.entries()).map(([userId, player]) => ({
      userId,
      rating: player.getRating(),
      rd: player.getRd(),
      vol: player.getVol()
    }));
  }
}

module.exports = new RatingSystem();