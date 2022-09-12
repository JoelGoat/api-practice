import gql from 'graphql-tag'

export const GET_MESSAGES = gql`
  query GET_MESSAGES($cursor: ID) {
    messages(cursor: $cursor) {
      id
      text
      timestamp
      user {
        id
        nickname
      }
    }
  }
`

export const GET_MESSAGE = gql`
  query GET_MESSAGE($id: ID!) {
    message(id: $id) {
      id
      text
      timestamp
      user {
        id
        nickname
      }
    }
  }
`

export const CREATE_MESSAGE = gql`
  mutation CREATE_MESSAGE($text: String!, $userId: ID!) {
    createMessage(text: $text, userId: $userId) {
      id
      text
      timestamp
      user {
        id
        nickname
      }
    }
  }
`

export const UPDATE_MESSAGE = gql`
  mutation UPDATE_MESSAGE($id: ID!, $text: String!, $userId: ID!) {
    updateMessage(id: $id, text: $text, userId: $userId) {
      id
      text
      timestamp
      user {
        id
        nickname
      }
    }
  }
`

export const DELETE_MESSAGE = gql`
  mutation DELETE_MESSAGE($id: ID!, $userId: ID!) {
    deleteMessage(id: $id, userId: $userId)
  }
`
