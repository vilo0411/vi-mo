import { INDICATORS } from "./indicators";
import { MAPS, type LibraryCategory } from "./maps";

export type { LibraryCategory } from "./maps";
export type LibraryItemType = "map";

export type LibraryItem = {
  /** Khóa dùng chung cho tiến độ, ví dụ "map:chinh" */
  key: string;
  type: LibraryItemType;
  id: string;
  name: string;
  hint: string;
  category: LibraryCategory;
  href: string;
  /** Số thẻ hoặc số bước, luôn tính từ dữ liệu */
  count: number;
  countLabel: string;
};

export const LIBRARY_CATEGORIES: Record<LibraryCategory, { name: string; hint: string; icon: string }> = {
  "tong-the": { name: "Bức tranh tổng thể", hint: "Toàn bộ nền kinh tế trên một trang.", icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.500 5.500 12 3Z" },
  "tang-truong": { name: "Tăng trưởng và ngân sách", hint: "Ai đang chi tiêu, và Chính phủ thu chi ra sao.", icon: "M4 19h16M6 15l4-4 3 3 5-6M14 8h4v4" },
  "tien-te": { name: "Tiền tệ và lạm phát", hint: "Lãi suất, tín dụng, và vì sao giá cả tăng.", icon: "M12 3v18M16.500 7.500C15.500 6 14 5.500 12 5.500c-2.500 0-4.500 1.200-4.500 3.200 0 4.500 9.300 2.300 9.300 6.800 0 2-2.100 3.200-4.800 3.200-2.200 0-3.900-.8-4.800-2.300" },
  "doi-ngoai": { name: "Đối ngoại và tỷ giá", hint: "Dòng tiền và hàng hóa giữa Việt Nam với thế giới.", icon: "M4 8h13l-3.500-3.500M20 16H7l3.500 3.500" },
};

export const FEATURED_KEYS = ["map:chinh", "map:tong-cau", "map:tien-te", "map:doi-ngoai"];

export const TYPE_LABELS: Record<LibraryItemType, string> = { map: "Bản đồ" };

export const LIBRARY_ITEMS: LibraryItem[] = MAPS.map((m) => {
  const count = m.ids === "all" ? INDICATORS.length : m.ids.length;
  return {
    key: `map:${m.id}`,
    type: "map",
    id: m.id,
    name: m.name,
    hint: m.hint,
    category: m.category,
    href: `/ban-do/${m.id}`,
    count,
    countLabel: `${count} chỉ số`,
  };
});
