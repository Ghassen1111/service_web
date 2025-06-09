const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type Feedback {
    id: ID!
    user: String!
    product: String!
    rating: Int!
    comment: String!
    date: String!
  }

  type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
  }

  type Product {
    id: ID!
    name: String!
    category: String!
  }

  type Query {
    allFeedbacks: [Feedback]
    allProducts: [Product]
  }

  type Mutation {
    addFeedback(user: String!, product: String!, rating: Int!, comment: String!): Feedback
    
    # La suppression est maintenant protégée
    deleteFeedback(id: ID!): Boolean

    # Nouvelles mutations pour l'authentification
    register(username: String!, password: String!): AuthData
    login(username: String!, password: String!): AuthData
  }
`);
