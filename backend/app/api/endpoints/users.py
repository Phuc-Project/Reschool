from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import StandardResponse, StudentProfile, ItemResponse
from app.services.firestore_service import user_service, item_service

router = APIRouter(prefix="/users", tags=["Hồ sơ học sinh"])

@router.post("/profile", response_model=StandardResponse[StudentProfile])
def save_profile(profile_in: StudentProfile):
    """Lưu hoặc cập nhật thông tin hồ sơ học sinh vào Database."""
    saved = user_service.save_profile(profile_in)
    return StandardResponse(
        success=True,
        message="Đã lưu hồ sơ học sinh thành công vào cơ sở dữ liệu",
        data=saved
    )

@router.get("/{uid}", response_model=StandardResponse[StudentProfile])
def get_profile(uid: str):
    """Lấy thông tin hồ sơ học sinh theo UID."""
    profile = user_service.get_profile(uid)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy hồ sơ cho học sinh với UID {uid}"
        )
    return StandardResponse(
        success=True,
        message="Lấy thông tin hồ sơ thành công",
        data=profile
    )

@router.get("/{uid}/items", response_model=StandardResponse[List[ItemResponse]])
def get_user_items(uid: str):
    """Lấy danh sách các bài đăng do học sinh này tạo."""
    all_items = item_service.list_items()
    user_items = [
        item for item in all_items 
        if item.user_id == uid or (item.contact and item.contact.user_id == uid)
    ]
    return StandardResponse(
        success=True,
        message=f"Đã tìm thấy {len(user_items)} bài đăng của học sinh",
        data=user_items
    )
