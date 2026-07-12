import logging

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from openai import APIConnectionError, APITimeoutError, RateLimitError

from config import (
    OPENAI_API_KEY,
    OPENAI_MAX_RETRIES,
    OPENAI_MODEL,
    OPENAI_TIMEOUT,
)

logger = logging.getLogger(__name__)

_llm: ChatOpenAI | None = None

# Circuit breaker: once the account reports insufficient_quota, every further
# call would 429 through the same retry loop. Skip straight to the
# deterministic fallback so the coach stays instant.
_llm_disabled_reason: str | None = None


def get_chat_model() -> ChatOpenAI:
    global _llm

    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not configured")

    if _llm is None:
        _llm = ChatOpenAI(
            model=OPENAI_MODEL,
            api_key=OPENAI_API_KEY,
            timeout=OPENAI_TIMEOUT,
            max_retries=OPENAI_MAX_RETRIES,
            temperature=0.4,
            max_tokens=220,
        )
        logger.info("Initialized ChatOpenAI model=%s max_retries=%s", OPENAI_MODEL, OPENAI_MAX_RETRIES)

    return _llm


async def invoke_llm(system_prompt: str, user_prompt: str) -> str:
    global _llm_disabled_reason
    if _llm_disabled_reason:
        raise RuntimeError(f"LLM disabled for session: {_llm_disabled_reason}")

    llm = get_chat_model()
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]

    try:
        response = await llm.ainvoke(messages)
        content = response.content
        if isinstance(content, str):
            return content.strip()
        return str(content).strip()
    except RateLimitError as exc:
        if "insufficient_quota" in str(exc):
            _llm_disabled_reason = "insufficient_quota (check OpenAI billing)"
            logger.error("OpenAI quota exhausted — deterministic coach mode for this session")
        else:
            logger.error("OpenAI rate limited: %s", exc)
        raise
    except (APITimeoutError, APIConnectionError) as exc:
        logger.error("OpenAI transient error: %s", exc)
        raise
    except Exception as exc:
        logger.error("OpenAI invocation failed: %s", exc)
        raise


def is_llm_configured() -> bool:
    return bool(OPENAI_API_KEY)
