/** Bỏ dấu tiếng Việt để tìm "lam phat" vẫn ra "lạm phát". */
export function fold(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}
