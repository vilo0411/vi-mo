import Link from "next/link";
import ScenarioList from "@/components/ScenarioList";
import ProblemSet from "@/components/ProblemSet";
import PlayerCard from "@/components/PlayerCard";
import DailyChallenge from "@/components/DailyChallenge";
import { PRACTICE_GAMES } from "@/content/macro-practice";

export const metadata = { title: "Thử thách · Vĩ mô Việt Nam" };

export default function ChallengesPage() {
  return (
    <div className="space-y-10 max-w-6xl">
      <section className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Thử làm người điều hành</h1>
          <p className="text-muted mt-2 max-w-3xl leading-relaxed">
            Mỗi thử thách dựa trên một giai đoạn thật của kinh tế Việt Nam. Bạn ra một quyết định mỗi năm, trong 2 đến 3 năm. Lựa chọn được đưa vào mô hình nhân quả của bản đồ và quy đổi ra số liệu cụ thể như lạm phát, tăng trưởng, tỷ giá. Thử thách khó có mục tiêu bằng số: phải đạt hết mới được 3 sao. Sao và bài tính cho bạn XP để thăng cấp, từ Thực tập sinh tới Thống đốc. Chặng sau mở khi bạn gom đủ sao.
          </p>
        </div>
        <PlayerCard />
        <DailyChallenge />
        <ScenarioList />
        <p className="text-sm text-muted">
          Chưa quen các khái niệm? Học <Link href="/lo-trinh" className="text-accent">lộ trình 6 bài</Link> trước sẽ dễ chơi hơn.
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="luyen-doc-so-lieu">
        <h2 id="luyen-doc-so-lieu" className="text-xl font-semibold">Luyện đọc số liệu</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(PRACTICE_GAMES).map(([id, game]) => (
            <Link key={id} href={`/thu-thach/${id}`} className="group rounded-xl border border-line bg-surface p-4 hover:border-accent">
              <h3 className="font-semibold group-hover:text-accent">{game.title} <span aria-hidden>→</span></h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{game.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Màn tính toán</h2>
          <p className="text-muted mt-1 max-w-3xl leading-relaxed">
            Những bài tính nhỏ mà người đọc tin kinh tế hay phải làm trong đầu. Số liệu trong đề lấy từ dữ liệu thật của app. Gõ số theo kiểu 6,4 hoặc 6.4 đều được. Giải đúng ngay lần đầu, không xem gợi ý, được thêm 50% XP.
          </p>
        </div>
        <ProblemSet />
      </section>
    </div>
  );
}
