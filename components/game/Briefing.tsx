"use client";

import { INDICATOR_BY_ID } from "@/content/indicators";
import type { Scenario } from "@/content/scenarios";
import { formatReal, type FireRule } from "@/lib/game";
import { resetHints } from "./Hint";
import SpeakButton from "./Speak";
import { useProgress } from "@/lib/progress";
import { STREET } from "@/content/world";
import { isUnlocked, scenarioXp, starsMissing } from "@/lib/rewards";
import { Stars } from "../ScenarioList";
import Link from "next/link";
import { LESSONS } from "@/content/lessons";
import { CAPITAL_START } from "@/lib/game";

const BRIEF_ROWS: { id: string; why: string }[] = [
  { id: "gdp_growth", why: "Nền kinh tế lớn nhanh hay chậm. Giảm mạnh nghĩa là doanh nghiệp đóng cửa, người lao động mất việc." },
  { id: "cpi", why: "Giá cả tăng nhanh hay chậm. Quá cao thì tiền mất giá, đời sống người dân khó khăn." },
  { id: "policy_rate", why: "Công cụ chính của bạn nếu bạn là Thống đốc. Tăng thì vay đắt hơn, hạ thì vay rẻ hơn." },
  { id: "fx_rate", why: "Giá của 1 USD. Tăng nghĩa là tiền đồng yếu đi, hàng nhập khẩu đắt hơn." },
  { id: "reserves", why: "Số đô la bạn có thể bán ra để giữ giá tiền đồng. Bán hết là mất bộ đệm." },
  { id: "public_debt", why: "Nhà nước đang nợ bao nhiêu so với quy mô nền kinh tế. Càng thấp càng còn dư địa để chi tiêu khi khó khăn." },
  { id: "oil_price", why: "Giá dầu thế giới, ảnh hưởng thẳng tới giá xăng và lạm phát." },
  { id: "fed_rate", why: "Lãi suất của Mỹ. Tăng thì đô la mạnh lên và tiền chảy khỏi Việt Nam." },
  { id: "unemployment", why: "Tỷ lệ người muốn làm việc mà chưa có việc." },
  { id: "m2", why: "Tốc độ tăng của lượng tiền trong nền kinh tế. Tăng quá nhanh thì lạm phát sẽ tới sau vài quý." },
];

/** Hồ sơ nhiệm vụ: các con số khởi điểm, mục tiêu và công cụ, để người chơi biết mình bắt đầu từ đâu. */
export default function Briefing({ scenario, rules, onStart }: { scenario: Scenario; rules: FireRule[]; onStart: () => void }) {
  const rows = BRIEF_ROWS.filter((r) => scenario.baseline[r.id] !== undefined);
  const { progress, loaded } = useProgress();
  const missing = loaded && !isUnlocked(scenario, progress) ? starsMissing(scenario.level, progress) : 0;
  const stars = progress.stars[scenario.id] ?? 0;
  const prep = LESSONS.filter((l) => scenario.lessons?.includes(l.slug));
  const losses = progress.losses[scenario.id] ?? 0;
  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] gap-6 max-w-6xl">
      <div className="space-y-5">
        <div className="bg-surface border border-line rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-medium text-accent">Hồ sơ nhiệm vụ</div>
            <SpeakButton id="briefing" text={`Bạn là ${scenario.role}. ${scenario.teaser}`} />
          </div>
          <p className="leading-relaxed">
            Bạn là <b className="font-medium">{scenario.role}</b>. {scenario.teaser}
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Đây là nhập vai, không phải chép lại lịch sử: bạn có thể làm khác những gì đã xảy ra. Các con số khởi điểm dưới đây được đặt gần với số liệu thật của Việt Nam để bạn có cảm giác thực tế. {scenario.baselineNote}
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Nền kinh tế bạn tiếp quản</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {rows.map((r) => (
              <div key={r.id} className="bg-surface border border-line rounded-xl p-4">
                <div className="text-xs text-muted">{INDICATOR_BY_ID[r.id].name}</div>
                <div className="text-2xl tabular-nums mt-0.5">{formatReal(r.id, scenario.baseline[r.id])}</div>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">{r.why}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-surface border border-line rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">Mục tiêu khi kết thúc nhiệm kỳ</h2>
          <ul className="space-y-2 text-sm">
            {scenario.targets.map((t) => {
              const base = scenario.baseline[t.node];
              const change = t.node === "fx_rate" ? ` (tiền đồng mất giá không quá ${Math.round((t.value / base - 1) * 100)}%)` : "";
              return (
                <li key={t.node} className="flex gap-2">
                  <span className="text-accent">●</span>
                  <span>
                    {INDICATOR_BY_ID[t.node].name} {t.op === "<=" ? "không quá" : "ít nhất"} <b className="font-medium tabular-nums">{formatReal(t.node, t.value)}</b>
                    {change}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-muted">Đạt hết mục tiêu mới có thể được 3 sao.</p>
        </div>
        <div className="bg-surface border border-line rounded-xl p-5 space-y-2 text-sm">
          <h2 className="font-semibold">Luật chơi</h2>
          {scenario.street ? (
            <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
              <li>Mỗi năm có một sự kiện. Bạn nghe hai cố vấn cãi nhau, rồi tự quyết định. Cả hai đều có thể sai.</li>
              <li>Không có con số báo trước. Sau khi chọn, bạn đoán chỉ số sẽ đi đâu, rồi mới được xem chuyện gì xảy ra.</li>
              <li>Bạn có {CAPITAL_START} vốn chính trị. Quyết định khó tốn vốn. Đoán đúng được thêm 1, để mục tiêu trượt xa mất 1.</li>
              <li>Tương lai chưa ngã ngũ: mỗi lượt chơi, cú sốc có thể đi theo hướng khác.</li>
              <li>Quyết định của bạn rơi xuống đầu những người ở {STREET}, và họ sẽ nhắn cho bạn.</li>
              <li>Kết thúc nhiệm kỳ, bạn xem chuyện gì xảy ra một năm sau, so với chuyên gia và với thực tế.</li>
            </ol>
          ) : (
            <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
            <li>Mỗi năm có một sự kiện. Bạn chọn một trong ba phương án dựng sẵn, hoặc tự đặt con số: thay đổi lãi suất, chi tiêu công, bán đô la từ dự trữ.</li>
            <li>Mỗi phương án ghi rõ con số nó thay đổi, ví dụ &ldquo;Lãi suất điều hành 4,0% → 5,5%&rdquo;.</li>
            <li>Sau khi chọn, bạn tự bấm để đi qua từng quý. Mỗi quý giải thích chỉ số nào vừa đổi, đổi bao nhiêu, và đó là do sự kiện trong câu chuyện hay do lựa chọn nào của bạn. Bản đồ bên phải hiện dần những chỉ số bị ảnh hưởng: thẻ có nhãn xanh là chỗ quyết định của bạn tác động vào, nhãn tím là sự kiện.</li>
            <li>Hết mỗi năm có bảng tổng kết so trước và sau quyết định. Bạn có thể bấm xem lại từng quý.</li>
            <li>Mỗi năm bạn chọn thêm giọng phát ngôn. Lời nói khớp với hành động thì giúp kéo kỳ vọng theo ý bạn, nói một đằng làm một nẻo thì phản tác dụng.</li>
            <li>Không chắc thì hỏi cố vấn. Tự quyết mà vẫn đạt 3 sao thì được huy hiệu &ldquo;Tự lực&rdquo;.</li>
            <li>Kết thúc nhiệm kỳ, bạn nhận điểm, số sao, so với chuyên gia, làm quiz ngắn và xem thực tế đã diễn ra thế nào.</li>
          </ol>
          )}
          {rules.length > 0 && (
            <div className="rounded-lg p-3 text-xs leading-relaxed" style={{ background: "var(--surface-2)" }}>
              <div className="font-medium text-sm mb-1" style={{ color: "var(--down)" }}>
                🚪 Bị cách chức nếu 2 quý liền:
              </div>
              <ul className="space-y-0.5">
                {rules.map((r) => (
                  <li key={r.node}>
                    {INDICATOR_BY_ID[r.node].name} {r.op === ">" ? "trên" : "dưới"} {formatReal(r.node, r.value)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button type="button" onClick={resetHints} className="text-xs text-accent">
            Bật lại hướng dẫn cho người mới
          </button>
        </div>
        <div className="bg-surface border border-line rounded-xl p-5 space-y-2 text-sm">
          <h2 className="font-semibold">Phần thưởng</h2>
          <ul className="space-y-1">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex justify-between gap-2">
                <Stars n={n} />
                <span className="tabular-nums">
                  {scenarioXp(scenario, n)} XP{stars >= n ? <span className="text-muted"> · đã nhận</span> : null}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted">Chơi lại chỉ được thêm phần XP chênh lệch khi đạt nhiều sao hơn lần trước.</p>
        </div>
        {missing > 0 && (
          <p className="text-xs text-muted rounded-lg bg-surface-2 p-3">
            🔒 Theo bản đồ chiến dịch, chặng này cần thêm {missing} sao mới mở. Bạn vẫn có thể chơi thử ngay.
          </p>
        )}
        {prep.length > 0 && (
          <div className="bg-surface border border-line rounded-xl p-5 space-y-2 text-sm">
            <h2 className="font-semibold">Nên học trước</h2>
            <ul className="space-y-1">
              {prep.map((l) => (
                <li key={l.slug} className="flex gap-2">
                  <span style={{ color: progress.lessons[l.slug] ? "var(--up)" : "var(--muted)" }}>{progress.lessons[l.slug] ? "✓" : "○"}</span>
                  <Link href={`/lo-trinh/${l.slug}`} className="hover:text-accent">{l.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {losses > 0 && <p className="text-xs text-muted">Bạn đã mất ghế {losses} lần ở thử thách này.</p>}
        <button type="button" onClick={onStart} className="w-full px-4 py-3 rounded-xl bg-accent text-white font-medium">
          Nhận nhiệm vụ
        </button>
      </div>
    </div>
  );
}
