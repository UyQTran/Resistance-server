import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    getPlayer(readableGameId: String!, playerName: String!): Player
    getGameState(readableGameId: String!): GameState
    checkForWinner(gameId: ID!): Affiliation
  }
  
  type Mutation {
    initializeGame(playerNames: [String]!): Game
    changeLeader(gameId: ID!, playerName: String): Game
    proposeArmedPlayers(gameId: ID!, playersNames: [String]!): Game
    armPlayers(gameId: ID!): Game
    resetArmedPlayers(gameId: ID!): Game
    incrementVoteRejectionCount(gameId: ID!): Game
    resetVoteRejectionCount(gameId: ID!): Game
    finishCurrentMission(gameId: ID!, teamWon: affiliation: Affiliation!): Game
  }
  
  type Game {
    id: ID!
    readableGameId: String!
    players: [Player]!
    currentState: GameState
  }
  
  type GameState {
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