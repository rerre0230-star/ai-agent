import StatusCard from './StatusCard'
import ChatTranscript from './ChatTranscript'
import InputBar from './InputBar'
import type { ChatMessage, ScreenState } from '../types'

interface Props {
  state: ScreenState
  messages: ChatMessage[]
  inputDisabled: boolean
  listening: boolean
  micSupported: boolean
  onAction: (text: string) => void
  onMicToggle: () => void
}

export default function ConversationScreen({ state, messages, inputDisabled, listening, micSupported, onAction, onMicToggle }: Props) {
  return (
    <div className="conversation-screen">
      <StatusCard state={state} onAction={onAction} />
      <ChatTranscript messages={messages} />
      <InputBar
        disabled={inputDisabled}
        listening={listening}
        micSupported={micSupported}
        onSend={onAction}
        onMicToggle={onMicToggle}
      />
    </div>
  )
}
