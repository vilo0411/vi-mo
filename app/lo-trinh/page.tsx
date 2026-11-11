import Link from "next/link";
import LessonList from "@/components/LessonList";
import { JourneyMap } from "@/components/lesson/GrowingMap";
import { LESSONS } from "@/content/lessons";

export const metadata = { title: "Bắt đầu học · Vĩ mô Việt Nam" };

export default function LearningPath() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bắt đầu học từ đâu?</h1>
        <p className="text-muted mt-2 leading-relaxed">
          Không cần biết gì trước. Lộ trình gồm {LESSONS.length} bài ngắn, kể tiếp nhau như phim dài tập quanh một con phố nhỏ. Mỗi bài ghép thêm vài mảnh vào bản đồ của bạn, và cuối chặng là một trận tự tay điều hành.
        </p>
        <p className="text-sm text-muted mt-2">
          Muốn nhìn tổng quan trước? <Link href="/ban-do/chinh?explore=1" className="text-accent">Khám phá bản đồ từng nhánh, bắt đầu từ GDP</Link>.
        </p>
      </div>
      <JourneyMap />
      <LessonList />
    </div>
  );
}
