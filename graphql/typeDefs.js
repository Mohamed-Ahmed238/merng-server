const { gql } = require('apollo-server')

exports.typeDefs = gql`
  type Query {
    getPosts: [Post]
    getPost(postId: ID!): Post!
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    createPost(body: String!): Post!
    deletePost(postId: ID!): String!
    createComment(postId: ID!, body: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    likePost(postId: ID!): Post!
  }

  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

  type User {
    id: ID!
    email: String!
    token: String
    username: String!
    createdAt: String!
  }

  type Comments {
    id: ID!
    body: String!
    createdAt: String!
    username: String!
  }

  type Likes {
    id: ID!
    username: String!
    createdAt: String!
  }

  type Post {
    id: ID!
    username: String!
    body: String!
    createdAt: String!
    comments: [Comments]!
    likes: [Likes!]
    likesCount: Int!
    commentsCount: Int!
  }
`
