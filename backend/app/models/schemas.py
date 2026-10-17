from enum import Enum
from typing import List, Optional, Generic, TypeVar, Any
from datetime import datetime
from pydantic import BaseModel, Field

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Thành công"
    data: Optional[T] = None
    error: Optional[str] = None

class ItemType(str, Enum):
    GIVE = "GIVE"        # Cần cho / Tặng lại
    RECEIVE = "RECEIVE"  # Cần xin / Tìm kiếm

class ItemCategory(str, Enum):
    TEXTBOOK = "TEXTBOOK"       # Sách giáo khoa
    UNIFORM = "UNIFORM"         # Đồng phục
    STATIONERY = "STATIONERY"   # Dụng cụ học tập
    OTHER = "OTHER"             # Đồ dùng khác

class ItemStatus(str, Enum):
    AVAILABLE = "AVAILABLE"     # Đang sẵn sàng
    RESERVED = "RESERVED"       # Đang giữ chỗ / Đang hẹn gặp
    COMPLETED = "COMPLETED"     # Đã trao nhận thành công

class LocationInfo(BaseModel):
    school_name: str = Field(..., description="Tên trường học, vd: THPT Chu Văn An")
    city: str = Field(default="Hà Nội", description="Tỉnh/Thành phố")
    district: str = Field(..., description="Quận/Huyện")
    address_detail: Optional[str] = Field(None, description="Địa chỉ cụ thể hoặc cổng trường")
    latitude: float = Field(default=21.0333, description="Vĩ độ")
    longitude: float = Field(default=105.8500, description="Kinh độ")

class ContactInfo(BaseModel):
    author_name: str = Field(..., description="Tên người đăng")
    author_avatar: Optional[str] = Field(None, description="Avatar của người đăng")
    student_class: Optional[str] = Field(None, description="Lớp, vd: 10A1, 11 Toán")
    phone: str = Field(..., description="Số điện thoại liên hệ")
    zalo: Optional[str] = Field(None, description="Số Zalo hoặc link Zalo")
    email: Optional[str] = Field(None, description="Email học sinh")
    user_id: Optional[str] = Field(None, description="UID của người đăng")

class ItemBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=150, description="Tiêu đề bài đăng")
    type: ItemType = Field(..., description="GIVE (Cho) hoặc RECEIVE (Nhận)")
    category: ItemCategory = Field(..., description="Danh mục đồ dùng")
    grade: Optional[int] = Field(None, ge=1, le=12, description="Khối lớp (1 đến 12 nếu là SGK/Đồng phục)")
    condition: str = Field(default="Mới 90%", description="Tình trạng đồ dùng")
    description: str = Field(..., max_length=1000, description="Mô tả chi tiết đồ dùng, ghi chú thêm")
    images: List[str] = Field(default_factory=list, description="Danh sách URL ảnh hoặc Data URL")
    tags: List[str] = Field(default_factory=list, description="Thẻ tag, vd: ['Cánh Diều', 'Toán 10', 'Size M']")
    user_id: Optional[str] = Field(None, description="UID của người đăng bài")
    location: LocationInfo
    contact: ContactInfo

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[ItemType] = None
    category: Optional[ItemCategory] = None
    grade: Optional[int] = None
    condition: Optional[str] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    status: Optional[ItemStatus] = None
    location: Optional[LocationInfo] = None
    contact: Optional[ContactInfo] = None

class ItemResponse(ItemBase):
    id: str
    status: ItemStatus = ItemStatus.AVAILABLE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    view_count: int = 0

class ItemFilter(BaseModel):
    keyword: Optional[str] = None
    type: Optional[ItemType] = None
    category: Optional[ItemCategory] = None
    grade: Optional[int] = None
    district: Optional[str] = None
    school_name: Optional[str] = None
    status: Optional[ItemStatus] = ItemStatus.AVAILABLE

# Ghép cặp thông minh
class MatchSuggestion(BaseModel):
    giver_item: ItemResponse
    receiver_item: ItemResponse
    match_score: int = Field(..., ge=0, le=100, description="Độ khớp % (0-100)")
    distance_km: float = Field(..., description="Khoảng cách giữa 2 bạn (km)")
    match_reasons: List[str] = Field(default_factory=list, description="Lý do ghép cặp tương đồng")

class SystemStats(BaseModel):
    total_items_circulated: int
    total_textbooks: int
    total_uniforms: int
    total_stationery: int
    co2_saved_kg: float
    paper_saved_kg: float
    students_helped: int

# Hồ sơ học sinh lưu Database
class StudentProfile(BaseModel):
    uid: str = Field(..., description="Mã UID tài khoản học sinh")
    displayName: str = Field(..., description="Họ và tên học sinh")
    email: Optional[str] = Field(None, description="Email Google")
    photoURL: Optional[str] = Field(None, description="Ảnh đại diện")
    school: str = Field(..., description="Tên trường học")
    district: str = Field(..., description="Quận/Huyện")
    city: str = Field(default="Hà Nội", description="Tỉnh/Thành phố")
    studentClass: Optional[str] = Field(None, description="Lớp học")
    grade: Optional[int] = Field(None, description="Khối lớp (1-12)")
    phone: str = Field(..., description="Số điện thoại liên hệ")
    zalo: Optional[str] = Field(None, description="Số Zalo trao đổi")
    defaultAddress: Optional[str] = Field(None, description="Địa điểm hẹn gặp thuận tiện")
    profileCompleted: bool = Field(default=True, description="Trạng thái đã hoàn tất hồ sơ")
    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)

