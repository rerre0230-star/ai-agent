import { useCallback, useEffect, useRef, useState } from 'react'

// 브라우저 Web Speech API 최소 타입 (lib.dom에 없는 프리픽스 API 대응)
interface SpeechRecognitionResultLike {
  transcript: string
}
interface SpeechRecognitionEventLike extends Event {
  results: { [i: number]: { [j: number]: SpeechRecognitionResultLike; isFinal: boolean }; length: number }
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null
}

function micErrorMessage(error: string): string {
  switch (error) {
    case 'not-allowed':
    case 'permission-denied':
    case 'service-not-allowed':
      return '마이크 권한이 꺼져 있어요. 브라우저 설정에서 마이크 사용을 허용해주세요.'
    case 'audio-capture':
      return '마이크를 찾을 수 없어요. 마이크가 연결되어 있는지 확인해주세요.'
    case 'network':
      return '음성 인식 서버에 연결할 수 없어요. 인터넷 연결을 확인해주세요.'
    case 'no-speech':
      return '말씀이 들리지 않았어요. 마이크 버튼을 다시 눌러 말씀해주세요.'
    case 'aborted':
      return ''
    default:
      return '음성 인식에 실패했어요. 다시 시도해주세요.'
  }
}

export function useSpeech() {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [micError, setMicError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const onResultCb = useRef<(text: string) => void>(() => {})
  const voiceEnabledRef = useRef(true)

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled
  }, [voiceEnabled])

  // 스테일 클로저 방지를 위해 참조를 통해 항상 최신 voiceEnabled를 읽는다
  const speak = useCallback((text: string) => {
    if (!voiceEnabledRef.current) return
    if (!('speechSynthesis' in window)) return
    const plain = text.replace(/[✅⚠️🔔🔕🔍📞]/gu, '')
    const utter = new SpeechSynthesisUtterance(plain)
    utter.lang = 'ko-KR'
    utter.rate = 0.95
    window.speechSynthesis.speak(utter)
  }, [])

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!Ctor) {
      setSupported(false)
      return
    }
    const rec = new Ctor()
    rec.lang = 'ko-KR'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1]
      const transcript = last?.[0]?.transcript
      if (transcript) onResultCb.current(transcript)
    }
    rec.onend = () => setListening(false)
    rec.onerror = (e) => {
      setListening(false)
      const msg = micErrorMessage(e.error)
      if (msg) {
        setMicError(msg)
        speak(msg)
      }
    }
    recognitionRef.current = rec
    setSupported(true)
  }, [speak])

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!recognitionRef.current) return
    onResultCb.current = onResult
    try {
      recognitionRef.current.start()
      setListening(true)
    } catch {
      // 이미 시작된 경우 등 무시
    }
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const clearMicError = useCallback(() => setMicError(null), [])

  return { supported, listening, startListening, stopListening, speak, voiceEnabled, setVoiceEnabled, micError, clearMicError }
}
