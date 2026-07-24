import type { RegisteredHospital } from './types'

export const initialRegisteredHospitals: RegisteredHospital[] = [
  { name: '삼육병원', phone: '02-1234-5678' },
]

// 데모용 웹 검색 결과 mock (실제 검색 API 대신 임의 후보 반환)
export function mockWebSearchHospital(name: string): { phone: string } | null {
  // "실패" 라는 단어가 포함되면 검색 실패 시나리오를 재현
  if (name.includes('실패') || name.includes('없는')) return null
  const digits = String(Math.abs(hashCode(name)) % 9000 + 1000)
  return { phone: `02-${digits}-${String(Math.abs(hashCode(name + 'x')) % 9000 + 1000)}` }
}

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return h
}

export const medicationLabelByTime = () => {
  const hour = new Date().getHours()
  if (hour < 11) return '아침 약'
  if (hour < 17) return '점심 약'
  return '저녁 약'
}
