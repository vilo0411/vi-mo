/** Địa chỉ trang công khai, dùng cho dữ liệu cấu trúc cần URL tuyệt đối. */
export const SITE_URL = "https://vilo0411.github.io/vi-mo";

/** Chuỗi JSON an toàn để đặt trong thẻ script. */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
