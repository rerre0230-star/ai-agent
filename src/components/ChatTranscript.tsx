import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types'

export default function ChatTranscript({ messages }: { messages: ChatMessage[] }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="transcript">
      {messages.map((m) => (
        <div key={m.id} className={`bubble-row ${m.sender}`}>
          <div className="bubble">{m.text}</div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}
