# CLAUDE.md

이 저장소에서 작업하는 Claude Code(또는 다른 에이전트)를 위한 안내 문서.

## 프로젝트 개요

**Bridge AI** — 장애인·고령자를 위한 "음성 우선 AI 에이전트" 시니어 케어 앱의 클릭 가능한 프로토타입(React + TypeScript + Vite). 병원 예약·두리발(장애인 특별교통수단) 호출·복약 알림이라는 세 시나리오가 하나의 공용 대화 템플릿을 공유하고, 여기에 범용 비서 기능(일정 등록·웹 검색·시간/날짜 안내·인사)도 통합되어 있다.

핵심 설계 원칙(원본 기획 문서 기준):
- **음성이 1차 인터페이스, 화면은 보조 수단** — 모든 화면 상태에서 음성 입력(STT)·텍스트 채팅·버튼 3채널이 동일한 결과를 내야 한다.
- **비가역적 행동은 confirm-before-execute** — 병원 전화 연결처럼 되돌리기 어려운 액션은 반드시 사용자 확인 후 실행한다. 신규 병원은 번호를 찾아도 바로 걸지 않고 재확인을 거친다.
- **무응답은 에스컬레이션** — 복약 알림 2회 연속 무응답 시 세션을 종료하고 보호자에게 알린다. AI가 응급 상황을 스스로 종결하지 않는다는 원칙의 축소판.
- **재질문은 최대 1회** — 인텐트를 이해하지 못하면 한 번만 다시 묻고, 그래도 안 되면 보호자 확인 요청으로 넘긴다(무한 루프 금지).

## 아키텍처

```
src/
  engine.ts          대화 상태머신(핵심 로직) — useConversationEngine 훅
  types.ts           ScreenState/IntentType/CalendarEvent 등 도메인 타입
  useSpeech.ts        Web Speech API 래퍼 (STT: SpeechRecognition, TTS: speechSynthesis)
  mockData.ts         등록 병원 목록, 웹 검색 mock
  App.tsx             탭(대화/일정/보호자 알림) + 헤더(홈/음성토글) 조립
  components/
    StatusCard.tsx     현재 대화 상태를 보여주는 큰 카드(와이어프레임의 핵심)
    ChatTranscript.tsx 대화 기록(스크롤 로그)
    InputBar.tsx       텍스트+마이크 상시 입력창
    ConversationScreen.tsx  위 셋을 조립
    CalendarScreen.tsx  일정 탭(예정/기록)
    GuardianDashboard.tsx  보호자 알림 탭
    Toast.tsx          일시적 안내(예약확정, 오류 등)

voice-assistant/
  voice_assistant.py  독립 실행형 Python CLI (규칙 기반, API 키 불필요)
```

`engine.ts`가 사실상 이 앱의 전부다. 상태(`ScreenState`)는 판별 유니온(discriminated union)이고, `handleAction(text)`가 현재 상태에 따라 분기하는 하나의 큰 리듀서 역할을 한다. 인텐트 파싱은 `parseIntent()`(정규식 기반, 키워드 우선순위 있음)가 담당한다.

## 알려진 함정 / 설계 이유 (재발 방지용 메모)

- **한글에는 JS `\b`(단어 경계)가 안 먹는다.** JS 정규식의 `\w`는 ASCII만 포함해서, 한글 사이에는 경계가 안 생긴다(Python의 유니코드 인식 `\w`와 다름). `parseScheduleRequest`의 조사(에/을/를) 제거는 `\b`가 아니라 공백 기준 토큰 분리 후 정확히 일치하는 토큰만 걸러내는 방식으로 구현했다. 이 패턴을 깨지 말 것.
- **지연 응답(setTimeout)은 세대(generation) 카운터로 무효화한다.** `startExternalConnect`/`startWebSearch`는 1.4~1.8초 뒤에 결과를 반영하는데, 그 사이 사용자가 "취소"하거나 새 요청을 보내면 오래된 타이머가 나중에 화면을 덮어쓰는 버그가 있었다(수정됨). `connectGen`/`searchGen` ref를 늘려서 콜백 시작 시점의 세대와 다르면 무시하는 패턴을 그대로 따를 것 — 새로운 비동기 mock을 추가할 때도 동일 패턴 적용.
- **상태 전이 중 재귀 호출은 ref로 직접 하지 말 것.** `confirmed`/`failed` 상태에서 "새 명령으로 재처리"가 필요할 때 `handleActionRef.current(text)`처럼 같은 렌더에서 만들어진 콜백을 다시 호출하면 `state`가 아직 갱신되지 않은 클로저를 참조해 무한 루프에 빠진다. 대신 `processIdleIntent(text)`처럼 상태를 직접 받지 않는 순수 라우팅 함수를 별도로 두고 그걸 호출한다.
- **아티팩트(claude.ai 미리보기)는 마이크 권한을 iframe에 위임하지 않는다.** `navigator.permissions.query({name:'microphone'})`가 `granted`인데도 `SpeechRecognition`은 `not-allowed`로 즉시 실패할 수 있다(iframe에 `allow="microphone"`이 없어서). `useSpeech.ts`의 `describePermissionBlocked()`가 이 케이스를 구분해서 안내한다. 마이크를 실제로 테스트하려면 `npm run dev`로 로컬에서 열어야 한다(아티팩트 링크로는 검증 불가).
- **pyttsx3(Python)는 이 개발 샌드박스에 espeak 백엔드가 기본으로 없다.** `apt-get install espeak-ng`가 필요했고, 그래도 스피커 자체가 없어 실제 재생(`aplay`)은 안 된다 — `engine.save_to_file()`로 wav를 만들어 검증했다. 사용자 로컬 PC에서는 정상 동작.
- **hospital 인텐트 정규식은 `병원|진료`만 본다(`예약` 단독으로는 안 걸림).** 예전엔 `예약`이라는 단어만으로도 병원으로 라우팅해서 "팀 회의 예약해줘" 같은 범용 일정이 병원 시나리오로 잘못 들어갔다. 새 인텐트를 추가할 때 트리거 키워드가 다른 인텐트와 겹치는지 `parseIntent()`의 우선순위 순서를 꼭 확인할 것.
- **`voice-assistant/`(Python)와 `src/engine.ts`(TypeScript)는 일정/검색/시간/날짜 로직을 각각 독립적으로 구현하고 있다.** 의도적 중복이다(브라우저 앱 vs 로컬 CLI, 서로 호출 불가). 한쪽 로직(특히 날짜/시간 파싱 규칙)을 고치면 다른 쪽도 고칠지 검토할 것.

## 개발/테스트 방법

```bash
npm install
npm run dev          # http://localhost:5173
npm run build         # tsc -b && vite build — 타입 에러는 반드시 여기서 잡을 것
```

이 저장소에는 자동화된 테스트 스위트가 없다. 지금까지는 매 변경마다 Playwright(`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, `--no-sandbox`)로 실제 헤드리스 브라우저를 띄워 시나리오를 스크립트로 재현하고 스크린샷/콘솔 에러를 확인하는 방식으로 검증했다. 마이크를 검증할 때는 `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` 플래그와 `context.grantPermissions(['microphone'])`가 필요하다.

Python 쪽(`voice-assistant/`)은 `python voice_assistant.py --text`로 오디오 라이브러리 없이 전체 기능을 키보드로 검증할 수 있다.

## 브랜치

개발은 `claude/senior-app-prototype-ifb0by` 브랜치에서 진행한다.
