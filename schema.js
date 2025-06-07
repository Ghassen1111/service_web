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

  type Query {
    allFeedbacks: [Feedback]
  }

  type Mutation {
    addFeedback(user: String!, product: String!, rating: Int!, comment: String!): Feedback
    deleteFeedback(id: ID!): Boolean
  }
`);
