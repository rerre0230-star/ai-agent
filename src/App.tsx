import { useState } from 'react'
import ConversationScreen from './components/ConversationScreen'
import GuardianDashboard from './components/GuardianDashboard'
import { useConversationEngine } from './engine'
import { useSpeech } from './useSpeech'
import './App.css'

type Tab = 'user' | 'guardian'

function App() {
  const [tab, setTab] = useState<Tab>('user')
  const speech = useSpeech()
  const { state, messages, alerts, hospitals, inputDisabled, handleAction } = useConversationEngine(speech.speak)

  const handleMicToggle = () => {
    if (speech.listening) {
      speech.stopListening()
      return
    }
    speech.startListening((text) => handleAction(text))
  }

  const unresolvedAlerts = alerts.filter((a) => a.level !== 'info').length

  return (
    <div className="phone-frame">
      <div className="phone-header">
        <span className="app-name">Bridge AI</span>
        <button
          type="button"
          className="voice-toggle"
          onClick={() => speech.setVoiceEnabled((v) => !v)}
          title="음성 안내 켜기/끄기"
        >
          {speech.voiceEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="phone-body">
        {tab === 'user' ? (
          <ConversationScreen
            state={state}
            messages={messages}
            inputDisabled={inputDisabled}
            listening={speech.listening}
            micSupported={speech.supported}
            onAction={handleAction}
            onMicToggle={handleMicToggle}
          />
        ) : (
          <GuardianDashboard alerts={alerts} hospitals={hospitals} />
        )}
      </div>

      <nav className="tab-bar">
        <button type="button" className={tab === 'user' ? 'active' : ''} onClick={() => setTab('user')}>
          🗣️<span>대화</span>
        </button>
        <button type="button" className={tab === 'guardian' ? 'active' : ''} onClick={() => setTab('guardian')}>
          👪<span>보호자 알림</span>
          {unresolvedAlerts > 0 && <em className="badge">{unresolvedAlerts}</em>}
        </button>
      </nav>
    </div>
  )
}

export default App
