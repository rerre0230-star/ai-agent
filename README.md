# Bridge AI — 시니어 케어 음성 어시스턴트 프로토타입

React + TypeScript + Vite로 만든 클릭 가능한 프로토타입. 병원 예약·이동수단 요청·복약 알림 3개 시나리오가 하나의 공용 대화 템플릿(대기 → 인텐트 확인 → 검색/외부연결 → 확정/실패 → 종료)을 공유합니다.

## 실행

```bash
npm install
npm run dev
```

## 구성

- `src/engine.ts` — 대화 상태머신 (인텐트 파싱, 병원 검색/연결, 복약 무응답 에스컬레이션 등 목업 로직)
- `src/useSpeech.ts` — 음성 인식(STT)·음성 합성(TTS) 훅 (Web Speech API, 미지원 브라우저는 텍스트로 폴백)
- `src/components/` — 상태 카드, 채팅 로그, 입력창, 보호자 알림 대시보드
- `src/mockData.ts` — 등록 병원 목록, 웹 검색 mock

실제 병원/콜택시 연동, 웹 검색 API, 통화 자동화는 모두 목업(mock)이며 UI/대화 흐름 검증용 프로토타입입니다.
