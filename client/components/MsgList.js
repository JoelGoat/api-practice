import { useEffect, useState } from 'react'
import MsgItem from './MsgItem'

// [
//   {
//     id: 1,
//     userId: getRandomUserId(),
//     timestamp: 1234567890123,
//     text: '1 mock text'
//   }
// ]

const MsgList = () => {
  const [msgs, setMsgs] = useState([])

  const UserIds = ['roy', 'jay']
  const getRandomUserId = () => UserIds[Math.round(Math.random())]

  useEffect(() => {
    setMsgs(
      Array(50)
        .fill(0)
        .map((_, i) => ({
          id: i + 1,
          userId: getRandomUserId(),
          timestamp: 1234567890123 + i * 1000 * 60,
          text: `${i + 1} mock text`,
        }))
        .reverse()
    )
  }, [])

  return (
    <ul className="messages">
      {msgs.map((x) => (
        <MsgItem key={x.id} {...x} />
      ))}
    </ul>
  )
}

export default MsgList
