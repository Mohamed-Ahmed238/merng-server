const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose')

const { Query } = require('./graphql/resolvers/query')
const { Mutation } = require('./graphql/resolvers/Mutation')
const { Post } = require('./graphql/resolvers/Post')
const { typeDefs } = require('./graphql/typeDefs')
const { MONGOOSE } = require('./config')

const resolvers = { Query, Mutation, Post }

const PORT = process.env.PORT || 3001

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
})

mongoose
  .connect(MONGOOSE)
  .then(() => {
    return server.listen({ port: PORT })
  })
  .then((result) => {
    console.log(`the server is running on port ${result.url}`)
  })
  .catch((error) => console.error(error))
