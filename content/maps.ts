/** Các bản đồ con: mỗi bản đồ chỉ hiện một nhóm chỉ số để dễ nhìn. Bản đồ đầu tiên là mặc định. */
export type MapView = { id: string; name: string; hint: string; ids: string[] | "all" };

export const MAPS: MapView[] = [
  {
    id: "chinh",
    name: "Bản đồ chính",
    hint: "12 chỉ số quan trọng nhất, nên bắt đầu từ đây.",
    ids: ["fed_rate", "oil_price", "policy_rate", "gov_spending", "lending_rate", "credit", "fx_rate", "consumption", "investment", "net_exports", "gdp_growth", "cpi", "unemployment"],
  },
  {
    id: "tong-cau",
    name: "GDP và tổng cầu",
    hint: "Ai đang tiêu tiền: C + I + G + (X − M) và những gì kéo chúng lên xuống.",
    ids: ["consumption", "investment", "gov_spending", "net_exports", "gdp_growth", "unemployment", "cpi", "credit", "confidence", "tax", "public_investment", "remittances", "fdi"],
  },
  {
    id: "tien-te",
    name: "Tiền tệ và ngân hàng",
    hint: "Ngân hàng Nhà nước kéo cần gạt lãi suất và lượng tiền như thế nào.",
    ids: ["policy_rate", "omo", "credit_quota", "interbank", "lending_rate", "real_rate", "credit", "m2", "expectations", "cpi", "investment", "consumption", "fx_rate"],
  },
  {
    id: "tai-khoa",
    name: "Ngân sách và nợ công",
    hint: "Chính phủ thu, chi và vay nợ.",
    ids: ["gov_spending", "tax", "public_investment", "fiscal_balance", "public_debt", "investment", "consumption", "gdp_growth", "lending_rate"],
  },
  {
    id: "doi-ngoai",
    name: "Tỷ giá và thế giới",
    hint: "Fed, giá dầu, dòng vốn ngoại, xuất nhập khẩu và dự trữ ngoại hối.",
    ids: ["fed_rate", "oil_price", "fdi", "fpi", "remittances", "fx_rate", "interbank", "policy_rate", "net_exports", "current_account", "reserves", "cpi", "investment"],
  },
  { id: "toan-bo", name: "Toàn bộ", hint: "Tất cả chỉ số và khái niệm. Nhiều thẻ, nên dùng khi đã quen.", ids: "all" },
];

export const MAP_BY_ID = Object.fromEntries(MAPS.map((m) => [m.id, m])) as Record<string, MapView>;
