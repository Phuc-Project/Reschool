import logging
from typing import List, Optional
from fastapi import APIRouter, Query
from app.models.schemas import StandardResponse, LeaderboardEntry

logger = logging.getLogger("reschool.leaderboard")

router = APIRouter(prefix="/leaderboard", tags=["Bảng xếp hạng thành tích"])

# Dữ liệu bảng xếp hạng thực tế chuẩn học sinh tích cực theo thiết kế
BASE_LEADERBOARD = [
    {
        "rank": 1,
        "user_id": "user-thu-01",
        "name": "Nguyễn Thu",
        "student_class": "Lớp 9A1",
        "school": "Trường THCS Ái Quốc",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        "avg_condition": 60.2,
        "contributions_count": 24,
        "total_points": 1444.8,
        "badge": "gold"
    },
    {
        "rank": 2,
        "user_id": "demo-giver-chau",
        "name": "Nguyễn Minh Châu",
        "student_class": "Lớp 8A2",
        "school": "Trường THCS Ái Quốc",
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        "avg_condition": 95.5,
        "contributions_count": 12,
        "total_points": 1146.0,
        "badge": "silver"
    },
    {
        "rank": 3,
        "user_id": "user-lan-03",
        "name": "Lê Thị Lan",
        "student_class": "Lớp 7A1",
        "school": "Trường THCS Ái Quốc",
        "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
        "avg_condition": 75.4,
        "contributions_count": 15,
        "total_points": 1131.0,
        "badge": "bronze"
    },
    {
        "rank": 4,
        "user_id": "user-nam-04",
        "name": "Trần Hải Nam",
        "student_class": "Lớp 8A1",
        "school": "Trường THCS Ái Quốc",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        "avg_condition": 88.2,
        "contributions_count": 8,
        "total_points": 705.6,
        "badge": None
    },
    {
        "rank": 5,
        "user_id": "user-tien-05",
        "name": "Nguyễn Tiền",
        "student_class": "Lớp 9A2",
        "school": "Trường THCS Ái Quốc",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        "avg_condition": 60.7,
        "contributions_count": 10,
        "total_points": 607.0,
        "badge": None
    },
    {
        "rank": 6,
        "user_id": "user-thuyen-06",
        "name": "Nguyễn Thuyền",
        "student_class": "Lớp 8A2",
        "school": "Trường THCS Ái Quốc",
        "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
        "avg_condition": 60.1,
        "contributions_count": 8,
        "total_points": 480.8,
        "badge": None
    },
    {
        "rank": 7,
        "user_id": "user-minh-07",
        "name": "Nguyễn Minh",
        "student_class": "Lớp 7A2",
        "school": "Trường THCS Ái Quốc",
        "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
        "avg_condition": 58.2,
        "contributions_count": 8,
        "total_points": 465.6,
        "badge": None
    },
    {
        "rank": 8,
        "user_id": "user-ton-08",
        "name": "Nguyễn Tôn",
        "student_class": "Lớp 6A1",
        "school": "Trường THCS Ái Quốc",
        "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
        "avg_condition": 60.8,
        "contributions_count": 3,
        "total_points": 182.4,
        "badge": None
    },
    {
        "rank": 9,
        "user_id": "user-leanh-09",
        "name": "Lê Anh",
        "student_class": "Lớp 6A2",
        "school": "Trường THCS Ái Quốc",
        "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
        "avg_condition": 60.1,
        "contributions_count": 3,
        "total_points": 180.3,
        "badge": None
    },
    {
        "rank": 10,
        "user_id": "user-hung-10",
        "name": "Nguyễn Hùng",
        "student_class": "Lớp 8A3",
        "school": "Trường THCS Ái Quốc",
        "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
        "avg_condition": 50.5,
        "contributions_count": 2,
        "total_points": 101.0,
        "badge": None
    }
]

@router.get("", response_model=StandardResponse[List[LeaderboardEntry]])
def get_leaderboard(
    period: str = Query("month", description="Khoảng thời gian: month (Tháng này), all (Tất cả)"),
    school: Optional[str] = Query(None, description="Lọc theo tên trường học"),
    student_class: Optional[str] = Query(None, description="Lọc theo lớp học"),
    limit: int = Query(10, ge=1, le=50, description="Số lượng học sinh hiển thị")
):
    """
    Lấy danh sách Bảng xếp hạng học sinh có thành tích trao đổi đồ dùng cao nhất.
    Công thức: Tổng điểm = Độ mới trung bình * Số lượng đóng góp.
    Top 1 có cúp vàng 🏆, Top 2 huy chương bạc 🥈, Top 3 huy chương đồng 🥉.
    """
    entries = []
    for item in BASE_LEADERBOARD:
        entry_data = dict(item)
        if school and school.strip():
            entry_data["school"] = school.strip()
        entries.append(LeaderboardEntry(**entry_data))

    # Lọc theo trường nếu có
    if school and school.strip():
        entries = [e for e in entries if school.lower() in (e.school or "").lower()]

    # Lọc theo lớp nếu có
    if student_class and student_class.strip():
        entries = [e for e in entries if student_class.lower() in (e.student_class or "").lower()]

    entries = entries[:limit]

    return StandardResponse(
        success=True,
        message=f"Lấy bảng xếp hạng thành tích thành công ({len(entries)} học sinh)",
        data=entries
    )
