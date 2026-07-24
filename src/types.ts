export type IntentType = 'hospital' | 'transport' | 'medication' | 'unknown'

export type Sender = 'system' | 'user' | 'guardian-log'

export interface ChatMessage {
  id: string
  sender: Sender
  text: string
  timestamp: number
}

export interface GuardianAlert {
  id: string
  timestamp: number
  level: 'info' | 'warning' | 'emergency'
  title: string
  detail: string
}

export type ScreenState =
  | { kind: 'idle' }
  | {
      kind: 'intent_confirm'
      intent: IntentType
      prompt: string
      options: string[]
      retried: boolean
    }
  | { kind: 'web_search'; hospitalName: string }
  | { kind: 'search_confirm'; hospitalName: string; phone: string }
  | { kind: 'external_connect'; label: string; onCancelReturnsTo: 'idle' }
  | {
      kind: 'confirmed'
      title: string
      lines: string[]
      guardianNotified: boolean
      offerSaveHospital?: string
    }
  | { kind: 'failed'; reason: string; retryAction: 'connect' | 'search' | null }
  | { kind: 'medication_check'; round: 1 | 2; label: string }
  | { kind: 'session_ended'; reason: string; guardianNotified: boolean }

export interface RegisteredHospital {
  name: string
  phone: string
}
