import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query'
import MsgItem from './MsgItem'
import MsgInput from './MsgInput'
import { QueryKeys, fetcher, findTargetMsgIndex, getNewMessages } from '../queryClient'
import { CREATE_MESSAGE, DELETE_MESSAGE, GET_MESSAGES, UPDATE_MESSAGE } from '../graphql/message'
import useInfiniteScroll from '../hooks/useInfiniteScroll'

const MsgList = ({ smsgs }) => {
  const client = useQueryClient()
  const {
    query: { userId = '' },
  } = useRouter()
  // const userId = query.userId || query.userid || ''

  // const [msgs, setMsgs] = useState(smsgs)
  const [msgs, setMsgs] = useState([{ messages: smsgs }])
  const [editingId, setEditingId] = useState(null)
  const fetchMoreEl = useRef(null)
  const intersecting = useInfiniteScroll(fetchMoreEl)

  const { mutate: onCreate } = useMutation(({ text }) => fetcher(CREATE_MESSAGE, { text, userId }), {
    onSuccess: ({ createMessage }) => {
      client.setQueryData(QueryKeys.MESSAGES, (old) => {
        return {
          pageParam: old.pageParam,
          pages: [{ messages: [createMessage, ...old.pages[0].messages] }, ...old.pages.slice(1)],
          // messages: [createMessage, ...old.messages],
        }
      })
    },
  })

  const { mutate: onUpdate } = useMutation(({ text, id }) => fetcher(UPDATE_MESSAGE, { text, id, userId }), {
    onSuccess: ({ updateMessage }) => {
      doneEdit()
      client.setQueryData(QueryKeys.MESSAGES, (old) => {
        // const targetIndex = old.messages.findIndex((msg) => msg.id === updateMessage.id)
        // if (targetIndex < 0) return old
        // const newMsgs = [...old.messages]
        // newMsgs.splice(targetIndex, 1, updateMessage)
        // return { messages: newMsgs }
        const { pageIndex, msgIndex } = findTargetMsgIndex(old.pages, updateMessage.id)
        if (pageIndex < 0 || msgIndex < 0) return old
        // const newPages = [...old.pages]
        // newPages[pageIndex] = { messages: [...newPages[pageIndex].messages] }
        // newPages[pageIndex].messages.splice(msgIndex, 1, updateMessage)
        // return {
        //   pageParam: old.pageParam,
        //   pages: newPages,
        // }
        const newMsgs = getNewMessages(old)
        newMsgs.pages[pageIndex].messages.splice(msgIndex, 1, updateMessage)
        return newMsgs
      })
      // doneEdit()
    },
  })

  const { mutate: onDelete } = useMutation((id) => fetcher(DELETE_MESSAGE, { id, userId }), {
    onSuccess: ({ deleteMessage: deletedId }) => {
      client.setQueryData(QueryKeys.MESSAGES, (old) => {
        // const targetIndex = old.messages.findIndex((msg) => msg.id === deletedId)
        // if (targetIndex < 0) return old
        // const newMsgs = [...old.messages]
        // newMsgs.splice(targetIndex, 1)
        // return { messages: newMsgs }
        const { pageIndex, msgIndex } = findTargetMsgIndex(old.pages, deletedId)
        if (pageIndex < 0 || msgIndex < 0) return old
        // const newPages = [...old.pages]
        // newPages[pageIndex] = { messages: [...newPages[pageIndex].messages] }
        // newPages[pageIndex].messages.splice(msgIndex, 1)
        // return {
        //   pageParam: old.pageParam,
        //   pages: newPages,
        // }
        const newMsgs = getNewMessages(old)
        newMsgs.pages[pageIndex].messages.splice(msgIndex, 1)
        return newMsgs
      })
    },
  })

  const startEdit = (id) => setEditingId(id)

  const doneEdit = () => setEditingId(null)

  const { data, error, isError, fetchNextPage, hasNextPage } = useInfiniteQuery(
    QueryKeys.MESSAGES,
    ({ pageParam = '' }) => fetcher(GET_MESSAGES, { cursor: pageParam }),
    {
      getNextPageParam: ({ messages }) => {
        return messages?.[messages.length - 1]?.id
      },
    }
  )

  useEffect(() => {
    if (!data?.pages) return
    // const mergedMsgs = data.pages.flatMap((d) => d.messages)
    // setMsgs(mergedMsgs)
    setMsgs(data.pages)
  }, [data?.pages])

  if (isError) {
    console.error(error)
    return null
  }

  useEffect(() => {
    if (intersecting && hasNextPage) fetchNextPage()
  }, [intersecting, hasNextPage])

  return (
    <>
      {userId && <MsgInput mutate={onCreate} />}
      <ul className="messages">
        {/* {msgs.map((x) => (
          <MsgItem
            key={x.id}
            {...x}
            onUpdate={onUpdate}
            onDelete={() => onDelete(x.id)}
            startEdit={() => startEdit(x.id)}
            isEditing={editingId === x.id}
            myId={userId}
            user={users.find((x) => userId === x.id)}
          />
        ))} */}
        {msgs.map(({ messages }) =>
          messages.map((x) => (
            <MsgItem
              key={x.id}
              {...x}
              onUpdate={onUpdate}
              onDelete={() => onDelete(x.id)}
              startEdit={() => startEdit(x.id)}
              isEditing={editingId === x.id}
              myId={userId}
            />
          ))
        )}
      </ul>
      <div ref={fetchMoreEl} />
    </>
  )
}

export default MsgList
