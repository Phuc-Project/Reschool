from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.schemas import (
    StandardResponse, ItemResponse, ItemCreate, ItemUpdate,
    ItemFilter, ItemType, ItemCategory, ItemStatus
)
from app.services.firestore_service import item_service

router = APIRouter(prefix="/items", tags=["Vật phẩm & Sách"])

@router.get("", response_model=StandardResponse[List[ItemResponse]])
def get_items(
    keyword: Optional[str] = Query(None, description="Từ khóa tìm kiếm tiêu đề hoặc mô tả"),
    type: Optional[ItemType] = Query(None, description="GIVE (Cho) hoặc RECEIVE (Nhận)"),
    category: Optional[ItemCategory] = Query(None, description="Danh mục sách/đồ dùng"),
    grade: Optional[int] = Query(None, ge=1, le=12, description="Khối lớp"),
    district: Optional[str] = Query(None, description="Quận/Huyện"),
    school_name: Optional[str] = Query(None, description="Tên trường học"),
    status: Optional[ItemStatus] = Query(ItemStatus.AVAILABLE, description="Trạng thái bài đăng")
):
    """Lấy danh sách các bài đăng cho/nhận với bộ lọc đa năng."""
    filters = ItemFilter(
        keyword=keyword,
        type=type,
        category=category,
        grade=grade,
        district=district,
        school_name=school_name,
        status=status
    )
    items = item_service.list_items(filters)
    return StandardResponse(
        success=True,
        message=f"Đã tìm thấy {len(items)} bài đăng phù hợp",
        data=items
    )

@router.get("/{item_id}", response_model=StandardResponse[ItemResponse])
def get_item_detail(item_id: str):
    """Xem chi tiết một bài đăng đồ cũ/sách giáo khoa."""
    item = item_service.get_by_id(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy bài đăng với mã {item_id}"
        )
    return StandardResponse(
        success=True,
        message="Lấy thông tin bài đăng thành công",
        data=item
    )

@router.post("", response_model=StandardResponse[ItemResponse], status_code=status.HTTP_201_CREATED)
def create_item(item_in: ItemCreate):
    """Đăng tin cho hoặc tin cần nhận mới lên hệ thống Reschool."""
    created = item_service.create(item_in)
    return StandardResponse(
        success=True,
        message="Đăng tin thành công! Bài đăng của bạn đã được đưa lên hệ thống.",
        data=created
    )

@router.put("/{item_id}", response_model=StandardResponse[ItemResponse])
def update_item(item_id: str, item_in: ItemUpdate):
    """Cập nhật thông tin bài đăng."""
    updated = item_service.update(item_id, item_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy bài đăng {item_id} để cập nhật"
        )
    return StandardResponse(
        success=True,
        message="Cập nhật bài đăng thành công",
        data=updated
    )

@router.delete("/{item_id}", response_model=StandardResponse[bool])
def delete_item(item_id: str):
    """Xóa bài đăng."""
    success = item_service.delete(item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy bài đăng {item_id} để xóa"
        )
    return StandardResponse(
        success=True,
        message="Đã xóa bài đăng thành công",
        data=True
    )
