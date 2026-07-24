import { useState } from 'react'
import ConversationScreen from './components/ConversationScreen'
import GuardianDashboard from './components/GuardianDashboard'
import CalendarScreen from './components/CalendarScreen'
import Toast from './components/Toast'
import { useConversationEngine } from './engine'
import { useSpeech } from './useSpeech'
import './App.css'

type Tab = 'user' | 'calendar' | 'guardian'

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'user', icon: '🗣️', label: '대화' },
  { key: 'calendar', icon: '📅', label: '일정' },
  { key: 'guardian', icon: '👪', label: '보호자 알림' },
]

function App() {
  const [tab, setTab] = useState<Tab>('user')
  const speech = useSpeech()
  const { state, messages, alerts, hospitals, events, toasts, inputDisabled, handleAction, dismissToast } = useConversationEngine(speech.speak)

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
          aria-label={speech.voiceEnabled ? '음성 안내 끄기' : '음성 안내 켜기'}
          aria-pressed={speech.voiceEnabled}
          title="음성 안내 켜기/끄기"
        >
          <span aria-hidden="true">{speech.voiceEnabled ? '🔊' : '🔇'}</span>
        </button>
      </div>

      <div className="phone-body">
        <Toast toasts={toasts} onDismiss={dismissToast} />
        {tab === 'user' && (
          <ConversationScreen
            state={state}
            messages={messages}
            inputDisabled={inputDisabled}
            listening={speech.listening}
            micSupported={speech.supported}
            onAction={handleAction}
            onMicToggle={handleMicToggle}
          />
        )}
        {tab === 'calendar' && <CalendarScreen events={events} />}
        {tab === 'guardian' && <GuardianDashboard alerts={alerts} hospitals={hospitals} />}
      </div>

      <nav className="tab-bar" aria-label="주요 메뉴">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={tab === t.key ? 'active' : ''}
            onClick={() => setTab(t.key)}
            aria-current={tab === t.key ? 'page' : undefined}
          >
            <span aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
            {t.key === 'guardian' && unresolvedAlerts > 0 && (
              <em className="badge" aria-label={`확인 필요한 알림 ${unresolvedAlerts}건`}>
                {unresolvedAlerts}
              </em>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
