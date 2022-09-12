import { v4 } from 'uuid'
import { writeDB } from '../dbController.js'

const setMsgs = (data) => writeDB('messages', data)

const messageResolver = {
  Query: {
    messages: (parent, { cursor = '' }, { db }) => {
      const fromIndex = db.messages.findIndex((msg) => msg.id === cursor) + 1
      return db.messages.slice(fromIndex, fromIndex + 15) || []
    },
    message: (parent, { id = '' }, { db }) => {
      return db.messages.find((msg) => msg.id === id)
    },
  },
  Mutation: {
    createMessage: (parent, { text, userId }, { db }) => {
      const newMsg = {
        id: v4(),
        text,
        userId,
        timestamp: Date.now(),
      }
      db.messages.unshift(newMsg)
      setMsgs(db.messages)
      return newMsg
    },
    updateMessage: (parent, { id, text, userId }, { db }) => {
      const targetIndex = db.messages.findIndex((msg) => msg.id === id)
      if (targetIndex < 0) throw Error('메세지가 없습니다.')
      if (db.messages[targetIndex].userId !== userId) throw Error('사용자가 다릅니다.')

      const newMsg = { ...db.messages[targetIndex], text }
      db.messages.splice(targetIndex, 1, newMsg)
      setMsgs(db.messages)
      return newMsg
    },
    deleteMessage: (parent, { id, userId }, { db }) => {
      const targetIndex = db.messages.findIndex((msg) => msg.id === id)
      if (targetIndex < 0) throw Error('메세지가 없습니다.')
      if (db.messages[targetIndex].userId !== userId) throw Error('사용자가 다릅니다.')

      db.messages.splice(targetIndex, 1)
      setMsgs(db.messages)
      return id
    },
  },
}

export default messageResolver
