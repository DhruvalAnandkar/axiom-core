import logging

import httpx

from config import WEBHOOK_URL

logger = logging.getLogger(__name__)

# Shared client: connection pooling keeps per-packet delivery at ~1-2ms after
# the first request instead of paying a fresh TCP connect every emit.
_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=5.0)
    return _client


async def emit_telemetry(
    node_id: str,
    agent_name: str,
    status: str,
    message: str,
    payload: dict | None = None,
) -> None:
    body = {
        "node_id": node_id,
        "agent_name": agent_name,
        "status": status,
        "message": message,
        "payload": payload or {},
    }
    # Awaited (not fire-and-forget) so packets arrive in pipeline order;
    # pooled localhost POSTs are cheap enough to stay on the hot path.
    try:
        response = await _get_client().post(WEBHOOK_URL, json=body)
        response.raise_for_status()
        logger.debug("Telemetry delivered for node_id=%s", node_id)
    except httpx.HTTPError as exc:
        logger.error("Telemetry HTTP error for node_id=%s: %s", node_id, exc)
    except Exception as exc:
        logger.error("Telemetry post failed for node_id=%s: %s", node_id, exc)
