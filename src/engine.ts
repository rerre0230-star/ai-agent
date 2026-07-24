import { useCallback, useEffect, useRef, useState } from 'react'
import { initialRegisteredHospitals, medicationLabelByTime, mockWebSearchHospital } from './mockData'
import type { ChatMessage, GuardianAlert, IntentType, RegisteredHospital, ScreenState } from './types'

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

function parseHospitalName(text: string): string | null {
  const match = text.match(/([가-힣A-Za-z0-9]{1,10}병원)/)
  return match ? match[1] : null
}

function parseIntent(text: string): IntentType {
  if (/병원|진료|예약/.test(text)) return 'hospital'
  if (/택시|콜택시|이동|차\s*불러|기사님|픽업/.test(text)) return 'transport'
  if (/약.*(확인|먹|드셨)/.test(text)) return 'medication'
  return 'unknown'
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

  const timer1 = useRef<number | null>(null)
  const timer2 = useRef<number | null>(null)
  const timer3 = useRef<number | null>(null)
  const connectFailCount = useRef(0)

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

  const startExternalConnect = useCallback((intent: IntentType, hospitalName: string | null, label: string) => {
    setState({ kind: 'external_connect', label, onCancelReturnsTo: 'idle' })
    addMessage('system', label)
    window.setTimeout(() => {
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
        } else {
          setState({
            kind: 'confirmed',
            title: '콜택시가 배정됐어요',
            lines: ['약 7분 후 도착 예정', '기사님 연락처: 010-****-1234'],
            guardianNotified: true,
          })
          addMessage('system', '✅ 콜택시가 배정됐어요. 약 7분 후 도착합니다. 보호자에게도 알려드렸어요.')
          addAlert('info', '이동 지원 완료', '콜택시 배차 완료 · 약 7분 후 도착')
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
  }, [addAlert, addMessage, hospitals])

  const startWebSearch = useCallback((hospitalName: string) => {
    setState({ kind: 'web_search', hospitalName })
    addMessage('system', `🔍 ${hospitalName} 찾아볼게요`)
    window.setTimeout(() => {
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
        timer3.current = window.setTimeout(() => setState({ kind: 'idle' }), AUTO_RETURN_MS)
      }, DEMO_TIMEOUT_MS)
    }, DEMO_TIMEOUT_MS)
  }, [addAlert, addMessage])

  const processIdleIntent = useCallback((text: string) => {
    const intent = parseIntent(text)
    if (intent === 'hospital') routeHospitalIntent(parseHospitalName(text))
    else if (intent === 'transport') startExternalConnect('transport', null, '콜택시 연결해드릴게요')
    else if (intent === 'medication') startMedicationDemo()
    else {
      setState({ kind: 'intent_confirm', intent: 'unknown', prompt: '무엇을 도와드릴까요?', options: ['병원 예약', '이동수단 요청', '오늘 복약 확인'], retried: false })
      addMessage('system', '무엇을 도와드릴까요? 병원 예약, 이동수단 요청, 복약 확인 중에 골라주세요.')
    }
  }, [addMessage, routeHospitalIntent, startExternalConnect, startMedicationDemo])

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
        if (s.intent === 'unknown') {
          if (text.includes('병원')) return routeHospitalIntent(parseHospitalName(text))
          if (text.includes('이동')) return startExternalConnect('transport', null, '콜택시 연결해드릴게요')
          if (text.includes('복약') || text.includes('약')) return startMedicationDemo()
        }
        // 인텐트를 이해하지 못함 → 재질문 상한(1회) 적용
        if (!s.retried) {
          setState({ ...s, retried: true })
          addMessage('system', `${s.prompt} 다시 한 번 말씀해 주시겠어요?`)
        } else {
          setState({ kind: 'failed', reason: '요청을 확인하기 어려워요', retryAction: null })
          addMessage('system', '요청을 확인하기 어려워요. 보호자에게 확인을 요청드릴게요.')
          addAlert('warning', '사용자 확인 필요', '두 번 재질문에도 요청을 이해하지 못했어요')
          window.setTimeout(() => setState({ kind: 'idle' }), AUTO_RETURN_MS)
        }
        break
      }

      case 'search_confirm': {
        const s = state
        if (isYes(text)) {
          startExternalConnect('hospital', s.hospitalName, `${s.hospitalName} 전화 연결해드릴게요`)
        } else if (isNo(text)) {
          setState({ kind: 'intent_confirm', intent: 'hospital', prompt: '병원 이름을 다시 말씀해 주세요', options: [], retried: true })
          addMessage('system', '병원 이름을 다시 말씀해 주세요')
        } else {
          addMessage('system', '"네, 연결해줘" 또는 "아니요"로 답해주세요')
        }
        break
      }

      case 'external_connect': {
        if (isCancel(text)) {
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
            startExternalConnect('hospital', null, s.reason)
          } else {
            setState({ kind: 'idle' })
            addAlert('info', '재시도 보류', '연결 재시도를 보류하고 나중에 알려드리기로 했어요')
            addMessage('system', '알겠어요. 나중에 다시 알려드릴게요')
          }
        } else if (s.retryAction === 'search') {
          if (/보호자|확인 요청/.test(text)) {
            addAlert('warning', '보호자 확인 요청', '병원 번호를 찾지 못해 보호자 확인이 필요해요')
            addMessage('system', '보호자에게 확인을 요청했어요')
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
          setState({ kind: 'idle' })
        } else {
          addMessage('system', '기록했어요. 확인 감사해요')
          setState({ kind: 'idle' })
        }
        void s
        break
      }

      case 'web_search':
      case 'session_ended':
        break
    }
  }, [addAlert, addMessage, hospitals, processIdleIntent, routeHospitalIntent, startExternalConnect, startMedicationDemo, state])

  const inputDisabled = state.kind === 'session_ended'

  return { state, messages, alerts, hospitals, inputDisabled, handleAction, startMedicationDemo }
}
