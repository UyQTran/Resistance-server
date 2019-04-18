import {hri} from 'human-readable-ids';
import uuid from 'uuid/v4';

const AffiliationEnum = Object.freeze({"SPY":0, "RESISTANCE":1});
const RoleEnum = Object.freeze({"NONE":0});

const cache = {
  games: []
};

const missionRequiredPlayers = [
  [2,3,2,3,3],
  [2,3,4,3,4],
  [2,3,3,4,4],
  [3,4,4,5,5],
  [3,4,4,5,5],
  [3,4,4,5,5]
];
const missionRequiredFailsToFail = [
  [1,1,1,1,1],
  [1,1,1,1,1],
  [1,1,1,2,1],
  [1,1,1,2,1],
  [1,1,1,2,1],
  [1,1,1,2,1]
];

const shuffle = (array) => {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const getSpyCount = (playerCount) => {
  switch(playerCount) {
    case 5:
    case 6:
      return 2;
    case 7:
    case 8:
    case 9:
      return 3;
    case 10:
      return 4;
    default:
      return 0;
  }
};

const generateDeck = (playerCount) => {
  let spyCount = getSpyCount(playerCount);
  let i;
  const deck = [];
  for(i = 0; i < playerCount; i++) {
    deck.push({
      affiliation: i < spyCount ? AffiliationEnum.SPY : AffiliationEnum.RESISTANCE,
      role: RoleEnum.NONE
    });
  }
  return shuffle(deck);
};

const getMissionRequiredPlayers = (playerCount, missionNumber) => {
  return missionRequiredPlayers[playerCount-5][missionNumber-1];
};

const getMissionRequiredFailsToFail = (playerCount, missionNumber) => {
  return missionRequiredFailsToFail[playerCount-5][missionNumber-1];
};

export const resolvers = {
  Query: {
    getPlayer: (_, {readableGameId, playerName}) =>
      cache
        .games.find(game => game.readableGameId === readableGameId)
        .players.find(player => player.name === playerName),
    getGameState: (_, {readableGameId}) =>
      cache
        .games.find(game => game.readableGameId === readableGameId).gameState
  },
  Mutation: {
    initializeGame: (_, {playerNames}) => {
      const roleDeck = generateDeck(playerNames.length);
      const players = playerNames.map((playerName, index) => (
        {
          id: uuid(),
          name: playerName,
          number: index,
          roleCard: roleDeck.pop()
        }
      ));

      const currentMission = {
        number: 1,
        requiredPlayers: getMissionRequiredPlayers(players.length, 1),
        requiredFailsToFail: getMissionRequiredFailsToFail(players.length, 1)
      };

      const currentState = {
        currentMission,
        voteRejectionCount: 0,
        missions: []
      };

      const newGame = {
        id: uuid(),
        readableGameId: hri.random(),
        players,
        currentState,
        leader: shuffle(players).pop()
      };

      cache.games.push(newGame);

      return newGame;
    },
    changeLeader: (_, {gameId, playerName}) => {
      const game = cache.games.find(game => game.id === gameId);
      if(playerName) {
        game.currentState.leaderName = playerName;
      } else {
        let currentLeaderIndex = game.players.reduce((acc, player, index) =>
          player.name === game.currentState.leaderName ? index : 0);

        if (currentLeaderIndex + 1 === game.players.length)
          currentLeaderIndex = 0;

        game.currentState.leaderName = game.players[currentLeaderIndex].name;
      }
    },
    proposeArmedPlayers: (_, {gameId, playerNames}) => {
      const game = cache.games.find(game => game.id === gameId);
      game.currentState.proposedArmedPlayerNames = playerNames;
    },
    armPlayers: (_, {gameId}) => {
      const game = cache.games.find(game => game.id === gameId);
      game.currentState.armedPlayerNames = game.currentState.proposedArmedPlayerNames;
      game.currentState.proposedArmedPlayerNames = [];
    },
    resetProposedArmedPlayers: (_, {gameId}) => {
      const game = cache.games.find(game => game.id === gameId);
      game.currentState.armedPlayerNames = [];
    },
    incrementVoteRejectionCount: (_, {gameId}) => {
      const game = cache.games.find(game => game.id === gameId);
      game.currentState.voteRejectionCount++;
    },
    resetVoteRejectionCount: (_, {gameId}) => {
      const game = cache.games.find(game => game.id === gameId);
      game.currentState.voteRejectionCount = 0;
    },
    finishCurrentMission: (_, {gameId, affiliation}) => {
      const game = cache.games.find(game => game.id === gameId);
      const currentMission = game.currentState.currentMission;
      currentMission.teamWon = affiliation;
      game.currentState.missions.push(currentMission);

      const nextMissionNumber = currentMission.number + 1;
      const players = game.players;
      game.currentState.currentMission = {
        number: nextMissionNumber,
        requiredPlayers: getMissionRequiredPlayers(players, nextMissionNumber),
        requiredFailsToFail: getMissionRequiredFailsToFail(players, nextMissionNumber)
      };
    },
  },

};