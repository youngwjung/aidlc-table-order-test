import asyncio
import json
from datetime import datetime, timezone
from typing import AsyncGenerator


class SSEService:
    def __init__(self):
        self._subscribers: dict[int, list[asyncio.Queue]] = {}

    async def subscribe(self, store_id: int) -> AsyncGenerator[str, None]:
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._subscribers.setdefault(store_id, []).append(queue)
        try:
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                except asyncio.TimeoutError:
                    yield f"data: {json.dumps({'event_type': 'ping', 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            if store_id in self._subscribers:
                try:
                    self._subscribers[store_id].remove(queue)
                except ValueError:
                    pass
                if not self._subscribers[store_id]:
                    del self._subscribers[store_id]

    async def broadcast(self, store_id: int, event_type: str, data: dict) -> None:
        event = {
            "event_type": event_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        for queue in self._subscribers.get(store_id, []):
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                pass


sse_service = SSEService()
