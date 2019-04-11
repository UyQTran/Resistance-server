import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    getPlayer(playerName: String!): Player
    getGame(readableGameId: String!): Game
  }
  
  type Mutation {
    initializeGame(readableGameId: String!): Game
    changeLeader(gameId: ID!, playerId: ID!): Game
    proposeArmedPlayer(gameId: ID!, playersIds: [ID]!): Game
    armPlayer(gameId: ID!, playerIds: [ID]!): Game
    resetProposedArmedPlayers(gameId: ID!): Game
    incrementVoteRejectionCount(gameId: ID!): Game
    resetVoteRejectionCount(gameId: ID!): Game
    failCurrentMission(gameId: ID!): Game
    succeedCurrentMission(gameId: ID!): Game
    advanceMission(gameId: ID!): Game
    checkForWinner(gameId: ID!): Affiliation
  }
  
  type Game {
    id: ID!
    readableGameId: String!
    players: [Player]!
    currentState: GameState
  }
  
  type GameState {
    leader: Player
    currentMission: Mission
    missions: [Mission]
    proposedArmedPlayers: [Player]
    armedPlayers: [Player]
    voteRejectionCount: Int!
  }
  
  type Player {
    id: ID!
    name: String!
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
    requiredFailsForSpiesToWin: Int!
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