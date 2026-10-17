/**
 * Kho dữ liệu mẫu thực tế học đường Việt Nam
 * Bao gồm các bộ sách giáo khoa hiện hành (Kết Nối Tri Thức, Cánh Diều, Chân Trời Sáng Tạo),
 * đồng phục trường học, máy tính cầm tay, đồ dùng học tập kèm tọa độ thực tế.
 */

export const INITIAL_ITEMS_DATA = [
  {
    id: "item-001",
    title: "Trọn bộ SGK Lớp 10 Kết Nối Tri Thức (12 cuốn, còn mới 95%)",
    type: "GIVE", // GIVE: Cần cho / Tặng, RECEIVE: Cần xin / Nhận
    category: "TEXTBOOK", // TEXTBOOK, UNIFORM, STATIONERY, OTHER
    grade: 10,
    condition: "Mới 95% - Bọc nilon cẩn thận, chỉ ghi chú nhẹ bút chì",
    description: "Mình vừa hoàn thành lớp 10 lên lớp 11 nên muốn trao lại bộ sách Kết Nối Tri Thức cho bạn nào cần. Bộ gồm Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa, GDCD... Đầy đủ không rách trang nào.",
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"],
    tags: ["Kết Nối Tri Thức", "Toán 10", "Ngữ Văn 10", "Tặng 0đ"],
    location: {
      school_name: "THPT Chu Văn An",
      city: "Hà Nội",
      district: "Tây Hồ",
      address_detail: "Số 10 Thụy Khuê, Tây Hồ",
      latitude: 21.0442,
      longitude: 105.8344
    },
    contact: {
      author_name: "Nguyễn Hoàng Nam",
      student_class: "11A2",
      phone: "0987 654 321",
      zalo: "0987654321",
      email: "nam.nh11a2@chuvanan.edu.vn"
    },
    status: "AVAILABLE",
    created_at: "2026-10-15T09:30:00Z",
    view_count: 54
  },
  {
    id: "item-002",
    title: "Cần xin bộ SGK Lớp 10 Kết Nối Tri Thức cho em gái",
    type: "RECEIVE",
    category: "TEXTBOOK",
    grade: 10,
    condition: "Dùng được - Chỉ cần đủ các môn chính",
    description: "Nhà mình ở gần trường Phan Đình Phùng, năm nay em gái vào lớp 10 học bộ Kết Nối Tri Thức. Gia đình khó khăn nên mong được bạn nào khóa trên tặng lại hoặc đổi lấy vở mới ạ. Xin cảm ơn!",
    images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80"],
    tags: ["Kết Nối Tri Thức", "Lớp 10", "Cần nhận gấp", "Ba Đình"],
    location: {
      school_name: "THPT Phan Đình Phùng",
      city: "Hà Nội",
      district: "Ba Đình",
      address_detail: "30 Phan Đình Phùng",
      latitude: 21.0405,
      longitude: 105.8405
    },
    contact: {
      author_name: "Phạm Mai Anh",
      student_class: "12 D2",
      phone: "0977 112 233",
      zalo: "0977112233",
      email: "maianh.pdp@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-16T08:15:00Z",
    view_count: 68
  },
  {
    id: "item-003",
    title: "Áo khoác gió đồng phục mùa đông THPT Kim Liên (Size M)",
    type: "GIVE",
    category: "UNIFORM",
    grade: 11,
    condition: "Tốt 90% - Khóa kéo trơn tru, không sờn rách",
    description: "Áo khoác ấm, logo trường Kim Liên rõ nét. Mình chuyển trường nên để lại cho bạn nào cần thêm áo ấm đi học mùa đông này.",
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80"],
    tags: ["Đồng phục", "Size M", "THPT Kim Liên", "Áo khoác ấm"],
    location: {
      school_name: "THPT Kim Liên",
      city: "Hà Nội",
      district: "Đống Đa",
      address_detail: "Số 1 ngõ 4C Đặng Văn Ngữ",
      latitude: 21.0094,
      longitude: 105.8335
    },
    contact: {
      author_name: "Trần Thu Hà",
      student_class: "11 Văn",
      phone: "0912 345 678",
      zalo: "0912345678",
      email: "ha.tran11@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-14T14:20:00Z",
    view_count: 42
  },
  {
    id: "item-004",
    title: "Máy tính cầm tay Casio fx-580VN X chính hãng Bitex",
    type: "GIVE",
    category: "STATIONERY",
    grade: 12,
    condition: "Mới 92% - Phím nảy tốt, màn hình sắc nét",
    description: "Máy tính phục vụ thi tốt nghiệp THPT và đại học. Đã dán tem chống hàng giả Bitex, tặng kèm nắp trượt bảo vệ và pin mới.",
    images: ["https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80"],
    tags: ["Casio 580", "Dụng cụ Toán", "Lớp 12", "Tặng bạn khó khăn"],
    location: {
      school_name: "THPT Marie Curie",
      city: "Hà Nội",
      district: "Nam Từ Liêm",
      address_detail: "Phố Trần Văn Lai, KĐT Mỹ Đình 1",
      latitude: 21.0189,
      longitude: 105.7766
    },
    contact: {
      author_name: "Lê Quang Minh",
      student_class: "12 Lý",
      phone: "0934 567 890",
      zalo: "0934567890",
      email: "minh.lq@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-16T11:00:00Z",
    view_count: 95
  },
  {
    id: "item-005",
    title: "Cần tìm máy tính cầm tay fx-580 hoặc fx-570VN Plus",
    type: "RECEIVE",
    category: "STATIONERY",
    grade: 12,
    condition: "Dùng được - Tính toán ổn định",
    description: "Em đang ôn thi khối A nhưng vừa làm rơi vỡ máy tính, điều kiện gia đình chưa mua máy mới được. Anh/chị hoặc bạn nào có máy dư cho em mượn hoặc xin lại ạ.",
    images: ["https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80"],
    tags: ["Casio", "Dụng cụ thi", "Cần gấp", "Lớp 12"],
    location: {
      school_name: "THPT Chuyên Hà Nội - Amsterdam",
      city: "Hà Nội",
      district: "Cầu Giấy",
      address_detail: "Số 1 Hoàng Minh Giám",
      latitude: 21.0076,
      longitude: 105.7958
    },
    contact: {
      author_name: "Ngô Tuấn Đạt",
      student_class: "12 Tin",
      phone: "0944 889 900",
      zalo: "0944889900",
      email: "tuandat.ams@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-17T07:45:00Z",
    view_count: 73
  },
  {
    id: "item-006",
    title: "Balo chống gù học sinh cấp 2 & bộ compa eke đầy đủ",
    type: "GIVE",
    category: "STATIONERY",
    grade: 8,
    condition: "Tốt 88% - Quai đeo êm ái, khóa kéo bền",
    description: "Balo màu xanh than chống nước nhẹ, quai đệm lưng thoáng khí. Tặng lại các em học sinh lớp 6, lớp 7 chuẩn bị năm học mới kèm bộ compa eke Deli.",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80"],
    tags: ["Balo học sinh", "Chống gù", "Compa thước kẻ", "Miễn phí"],
    location: {
      school_name: "THCS Trưng Vương",
      city: "Hà Nội",
      district: "Hoàn Kiếm",
      address_detail: "26 Hàng Bài, Hoàn Kiếm",
      latitude: 21.0232,
      longitude: 105.8521
    },
    contact: {
      author_name: "Đặng Quốc Bảo",
      student_class: "8A1",
      phone: "0905 667 788",
      zalo: "0905667788",
      email: "bao.dang@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-13T16:10:00Z",
    view_count: 38
  },
  {
    id: "item-007",
    title: "Đèn học để bàn LED Rạng Đông chống cận thị",
    type: "GIVE",
    category: "OTHER",
    grade: null,
    condition: "Mới 95% - Ánh sáng 3000K vàng dịu chống mỏi mắt",
    description: "Mình đổi sang đèn kẹp bàn nên dư chiếc đèn LED học sinh này. Hoạt động hoàn hảo, tiết kiệm điện, cần gập linh hoạt các góc chiếu.",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80"],
    tags: ["Đèn học", "Chống cận", "Góc học tập", "Đồ dùng khác"],
    location: {
      school_name: "THPT Việt Đức",
      city: "Hà Nội",
      district: "Hoàn Kiếm",
      address_detail: "47 Lý Thường Kiệt, Hoàn Kiếm",
      latitude: 21.0248,
      longitude: 105.8491
    },
    contact: {
      author_name: "Vũ Khánh Linh",
      student_class: "10D1",
      phone: "0966 443 322",
      zalo: "0966443322",
      email: "khanhlinh.vd@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-17T09:00:00Z",
    view_count: 59
  },
  {
    id: "item-008",
    title: "Bộ SGK Lớp 11 Cánh Diều (Toán, Văn, Tiếng Anh Global, Sử, Địa)",
    type: "GIVE",
    category: "TEXTBOOK",
    grade: 11,
    condition: "Mới 90% - Không quăn mép",
    description: "Sách của anh trai để lại, giấy in màu đẹp chuẩn bộ Cánh Diều. Muốn tặng lại cho bạn nào khó khăn hoặc đổi lấy sách nâng cao ôn thi.",
    images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80"],
    tags: ["Cánh Diều", "Toán 11", "Ngữ Văn 11", "Global Success"],
    location: {
      school_name: "THPT Yên Hòa",
      city: "Hà Nội",
      district: "Cầu Giấy",
      address_detail: "Ngõ 251 Nguyễn Khang, Yên Hòa",
      latitude: 21.0182,
      longitude: 105.7997
    },
    contact: {
      author_name: "Hoàng Gia Huy",
      student_class: "11A4",
      phone: "0988 223 344",
      zalo: "0988223344",
      email: "huy.hoang@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-17T10:15:00Z",
    view_count: 45
  }
];

export const CATEGORY_LABELS = {
  TEXTBOOK: "Sách giáo khoa",
  UNIFORM: "Đồng phục học sinh",
  STATIONERY: "Dụng cụ học tập",
  OTHER: "Đồ dùng học đường khác"
};

export const TYPE_LABELS = {
  GIVE: "Cho tặng miễn phí",
  RECEIVE: "Cần tìm / Cần xin"
};
