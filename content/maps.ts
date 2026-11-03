/** Các bản đồ con: mỗi bản đồ chỉ hiện một nhóm chỉ số để dễ nhìn. Bản đồ đầu tiên là mặc định. */
export type LibraryCategory = "tong-the" | "tang-truong" | "tien-te" | "doi-ngoai";

export type MapView = {
  id: string; name: string; hint: string; category: LibraryCategory; ids: string[] | "all";
  /** Thẻ nên đọc đầu tiên trên bản đồ này */
  keyId: string;
  /** Xương sống của bản đồ, hiện mặc định cho người mới. Không có thì luôn hiện đầy đủ. */
  core?: string[];
};

export const MAPS: MapView[] = [
  {
    id: "chinh",
    name: "Bản đồ chính",
    hint: "13 chỉ số quan trọng nhất, nên bắt đầu từ đây.",
    category: "tong-the",
    keyId: "gdp_growth",
    core: ["policy_rate", "lending_rate", "credit", "consumption", "investment", "gdp_growth", "cpi", "unemployment"],
    ids: ["fed_rate", "oil_price", "policy_rate", "gov_spending", "lending_rate", "credit", "fx_rate", "consumption", "investment", "net_exports", "gdp_growth", "cpi", "unemployment"],
  },
  {
    id: "tong-cau",
    name: "GDP và tổng cầu",
    hint: "Ai đang tiêu tiền: C + I + G + (X − M) và những gì kéo chúng lên xuống.",
    category: "tang-truong",
    keyId: "gdp_growth",
    core: ["consumption", "investment", "gov_spending", "net_exports", "gdp_growth", "unemployment", "cpi"],
    ids: ["consumption", "investment", "gov_spending", "net_exports", "gdp_growth", "unemployment", "cpi", "credit", "confidence", "tax", "public_investment", "remittances", "fdi"],
  },
  {
    id: "tien-te",
    name: "Tiền tệ và ngân hàng",
    hint: "Ngân hàng Nhà nước kéo cần gạt lãi suất và lượng tiền như thế nào.",
    category: "tien-te",
    keyId: "lending_rate",
    core: ["policy_rate", "interbank", "lending_rate", "credit", "m2", "cpi", "investment", "consumption"],
    ids: ["policy_rate", "omo", "credit_quota", "interbank", "lending_rate", "real_rate", "credit", "m2", "expectations", "cpi", "investment", "consumption", "fx_rate"],
  },
  {
    id: "tai-khoa",
    name: "Ngân sách và nợ công",
    hint: "Chính phủ thu, chi và vay nợ.",
    category: "tang-truong",
    keyId: "public_debt",
    core: ["gov_spending", "tax", "fiscal_balance", "public_debt", "gdp_growth", "consumption"],
    ids: ["gov_spending", "tax", "public_investment", "fiscal_balance", "public_debt", "investment", "consumption", "gdp_growth"],
  },
  {
    id: "doi-ngoai",
    name: "Tỷ giá và thế giới",
    hint: "Fed, giá dầu, dòng vốn ngoại, xuất nhập khẩu và dự trữ ngoại hối.",
    category: "doi-ngoai",
    keyId: "fx_rate",
    core: ["fed_rate", "fdi", "fx_rate", "policy_rate", "net_exports", "current_account", "reserves", "cpi"],
    ids: ["fed_rate", "oil_price", "fdi", "fpi", "remittances", "fx_rate", "interbank", "policy_rate", "net_exports", "current_account", "reserves", "cpi", "investment"],
  },
  {
    id: "lam-phat",
    name: "Lạm phát đến từ đâu",
    hint: "Giá dầu, tỷ giá, tiền trong nền kinh tế và kỳ vọng cùng đẩy giá cả như thế nào.",
    category: "tien-te",
    keyId: "cpi",
    core: ["oil_price", "fx_rate", "m2", "expectations", "cpi", "policy_rate"],
    ids: ["oil_price", "fx_rate", "m2", "credit", "consumption", "expectations", "cpi", "policy_rate", "real_rate", "lending_rate"],
  },
  {
    id: "tin-dung",
    name: "Tín dụng và doanh nghiệp",
    hint: "Từ quyết định của Ngân hàng Nhà nước tới khoản vay của doanh nghiệp và hộ gia đình.",
    category: "tien-te",
    keyId: "credit",
    core: ["policy_rate", "lending_rate", "credit", "investment", "consumption", "gdp_growth"],
    ids: ["policy_rate", "omo", "credit_quota", "interbank", "lending_rate", "credit", "investment", "consumption", "gdp_growth", "confidence"],
  },
  {
    id: "von-ngoai",
    name: "Dòng vốn ngoại",
    hint: "Vốn FDI, vốn gián tiếp và kiều hối đi vào, đi ra và tác động tới tỷ giá.",
    category: "doi-ngoai",
    keyId: "fx_rate",
    core: ["fed_rate", "fdi", "fpi", "remittances", "fx_rate", "reserves", "current_account"],
    ids: ["fed_rate", "fdi", "fpi", "remittances", "fx_rate", "reserves", "current_account", "net_exports", "interbank", "policy_rate"],
  },
  { id: "toan-bo", name: "Toàn bộ", hint: "Tất cả chỉ số và khái niệm. Nhiều thẻ, nên dùng khi đã quen.", category: "tong-the", keyId: "gdp_growth", ids: "all" },
];

export const MAP_BY_ID = Object.fromEntries(MAPS.map((m) => [m.id, m])) as Record<string, MapView>;

/** Bản đồ con đầu tiên có chỉ số này; bản đồ Toàn bộ chỉ là phương án cuối. */
export function firstMapWith(id: string) {
  return MAPS.find((m) => m.ids !== "all" && m.ids.includes(id))?.id ?? "toan-bo";
}
