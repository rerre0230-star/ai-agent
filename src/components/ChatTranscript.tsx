import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types'

export default function ChatTranscript({ messages }: { messages: ChatMessage[] }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    // 상태 카드가 각 턴의 핵심 메시지를 이미 aria-live로 안내하므로,
    // 여기서는 중복 낭독을 피하기 위해 실시간 알림 없이 탐색 가능한 기록으로만 제공한다.
    <div className="transcript" aria-label="대화 기록">
      {messages.map((m) => (
        <div key={m.id} className={`bubble-row ${m.sender}`}>
          <div className="bubble">{m.text}</div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}
