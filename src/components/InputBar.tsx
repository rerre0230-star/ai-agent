import { useState } from 'react'

interface Props {
  disabled: boolean
  listening: boolean
  micSupported: boolean
  onSend: (text: string) => void
  onMicToggle: () => void
}

export default function InputBar({ disabled, listening, micSupported, onSend, onMicToggle }: Props) {
  const [text, setText] = useState('')

  const submit = () => {
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
  }

  return (
    <div className={`input-bar ${disabled ? 'disabled' : ''}`}>
      <button
        type="button"
        className={`mic-btn ${listening ? 'listening' : ''}`}
        onClick={onMicToggle}
        disabled={disabled || !micSupported}
        aria-label={listening ? '음성 듣기 중지' : '음성으로 말하기'}
        aria-pressed={listening}
        title={micSupported ? '음성으로 말하기' : '이 브라우저는 음성 인식을 지원하지 않아요'}
      >
        <span aria-hidden="true">🎤</span>
      </button>
      <label htmlFor="chat-input" className="visually-hidden">메시지 입력</label>
      <input
        id="chat-input"
        type="text"
        placeholder={disabled ? '대화가 종료됐어요' : '메시지를 입력하세요...'}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <button type="button" className="send-btn" onClick={submit} disabled={disabled} aria-label="메시지 보내기">
        <span aria-hidden="true">➤</span>
      </button>
    </div>
  )
}
