from __future__ import annotations

import csv
import io

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from services.api.app.schemas import IncidentAnalysisResponse
from services.incidents.analysis import (
    AnalysisResult,
    EmptyCsvFileError,
    InvalidCsvFormatError,
    MissingColumnsError,
    analyze_incidents_text,
    build_export_rows,
    serialize_analysis_result,
)

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

# Simple in-memory storage for the latest analysis result.
# This only works for a single user/process instance. If this grows into a
# real multi-user or persistent workflow, this should move to shared storage.
LATEST_ANALYSIS_RESULT: AnalysisResult | None = None


@router.post("/analyze", response_model=IncidentAnalysisResponse)
async def analyze_incidents(file: UploadFile = File(...)) -> IncidentAnalysisResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="A CSV file is required.")

    try:
        content = await file.read()
        csv_text = content.decode("utf-8-sig")
        result = analyze_incidents_text(file.filename, csv_text)
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="The CSV file must be UTF-8 encoded.") from exc
    except EmptyCsvFileError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except InvalidCsvFormatError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except MissingColumnsError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    global LATEST_ANALYSIS_RESULT
    LATEST_ANALYSIS_RESULT = result

    return IncidentAnalysisResponse.model_validate(serialize_analysis_result(result))


@router.get("/results/export")
def export_last_analysis() -> Response:
    if LATEST_ANALYSIS_RESULT is None:
        raise HTTPException(
            status_code=404,
            detail="No analysis result is available yet. Run /api/incidents/analyze first.",
        )

    csv_buffer = io.StringIO()
    writer = csv.DictWriter(csv_buffer, fieldnames=["metric", "value", "percentage"])
    writer.writeheader()
    writer.writerows(build_export_rows(LATEST_ANALYSIS_RESULT))

    return Response(
        content=csv_buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="incident-analysis-results.csv"',
        },
    )