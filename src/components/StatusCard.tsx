import type { ScreenState } from '../types'

interface Props {
  state: ScreenState
  onAction: (text: string) => void
}

function Buttons({ options, onAction }: { options: string[]; onAction: (t: string) => void }) {
  if (options.length === 0) return null
  return (
    <div className="status-buttons">
      {options.map((opt) => (
        <button key={opt} className="option-btn" onClick={() => onAction(opt)} type="button">
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function StatusCard({ state, onAction }: Props) {
  switch (state.kind) {
    case 'idle':
      return (
        <div className="status-card idle">
          <div className="status-icon pulse">🎙️</div>
          <p className="status-text">말씀주세요</p>
          <Buttons options={['병원 예약', '이동수단 요청', '오늘 복약 확인']} onAction={onAction} />
        </div>
      )
    case 'intent_confirm':
      return (
        <div className="status-card">
          <div className="status-icon">💬</div>
          <p className="status-text">{state.prompt}</p>
          {state.options.length === 0 && <p className="status-hint">아래 입력창에 말하거나 입력해 주세요</p>}
          <Buttons options={state.options} onAction={onAction} />
        </div>
      )
    case 'web_search':
      return (
        <div className="status-card">
          <div className="status-icon spin">🔍</div>
          <p className="status-text">{state.hospitalName} 찾아볼게요</p>
          <p className="status-hint">검색 중...</p>
        </div>
      )
    case 'search_confirm':
      return (
        <div className="status-card">
          <div className="status-icon">🔍</div>
          <p className="status-text">
            {state.hospitalName}, 대표번호 {state.phone} 맞으실까요?
          </p>
          <Buttons options={['네, 연결해줘', '아니요']} onAction={onAction} />
        </div>
      )
    case 'external_connect':
      return (
        <div className="status-card">
          <div className="status-icon pulse">📞</div>
          <p className="status-text">{state.label}</p>
          <p className="status-hint">연결 중...</p>
          <Buttons options={['취소']} onAction={onAction} />
        </div>
      )
    case 'confirmed':
      return (
        <div className="status-card success">
          <div className="status-icon">✅</div>
          <p className="status-text">{state.title}</p>
          {state.lines.map((l) => (
            <p key={l} className="status-line">{l}</p>
          ))}
          {state.guardianNotified && <p className="status-hint">보호자에게도 알려드렸어요</p>}
          {state.offerSaveHospital && (
            <>
              <p className="status-text small">다음에도 이 병원으로 바로 연결해드릴까요?</p>
              <Buttons options={['네', '아니요']} onAction={onAction} />
            </>
          )}
        </div>
      )
    case 'failed':
      return (
        <div className="status-card warning">
          <div className="status-icon">⚠️</div>
          <p className="status-text">연결이 안 됐어요</p>
          <p className="status-hint">사유: {state.reason}</p>
          {state.retryAction === 'connect' && (
            <Buttons options={['다시 연결하기', '나중에 알림 받기']} onAction={onAction} />
          )}
          {state.retryAction === 'search' && (
            <Buttons options={['병원 이름 다시 말하기', '보호자에게 확인 요청']} onAction={onAction} />
          )}
        </div>
      )
    case 'medication_check':
      return (
        <div className="status-card">
          <div className="status-icon">🔔</div>
          <p className="status-text">
            {state.round === 1 ? `${state.label} 드셨나요?` : `(재알림) ${state.label} 아직 안 드셨어요?`}
          </p>
          <Buttons options={['먹었어요', '아직요', '이제 그만 알려줘']} onAction={onAction} />
        </div>
      )
    case 'session_ended':
      return (
        <div className="status-card warning">
          <div className="status-icon">🔕</div>
          <p className="status-text">대화를 종료할게요</p>
          <p className="status-hint">{state.reason}</p>
          <p className="status-hint">잠시 후 대기 화면으로 돌아갑니다</p>
        </div>
      )
    default:
      return null
  }
}
