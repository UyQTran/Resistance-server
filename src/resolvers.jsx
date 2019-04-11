const cache = {
  games: []
};

export const resolvers = {
  Query: {
    getPlayer: (_, {readableGameId, playerName}) => {
      cache.games.find(game => game.readableGameId === readableGameId).players.find()
    }

  }
};