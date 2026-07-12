import os
from pathlib import Path

from dotenv import load_dotenv

_ENGINE_DIR = Path(__file__).resolve().parent
load_dotenv(_ENGINE_DIR / ".env")
load_dotenv()  # optional override from cwd

def _get_key() -> str:
    raw = os.getenv("OPENAI_API_KEY", "").strip()
    # fix common typo: OPENAI_API_KEY=sk-... pasted as value
    if raw.startswith("OPENAI_API_KEY="):
        raw = raw.removeprefix("OPENAI_API_KEY=").strip()
    return raw

OPENAI_API_KEY = _get_key()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_TIMEOUT = float(os.getenv("OPENAI_TIMEOUT", "20"))
OPENAI_MAX_RETRIES = int(os.getenv("OPENAI_MAX_RETRIES", "1"))
# 127.0.0.1, not localhost: Windows resolves localhost to ::1 first and the
# IPv6 connect stall adds seconds to the first telemetry delivery.
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "http://127.0.0.1:3001/api/webhook")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
PORT = int(os.getenv("PORT", "8000"))
