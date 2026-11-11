/** Tên khu phố, đổi ở đây là đổi khắp nơi. */
export const STREET = "phố Cầu Tre";

export type CastId = "ba" | "tu" | "sau" | "bay" | "nam";

/** Lời một nhân vật nói với người chơi. */
export type Voice = { by: CastId; text: string };

/** Nhân vật lên tiếng khi chỉ số `node` đi theo hướng `dir` ít nhất `min` (điểm %, hoặc % với chỉ số tính theo tỷ lệ). */
export type Watch = { node: string; dir: "up" | "down"; min: number; text: string };

export type Cast = { id: CastId; name: string; role: string; icon: string; watches: Watch[] };

export const CAST: Cast[] = [
  {
    id: "ba",
    name: "Cô Ba",
    role: "tiệm bánh mì",
    icon: "🥖",
    watches: [
      { node: "policy_rate", dir: "up", min: 0.5, text: "Lãi vay lên rồi. Cái lò thứ hai chắc phải đợi." },
      { node: "cpi", dir: "up", min: 0.5, text: "Bột, trứng, ga cái gì cũng lên. Tôi chưa dám tăng giá bánh, sợ mất khách." },
      { node: "cpi", dir: "down", min: 0.5, text: "Giá đầu vào dịu lại, tôi thở được một chút." },
    ],
  },
  {
    id: "tu",
    name: "Anh Tư",
    role: "thợ xây",
    icon: "👷",
    watches: [
      { node: "gdp_growth", dir: "down", min: 0.3, text: "Mấy công trình đang dừng lại. Tuần này tôi chỉ có ba ngày công." },
      { node: "unemployment", dir: "up", min: 0.1, text: "Tổ thợ của tôi vừa cho nghỉ thêm hai người." },
      { node: "gdp_growth", dir: "up", min: 0.3, text: "Việc nhiều lại rồi, tôi nhận không xuể." },
    ],
  },
  {
    id: "sau",
    name: "Chú Sáu",
    role: "xe tải giao hàng",
    icon: "🚚",
    watches: [
      { node: "oil_price", dir: "up", min: 10, text: "Đổ đầy bình bây giờ mất gần hết tiền lời một chuyến." },
      { node: "oil_price", dir: "down", min: 10, text: "Xăng hạ, tôi lại chạy có lời." },
    ],
  },
  {
    id: "bay",
    name: "Bà Bảy",
    role: "về hưu, gửi tiết kiệm",
    icon: "👵",
    watches: [
      { node: "cpi", dir: "up", min: 0.3, text: "Tiền lãi tháng này không đủ bù phần giá chợ tăng." },
      { node: "policy_rate", dir: "up", min: 0.5, text: "Lãi gửi nhích lên, bà cũng đỡ lo." },
    ],
  },
  { id: "nam", name: "Chị Năm", role: "xưởng cà phê xuất khẩu", icon: "☕", watches: [] },
];

export const CAST_BY_ID = Object.fromEntries(CAST.map((c) => [c.id, c])) as Record<CastId, Cast>;
