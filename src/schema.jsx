import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    getPlayer(id: ID!): Player
    getGame(gameId: String!): Game
  }
  
  type Game {
    id: ID!
    gameId: String!
    players: [Player]!
    currentState: GameState
  }
  
  type GameState {
    leader: Player
    missions: [Mission]
    armedPlayers: [Player]
    voteRejectionCount: Int!
  }
  
  type Player {
    id: ID!
    name: String!
    role: RoleCard
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