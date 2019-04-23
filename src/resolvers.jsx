import {hri} from 'human-readable-ids';
import uuid from 'uuid/v4';

const AffiliationEnum = Object.freeze({"SPY":0, "RESISTANCE":1});
const RoleEnum = Object.freeze({"NONE":0});

const minimumNumberOfPlayers = 5;

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

const spyCountByNumberOfPlayers = [2, 2, 3, 3, 3, 4];

const shuffle = array => {
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

const getSpyCount = playerCount => spyCountByNumberOfPlayers[playerCount - minimumNumberOfPlayers];

const generateDeck = playerCount => {
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
  return missionRequiredPlayers[playerCount-minimumNumberOfPlayers][missionNumber-1];
};

const getMissionRequiredFailsToFail = (playerCount, missionNumber) => {
  return missionRequiredFailsToFail[playerCount-minimumNumberOfPlayers][missionNumber-1];
};

export const resolvers = {
  Query: {
    getPlayer: (_, {readableGameId, playerName}) =>
      cache
        .games.find(game => game.readableGameId === readableGameId)
        .players.find(player => player.name === playerName),
    getGameState: (_, {readableGameId}) =>
      cache
        .games.find(game => game.readableGameId === readableGameId).currentState,
    checkForWinner: (_, {gameId}) => {
      const missions = cache.games.find(game => game.id === gameId).currentState.missions;
      const teamPoints = missions.reduce(
        (acc, mission) => (
          mission.teamWon === AffiliationEnum.RESISTANCE ?
            acc.resistancePoints++ :
            acc.spyPoints++
        ),
        {resistancePoints: 0, spyPoints: 0});
      if(teamPoints.resistancePoints >= 3) {
        return AffiliationEnum.RESISTANCE;
      }
      if(teamPoints.spyPoints >= 3) {
        return AffiliationEnum.SPY;
      }
    },
  },
  Subscription: {
    isGameReadyToStart: (_, {readableGameId}) => {
      const game = cache.games.find(game => game.readableGameId === readableGameId);
      return game.playerCount === game.players.length;
    }
  },
  Mutation: {
    initializeGame: (_, {gameMasterName, playerCount}) => {
      if(playerCount < minimumNumberOfPlayers) {
        return {};
      }

      const newGame = {
        gameMasterName,
        playerCount,
        id: uuid(),
        readableGameId: hri.random(),
        players: []
      };

      newGame.players.push(
        {
          id: uuid(),
          name: gameMasterName
        }
      );

      return newGame;
    },
    joinGame: (_, {readableGameId, playerName}) => {
      const game = cache.games.find(game => game.readableGameId === readableGameId);
      game.players.push({
        id: uuid(),
        name: playerName,
      });
    },
    startGame: (_, {gameId}) => {
      const game = cache.games.find(game => game.id === gameId);
      const roleDeck = generateDeck(playerNames.length);
      const players = game.players.map((player, index) => {
        player.number = index;
        player.roleCard = roleDeck.pop();
      });

      const currentMission = {
        number: 1,
        requiredPlayers: getMissionRequiredPlayers(players.length, 1),
        requiredFailsToFail: getMissionRequiredFailsToFail(players.length, 1)
      };

      const playerNames = players.map(player => player.name);

      const currentState = {
        playerNames,
        leaderName: shuffle(playerNames).pop(),
        currentMission,
        voteRejectionCount: 0,
        missions: []
      };

      game.currentState = currentState;

      return currentState;
    },
    rotateLeader: (_, {gameId, playerName}) => {
      const game = cache.games.find(game => game.id === gameId);
      let currentLeaderIndex = game.players.reduce((acc, player, index) =>
        player.name === game.currentState.leaderName ? index : 0);

      if (currentLeaderIndex + 1 === game.players.length)
        currentLeaderIndex = 0;

      game.currentState.leaderName = game.players[currentLeaderIndex].name;
    },
    changeLeader: (_, {gameId, playerName}) => {
      const game = cache.games.find(game => game.id === gameId);
      game.currentState.leaderName = playerName;
      return game.currentState;
    },
    proposeArmedPlayers: (_, {gameId, playerNames}) => {
      const game = cache.games.find(game => game.id === gameId);
      game.currentState.proposedArmedPlayerNames = playerNames;
      return game.currentState;
    },
    armPlayers: (_, {gameId}) => {
      const game = cache.games.find(game => game.id === gameId);
      game.currentState.armedPlayerNames = game.currentState.proposedArmedPlayerNames;
      game.currentState.proposedArmedPlayerNames = [];
      return game.currentState;
    },
    resetArmedPlayers: (_, {gameId}) => {
      const game = cache.games.find(game => game.id === gameId);
      game.currentState.armedPlayerNames = [];
      return game.currentState;
    },
    incrementVoteRejectionCount: (_, {gameId}) => {
      const game = cache.games.find(game => game.id === gameId);
      game.currentState.voteRejectionCount++;
      return game.currentState;
    },
    resetVoteRejectionCount: (_, {gameId}) => {
      const game = cache.games.find(game => game.id === gameId);
      game.currentState.voteRejectionCount = 0;
      return game.currentState;
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
      return game.currentState;
    },
  },
};