import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    getPlayer(readableGameId: String!, playerName: String!): Player
    getGameState(readableGameId: String!): GameState
    checkForWinner(gameId: ID!): Affiliation
  }
  
  type Subscription {
    isGameReadyToStart(readableGameId: String!): Boolean
  }
  
  type Mutation {
    initializeGame(gameMasterName: String!, playerCount: Int!): Game
    joinGame(readableGameId: String!, playerName: String!): Game
    startGame(gameId: ID!, playerNames: [String]!): GameState
    rotateLeader(gameId: ID!): GameState
    changeLeader(gameId: ID!, playerName: String): GameState
    proposeArmedPlayers(gameId: ID!, playersNames: [String]!): GameState
    armPlayers(gameId: ID!): GameState
    resetArmedPlayers(gameId: ID!): GameState
    incrementVoteRejectionCount(gameId: ID!): GameState
    resetVoteRejectionCount(gameId: ID!): GameState
    finishCurrentMission(gameId: ID!, teamWon: Affiliation!): GameState
  }
  
  type Game {
    id: ID!
    gameMasterName: String!
    readableGameId: String!
    players: [Player]!
    playerCount: Int!
    currentState: GameState
  }
  
  type GameState {
    playerNames: [String]!
    leaderName: String!
    currentMission: Mission
    missions: [Mission]
    proposedArmedPlayerNames: [String]!
    armedPlayerNames: [String]!
    voteRejectionCount: Int!
  }
  
  type Player {
    id: ID!
    name: String!
    number: Int!
    roleCard: RoleCard
    attendedMissions: [Mission]
  }
  
  type RoleCard {
    affiliation: Affiliation!
    role: Role!
  }
  
  type Mission {
    number: Int!
    requiredPlayers: Int!
    requiredFailsToFail: Int!
    teamWon: Affiliation
  }
  
  enum Affiliation {
    SPY
    RESISTANCE
  }
  
  #Future use
  enum Role {
    NONE
    ASSASSIN
    COMMANDER
  }
`;