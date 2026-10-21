from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, status
from app.models.schemas import (
    StandardResponse, ItemRequestCreate, ItemRequestResponse, RequestStatus
)
from app.services.firestore_service import item_service

router = APIRouter(prefix="/requests", tags=["Yêu cầu trao nhận đồ"])

# In-memory storage fallback for requests
_requests_db: List[dict] = [
    {
        "id": "REQ-2026-001",
        "item_id": "item-hp-aq-01",
        "item_title": "Trọn bộ SGK Lớp 7 Kết Nối Tri Thức (12 cuốn, còn mới 95%)",
        "item_image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        "giver_id": "user-giver-minhchau",
        "giver_name": "Nguyễn Minh Châu",
        "giver_class": "8A2",
        "requester_id": "user-receiver-an",
        "requester_name": "Trần Minh An",
        "requester_school": "Trường THCS Ái Quốc",
        "requester_class": "7A1",
        "requester_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        "requester_note": "Em chào anh/chị, em học lớp 7A1 muốn xin lại bộ SGK lớp 7 Kết Nối Tri Thức để học kỳ này học tập tốt. Em xin hẹn nhận qua Trạm Thư viện trường ạ.",
        "transit_station": "Thư viện / Phòng Đoàn Đội - Trường THCS Ái Quốc",
        "transit_code": "SGK-01",
        "status": RequestStatus.PENDING,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

@router.get("", response_model=StandardResponse[List[ItemRequestResponse]])
def get_requests(
    user_id: Optional[str] = Query(None, description="Lọc theo UID người dùng"),
    role: Optional[str] = Query("all", description="giver (nhận được), requester (đã gửi), all")
):
    """Lấy danh sách yêu cầu cho/nhận đồ theo người dùng."""
    results = []
    for r in _requests_db:
        if user_id:
            if role == "giver" and r["giver_id"] != user_id:
                continue
            if role == "requester" and r["requester_id"] != user_id:
                continue
            if role == "all" and r["giver_id"] != user_id and r["requester_id"] != user_id:
                continue
        results.append(ItemRequestResponse(**r))

    return StandardResponse(
        success=True,
        message=f"Đã tìm thấy {len(results)} yêu cầu",
        data=results
    )

@router.post("", response_model=StandardResponse[ItemRequestResponse], status_code=status.HTTP_201_CREATED)
def create_request(req_in: ItemRequestCreate):
    """Tạo yêu cầu xin nhận đồ dùng gửi tới người cho đồ."""
    item = item_service.get_by_id(req_in.item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy món đồ {req_in.item_id}"
        )

    req_dict = {
        "id": f"REQ-{int(datetime.utcnow().timestamp())}",
        "item_id": item.id,
        "item_title": item.title,
        "item_image": item.images[0] if item.images else None,
        "giver_id": item.user_id or (item.contact.user_id if item.contact else "user-giver-default"),
        "giver_name": item.contact.author_name if item.contact else "Người cho",
        "giver_class": item.contact.student_class if item.contact else "8A2",
        "requester_id": req_in.requester_id,
        "requester_name": req_in.requester_name,
        "requester_school": req_in.requester_school or "Trường THCS Ái Quốc",
        "requester_class": req_in.requester_class or "7A1",
        "requester_avatar": req_in.requester_avatar,
        "requester_note": req_in.requester_note,
        "transit_station": item.transit_station or "Thư viện / Phòng Đoàn Đội trường",
        "transit_code": None,
        "status": RequestStatus.PENDING,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    _requests_db.insert(0, req_dict)
    return StandardResponse(
        success=True,
        message="Đã gửi yêu cầu tới người tặng đồ thành công!",
        data=ItemRequestResponse(**req_dict)
    )

@router.put("/{request_id}/status", response_model=StandardResponse[ItemRequestResponse])
def update_request_status(
    request_id: str,
    new_status: RequestStatus = Query(..., description="PENDING, ACCEPTED, REJECTED"),
    transit_code: Optional[str] = Query(None, description="Mã luân chuyển cấp cho học sinh")
):
    """Chấp nhận hoặc Từ chối yêu cầu xin đồ (Chuẩn theo yêu cầu khách hàng)."""
    target = None
    for r in _requests_db:
        if r["id"] == request_id:
            target = r
            break

    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy yêu cầu {request_id}"
        )

    target["status"] = new_status
    target["updated_at"] = datetime.utcnow()
    if new_status == RequestStatus.ACCEPTED:
        target["transit_code"] = transit_code or target.get("transit_code") or "SGK-01"

    return StandardResponse(
        success=True,
        message=f"Đã cập nhật trạng thái yêu cầu sang {new_status}",
        data=ItemRequestResponse(**target)
    )
