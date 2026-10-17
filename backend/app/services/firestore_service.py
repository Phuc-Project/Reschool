import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.core.firebase import firebase_manager
from app.models.schemas import (
    ItemCreate, ItemResponse, ItemUpdate, ItemStatus, ItemType, ItemCategory,
    LocationInfo, ContactInfo, ItemFilter
)

# Dữ liệu ban đầu phong phú, chuẩn thực tế trường học Việt Nam
INITIAL_ITEMS: List[Dict[str, Any]] = [
    {
        "id": "item-001",
        "title": "Trọn bộ SGK Lớp 10 Kết Nối Tri Thức (12 cuốn, còn mới 95%)",
        "type": "GIVE",
        "category": "TEXTBOOK",
        "grade": 10,
        "condition": "Mới 95% - Bọc nilon cẩn thận, chỉ ghi chú nhẹ bút chì",
        "description": "Mình vừa lên lớp 11 nên muốn tặng lại bộ sách Kết Nối Tri Thức cho bạn nào cần. Bộ gồm Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa... Đầy đủ không rách trang nào.",
        "images": ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"],
        "tags": ["Kết Nối Tri Thức", "Toán 10", "Ngữ Văn 10", "Miễn phí 0đ"],
        "location": {
            "school_name": "THPT Chu Văn An",
            "city": "Hà Nội",
            "district": "Tây Hồ",
            "address_detail": "Số 10 Thụy Khuê, Tây Hồ",
            "latitude": 21.0442,
            "longitude": 105.8344
        },
        "contact": {
            "author_name": "Nguyễn Hoàng Nam",
            "student_class": "11A2",
            "phone": "0987654321",
            "zalo": "0987654321",
            "email": "nam.nh11a2@gmail.com"
        },
        "status": "AVAILABLE",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "view_count": 48
    },
    {
        "id": "item-002",
        "title": "Áo khoác gió đồng phục mùa đông THPT Kim Liên (Size M)",
        "type": "GIVE",
        "category": "UNIFORM",
        "grade": 11,
        "condition": "Tốt 90% - Khóa kéo trơn tru, không sờn rách",
        "description": "Áo khoác ấm, logo trường Kim Liên rõ nét. Mình chuyển trường nên để lại cho bạn nào khó khăn hoặc cần thêm áo thay đổi mùa đông.",
        "images": ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80"],
        "tags": ["Đồng phục", "Size M", "THPT Kim Liên", "Áo khoác ấm"],
        "location": {
            "school_name": "THPT Kim Liên",
            "city": "Hà Nội",
            "district": "Đống Đa",
            "address_detail": "Số 1 ngõ 4C Đặng Văn Ngữ",
            "latitude": 21.0094,
            "longitude": 105.8335
        },
        "contact": {
            "author_name": "Trần Thu Hà",
            "student_class": "11 Văn",
            "phone": "0912345678",
            "zalo": "0912345678",
            "email": "ha.tran11@gmail.com"
        },
        "status": "AVAILABLE",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "view_count": 32
    },
    {
        "id": "item-003",
        "title": "Máy tính cầm tay Casio fx-580VN X chính hãng",
        "type": "GIVE",
        "category": "STATIONERY",
        "grade": 12,
        "condition": "Mới 92% - Pin khỏe, màn hình sắc nét",
        "description": "Máy tính phục vụ ôn thi tốt nghiệp THPT và đại học. Đã dán tem bảo hành Bitex, tặng kèm nắp bảo vệ.",
        "images": ["https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80"],
        "tags": ["Casio 580", "Dụng cụ Toán", "Lớp 12", "Tặng bạn khó khăn"],
        "location": {
            "school_name": "THPT Marie Curie",
            "city": "Hà Nội",
            "district": "Nam Từ Liêm",
            "address_detail": "Phố Trần Văn Lai, KĐT Mỹ Đình",
            "latitude": 21.0189,
            "longitude": 105.7766
        },
        "contact": {
            "author_name": "Lê Quang Minh",
            "student_class": "12 Lý",
            "phone": "0934567890",
            "zalo": "0934567890",
            "email": "minh.lq@gmail.com"
        },
        "status": "AVAILABLE",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "view_count": 89
    },
    {
        "id": "item-004",
        "title": "Cần xin bộ SGK Lớp 10 Chân Trời Sáng Tạo cho em gái",
        "type": "RECEIVE",
        "category": "TEXTBOOK",
        "grade": 10,
        "condition": "Dùng được - Chỉ cần đủ trang sách chính",
        "description": "Gia đình mình có hoàn cảnh khó khăn ở trọ tại Ba Đình, năm nay em gái vào lớp 10 trường Phan Đình Phùng. Bạn nào có bộ Chân Trời Sáng Tạo không dùng tới cho mình xin lại ạ. Mình xin cảm ơn!",
        "images": ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80"],
        "tags": ["Chân Trời Sáng Tạo", "SGK Lớp 10", "Cần nhận gấp", "Ba Đình"],
        "location": {
            "school_name": "THPT Phan Đình Phùng",
            "city": "Hà Nội",
            "district": "Ba Đình",
            "address_detail": "30 Phan Đình Phùng",
            "latitude": 21.0405,
            "longitude": 105.8405
        },
        "contact": {
            "author_name": "Phạm Mai Anh",
            "student_class": "12 D2",
            "phone": "0977112233",
            "zalo": "0977112233",
            "email": "maianh.pdp@gmail.com"
        },
        "status": "AVAILABLE",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "view_count": 64
    },
    {
        "id": "item-005",
        "title": "Balo chống gù học sinh cấp 2 & hộp bút đa năng",
        "type": "GIVE",
        "category": "STATIONERY",
        "grade": 7,
        "condition": "Tốt 88% - Quai đeo êm ái",
        "description": "Balo màu xanh dương chống nước nhẹ, quai đệm lưng thoáng khí. Tặng lại các em học sinh lớp 6, lớp 7 chuẩn bị năm học mới.",
        "images": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80"],
        "tags": ["Balo học sinh", "Chống gù", "Cấp 2", "Đồ dùng học tập"],
        "location": {
            "school_name": "THCS Trưng Vương",
            "city": "Hà Nội",
            "district": "Hoàn Kiếm",
            "address_detail": "26 Hàng Bài, Hoàn Kiếm",
            "latitude": 21.0232,
            "longitude": 105.8521
        },
        "contact": {
            "author_name": "Đặng Quốc Bảo",
            "student_class": "8A1",
            "phone": "0905667788",
            "zalo": "0905667788",
            "email": "bao.dang@gmail.com"
        },
        "status": "AVAILABLE",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "view_count": 27
    },
    {
        "id": "item-006",
        "title": "Đèn bàn học LED chống cận Rạng Đông (Ánh sáng vàng dịu mắt)",
        "type": "GIVE",
        "category": "OTHER",
        "grade": None,
        "condition": "Mới 95% - Bóng LED sáng đều, cần gập linh hoạt",
        "description": "Mình đổi sang đèn kẹp bàn nên dư chiếc đèn LED học sinh này. Hoạt động hoàn hảo, tiết kiệm điện, chống mỏi mắt.",
        "images": ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80"],
        "tags": ["Đèn học", "Chống cận", "Góc học tập", "Đồ dùng khác"],
        "location": {
            "school_name": "THPT Chuyên Hà Nội - Amsterdam",
            "city": "Hà Nội",
            "district": "Cầu Giấy",
            "address_detail": "Số 1 Hoàng Minh Giám",
            "latitude": 21.0076,
            "longitude": 105.7958
        },
        "contact": {
            "author_name": "Vũ Khánh Linh",
            "student_class": "10 Anh 1",
            "phone": "0966443322",
            "zalo": "0966443322",
            "email": "khanhlinh.ams@gmail.com"
        },
        "status": "AVAILABLE",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "view_count": 51
    }
]

class ItemService:
    def __init__(self):
        self._local_items: List[Dict[str, Any]] = [item.copy() for item in INITIAL_ITEMS]
        self._collection_name = "reschool_items"

    def list_items(self, filters: Optional[ItemFilter] = None) -> List[ItemResponse]:
        """Lấy danh sách các món đồ tái sử dụng theo bộ lọc."""
        db = firebase_manager.db
        
        # Nếu đã có kết nối Firestore thực tế
        if db is not None:
            try:
                coll = db.collection(self._collection_name)
                docs = coll.stream()
                items = []
                for doc in docs:
                    data = doc.to_dict()
                    data["id"] = doc.id
                    items.append(ItemResponse(**data))
                return self._apply_memory_filters(items, filters)
            except Exception as e:
                pass  # Fallback to local memory

        # Fallback local memory
        items = [ItemResponse(**item) for item in self._local_items]
        return self._apply_memory_filters(items, filters)

    def _apply_memory_filters(self, items: List[ItemResponse], filters: Optional[ItemFilter]) -> List[ItemResponse]:
        if not filters:
            return items

        result = items
        if filters.keyword:
            kw = filters.keyword.lower().strip()
            result = [
                i for i in result
                if kw in i.title.lower() or kw in i.description.lower() or any(kw in t.lower() for t in i.tags)
            ]
        if filters.type:
            result = [i for i in result if i.type == filters.type]
        if filters.category:
            result = [i for i in result if i.category == filters.category]
        if filters.grade is not None:
            result = [i for i in result if i.grade == filters.grade]
        if filters.district:
            d_kw = filters.district.lower().strip()
            result = [i for i in result if d_kw in i.location.district.lower()]
        if filters.school_name:
            s_kw = filters.school_name.lower().strip()
            result = [i for i in result if s_kw in i.location.school_name.lower()]
        if filters.status:
            result = [i for i in result if i.status == filters.status]

        return result

    def get_by_id(self, item_id: str) -> Optional[ItemResponse]:
        db = firebase_manager.db
        if db is not None:
            try:
                doc = db.collection(self._collection_name).document(item_id).get()
                if doc.exists:
                    data = doc.to_dict()
                    data["id"] = doc.id
                    return ItemResponse(**data)
            except Exception:
                pass

        for item in self._local_items:
            if item["id"] == item_id:
                return ItemResponse(**item)
        return None

    def create(self, item_in: ItemCreate) -> ItemResponse:
        new_id = f"item-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        item_dict = item_in.model_dump()
        item_dict["id"] = new_id
        item_dict["status"] = ItemStatus.AVAILABLE
        item_dict["created_at"] = now
        item_dict["updated_at"] = now
        item_dict["view_count"] = 0

        db = firebase_manager.db
        if db is not None:
            try:
                db.collection(self._collection_name).document(new_id).set(item_dict)
            except Exception:
                pass

        self._local_items.insert(0, item_dict)
        return ItemResponse(**item_dict)

    def update(self, item_id: str, item_in: ItemUpdate) -> Optional[ItemResponse]:
        update_data = {k: v for k, v in item_in.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()

        db = firebase_manager.db
        if db is not None:
            try:
                doc_ref = db.collection(self._collection_name).document(item_id)
                doc_ref.update(update_data)
            except Exception:
                pass

        for item in self._local_items:
            if item["id"] == item_id:
                item.update(update_data)
                return ItemResponse(**item)
        return None

    def delete(self, item_id: str) -> bool:
        db = firebase_manager.db
        if db is not None:
            try:
                db.collection(self._collection_name).document(item_id).delete()
            except Exception:
                pass

        initial_len = len(self._local_items)
        self._local_items = [i for i in self._local_items if i["id"] != item_id]
        return len(self._local_items) < initial_len

item_service = ItemService()
