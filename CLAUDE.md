# CLAUDE.md

## 프로젝트 전체 규칙
- 이 저장소는 AI 회사형 멀티 에이전트 협업 템플릿으로 사용한다.
- 모든 에이전트는 역할에 맞는 책임을 명확히 수행한다.
- 코드 변경 전에는 요구사항과 규칙을 확인한다.
- 문서, 코드, 테스트는 항상 최신 상태로 유지한다.
- 보안 정보는 저장소에 직접 포함하지 않는다.
- 중요한 변경사항은 항상 이 파일에 요약해서 반영한다.

## 프로젝트 개요
- 목적: AI 회사형 멀티 에이전트 협업 구조를 문서 중심 템플릿으로 정리한다.
- 사용 대상: AI 에이전트 협업을 설계하는 팀, PM, 개발자, 디자이너, QA, DevOps 담당자.
- 핵심 가치: 역할 분담 명확화, 규칙 기반 협업, 프로젝트/문서/메모 템플릿화.

## 현재 저장소 구조
- AGENTS/: 각 에이전트의 역할과 시스템 프롬프트 템플릿
- RULES/: 개발 및 협업 규칙 문서
- PROJECT/: 요구사항, 로드맵, 마일스톤, TODO, 백로그, 리스크, 변경 이력 템플릿
- DOCUMENTS/: 아키텍처, API, DB, 프롬프트, 회의록, 의사결정 문서 템플릿
- MEMORY/: 학습, 실수, 베스트 프랙티스, 프로젝트 메모 템플릿
- TASKS/: active, review, done 구조의 작업 관리 폴더
- src/, docs/, tests/, scripts/: 기본 프로젝트 디렉터리

## 에이전트 역할 요약
- CEO: 목표 설정, 우선순위 결정, 최종 승인
- PM: 요구사항 분석, 업무 분해, 담당자 지정, 회의 운영, QA 요청, 배포 승인
- Research: 조사, 경쟁 분석, API/정책 검토
- Architect: 프로젝트 구조, 폴더/모듈 분리, DB/API 설계 방향, 아키텍처 패턴 선정
- UXDesigner: Wireframe, User Flow, Figma, 색상, 접근성
- Design: UX/UI 설계, 디자인 시스템, 컴포넌트 구조 정의
- Frontend: React, Next.js, Flutter 기반 UI 구현
- Backend: API, DB, Auth, Redis, Queue 처리
- AI: Prompt, RAG, Embedding, LLM, Vision, OCR, STT, TTS, Agent, Memory
- Data: JSON/CSV 전처리, ETL, Feature 엔지니어링, DB 적재, 데이터 검증
- QA: 테스트, 버그 분석, 품질 검증
- Security: 보안 정책, 취약점 점검
- DevOps: 배포, CI/CD, 운영 관리
- Documentation: 문서 및 변경 이력 관리

## 협업 워크플로우
전체 작업은 다음 순서로 에이전트 간에 전달된다. Backend, Frontend, AI, Data는 Design 산출물을 기준으로 병렬로 진행하며, 모두 QA 단계로 합류한다.

```
CEO
  ↓
PM
  ↓
Research
  ↓
Architect
  ↓
UXDesigner
  ↓
Design
  ↓
Backend + Frontend + AI + Data (병렬)
  ↓
QA
  ↓
Security
  ↓
DevOps
  ↓
Documentation
```

- 각 단계는 이전 단계의 산출물(문서/설계/구현)을 입력으로 받아 진행한다.
- Backend/Frontend/AI/Data 병렬 구간에서는 서로의 담당 범위를 침범하지 않고, Design 단계에서 정의된 명세를 공통 기준으로 삼는다.
- QA는 병렬 구간의 모든 산출물이 도착한 뒤 통합 검증을 수행한다.
- Security는 QA 통과 이후 취약점 점검을 수행하며, 문제가 발견되면 해당 담당 에이전트로 회귀한다.
- DevOps 배포 이후 Documentation이 변경 이력과 문서를 최종 정리한다.
- 각 에이전트 문서(AGENTS/*.md)의 "협업 흐름에서의 위치" 항목에 자신의 앞/뒤 단계가 명시되어 있다.
- Backend/Frontend/AI/Data 병렬 구간을 실제로 실행하는 방법(서브에이전트 병렬 호출, 수동 터미널 분리 시 참고사항)은 RULES/workflow.md의 "병렬 구간 실행 방법"을 따른다.

## 규칙 및 워크플로우
- PM의 기본 흐름은 다음과 같다: 요구사항 분석 → 업무 분해 → 담당자 지정 → 회의 개최 → QA 요청 → 배포 승인
- 개발은 역할별 책임에 따라 진행한다.
- 문서와 구현은 가능하면 함께 업데이트한다.
- 접근성, 보안, 테스트는 기본 품질 기준으로 포함한다.

## 컨셉 및 디자인 규칙
- 컨셉: AI 회사형 멀티 에이전트 협업 템플릿을 문서 중심으로 구조화한다.
- UI/UX 방향: 깔끔하고 명확한 정보 계층, 사용자 친화적인 구조, 접근성 우선.
- 색상 규칙: 기본 톤은 심플하고 전문적인 느낌을 유지하며, 주요 액션과 경고 상태를 명확히 구분한다.
- 폴더 구조: 역할별 폴더와 문서 템플릿을 명확히 분리하여 관리한다.

## 절대 하지 말 것
- 프로젝트 목적과 역할 분담을 무시하고 임의로 구조를 변경하지 않는다.
- 보안 정보나 비밀키를 저장소에 직접 포함하지 않는다.
- 문서와 구현이 서로 어긋나게 수정하지 않는다.
- 중요한 결정이나 변경사항을 기록 없이 넘어가지 않는다.
- 요구사항 없이 기능을 임의로 추가하지 않는다.

## 지금까지 수행한 작업
- 프로젝트 폴더 구조를 생성했다.
- AGENTS, RULES, PROJECT, DOCUMENTS, MEMORY, TASKS 폴더와 핵심 템플릿 파일을 구성했다.
- 각 에이전트 문서에 역할과 사용법을 작성했다.
- 개발 규칙, 프로젝트 관리 템플릿, 기술 문서 템플릿, 메모 템플릿을 추가했다.
- README와 루트 설정 파일(.gitignore, .env.example)을 구성했다.
- AI 에이전트 문서에 Vision, Embedding, OCR, STT, TTS, Agent, Memory 역할을 반영했다.
- PM 워크플로우에 요구사항 분석부터 배포 승인까지의 흐름을 반영했다.
- UX 및 Frontend, Backend 문서에 각각의 담당 범위를 확장했다.
- **AI Company Simulator MVP를 구현했다** (Next.js App Router + TypeScript + TailwindCSS + Framer Motion + Zustand).
  - 등각(2:1 투영) 오피스 뷰에 10개 Agent(CEO/PM/Research/Design/Frontend/Backend/AI/QA/DevOps/Documentation) 자리를 배치했다.
  - 순수 프론트엔드 tick 기반 시뮬레이션 엔진(`src/lib/simulation/`)이 Agent 상태 전이(Idle/Thinking/Working/Review/Meeting/Debugging/Testing/Deploying/Completed/Error), Activity Feed, Terminal 로그, 부문별(Frontend/Backend/Design/QA/Deploy) 진행률을 자동 생성한다. 주기적으로 전체 Agent가 중앙 회의실에 모이는 Meeting 이벤트도 포함한다.
  - Agent 클릭 시 프로필 패널(현재 작업/진행률/Last Commit/CPU/최근 로그)을 표시하고, 오피스 확대·축소·드래그 이동과 다크모드 토글을 지원한다.
  - Socket.io 실시간 백엔드, PixiJS/Phaser 렌더링, 멀티 프로젝트(Room), 캘린더, 칸반보드, 실제 Git 연동, 에이전트 간 메시지 애니메이션은 다음 스프린트로 이연했다 (계획 문서 기준).
  - `npm run build` 통과 및 Playwright로 브라우저 동작(시뮬레이션 시작, 상태 전이, 프로필 패널, 확대/축소, 다크모드)을 검증했다.
- Architect, Data 에이전트 문서를 추가하고 기존 에이전트 문서와 동일한 포맷(역할/담당 업무/System Prompt/사용법)으로 정리했다.
- CLAUDE.md에 CEO → PM → Research → Architect → UXDesigner → Design → (Backend+Frontend+AI+Data 병렬) → QA → Security → DevOps → Documentation 협업 워크플로우를 반영했다.
- 각 AGENTS/*.md 파일에 "협업 흐름에서의 위치" 항목을 추가해 앞/뒤 단계를 명시했다.

## 커밋 및 푸시 절차
사용자가 커밋과 푸시를 요청하면, 다음 순서로 처리한다.

1. 지금까지 수행한 내용을 검토한다.
2. CLAUDE.md를 최신 상태로 업데이트한다.
   - 새로 완료한 작업
   - 변경된 파일 목록
   - 현재 진행 상태
3. 변경사항을 확인한다.
4. 적절한 커밋 메시지를 작성한다.
5. 변경사항을 커밋한다.
6. 원격 저장소에 푸시한다.

## 커밋 메시지 원칙
- 한 번에 하나의 주제를 담는다.
- 명확하고 짧게 작성한다.
- 한국어 또는 영어 중 한 가지로 일관되게 작성한다.

## 안전 원칙
- 민감한 정보는 저장소에 포함하지 않는다.
- 중요한 변경 전에는 문서와 규칙을 먼저 확인한다.
- 필요할 경우 변경 내용을 요약해서 사용자에게 전달한다.
