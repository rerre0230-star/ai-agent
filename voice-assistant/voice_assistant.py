#!/usr/bin/env python3
"""음성 비서 — 규칙 기반 STT/TTS 어시스턴트 (API 키 불필요)

python voice_assistant.py --text   # 키보드 입력 모드 (설치 없이 테스트)
python voice_assistant.py          # 마이크 음성 모드 (SpeechRecognition/pyttsx3/pyaudio 필요)
"""

import argparse
import re
import webbrowser
from datetime import date, datetime, time as dtime, timedelta
from pathlib import Path
from urllib.parse import quote
from uuid import uuid4

BASE_DIR = Path(__file__).resolve().parent
EVENTS_DIR = BASE_DIR / "events"

# ============================================================
# 1. 입출력 — 듣기(listen_voice) / 말하기(speak)
# ============================================================

try:
    import pyttsx3
    _tts_engine = pyttsx3.init()
except Exception:
    _tts_engine = None

try:
    import speech_recognition as sr
except Exception:
    sr = None

_tts_warned = False


def speak(text: str) -> None:
    """자막(콘솔 출력)과 음성을 항상 함께 낸다."""
    global _tts_warned
    print(f"🤖 {text}")
    if _tts_engine is None:
        if not _tts_warned:
            print("   (pyttsx3가 설치되어 있지 않아 음성 출력은 생략돼요: pip install pyttsx3)")
            _tts_warned = True
        return
    try:
        _tts_engine.say(text)
        _tts_engine.runAndWait()
    except Exception as e:
        print(f"   (음성 출력 실패: {e})")


def listen_voice() -> str | None:
    """마이크로 한 문장을 듣고 텍스트로 반환한다. 실패 시 None."""
    if sr is None:
        speak("음성 인식 라이브러리가 설치되어 있지 않아요. pip install SpeechRecognition pyaudio 후 다시 실행하거나 --text 모드를 사용해주세요.")
        return None

    recognizer = sr.Recognizer()
    try:
        with sr.Microphone() as source:
            print("🎙️  듣고 있어요...")
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=8)
    except OSError:
        speak("마이크를 찾을 수 없어요. 마이크가 연결되어 있는지 확인해주세요.")
        return None
    except sr.WaitTimeoutError:
        speak("아무 말도 들리지 않았어요. 다시 말씀해주세요.")
        return None

    try:
        text = recognizer.recognize_google(audio, language="ko-KR")
        print(f"🗣️  인식됨: {text}")
        return text
    except sr.UnknownValueError:
        speak("잘 못 들었어요. 다시 한 번 말씀해주세요.")
        return None
    except sr.RequestError:
        speak("음성 인식 서버에 연결할 수 없어요. 인터넷 연결을 확인해주세요.")
        return None


# ============================================================
# 2. 의도 파악 — detect_intent (여기에 키워드를 추가하면 새 명령 인식)
# ============================================================

EXIT_RE = re.compile(r"종료|끝내|그만할래|프로그램\s*그만")
GREETING_RE = re.compile(r"^안녕")
CALENDAR_TRIGGER_RE = re.compile(r"잡아줘|잡아|예약해줘|예약|등록해줘|등록|일정\s*(?:추가|잡아)?|스케줄")
TIME_RE = re.compile(r"몇\s*시")
DATE_RE = re.compile(r"며칠|무슨\s*요일")
SEARCH_RE = re.compile(r"(.+?)\s*(검색해줘|검색|찾아줘|알려줘)$")


def detect_intent(text: str):
    """텍스트를 보고 (인텐트 이름, 부가 데이터) 를 반환한다."""
    t = text.strip()
    if not t:
        return "empty", None
    if EXIT_RE.search(t):
        return "exit", None
    if GREETING_RE.search(t):
        return "greeting", None
    if CALENDAR_TRIGGER_RE.search(t):
        return "calendar", t
    if TIME_RE.search(t):
        return "time", None
    if DATE_RE.search(t):
        return "date", None
    m = SEARCH_RE.search(t)
    if m:
        return "search", m.group(1).strip()
    return "unknown", None


# ============================================================
# 3. 실행 — handle_calendar, handle_search, handle_time, handle_date, ...
# ============================================================

RELATIVE_DAY_OFFSET = {"모레": 2, "내일": 1, "오늘": 0}
MONTH_DAY_RE = re.compile(r"(\d{1,2})\s*월\s*(\d{1,2})\s*일")
MERIDIEM_RE = re.compile(r"오전|오후")
HOUR_MIN_RE = re.compile(r"(\d{1,2})\s*시\s*(?:(\d{1,2})\s*분)?")
PARTICLE_RE = re.compile(r"\b(에|을|를)\b")
WEEKDAYS_KO = ["월", "화", "수", "목", "금", "토", "일"]
DEFAULT_HOUR = 9  # 시간을 말하지 않았을 때 기본 시각


def parse_calendar_request(text: str):
    """'내일 오후 3시에 치과 예약 잡아줘' → (제목, datetime, 시간지정여부)"""
    remaining = text

    day_offset = None
    for word, offset in RELATIVE_DAY_OFFSET.items():
        if word in remaining:
            day_offset = offset
            remaining = remaining.replace(word, " ", 1)
            break

    explicit_date = None
    m = MONTH_DAY_RE.search(remaining)
    if m:
        month, day = int(m.group(1)), int(m.group(2))
        remaining = remaining[: m.start()] + " " + remaining[m.end():]
        today = date.today()
        try:
            candidate = date(today.year, month, day)
            if candidate < today:
                candidate = date(today.year + 1, month, day)
            explicit_date = candidate
        except ValueError:
            explicit_date = None

    meridiem = None
    m = MERIDIEM_RE.search(remaining)
    if m:
        meridiem = m.group(0)
        remaining = remaining[: m.start()] + " " + remaining[m.end():]

    hour, minute, time_specified = None, 0, False
    m = HOUR_MIN_RE.search(remaining)
    if m:
        hour = int(m.group(1))
        minute = int(m.group(2)) if m.group(2) else 0
        time_specified = True
        remaining = remaining[: m.start()] + " " + remaining[m.end():]

    target_date = explicit_date if explicit_date else date.today() + timedelta(days=day_offset or 0)

    if hour is None:
        hour = DEFAULT_HOUR
    if meridiem == "오후" and hour != 12:
        hour += 12
    elif meridiem == "오전" and hour == 12:
        hour = 0
    hour = hour % 24

    target_dt = datetime.combine(target_date, dtime(hour=hour, minute=minute))

    remaining = CALENDAR_TRIGGER_RE.sub(" ", remaining)
    remaining = PARTICLE_RE.sub(" ", remaining)
    title = re.sub(r"\s+", " ", remaining).strip() or "일정"

    return title, target_dt, time_specified


def _sanitize_filename(name: str) -> str:
    return re.sub(r'[\\/:*?"<>|]', "_", name).strip() or "일정"


def handle_calendar(text: str) -> None:
    title, when, time_specified = parse_calendar_request(text)

    EVENTS_DIR.mkdir(exist_ok=True)
    stamp = when.strftime("%Y%m%d_%H%M")
    path = EVENTS_DIR / f"{stamp}_{_sanitize_filename(title)}.ics"

    ics = "\n".join([
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//VoiceAssistant//KO",
        "BEGIN:VEVENT",
        f"UID:{uuid4()}",
        f"DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}",
        f"DTSTART:{when.strftime('%Y%m%dT%H%M%S')}",
        f"DTEND:{(when + timedelta(hours=1)).strftime('%Y%m%dT%H%M%S')}",
        f"SUMMARY:{title}",
        "END:VEVENT",
        "END:VCALENDAR",
        "",
    ])
    path.write_text(ics, encoding="utf-8")

    weekday = WEEKDAYS_KO[when.weekday()]
    hour12 = when.hour % 12 or 12
    meridiem = "오전" if when.hour < 12 else "오후"
    when_label = f"{when.month}월 {when.day}일({weekday}) {meridiem} {hour12}시"
    if when.minute:
        when_label += f" {when.minute}분"

    msg = f"{when_label}, {title} 일정을 등록했어요."
    if not time_specified:
        msg += " 시간을 말씀하지 않으셔서 오전 9시로 등록했어요."
    speak(msg)
    print(f"   📁 저장 위치: {path}")


def handle_search(query: str) -> None:
    if not query:
        speak("무엇을 검색할지 말씀해주세요.")
        return
    url = f"https://www.google.com/search?q={quote(query)}"
    opened = False
    try:
        opened = webbrowser.open(url)
    except Exception:
        opened = False
    if opened:
        speak(f"{query} 검색 결과를 열었어요.")
    else:
        speak(f"브라우저를 열 수 없어요. 이 주소로 직접 검색해주세요: {url}")


def handle_time() -> None:
    now = datetime.now()
    hour12 = now.hour % 12 or 12
    meridiem = "오전" if now.hour < 12 else "오후"
    speak(f"지금은 {meridiem} {hour12}시 {now.minute}분이에요.")


def handle_date() -> None:
    now = datetime.now()
    speak(f"오늘은 {now.month}월 {now.day}일 {WEEKDAYS_KO[now.weekday()]}요일이에요.")


def handle_greeting() -> None:
    speak(
        "안녕하세요! 저는 음성 비서예요. "
        "일정 등록, 검색, 시간·날짜 안내를 도와드려요. "
        "예를 들어 '내일 오후 3시에 치과 예약 잡아줘'라고 말해보세요."
    )


def handle_exit() -> None:
    speak("종료할게요. 안녕히 가세요!")


def handle_unknown() -> None:
    speak("무슨 말인지 잘 모르겠어요. '안녕'이라고 말하면 할 수 있는 일을 알려드려요.")


# ============================================================
# 4. 메인 루프
# ============================================================

def main() -> None:
    parser = argparse.ArgumentParser(description="규칙 기반 음성 비서")
    parser.add_argument("--text", action="store_true", help="마이크 대신 키보드로 입력하는 텍스트 모드")
    args = parser.parse_args()

    mode = "텍스트" if args.text else "음성"
    print(f"=== 🎙️ 음성 비서 시작 ({mode} 모드) ===")
    speak("안녕하세요! 말씀해주세요.")

    while True:
        try:
            if args.text:
                user_text = input("👤 입력> ").strip()
            else:
                user_text = listen_voice()
        except (KeyboardInterrupt, EOFError):
            print()
            handle_exit()
            break

        if not user_text:
            continue

        intent, data = detect_intent(user_text)

        if intent == "exit":
            handle_exit()
            break
        elif intent == "greeting":
            handle_greeting()
        elif intent == "calendar":
            handle_calendar(data)
        elif intent == "search":
            handle_search(data)
        elif intent == "time":
            handle_time()
        elif intent == "date":
            handle_date()
        else:
            handle_unknown()


if __name__ == "__main__":
    main()
