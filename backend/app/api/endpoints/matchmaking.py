from typing import List
from fastapi import APIRouter, Query
from app.models.schemas import StandardResponse, MatchSuggestion
from app.services.matchmaking_service import matchmaking_service

router = APIRouter(prefix="/matchmaking", tags=["Ghép cặp thông minh"])

@router.get("/suggestions", response_model=StandardResponse[List[MatchSuggestion]])
def get_matchmaking_suggestions(
    min_score: int = Query(50, ge=10, le=100, description="Độ tương đồng tối thiểu (%)")
):
    """
    Gợi ý ghép cặp thông minh giữa người cần cho và người cần nhận
    dựa trên nhu cầu, môn học, khối lớp và khoảng cách trường học.
    """
    matches = matchmaking_service.find_all_matches(min_score=min_score)
    return StandardResponse(
        success=True,
        message=f"Hệ thống Reschool đã tự động ghép cặp thành công {len(matches)} lượt trao đổi tiềm năng!",
        data=matches
    )
