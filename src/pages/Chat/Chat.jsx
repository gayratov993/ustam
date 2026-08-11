import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGetConversationsQuery, useGetMessagesQuery, useGetChatUserQuery, useSendMessageMutation } from '@/features/chat/chatApi'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'

function Chat() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeId, setActiveId] = useState(searchParams.get('with') || null)
  const bottomRef = useRef(null)

  useEffect(() => {
    const withId = searchParams.get('with')
    if (withId && withId !== activeId) setActiveId(withId)
  }, [searchParams, activeId])

  const { data: conversations } = useGetConversationsQuery(
    { userId: user?.id },
    { skip: !user }
  )
  const { data: messages } = useGetMessagesQuery(
    { userId: user?.id, otherId: activeId },
    { skip: !user || !activeId }
  )
  const { data: chatUser } = useGetChatUserQuery(
    { id: activeId },
    { skip: !activeId || !user }
  )
  const [sendMessage, { isLoading }] = useSendMessageMutation()
  const [text, setText] = useState('')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeId) return
    const res = await sendMessage({
      sender_id: user.id,
      receiver_id: activeId,
      content: text.trim(),
    })
    if (!res.error) setText('')
  }

  const active = conversations?.find((c) => c.id === activeId) || chatUser

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
        {t('chat.title')}
      </h1>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          {!conversations?.length ? (
            <EmptyState icon={MessageSquare} title={t('chat.empty')} description="" />
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition',
                  activeId === c.id
                    ? 'border-primary-400 bg-primary-50 dark:bg-primary-500/10'
                    : 'border-slate-200 bg-white hover:border-primary-300 dark:border-slate-800 dark:bg-slate-900'
                )}
              >
                <Avatar src={c.avatar} name={c.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {c.name}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {c.lastMessage?.content}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex h-[60vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {!activeId ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState icon={MessageSquare} title={t('chat.empty')} description="" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
                <Avatar src={active?.avatar} name={active?.name} size="sm" />
                <span className="font-semibold text-slate-900 dark:text-white">{active?.name}</span>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {messages?.map((msg) => {
                  const mine = msg.sender_id === user.id
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                          mine
                            ? 'rounded-br-sm bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                            : 'rounded-bl-sm bg-surface-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        )}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('chat.placeholder')}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!text.trim()} loading={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat
