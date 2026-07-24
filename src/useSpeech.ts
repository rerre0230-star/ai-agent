import { useCallback, useEffect, useRef, useState } from 'react'

// 브라우저 Web Speech API 최소 타입 (lib.dom에 없는 프리픽스 API 대응)
interface SpeechRecognitionResultLike {
  transcript: string
}
interface SpeechRecognitionEventLike extends Event {
  results: { [i: number]: { [j: number]: SpeechRecognitionResultLike; isFinal: boolean }; length: number }
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

export function useSpeech() {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const onResultCb = useRef<(text: string) => void>(() => {})

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
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    setSupported(true)
  }, [])

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

  const speak = useCallback((text: string) => {
    if (!voiceEnabled) return
    if (!('speechSynthesis' in window)) return
    const plain = text.replace(/[✅⚠️🔔🔕🔍📞]/gu, '')
    const utter = new SpeechSynthesisUtterance(plain)
    utter.lang = 'ko-KR'
    utter.rate = 0.95
    window.speechSynthesis.speak(utter)
  }, [voiceEnabled])

  return { supported, listening, startListening, stopListening, speak, voiceEnabled, setVoiceEnabled }
}
