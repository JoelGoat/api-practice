import { v4 } from 'uuid'
import db from '../dbController.js'

const messageResolver = {
  Query: {
    messages: (parent, { cursor = '' }, { models }) => {
      const fromIndex = models.messages.findIndex((msg) => msg.id === cursor) + 1
      return models.messages.slice(fromIndex, fromIndex + 15) || []
    },
    message: (parent, { id = '' }, { models }) => {
      return models.messages.find((msg) => msg.id === id)
    },
  },
  Mutation: {
    createMessage: (parent, { text, userId }, { models }) => {
      const newMsg = {
        id: v4(),
        text,
        userId,
        timestamp: Date.now(),
      }
      models.messages.unshift(newMsg)
      db.write()
      return newMsg
    },
    updateMessage: (parent, { id, text, userId }, { models }) => {
      const targetIndex = models.messages.findIndex((msg) => msg.id === id)
      if (targetIndex < 0) throw Error('메세지가 없습니다.')
      if (models.messages[targetIndex].userId !== userId) throw Error('사용자가 다릅니다.')

      const newMsg = { ...models.messages[targetIndex], text }
      models.messages.splice(targetIndex, 1, newMsg)
      db.write()
      return newMsg
    },
    deleteMessage: (parent, { id, userId }, { models }) => {
      const targetIndex = models.messages.findIndex((msg) => msg.id === id)
      if (targetIndex < 0) throw Error('메세지가 없습니다.')
      if (models.messages[targetIndex].userId !== userId) throw Error('사용자가 다릅니다.')

      models.messages.splice(targetIndex, 1)
      db.write()
      return id
    },
  },
  Message: {
    user: (msg, args, { models }) => models.users[msg.userId],
  },
}

export default messageResolver
