import type { GuardianAlert, RegisteredHospital } from '../types'

const levelIcon: Record<GuardianAlert['level'], string> = {
  info: '✅',
  warning: '⚠️',
  emergency: '🚨',
}

function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function GuardianDashboard({ alerts, hospitals }: { alerts: GuardianAlert[]; hospitals: RegisteredHospital[] }) {
  return (
    <div className="guardian-screen">
      <h2>보호자 알림</h2>
      <p className="guardian-sub">정OO님 (보호자) 화면 · 실시간 알림 로그</p>

      {alerts.length === 0 && <p className="guardian-empty">아직 알림이 없어요. 대화창에서 병원 예약이나 복약 확인을 진행해보세요.</p>}

      <ul className="alert-list">
        {alerts.map((a) => (
          <li key={a.id} className={`alert-item ${a.level}`}>
            <span className="alert-icon">{levelIcon[a.level]}</span>
            <div className="alert-body">
              <div className="alert-title-row">
                <strong>{a.title}</strong>
                <span className="alert-time">{timeLabel(a.timestamp)}</span>
              </div>
              <p>{a.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <h3>등록된 병원</h3>
      <ul className="hospital-list">
        {hospitals.map((h) => (
          <li key={h.name}>
            {h.name} {h.phone && <span className="hospital-phone">{h.phone}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
