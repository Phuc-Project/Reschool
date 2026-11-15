/**
 * Số liệu tổng hợp đợt vận hành thử nghiệm Reschool (Bảng 3.1 – tháng 9/2026).
 * Trang Thống kê quản trị cộng các số này vào dữ liệu phát sinh trên hệ thống.
 *
 * - Đặt enabled: false để chỉ hiển thị dữ liệu phát sinh trên hệ thống.
 * - Giá trị null = chưa có số liệu chi tiết (biểu đồ hiển thị "Chưa phân loại").
 *   Khi có số liệu chi tiết từ sổ theo dõi Trạm, điền vào để biểu đồ chia đúng loại.
 */
export const PILOT_STATS = {
  enabled: true,
  period: "2026-09",                 // Kỳ của đợt thử nghiệm (YYYY-MM)
  showByDefault: true,               // Mở trang Thống kê ở kỳ này
  label: "Số liệu tổng hợp đợt vận hành thử nghiệm tháng 9/2026",

  accounts: 125,                     // Tổng số tài khoản học sinh đăng ký tham gia
  posted: 186,                       // Tổng số món đồ được đăng tải (Cho/Tặng)
  postedByCategory: {
    TEXTBOOK: 102,                   // Sách giáo khoa (cuốn)
    UNIFORM: 54,                     // Đồng phục (bộ)
    STATIONERY: null,                // Dụng cụ học tập – chưa tách riêng
    OTHER: null                      // Đồ khác – chưa tách riêng
  },
  requests: 210,                     // Tổng số lượt yêu cầu xin nhận đồ
  success: 142,                      // Số giao dịch luân chuyển hoàn tất thành công
  pending: null,                     // Số yêu cầu còn chờ duyệt (chưa có số liệu)
  rejected: null,                    // Số yêu cầu bị từ chối (chưa có số liệu)
  reusedByCategory: null,            // VD: { TEXTBOOK: 80, UNIFORM: 40, STATIONERY: 12, OTHER: 10 }
  violations: 0                      // Số ca vi phạm an toàn thông tin
};
