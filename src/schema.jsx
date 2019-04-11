import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    getPlayer(id: ID!): Player
    getGame(gameId: String!): Game
  }
  
  type Mutation {
    changeLeader(gameId: ID!, player: Player): Game
    proposeArmedPlayers(gameId: ID!, players: [Player]): Game
    armPlayers(gameId: ID!, players: [Player]): Game
    resetProposedArmedPlayers(gameId: ID!): Game
    incrementVoteRejectionCount(gameId: ID!): Game
    resetVoteRejectionCount(gameId: ID!): Game
    failCurrentMission(gameId: ID!): Game
    succeedCurrentMission(gameId: ID!): Game
  }
  
  type Game {
    id: ID!
    readableGameId: String!
    players: [Player]!
    currentState: GameState
  }
  
  type GameState {
    leader: Player
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