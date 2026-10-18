/**
 * Kho dữ liệu mẫu thực tế học đường Việt Nam
 * Bao gồm các bộ sách giáo khoa hiện hành (Kết Nối Tri Thức, Cánh Diều, Chân Trời Sáng Tạo),
 * đồng phục trường học, máy tính cầm tay, đồ dùng học tập kèm tọa độ thực tế.
 */

export const INITIAL_ITEMS_DATA = [
  {
    id: "item-hp-aq-01",
    title: "Trọn bộ SGK Lớp 7 Kết Nối Tri Thức (12 cuốn, còn mới 95%)",
    type: "GIVE",
    category: "TEXTBOOK",
    grade: 7,
    condition: "Mới 95% - Bọc bìa nilon cẩn thận, không rách trang, chỉ ghi chú nhẹ chì",
    description: "Em đã hoàn thành chương trình lớp 7 tại trường THCS Ái Quốc, nay muốn chuyển giao lại toàn bộ bộ sách cho bạn học sinh khóa dưới có nhu cầu. Đồ dùng sẽ được bàn giao qua Trạm luân chuyển thư viện trường.",
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"],
    tags: ["THCS Ái Quốc", "Hải Phòng", "Kết Nối Tri Thức", "Lớp 7", "Trạm Thư viện"],
    location: {
      school_name: "Trường THCS Ái Quốc",
      city: "Hải Phòng",
      district: "Ái Quốc",
      address_detail: "Phường Ái Quốc, TP Hải Phòng",
      latitude: 20.9525,
      longitude: 106.3785
    },
    transit_station: "Thư viện / Phòng Đoàn Đội - Trường THCS Ái Quốc",
    contact: {
      author_name: "Nguyễn Minh Châu",
      student_class: "8A2",
      email: "minhchau.thcsaiquoc@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-18T08:50:00Z",
    view_count: 142
  },
  {
    id: "item-hp-aq-02",
    title: "Đồng phục học sinh THCS Ái Quốc mùa thu đông (Size M) & Khăn quàng đỏ",
    type: "GIVE",
    category: "UNIFORM",
    grade: 8,
    condition: "Tốt 90% - Áo khoác ấm sạch sẽ, khóa kéo tốt, logo trường rõ nét",
    description: "Áo khoác gió đồng phục mùa đông trường THCS Ái Quốc, kèm 2 khăn quàng đỏ Đội TNTP. Em tăng chiều cao nên mặc chật, xin gửi lại Trạm luân chuyển phòng Đội cho bạn nào cần.",
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80"],
    tags: ["THCS Ái Quốc", "Đồng phục", "Phòng Đoàn Đội", "Size M"],
    location: {
      school_name: "Trường THCS Ái Quốc",
      city: "Hải Phòng",
      district: "Ái Quốc",
      address_detail: "Phường Ái Quốc, TP Hải Phòng",
      latitude: 20.9525,
      longitude: 106.3785
    },
    transit_station: "Phòng Đoàn Đội - Trường THCS Ái Quốc",
    contact: {
      author_name: "Vũ Hải Đăng",
      student_class: "9A1",
      email: "haidang.thcsaiquoc@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-18T08:55:00Z",
    view_count: 87
  },
  {
    id: "item-hp-aq-03",
    title: "Cần xin bộ SGK Lớp 9 Kết Nối Tri Thức ôn thi vào lớp 10",
    type: "RECEIVE",
    category: "TEXTBOOK",
    grade: 9,
    condition: "Dùng được - Đầy đủ các môn chính Toán, Ngữ Văn, Tiếng Anh",
    description: "Em là học sinh lớp 9 trường THCS Ái Quốc, điều kiện gia đình khó khăn nên mong được anh chị khóa trên tặng lại bộ SGK lớp 9 để ôn thi vào lớp 10 THPT. Em xin nhận qua Trạm luân chuyển của trường ạ.",
    images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80"],
    tags: ["THCS Ái Quốc", "Lớp 9", "Cần nhận gấp", "Ôn thi vào 10"],
    location: {
      school_name: "Trường THCS Ái Quốc",
      city: "Hải Phòng",
      district: "Ái Quốc",
      address_detail: "Phường Ái Quốc, TP Hải Phòng",
      latitude: 20.9525,
      longitude: 106.3785
    },
    transit_station: "Thư viện / Phòng Đoàn Đội - Trường THCS Ái Quốc",
    contact: {
      author_name: "Đỗ Phương Thảo",
      student_class: "9A3",
      email: "phuongthao.thcsaiquoc@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-18T09:00:00Z",
    view_count: 105
  },
  {
    id: "item-hp-001",
    title: "Giáo trình Hàng hải & Bộ tài liệu Tiếng Anh chuyên ngành VMU (Năm 1 & 2)",
    type: "GIVE",
    category: "TEXTBOOK",
    grade: 13,
    condition: "Mới 92% - Giữ gìn cẩn thận, đầy đủ bài tập và ghi chú thực hành",
    description: "Mình là sinh viên năm cuối Khoa Hàng hải - ĐH Hàng hải Việt Nam, xin tặng lại bộ giáo trình Đại cương Hàng hải, Toán cao cấp và Tiếng Anh chuyên ngành cho các bạn tân sinh viên khóa dưới.",
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"],
    tags: ["ĐH Hàng hải", "VMU", "Hải Phòng", "Giáo trình", "Tặng 0đ"],
    location: {
      school_name: "Đại học Hàng hải Việt Nam (VMU)",
      city: "Hải Phòng",
      district: "Ngô Quyền",
      address_detail: "484 Lạch Tray, Quận Ngô Quyền, Hải Phòng",
      latitude: 20.8415,
      longitude: 106.6963
    },
    contact: {
      author_name: "Trần Đức Mạnh",
      student_class: "K62 ĐK Tàu biển",
      phone: "0936 888 777",
      zalo: "0936888777",
      email: "ducmanh.vmu@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-18T08:00:00Z",
    view_count: 89
  },
  {
    id: "item-hp-002",
    title: "Trọn bộ SGK Lớp 11 Kết Nối Tri Thức & Máy tính Casio 580VN X",
    type: "GIVE",
    category: "TEXTBOOK",
    grade: 11,
    condition: "Mới 95% - Bọc bìa bóng kính, máy tính còn đủ nắp trượt",
    description: "Tặng lại cho các em khóa dưới tại Hải Phòng bộ sách giáo khoa lớp 11 kèm máy tính bỏ túi Casio fx-580VN X chính hãng. Ưu tiên các bạn học sinh có hoàn cảnh khó khăn hiếu học.",
    images: ["https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80"],
    tags: ["THPT Chuyên Trần Phú", "Hải Phòng", "Casio 580", "SGK 11"],
    location: {
      school_name: "THPT Chuyên Trần Phú",
      city: "Hải Phòng",
      district: "Hải An",
      address_detail: "Lô 10A Lê Hồng Phong, Quận Hải An, Hải Phòng",
      latitude: 20.8439,
      longitude: 106.7115
    },
    contact: {
      author_name: "Nguyễn Thảo Vy",
      student_class: "12 Chuyên Toán",
      phone: "0904 123 456",
      zalo: "0904123456",
      email: "thaovy.ctp@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-18T08:30:00Z",
    view_count: 112
  },
  {
    id: "item-hp-003",
    title: "Bộ bàn học sinh viên gấp gọn & Đèn LED học bài KTX ĐH Hải Phòng",
    type: "GIVE",
    category: "OTHER",
    grade: null,
    condition: "Tốt 90% - Chắc chắn, gọn nhẹ, chống cận thị",
    description: "Mình chuyển trọ ngoài nên muốn tặng lại bàn học gấp gọn bằng gỗ chân sắt và đèn học LED rạng đông cho bạn tân sinh viên nào mới vào KTX trường Đại học Hải Phòng.",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80"],
    tags: ["ĐH Hải Phòng", "Kiến An", "Bàn học sinh viên", "Miễn phí"],
    location: {
      school_name: "Đại học Hải Phòng",
      city: "Hải Phòng",
      district: "Kiến An",
      address_detail: "171 Phan Đăng Lưu, Quận Kiến An, Hải Phòng",
      latitude: 20.8037,
      longitude: 106.6341
    },
    contact: {
      author_name: "Lê Văn Thành",
      student_class: "Năm 3 KTX Kiến An",
      phone: "0978 654 999",
      zalo: "0978654999",
      email: "vanthanh.dhhpy@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-18T07:15:00Z",
    view_count: 76
  },
  {
    id: "item-hp-004",
    title: "Áo Blouse trắng sinh viên Y Dược Hải Phòng (Size L, còn mới 95%)",
    type: "GIVE",
    category: "UNIFORM",
    grade: 14,
    condition: "Mới 95% - Vải thô dày dặn, logo in sắc nét, không ố vàng",
    description: "Thừa 1 áo blouse thực tập lâm sàng do được tặng thêm, nhượng lại 0đ cho bạn nào sinh viên Y Dược Hải Phòng năm 1 chuẩn bị đi bệnh viện thực tập.",
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80"],
    tags: ["ĐH Y Dược Hải Phòng", "Áo Blouse", "Đồng phục Y", "Hải Phòng"],
    location: {
      school_name: "Đại học Y Dược Hải Phòng",
      city: "Hải Phòng",
      district: "Ngô Quyền",
      address_detail: "214 Ngô Quyền, Quận Ngô Quyền, Hải Phòng",
      latitude: 20.8550,
      longitude: 106.6998
    },
    contact: {
      author_name: "Phạm Hồng Quân",
      student_class: "Y Đa Khoa K42",
      phone: "0915 222 333",
      zalo: "0915222333",
      email: "hongquan.hpmu@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-18T07:45:00Z",
    view_count: 64
  },
  {
    id: "item-hp-005",
    title: "Cần xin bộ SGK Lớp 10 Chân Trời Sáng Tạo cho học sinh khó khăn",
    type: "RECEIVE",
    category: "TEXTBOOK",
    grade: 10,
    condition: "Dùng được - Chỉ cần nguyên trang không rách nát",
    description: "Gia đình em tại Lê Chân khó khăn, em vừa đỗ vào trường Ngô Quyền Hải Phòng. Em cần xin lại bộ sách lớp 10 chương trình mới để học. Em xin chân thành cảm ơn các anh chị!",
    images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80"],
    tags: ["THPT Ngô Quyền", "Hải Phòng", "Cần nhận gấp", "Chân Trời Sáng Tạo"],
    location: {
      school_name: "THPT Ngô Quyền (Hải Phòng)",
      city: "Hải Phòng",
      district: "Lê Chân",
      address_detail: "Số 2 Mê Linh, Quận Lê Chân, Hải Phòng",
      latitude: 20.8601,
      longitude: 106.6852
    },
    contact: {
      author_name: "Hoàng Minh Trang",
      student_class: "10A5 THPT Ngô Quyền",
      phone: "0945 999 111",
      zalo: "0945999111",
      email: "minhtrang.nq@gmail.com"
    },
    status: "AVAILABLE",
    created_at: "2026-10-18T08:10:00Z",
    view_count: 98
  },
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
