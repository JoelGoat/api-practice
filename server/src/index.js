import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import cors from 'cors'

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    models: {
      messages: '',
      users: '',
    },
  },
})

server.applyMiddleware({ app, path: '/graphql' })

app.listen(8000, () => {
  console.log('server listening on 8000...')
})
