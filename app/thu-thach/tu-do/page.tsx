import Link from "next/link";
import SandboxPlayer from "@/components/SandboxPlayer";

export const metadata = { title: "Chế độ tự do · Vĩ mô Việt Nam" };

export default function SandboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/thu-thach" className="text-sm text-muted hover:text-text">
          ← Tất cả thử thách
        </Link>
        <h1 className="text-2xl font-semibold mt-3">Chế độ tự do</h1>
        <p className="text-muted mt-1 max-w-3xl">
          Không có kịch bản dựng sẵn, không có đáp án. Mỗi năm một biến cố ngẫu nhiên, bạn tự đặt mọi con số. Bạn trụ được bao nhiêu năm?
        </p>
      </div>
      <SandboxPlayer />
    </div>
  );
}
