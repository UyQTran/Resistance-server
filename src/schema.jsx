const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    launches: [Launch]!
    launch(id: ID!): Launch
    # Queries for the current user
    me: User
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

module.exports = typeDefs;