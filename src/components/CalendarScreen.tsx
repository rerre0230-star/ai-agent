import type { CalendarEvent, CalendarEventStatus, CalendarEventType } from '../types'

const typeIcon: Record<CalendarEventType, string> = {
  hospital: '🏥',
  transport: '🚐',
  medication: '💊',
}

const statusLabel: Record<CalendarEventStatus, string> = {
  scheduled: '예정',
  done: '완료',
  missed: '무응답',
  skipped: '미복용',
  stopped: '중단',
}

function EventItem({ e }: { e: CalendarEvent }) {
  return (
    <li className={`cal-item ${e.status}`}>
      <span className="cal-icon">{typeIcon[e.type]}</span>
      <div className="cal-body">
        <div className="cal-title-row">
          <strong>{e.title}</strong>
          <span className={`cal-badge ${e.status}`}>{statusLabel[e.status]}</span>
        </div>
        <p className="cal-when">{e.whenLabel}</p>
        {e.detail && <p className="cal-detail">{e.detail}</p>}
      </div>
    </li>
  )
}

export default function CalendarScreen({ events }: { events: CalendarEvent[] }) {
  const upcoming = events.filter((e) => e.status === 'scheduled').sort((a, b) => a.timestamp - b.timestamp)
  const history = events.filter((e) => e.status !== 'scheduled').sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="calendar-screen">
      <h2>일정</h2>
      <p className="calendar-sub">두리발 · 병원 예약 · 복약 기록</p>

      <h3>다가오는 일정</h3>
      {upcoming.length === 0 ? (
        <p className="calendar-empty">예정된 일정이 없어요</p>
      ) : (
        <ul className="cal-list">
          {upcoming.map((e) => (
            <EventItem key={e.id} e={e} />
          ))}
        </ul>
      )}

      <h3>최근 기록</h3>
      {history.length === 0 ? (
        <p className="calendar-empty">아직 기록이 없어요</p>
      ) : (
        <ul className="cal-list">
          {history.map((e) => (
            <EventItem key={e.id} e={e} />
          ))}
        </ul>
      )}
    </div>
  )
}
