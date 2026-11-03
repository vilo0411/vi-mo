import Link from "next/link";
import LessonList from "@/components/LessonList";

export const metadata = { title: "Bắt đầu học · Vĩ mô Việt Nam" };

export default function LearningPath() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bắt đầu học từ đâu?</h1>
        <p className="text-muted mt-2 leading-relaxed">
          Không cần biết gì trước. Lộ trình gồm 6 bài ngắn, đi từ những con số quen thuộc nhất tới những quan hệ phức tạp hơn. Mỗi bài có vài câu hỏi nhanh để tự kiểm tra, và một việc để thử ngay trên bản đồ.
        </p>
        <p className="text-sm text-muted mt-2">
          Muốn nhìn tổng quan trước? <Link href="/ban-do/chinh?explore=1" className="text-accent">Khám phá bản đồ từng nhánh, bắt đầu từ GDP</Link>.
        </p>
      </div>
      <LessonList />
    </div>
  );
}
