import { useCallback, useEffect, useRef, useState } from 'react'
import { initialRegisteredHospitals, medicationLabelByTime, mockWebSearchHospital } from './mockData'
import type { CalendarEvent, ChatMessage, GuardianAlert, IntentType, RegisteredHospital, ScreenState, ToastMessage } from './types'

// 데모 편의를 위해 30분 재알림 간격을 압축한 값 (실제 서비스에서는 30분)
const DEMO_TIMEOUT_MS = 12000
const AUTO_RETURN_MS = 4500

let idCounter = 0
const nextId = () => `${Date.now()}-${idCounter++}`

function futureDateLabel(): string {
  const d = new Date()
  d.setDate(d.getDate() + 4)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${days[d.getDay()]}) 오전 10시`
}

function nowLabel(): string {
  const d = new Date()
  const ampm = d.getHours() < 12 ? '오전' : '오후'
  const h12 = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `오늘 ${ampm} ${h12}:${mm}`
}

function parseHospitalName(text: string): string | null {
  const match = text.match(/([가-힣A-Za-z0-9]{1,10}병원)/)
  return match ? match[1] : null
}

const GREETING_RE = /^안녕/
const TIME_QUERY_RE = /몇\s*시/
const DATE_QUERY_RE = /며칠|무슨\s*요일/
const SCHEDULE_TRIGGER_RE = /잡아줘|잡아|예약해줘|예약|등록해줘|등록|일정|스케줄/
const SEARCH_RE = /(.+?)\s*(검색해줘|검색|찾아줘|알려줘)$/

function parseIntent(text: string): IntentType {
  if (GREETING_RE.test(text)) return 'greeting'
  // '예약'은 병원·두리발·범용 일정에 모두 쓰이는 단어라 구체적인 키워드부터 먼저 검사한다
  if (/두리발|콜택시|택시|이동|차\s*불러|기사님|픽업/.test(text)) return 'transport'
  if (/병원|진료/.test(text)) return 'hospital'
  if (/약.*(확인|먹|드셨)/.test(text)) return 'medication'
  if (TIME_QUERY_RE.test(text)) return 'time'
  if (DATE_QUERY_RE.test(text)) return 'date'
  if (SCHEDULE_TRIGGER_RE.test(text)) return 'schedule'
  if (SEARCH_RE.test(text)) return 'search'
  return 'unknown'
}

// ---- 범용 일정 등록: '내일 오후 3시에 치과 예약 잡아줘' → 제목/일시 파싱 ----
const RELATIVE_DAY_OFFSET: Record<string, number> = { 모레: 2, 내일: 1, 오늘: 0 }
const MONTH_DAY_RE = /(\d{1,2})\s*월\s*(\d{1,2})\s*일/
const MERIDIEM_RE = /오전|오후/
const HOUR_MIN_RE = /(\d{1,2})\s*시\s*(?:(\d{1,2})\s*분)?/
const SCHEDULE_TRIGGER_RE_G = /잡아줘|잡아|예약해줘|예약|등록해줘|등록|일정|스케줄/g
const WEEKDAYS_KO = ['월', '화', '수', '목', '금', '토', '일']
const DEFAULT_SCHEDULE_HOUR = 9

function parseScheduleRequest(text: string): { title: string; when: Date; timeSpecified: boolean } {
  let remaining = text

  let dayOffset: number | null = null
  for (const [word, offset] of Object.entries(RELATIVE_DAY_OFFSET)) {
    if (remaining.includes(word)) {
      dayOffset = offset
      remaining = remaining.replace(word, ' ')
      break
    }
  }

  let explicitDate: Date | null = null
  const mdMatch = MONTH_DAY_RE.exec(remaining)
  if (mdMatch) {
    const month = parseInt(mdMatch[1], 10)
    const day = parseInt(mdMatch[2], 10)
    remaining = remaining.slice(0, mdMatch.index) + ' ' + remaining.slice(mdMatch.index + mdMatch[0].length)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let candidate = new Date(today.getFullYear(), month - 1, day)
    if (candidate < today) candidate = new Date(today.getFullYear() + 1, month - 1, day)
    explicitDate = candidate
  }

  let meridiem: string | null = null
  const merMatch = MERIDIEM_RE.exec(remaining)
  if (merMatch) {
    meridiem = merMatch[0]
    remaining = remaining.slice(0, merMatch.index) + ' ' + remaining.slice(merMatch.index + merMatch[0].length)
  }

  let hour: number | null = null
  let minute = 0
  let timeSpecified = false
  const hmMatch = HOUR_MIN_RE.exec(remaining)
  if (hmMatch) {
    hour = parseInt(hmMatch[1], 10)
    minute = hmMatch[2] ? parseInt(hmMatch[2], 10) : 0
    timeSpecified = true
    remaining = remaining.slice(0, hmMatch.index) + ' ' + remaining.slice(hmMatch.index + hmMatch[0].length)
  }

  let targetDate: Date
  if (explicitDate) {
    targetDate = explicitDate
  } else {
    targetDate = new Date()
    targetDate.setHours(0, 0, 0, 0)
    targetDate.setDate(targetDate.getDate() + (dayOffset ?? 0))
  }

  if (hour === null) hour = DEFAULT_SCHEDULE_HOUR
  if (meridiem === '오후' && hour !== 12) hour += 12
  else if (meridiem === '오전' && hour === 12) hour = 0
  hour = hour % 24

  const when = new Date(targetDate)
  when.setHours(hour, minute, 0, 0)

  // 트리거 단어(잡아줘/예약/등록 등)는 부분 문자열로 제거
  remaining = remaining.replace(SCHEDULE_TRIGGER_RE_G, ' ')
  // 조사(에/을/를)는 완전히 분리된 토큰일 때만 제거 — 한글은 JS \b로 단어경계를 잡을 수 없어 토큰 단위로 거른다
  const PARTICLES = new Set(['에', '을', '를'])
  const title = remaining
    .split(/\s+/)
    .filter((tok) => tok && !PARTICLES.has(tok))
    .join(' ')
    .trim() || '일정'

  return { title, when, timeSpecified }
}

function formatScheduleWhenLabel(when: Date): string {
  const weekday = WEEKDAYS_KO[(when.getDay() + 6) % 7]
  const hour12 = when.getHours() % 12 || 12
  const meridiem = when.getHours() < 12 ? '오전' : '오후'
  let label = `${when.getMonth() + 1}월 ${when.getDate()}일(${weekday}) ${meridiem} ${hour12}시`
  if (when.getMinutes()) label += ` ${when.getMinutes()}분`
  return label
}

const isYes = (t: string) => /(네|응|좋아|연결해|맞아|그래)/.test(t)
const isNo = (t: string) => /(아니|아뇨|싫어|틀려)/.test(t)
const isCancel = (t: string) => /취소/.test(t)

export function useConversationEngine(onSystemSpeak: (text: string) => void) {
  const [state, setState] = useState<ScreenState>({ kind: 'idle' })
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), sender: 'system', text: '안녕하세요, 무엇을 도와드릴까요?', timestamp: Date.now() },
  ])
  const [alerts, setAlerts] = useState<GuardianAlert[]>([])
  const [hospitals, setHospitals] = useState<RegisteredHospital[]>(initialRegisteredHospitals)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const timer1 = useRef<number | null>(null)
  const timer2 = useRef<number | null>(null)
  const timer3 = useRef<number | null>(null)
  const connectFailCount = useRef(0)
  const pendingRequest = useRef<{ intent: IntentType; hospitalName: string | null; label: string } | null>(null)
  // 취소 후에도 살아있는 지연 타이머가 화면을 덮어쓰지 않도록 요청마다 세대를 구분한다
  const connectGen = useRef(0)
  const searchGen = useRef(0)

  const clearMedTimers = () => {
    if (timer1.current) window.clearTimeout(timer1.current)
    if (timer2.current) window.clearTimeout(timer2.current)
    if (timer3.current) window.clearTimeout(timer3.current)
    timer1.current = timer2.current = timer3.current = null
  }
  useEffect(() => clearMedTimers, [])

  const addMessage = useCallback((sender: ChatMessage['sender'], text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), sender, text, timestamp: Date.now() }])
    if (sender === 'system') onSystemSpeak(text)
  }, [onSystemSpeak])

  const addAlert = useCallback((level: GuardianAlert['level'], title: string, detail: string) => {
    setAlerts((prev) => [{ id: nextId(), timestamp: Date.now(), level, title, detail }, ...prev])
  }, [])

  const addEvent = useCallback((e: Omit<CalendarEvent, 'id' | 'timestamp'>) => {
    setEvents((prev) => [{ ...e, id: nextId(), timestamp: Date.now() }, ...prev])
  }, [])

  const pushToast = useCallback((text: string, level: ToastMessage['level'] = 'info') => {
    const id = nextId()
    setToasts((prev) => [...prev, { id, text, level }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2800)
  }, [])

  // 홈 버튼 등으로 안전하게 대기 화면으로 복귀: 진행 중인 지연 응답을 모두 무효화한다
  const resetToIdle = useCallback(() => {
    connectGen.current++
    searchGen.current++
    clearMedTimers()
    setState((prev) => (prev.kind === 'idle' ? prev : { kind: 'idle' }))
  }, [])

  const startExternalConnect = useCallback((intent: IntentType, hospitalName: string | null, label: string) => {
    pendingRequest.current = { intent, hospitalName, label }
    const myGen = ++connectGen.current
    setState({ kind: 'external_connect', label, onCancelReturnsTo: 'idle' })
    addMessage('system', label)
    window.setTimeout(() => {
      if (connectGen.current !== myGen) return
      const success = Math.random() < 0.78
      if (success) {
        connectFailCount.current = 0
        if (intent === 'hospital' && hospitalName) {
          const isNew = !hospitals.some((h) => h.name === hospitalName)
          const dateLabel = futureDateLabel()
          setState({
            kind: 'confirmed',
            title: '예약이 확정됐어요',
            lines: [hospitalName, dateLabel],
            guardianNotified: true,
            offerSaveHospital: isNew ? hospitalName : undefined,
          })
          addMessage('system', `✅ 예약이 확정됐어요. ${hospitalName}, ${dateLabel}. 보호자에게도 알려드렸어요.`)
          addAlert('info', '예약 확정', `${hospitalName} · ${dateLabel}`)
          addEvent({ type: 'hospital', title: `${hospitalName} 진료 예약`, whenLabel: dateLabel, status: 'scheduled' })
          pushToast('보호자에게 예약 확정을 알렸어요')
        } else {
          setState({
            kind: 'confirmed',
            title: '두리발 배차가 확정됐어요',
            lines: ['약 7분 후 도착 예정', '기사님 연락처: 010-****-1234'],
            guardianNotified: true,
          })
          addMessage('system', '✅ 두리발 배차가 확정됐어요. 약 7분 후 도착합니다. 보호자에게도 알려드렸어요.')
          addAlert('info', '두리발 배차 완료', '약 7분 후 도착 예정')
          addEvent({ type: 'transport', title: '두리발 이용', whenLabel: nowLabel(), detail: '약 7분 후 도착 예정', status: 'scheduled' })
          pushToast('보호자에게 두리발 배차를 알렸어요')
        }
      } else {
        connectFailCount.current += 1
        const reason = connectFailCount.current >= 2 ? '상담원과 계속 연결이 어려워요' : '지금은 통화 중이에요'
        setState({ kind: 'failed', reason, retryAction: 'connect' })
        addMessage('system', `⚠️ 연결이 안 됐어요. 사유: ${reason}`)
        if (connectFailCount.current >= 2) {
          addAlert('warning', '연결 반복 실패', `${label} 요청이 두 번 연속 실패했어요`)
        }
      }
    }, 1800)
  }, [addAlert, addEvent, addMessage, hospitals, pushToast])

  const startWebSearch = useCallback((hospitalName: string) => {
    const myGen = ++searchGen.current
    setState({ kind: 'web_search', hospitalName })
    addMessage('system', `🔍 ${hospitalName} 찾아볼게요`)
    window.setTimeout(() => {
      if (searchGen.current !== myGen) return
      const result = mockWebSearchHospital(hospitalName)
      if (result) {
        setState({ kind: 'search_confirm', hospitalName, phone: result.phone })
        addMessage('system', `${hospitalName}, 대표번호 ${result.phone} 맞으실까요?`)
      } else {
        setState({ kind: 'failed', reason: '번호를 찾지 못했어요', retryAction: 'search' })
        addMessage('system', '⚠️ 번호를 못 찾았어요. 직접 알려주시겠어요?')
      }
    }, 1400)
  }, [addMessage])

  const routeHospitalIntent = useCallback((hospitalName: string | null) => {
    if (!hospitalName) {
      const options = [...hospitals.map((h) => h.name), '다른 병원']
      setState({ kind: 'intent_confirm', intent: 'hospital', prompt: '어느 병원으로 연결해드릴까요?', options, retried: false })
      addMessage('system', '어느 병원으로 연결해드릴까요?')
      return
    }
    const registered = hospitals.find((h) => h.name === hospitalName)
    if (registered) {
      startExternalConnect('hospital', registered.name, `${registered.name} 전화 연결해드릴게요`)
    } else {
      startWebSearch(hospitalName)
    }
  }, [addMessage, hospitals, startExternalConnect, startWebSearch])

  const startMedicationDemo = useCallback(() => {
    clearMedTimers()
    connectFailCount.current = 0
    const label = medicationLabelByTime()
    setState({ kind: 'medication_check', round: 1, label })
    addMessage('system', `🔔 ${label} 드셨나요?`)
    timer1.current = window.setTimeout(() => {
      setState({ kind: 'medication_check', round: 2, label })
      addMessage('system', `🔔 (재알림) ${label} 아직 안 드셨어요?`)
      timer2.current = window.setTimeout(() => {
        setState({ kind: 'session_ended', reason: '2회 연속 응답이 없어 보호자에게 알렸어요', guardianNotified: true })
        addMessage('system', '🔕 대화를 종료할게요. 2회 연속 응답이 없어 보호자에게 알렸어요.')
        addAlert('emergency', '미복약 · 2회 연속 무응답', `${label} 관련 응답이 없어 보호자 확인이 필요해요`)
        addEvent({ type: 'medication', title: `${label} 미복용`, whenLabel: nowLabel(), status: 'missed' })
        pushToast('보호자에게 미복약 상황을 알렸어요')
        timer3.current = window.setTimeout(() => setState({ kind: 'idle' }), AUTO_RETURN_MS)
      }, DEMO_TIMEOUT_MS)
    }, DEMO_TIMEOUT_MS)
  }, [addAlert, addEvent, addMessage, pushToast])

  const handleGreeting = useCallback(() => {
    addMessage(
      'system',
      '안녕하세요! 병원 예약, 두리발 호출, 복약 확인은 물론 일정 등록·검색·시간·날짜 안내도 도와드려요. ' +
        "예를 들어 '내일 오후 3시에 치과 예약 잡아줘'라고 말해보세요.",
    )
  }, [addMessage])

  const handleTimeQuery = useCallback(() => {
    const now = new Date()
    const hour12 = now.getHours() % 12 || 12
    const meridiem = now.getHours() < 12 ? '오전' : '오후'
    addMessage('system', `지금은 ${meridiem} ${hour12}시 ${now.getMinutes()}분이에요.`)
  }, [addMessage])

  const handleDateQuery = useCallback(() => {
    const now = new Date()
    const weekday = WEEKDAYS_KO[(now.getDay() + 6) % 7]
    addMessage('system', `오늘은 ${now.getMonth() + 1}월 ${now.getDate()}일 ${weekday}요일이에요.`)
  }, [addMessage])

  const handleSearchQuery = useCallback((query: string) => {
    if (!query) {
      addMessage('system', '무엇을 검색할지 말씀해주세요.')
      return
    }
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`
    const opened = window.open(url, '_blank', 'noopener,noreferrer')
    if (opened) {
      addMessage('system', `🔍 ${query} 검색 결과를 새 창에서 열었어요.`)
    } else {
      addMessage('system', `브라우저 팝업이 차단된 것 같아요. 이 주소로 직접 검색해주세요: ${url}`)
    }
  }, [addMessage])

  const handleSchedule = useCallback((text: string) => {
    const { title, when, timeSpecified } = parseScheduleRequest(text)
    const whenLabel = formatScheduleWhenLabel(when)
    setState({ kind: 'confirmed', title: '일정을 등록했어요', lines: [title, whenLabel], guardianNotified: false })
    let msg = `✅ ${whenLabel}, ${title} 일정을 등록했어요.`
    if (!timeSpecified) msg += ' 시간을 말씀하지 않으셔서 오전 9시로 등록했어요.'
    addMessage('system', msg)
    addEvent({ type: 'schedule', title, whenLabel, status: 'scheduled' })
    pushToast('일정을 등록했어요')
  }, [addEvent, addMessage, pushToast])

  const processIdleIntent = useCallback((text: string) => {
    const intent = parseIntent(text)
    if (intent === 'hospital') routeHospitalIntent(parseHospitalName(text))
    else if (intent === 'transport') startExternalConnect('transport', null, '두리발 호출해드릴게요')
    else if (intent === 'medication') startMedicationDemo()
    else if (intent === 'greeting') handleGreeting()
    else if (intent === 'time') handleTimeQuery()
    else if (intent === 'date') handleDateQuery()
    else if (intent === 'schedule') handleSchedule(text)
    else if (intent === 'search') {
      const m = SEARCH_RE.exec(text)
      handleSearchQuery(m ? m[1].trim() : '')
    } else {
      setState({ kind: 'intent_confirm', intent: 'unknown', prompt: '무엇을 도와드릴까요?', options: ['병원 예약', '두리발 호출', '오늘 복약 확인'], retried: false })
      addMessage('system', '무엇을 도와드릴까요? 병원 예약, 두리발 호출, 복약 확인 중에 골라주세요.')
    }
  }, [addMessage, handleDateQuery, handleGreeting, handleSchedule, handleSearchQuery, handleTimeQuery, routeHospitalIntent, startExternalConnect, startMedicationDemo])

  const handleAction = useCallback((raw: string) => {
    const text = raw.trim()
    if (!text) return
    if (state.kind !== 'session_ended') addMessage('user', text)

    switch (state.kind) {
      case 'idle': {
        processIdleIntent(text)
        break
      }

      case 'intent_confirm': {
        const s = state
        if (isCancel(text)) {
          setState({ kind: 'idle' })
          addMessage('system', '취소했어요')
          break
        }
        if (s.options.includes('다른 병원') && text === '다른 병원') {
          setState({ kind: 'intent_confirm', intent: 'hospital', prompt: '병원 이름을 말씀해 주세요', options: [], retried: s.retried })
          addMessage('system', '병원 이름을 말씀해 주세요')
          return
        }
        if (s.intent === 'hospital') {
          const named = hospitals.find((h) => h.name === text) ? text : parseHospitalName(text)
          if (named) {
            routeHospitalIntent(named)
            return
          }
        }
        if (s.intent === 'unknown' && parseIntent(text) !== 'unknown') {
          processIdleIntent(text)
          return
        }
        // 인텐트를 이해하지 못함 → 재질문 상한(1회) 적용
        if (!s.retried) {
          setState({ ...s, retried: true })
          addMessage('system', `${s.prompt} 다시 한 번 말씀해 주시겠어요?`)
        } else {
          setState({ kind: 'failed', reason: '요청을 확인하기 어려워요', retryAction: null })
          addMessage('system', '요청을 확인하기 어려워요. 보호자에게 확인을 요청드릴게요.')
          addAlert('warning', '사용자 확인 필요', '두 번 재질문에도 요청을 이해하지 못했어요')
          pushToast('보호자에게 확인을 요청했어요')
          window.setTimeout(() => setState({ kind: 'idle' }), AUTO_RETURN_MS)
        }
        break
      }

      case 'search_confirm': {
        const s = state
        if (isCancel(text)) {
          setState({ kind: 'idle' })
          addMessage('system', '취소했어요')
        } else if (isYes(text)) {
          startExternalConnect('hospital', s.hospitalName, `${s.hospitalName} 전화 연결해드릴게요`)
        } else if (isNo(text)) {
          setState({ kind: 'intent_confirm', intent: 'hospital', prompt: '병원 이름을 다시 말씀해 주세요', options: [], retried: true })
          addMessage('system', '병원 이름을 다시 말씀해 주세요')
        } else {
          addMessage('system', '"네, 연결해줘" 또는 "아니요"로 답해주세요')
        }
        break
      }

      case 'web_search': {
        if (isCancel(text)) {
          searchGen.current++ // 진행 중이던 검색 결과가 뒤늦게 화면을 덮어쓰지 않도록 무효화
          setState({ kind: 'idle' })
          addMessage('system', '검색을 취소했어요')
        }
        break
      }

      case 'external_connect': {
        if (isCancel(text)) {
          connectGen.current++ // 지연된 연결 결과가 뒤늦게 화면을 덮어쓰지 않도록 무효화
          setState({ kind: 'idle' })
          addMessage('system', '연결을 취소했어요')
        }
        break
      }

      case 'confirmed': {
        const s = state
        if (s.offerSaveHospital) {
          if (isYes(text)) {
            setHospitals((prev) => [...prev, { name: s.offerSaveHospital as string, phone: '' }])
            addMessage('system', '다음부터 바로 연결해드릴게요. 등록했어요.')
            pushToast('병원을 등록했어요')
            setState({ kind: 'idle' })
            return
          }
          if (isNo(text)) {
            addMessage('system', '알겠어요')
            setState({ kind: 'idle' })
            return
          }
        }
        processIdleIntent(text)
        break
      }

      case 'failed': {
        const s = state
        if (s.retryAction === 'connect') {
          if (/다시|재시도/.test(text)) {
            const req = pendingRequest.current
            if (req) startExternalConnect(req.intent, req.hospitalName, req.label)
          } else {
            setState({ kind: 'idle' })
            addAlert('info', '재시도 보류', '연결 재시도를 보류하고 나중에 알려드리기로 했어요')
            addMessage('system', '알겠어요. 나중에 다시 알려드릴게요')
          }
        } else if (s.retryAction === 'search') {
          if (/보호자|확인 요청/.test(text)) {
            addAlert('warning', '보호자 확인 요청', '병원 번호를 찾지 못해 보호자 확인이 필요해요')
            addMessage('system', '보호자에게 확인을 요청했어요')
            pushToast('보호자에게 확인을 요청했어요')
            setState({ kind: 'idle' })
          } else {
            setState({ kind: 'intent_confirm', intent: 'hospital', prompt: '병원 이름을 다시 말씀해 주세요', options: [], retried: false })
            addMessage('system', '병원 이름을 다시 말씀해 주세요')
          }
        } else {
          processIdleIntent(text)
        }
        break
      }

      case 'medication_check': {
        clearMedTimers()
        const s = state
        if (/그만/.test(text)) {
          addAlert('info', '복약 알림 중단', '사용자가 스케줄을 중단했어요')
          addMessage('system', '알겠어요. 더 이상 알려드리지 않을게요')
          addEvent({ type: 'medication', title: `${s.label} 알림 중단`, whenLabel: nowLabel(), status: 'stopped' })
        } else if (/먹었|드셨/.test(text)) {
          addMessage('system', '잘하셨어요. 기록했어요')
          addEvent({ type: 'medication', title: `${s.label} 복용 완료`, whenLabel: nowLabel(), status: 'done' })
          pushToast('일정에 복용 기록을 저장했어요')
        } else {
          addMessage('system', '기록했어요. 확인 감사해요')
          addEvent({ type: 'medication', title: `${s.label} 아직 미복용`, whenLabel: nowLabel(), status: 'skipped' })
        }
        setState({ kind: 'idle' })
        break
      }

      case 'session_ended':
        break
    }
  }, [addAlert, addEvent, addMessage, hospitals, processIdleIntent, pushToast, routeHospitalIntent, startExternalConnect, startMedicationDemo, state])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const inputDisabled = state.kind === 'session_ended'

  return { state, messages, alerts, hospitals, events, toasts, inputDisabled, handleAction, startMedicationDemo, dismissToast, pushToast, resetToIdle }
}
