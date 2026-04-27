import os
import uuid
from pathlib import Path
from typing import Optional

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from auth import current_user
from database import get_conn, UPLOADS_DIR

router = APIRouter(prefix="/recordings", tags=["recordings"])

ALLOWED_MIME = {"audio/webm", "audio/ogg", "audio/wav", "audio/mpeg", "audio/mp4", "audio/x-m4a"}


class RecordingOut(BaseModel):
    id: int
    created_at: str
    program: str
    audio_url: Optional[str]
    score_similarity: Optional[float]
    score_intonation: Optional[float]
    score_rhythm: Optional[float]
    score_intensity: Optional[float]
    score_relief: Optional[float]
    score_monotony: Optional[float]
    relief_label: Optional[str]
    comment: Optional[str]
    syllables: Optional[str]
    segment_source: Optional[str]


def _row_to_out(row, request_base: str) -> dict:
    d = dict(row)
    filename = d.get("audio_filename")
    d["audio_url"] = f"{request_base}/recordings/audio/{filename}" if filename else None
    return d


@router.get("/", response_model=list[RecordingOut])
def list_recordings(
    program: Optional[str] = None,
    limit: int = 50,
    user: dict = Depends(current_user),
):
    query = "SELECT * FROM recordings WHERE user_id = ?"
    params: list = [user["id"]]
    if program:
        query += " AND program = ?"
        params.append(program)
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    with get_conn() as conn:
        rows = conn.execute(query, params).fetchall()
    return [dict(r) for r in rows]


@router.post("/", response_model=RecordingOut)
async def create_recording(
    program: str = Form(...),
    score_similarity: Optional[float] = Form(None),
    score_intonation: Optional[float] = Form(None),
    score_rhythm: Optional[float] = Form(None),
    score_intensity: Optional[float] = Form(None),
    score_relief: Optional[float] = Form(None),
    score_monotony: Optional[float] = Form(None),
    relief_label: Optional[str] = Form(None),
    comment: Optional[str] = Form(None),
    syllables: Optional[str] = Form(None),
    segment_source: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    user: dict = Depends(current_user),
):
    audio_filename = None
    if audio and audio.filename:
        if audio.content_type not in ALLOWED_MIME:
            raise HTTPException(status_code=400, detail="Format audio non supporté")
        ext = Path(audio.filename).suffix or ".webm"
        audio_filename = f"{uuid.uuid4().hex}{ext}"
        dest = UPLOADS_DIR / audio_filename
        async with aiofiles.open(dest, "wb") as f:
            while chunk := await audio.read(1024 * 64):
                await f.write(chunk)

    with get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO recordings
               (user_id, program, audio_filename, segment_source, syllables,
                score_similarity, score_intonation, score_rhythm, score_intensity,
                score_relief, score_monotony, relief_label, comment)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                user["id"], program, audio_filename, segment_source, syllables,
                score_similarity, score_intonation, score_rhythm, score_intensity,
                score_relief, score_monotony, relief_label, comment,
            ),
        )
        row = conn.execute("SELECT * FROM recordings WHERE id = ?", (cur.lastrowid,)).fetchone()
    return dict(row)


@router.get("/audio/{filename}")
async def serve_audio(filename: str, user: dict = Depends(current_user)):
    from fastapi.responses import FileResponse
    path = UPLOADS_DIR / filename
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404)
    return FileResponse(path)


@router.delete("/{recording_id}")
def delete_recording(recording_id: int, user: dict = Depends(current_user)):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM recordings WHERE id = ? AND user_id = ?",
            (recording_id, user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404)
        filename = row["audio_filename"]
        conn.execute("DELETE FROM recordings WHERE id = ?", (recording_id,))
    if filename:
        path = UPLOADS_DIR / filename
        if path.exists():
            path.unlink()
    return {"deleted": True}
