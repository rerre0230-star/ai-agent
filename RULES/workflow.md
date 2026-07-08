# Workflow Rule

## 개발 순서
1. CEO가 목표와 우선순위를 정의한다.
2. PM이 작업을 분해하고 일정과 담당자를 배정한다.
3. Research가 조사 결과를 제공한다.
4. Architect가 구조, 폴더/모듈 분리, DB/API 설계 방향, 아키텍처 패턴을 정한다.
5. UXDesigner가 Wireframe과 User Flow를 설계한다.
6. Design이 UX/UI 설계를 디자인 시스템과 컴포넌트 구조로 구체화한다.
7. Backend, Frontend, AI, Data가 Design 산출물을 기준으로 **병렬** 구현을 진행한다.
8. QA가 병렬 구간의 산출물을 통합해 테스트와 품질 검증을 수행한다.
9. Security가 취약점 점검을 수행한다.
10. DevOps가 배포 및 운영 준비를 한다.
11. Documentation이 문서를 정리한다.
12. CEO가 최종 승인한다.

전체 흐름은 CLAUDE.md의 "협업 워크플로우" 다이어그램을 참고한다.

## 승인 절차
- 주요 기능은 PM과 CEO의 검토를 거친다.
- 배포 전에는 QA, Security, DevOps의 승인을 받는다.
- 문서 변경은 Documentation이 반영한다.

## 병렬 구간 실행 방법 (Backend / Frontend / AI / Data)
Design 단계가 끝나면 Backend, Frontend, AI, Data 네 역할은 서로의 결과를 기다리지 않고 동시에 작업한다. Claude Code로 이 구간을 진행할 때는 실제 터미널 4개를 여는 대신, 하나의 세션에서 **서브에이전트를 한 번의 메시지에 병렬로 호출**해 구현한다.

- 각 서브에이전트 프롬프트에는 해당 역할의 `AGENTS/*.md` 문서(역할, 담당 업무, System Prompt, 담당 범위 제한)를 컨텍스트로 전달한다.
- 4개 role(Backend/Frontend/AI/Data)의 Agent 호출을 같은 응답 안에 함께 포함시켜야 실제로 병렬 실행된다. 순차적으로 하나씩 호출하면 병렬이 아니다.
- 각 서브에이전트는 자신의 담당 범위만 수정한다 (예: Backend는 프론트 코드를 건드리지 않는다).
- 네 역할의 결과가 모두 돌아오면 QA 단계로 통합해 넘긴다.
- 사람이 직접 터미널을 여러 개 열어 각 역할을 수동으로 진행하고 싶다면, 역할별 작업 디렉터리/브랜치를 나누고 각 터미널에서 해당 `AGENTS/*.md`의 System Prompt를 시작 컨텍스트로 사용한다.
