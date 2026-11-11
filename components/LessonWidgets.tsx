"use client";

import { useState } from "react";
import type { WidgetId } from "@/content/feynman";
import ContributionChart from "./ContributionChart";

const vnd = (x: number) => `${Math.round(x).toLocaleString("vi-VN")} đ`;
const pct = (x: number, d = 1) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toLocaleString("vi-VN", { maximumFractionDigits: d, minimumFractionDigits: d })}%`;

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-4 sm:p-5 space-y-4">
      <div>
        <h3 className="font-semibold">{title}</h3>
        {hint && <p className="text-sm text-muted mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, show }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; show: string }) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between gap-3">
        <span>{label}</span>
        <span className="tabular-nums font-medium text-accent">{show}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}

function Stat({ label, value, tone, note }: { label: string; value: string; tone?: "up" | "down" | "neutral"; note?: string }) {
  const color = tone === "up" ? "var(--up)" : tone === "down" ? "var(--down)" : "var(--text)";
  return (
    <div className="rounded-lg bg-surface-2 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-xl font-medium tabular-nums mt-0.5" style={{ color }}>
        {value}
      </div>
      {note && <div className="text-xs text-muted mt-0.5 leading-snug">{note}</div>}
    </div>
  );
}

/** Bài 1: tăng trưởng thực, lạm phát và tăng doanh thu danh nghĩa trong một tiệm bánh mì. */
function Bakery() {
  const [loaves, setLoaves] = useState(107);
  const [price, setPrice] = useState(10400);
  const [workers, setWorkers] = useState(98);
  const growth = loaves - 100;
  const inflation = (price / 10000 - 1) * 100;
  const revenue = loaves * price;
  const nominal = (revenue / 1_000_000 - 1) * 100;
  return (
    <Card title="Tiệm bánh của cô Ba" hint="Năm ngoái: 100 ổ bánh, giá 10.000 đ một ổ, 100 người muốn làm thợ. Kéo các thanh để đổi năm nay.">
      <div className="grid sm:grid-cols-3 gap-4">
        <Slider label="Số ổ bánh năm nay" value={loaves} min={90} max={115} step={1} onChange={setLoaves} show={`${loaves} ổ`} />
        <Slider label="Giá một ổ năm nay" value={price} min={9500} max={12000} step={100} onChange={setPrice} show={vnd(price)} />
        <Slider label="Số thợ có việc" value={workers} min={90} max={100} step={1} onChange={setWorkers} show={`${workers}/100 người`} />
      </div>
      <div className="flex flex-wrap gap-1" aria-label={`${loaves} ổ bánh`}>
        {Array.from({ length: loaves }, (_, i) => (
          <span key={i} className="w-3 h-2 rounded-full" style={{ background: i < 100 ? "var(--chart-2)" : "var(--up)" }} />
        ))}
      </div>
      <div className="grid sm:grid-cols-4 gap-3">
        <Stat label="Tăng trưởng GDP (thực)" value={pct(growth)} tone={growth >= 0 ? "up" : "down"} note="Bánh làm ra nhiều hơn bao nhiêu" />
        <Stat label="Lạm phát" value={pct(inflation)} tone={inflation > 5 ? "down" : "neutral"} note="Giá một ổ tăng bao nhiêu" />
        <Stat label="Thất nghiệp" value={`${100 - workers}%`} tone={100 - workers > 3 ? "down" : "neutral"} note={`${100 - workers} người chưa có việc`} />
        <Stat label="Tiền bán bánh (danh nghĩa)" value={pct(nominal)} note={`${vnd(revenue)} so với 1.000.000 đ`} />
      </div>
      <p className="text-sm leading-relaxed rounded-lg border border-line p-3">
        Tiền bán bánh tăng {pct(nominal)}, gần bằng tăng trưởng {pct(growth)} cộng lạm phát {pct(inflation)}. Chỉ phần {pct(growth)} là bánh thật sự nhiều hơn. Vì vậy người ta nói về <b className="font-medium">GDP thực</b>, đã trừ phần tăng giá.
      </p>
    </Card>
  );
}

const SORT_ITEMS: { text: string; answer: "C" | "I" | "G" | "X" | "M"; why: string }[] = [
  { text: "Mẹ mua bát phở buổi sáng", answer: "C", why: "Hộ gia đình chi tiêu để dùng ngay: tiêu dùng." },
  { text: "Công ty may mua thêm 50 máy khâu", answer: "I", why: "Mua máy móc để sản xuất trong tương lai: đầu tư." },
  { text: "Nhà nước trả lương cho giáo viên", answer: "G", why: "Chi tiêu dùng của Nhà nước." },
  { text: "Samsung bán điện thoại làm ở Bắc Ninh cho người Mỹ", answer: "X", why: "Hàng làm ra trong nước, bán cho nước ngoài: xuất khẩu." },
  { text: "Nhà máy mua linh kiện từ Hàn Quốc", answer: "M", why: "Mua hàng nước ngoài làm ra: nhập khẩu, phải trừ đi." },
  { text: "Gia đình xây nhà mới", answer: "I", why: "Nhà ở mới được tính là đầu tư, không phải tiêu dùng." },
  { text: "Bạn mua vé xem phim", answer: "C", why: "Dịch vụ hộ gia đình dùng ngay: tiêu dùng." },
  { text: "Khách du lịch Hàn Quốc ăn bún chả ở Hà Nội", answer: "X", why: "Người nước ngoài mua dịch vụ của Việt Nam: xuất khẩu dịch vụ." },
];
const BUCKETS = [
  { id: "C", label: "C · Tiêu dùng" },
  { id: "I", label: "I · Đầu tư" },
  { id: "G", label: "G · Nhà nước" },
  { id: "X", label: "X · Xuất khẩu" },
  { id: "M", label: "M · Nhập khẩu (trừ đi)" },
] as const;

/** Bài 2: phân loại các khoản chi tiêu đời thường vào C, I, G, X, M. */
function GdpSort() {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const done = i >= SORT_ITEMS.length;
  const item = SORT_ITEMS[i];
  return (
    <Card title="Trò chơi: ai đang mua?" hint="Đọc từng tình huống và xếp khoản tiền vào đúng nhóm của GDP.">
      {done ? (
        <div className="space-y-3">
          <p className="text-lg font-medium">
            Bạn xếp đúng {score}/{SORT_ITEMS.length} tình huống.
          </p>
          <button type="button" onClick={() => { setI(0); setScore(0); setPicked(null); }} className="px-4 py-2 rounded-lg border border-line text-sm">
            Chơi lại
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-muted">
            Tình huống {i + 1}/{SORT_ITEMS.length} · đúng {score}
          </div>
          <p className="text-lg">{item.text}</p>
          <div className="flex flex-wrap gap-2">
            {BUCKETS.map((b) => {
              const isPicked = picked === b.id;
              const right = b.id === item.answer;
              return (
                <button
                  key={b.id}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => {
                    setPicked(b.id);
                    if (right) setScore((s) => s + 1);
                  }}
                  className="px-3 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor: picked && right ? "var(--up)" : isPicked ? "var(--down)" : "var(--border)",
                    background: picked && right ? "color-mix(in srgb, var(--up) 12%, var(--surface))" : undefined,
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
          {picked && (
            <div className="space-y-2">
              <p className="text-sm" style={{ color: picked === item.answer ? "var(--up)" : "var(--down)" }}>
                {picked === item.answer ? "Đúng rồi! " : "Chưa đúng. "}
                <span style={{ color: "var(--text)" }}>{item.why}</span>
              </p>
              <button type="button" onClick={() => { setI(i + 1); setPicked(null); }} className="px-4 py-2 rounded-lg bg-accent text-white text-sm">
                Tiếp
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Mỗi người trong xóm chỉ vay nếu lãi suất không vượt quá mức họ chịu được.
const NEIGHBORS = [
  { who: "Chị Lan mở quán cà phê", max: 7 },
  { who: "Anh Minh mua xe tải chở hàng", max: 9 },
  { who: "Cô Hoa mua nhà", max: 8 },
  { who: "Xưởng gỗ mua máy mới", max: 11 },
  { who: "Bạn Tuấn mua xe máy trả góp", max: 6 },
  { who: "Công ty xây thêm nhà kho", max: 10 },
  { who: "Bác Ba mở rộng vườn cây", max: 7.5 },
  { who: "Shop quần áo nhập thêm hàng", max: 12 },
  { who: "Gia đình sửa nhà", max: 6.5 },
  { who: "Startup thuê thêm người", max: 8.5 },
];

/** Bài 3: lãi suất cao lên thì tiền lãi tăng và ít người còn muốn vay. */
function Loan() {
  const [policy, setPolicy] = useState(4.5);
  const lending = policy + 4; // ngân hàng cộng thêm chi phí và lợi nhuận
  const borrowers = NEIGHBORS.filter((n) => n.max >= lending);
  const interest = 1_000_000_000 * (lending / 100);
  return (
    <Card title="Ngân hàng Nhà nước kéo cần gạt" hint="Ngân hàng cho vay bằng lãi suất điều hành cộng thêm khoảng 4 điểm % (chi phí và lợi nhuận của ngân hàng).">
      <Slider label="Lãi suất điều hành của NHNN" value={policy} min={2} max={10} step={0.5} onChange={setPolicy} show={`${policy.toLocaleString("vi-VN")}%`} />
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Lãi suất ngân hàng cho bạn vay" value={`${lending.toLocaleString("vi-VN")}%/năm`} />
        <Stat label="Tiền lãi khi vay 1 tỷ đồng mua nhà" value={`${Math.round(interest / 1_000_000).toLocaleString("vi-VN")} triệu/năm`} note={`≈ ${Math.round(interest / 12 / 1_000_000).toLocaleString("vi-VN")} triệu mỗi tháng`} />
        <Stat label="Số người trong xóm còn muốn vay" value={`${borrowers.length}/10`} tone={borrowers.length <= 4 ? "down" : "up"} />
      </div>
      <ul className="grid sm:grid-cols-2 gap-1.5 text-sm">
        {NEIGHBORS.map((n) => {
          const yes = n.max >= lending;
          return (
            <li key={n.who} className="flex items-center gap-2 rounded-md px-2 py-1" style={{ background: yes ? "color-mix(in srgb, var(--up) 10%, transparent)" : "var(--surface-2)", opacity: yes ? 1 : 0.6 }}>
              <span aria-hidden>{yes ? "✓" : "✗"}</span>
              <span className="flex-1">{n.who}</span>
              <span className="text-xs text-muted">vay nếu ≤ {n.max.toLocaleString("vi-VN")}%</span>
            </li>
          );
        })}
      </ul>
      <p className="text-sm leading-relaxed rounded-lg border border-line p-3">
        Ít người vay hơn thì ít tiền được tiêu ra hơn: ít quán mở, ít nhà xây, ít máy mua. Cầu giảm thì giá cả bớt tăng, nhưng việc làm cũng ít đi. Đó là sự đánh đổi mỗi lần NHNN tăng lãi suất.
      </p>
    </Card>
  );
}

/** Bài 3: lãi suất thực, gửi tiết kiệm có thật sự lời không. */
function RealRate() {
  const [rate, setRate] = useState(6);
  const [inf, setInf] = useState(4);
  const nominal = 100_000_000 * (1 + rate / 100);
  const basketBefore = 100_000_000;
  const basketAfter = basketBefore * (1 + inf / 100);
  const real = ((1 + rate / 100) / (1 + inf / 100) - 1) * 100;
  return (
    <Card title="Gửi tiết kiệm có thật sự lời không?" hint="Bạn gửi 100 triệu đồng trong một năm. Cuối năm số tiền nhiều hơn, nhưng giá cả cũng tăng.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Slider label="Lãi suất tiết kiệm" value={rate} min={0} max={15} step={0.5} onChange={setRate} show={`${rate.toLocaleString("vi-VN")}%`} />
        <Slider label="Lạm phát trong năm" value={inf} min={0} max={25} step={0.5} onChange={setInf} show={`${inf.toLocaleString("vi-VN")}%`} />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Số tiền cuối năm" value={`${Math.round(nominal / 1_000_000).toLocaleString("vi-VN")} triệu`} />
        <Stat label="Giỏ hàng 100 triệu giờ giá" value={`${Math.round(basketAfter / 1_000_000).toLocaleString("vi-VN")} triệu`} />
        <Stat label="Lãi suất thực" value={pct(real)} tone={real >= 0 ? "up" : "down"} note={real >= 0 ? "Bạn mua được nhiều hàng hơn" : "Bạn mua được ít hàng hơn lúc gửi"} />
      </div>
      <p className="text-sm text-muted">Thử đặt lãi suất 12% và lạm phát 23%, gần với năm 2008.</p>
    </Card>
  );
}

/** Bài 4: tỷ giá tăng thì ai được, ai mất. */
function Exchange() {
  const [fx, setFx] = useState(25000);
  const base = 24000;
  const iphone = 1000 * fx;
  const coffeeUsd = 100000 / fx;
  const weaker = fx > base;
  return (
    <Card title="Đổi tiền: ai vui, ai buồn?" hint="Tỷ giá ban đầu là 24.000 đồng/USD. Kéo để tiền đồng yếu đi (số tăng) hoặc mạnh lên (số giảm).">
      <Slider label="1 USD đổi được" value={fx} min={21000} max={28000} step={250} onChange={setFx} show={vnd(fx)} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Stat
          label="Bạn mua điện thoại nhập khẩu giá 1.000 USD"
          value={vnd(iphone)}
          tone={weaker ? "down" : "up"}
          note={`${pct((fx / base - 1) * 100)} so với lúc tỷ giá 24.000. ${weaker ? "Người mua hàng nhập khẩu buồn." : "Người mua hàng nhập khẩu vui."}`}
        />
        <Stat
          label="Người Mỹ mua 1 kg cà phê Việt giá 100.000 đ"
          value={`${coffeeUsd.toLocaleString("vi-VN", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} USD`}
          tone={weaker ? "up" : "down"}
          note={weaker ? "Cà phê Việt rẻ đi với người Mỹ, nông dân trồng cà phê vui." : "Cà phê Việt đắt lên với người Mỹ, khó bán hơn."}
        />
      </div>
      <p className="text-sm leading-relaxed rounded-lg border border-line p-3">
        Không có tỷ giá nào làm mọi người cùng vui. Ngân hàng Nhà nước thường cố giữ tỷ giá thay đổi từ từ, để cả người nhập khẩu lẫn người xuất khẩu kịp thích nghi.
      </p>
    </Card>
  );
}

/** Bài 5: quỹ lớp, bội chi cộng dồn thành nợ và so với "thu nhập" đang lớn dần. */
function ClassFund() {
  const [tax, setTax] = useState(18);
  const [spend, setSpend] = useState(21);
  const [growth, setGrowth] = useState(9);
  const years = Array.from({ length: 11 }, (_, k) => k);
  const debt: number[] = [];
  let d = 35;
  for (const k of years) {
    if (k > 0) d = d / (1 + growth / 100) + (spend - tax);
    debt.push(d);
  }
  const max = Math.max(60, ...debt);
  const last = debt.at(-1)!;
  return (
    <Card title="Làm lớp trưởng quỹ cả nước" hint="Nợ khởi điểm bằng 35% thu nhập cả năm (GDP). Mỗi năm thu và chi tính theo % GDP; GDP danh nghĩa lớn lên theo tốc độ bạn đặt.">
      <div className="grid sm:grid-cols-3 gap-4">
        <Slider label="Thu mỗi năm (thuế, phí)" value={tax} min={12} max={25} step={0.5} onChange={setTax} show={`${tax.toLocaleString("vi-VN")}% GDP`} />
        <Slider label="Chi mỗi năm" value={spend} min={12} max={28} step={0.5} onChange={setSpend} show={`${spend.toLocaleString("vi-VN")}% GDP`} />
        <Slider label="GDP danh nghĩa tăng mỗi năm" value={growth} min={0} max={14} step={1} onChange={setGrowth} show={`${growth}%`} />
      </div>
      <div className="flex items-end gap-1.5 h-40" aria-label="Nợ theo từng năm">
        {debt.map((x, k) => (
          <div key={k} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="text-[10px] text-muted tabular-nums">{Math.round(x)}</span>
            <div className="w-full rounded-t" style={{ height: `${(x / max) * 100}%`, background: x > 60 ? "var(--down)" : "var(--chart-1)" }} />
            <span className="text-[10px] text-muted mt-0.5">{k === 0 ? "nay" : `+${k}`}</span>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Stat label="Mỗi năm" value={spend > tax ? `Bội chi ${(spend - tax).toLocaleString("vi-VN")}% GDP` : `Thặng dư ${(tax - spend).toLocaleString("vi-VN")}% GDP`} tone={spend > tax ? "down" : "up"} />
        <Stat label="Nợ sau 10 năm" value={`${Math.round(last)}% GDP`} tone={last > 60 ? "down" : last < 35 ? "up" : "neutral"} note={last > 60 ? "Vượt mốc 60% từng được dùng làm ngưỡng cảnh báo" : "Vẫn trong vùng an toàn"} />
      </div>
      <p className="text-sm text-muted leading-relaxed">
        Để ý: bội chi 3% GDP mỗi năm nhưng GDP tăng 9% thì nợ trên GDP vẫn có thể đứng yên, vì &ldquo;thu nhập&rdquo; lớn nhanh hơn. Đặt tăng trưởng 0% để thấy nợ phình ra thế nào.
      </p>
    </Card>
  );
}

/** Bài 6: tiền tăng nhanh hơn hàng thì giá tăng. */
function MoneyGoods({ item = "quả táo", place = "chợ", title = "Cái chợ táo" }: { item?: string; place?: string; title?: string }) {
  const [money, setMoney] = useState(100);
  const [apples, setApples] = useState(10);
  const price = (money * 1000) / apples;
  const change = (price / 10000 - 1) * 100;
  return (
    <Card title={title} hint={`Lúc đầu ${place} có 10 ${item} và 100.000 đ, mỗi ${item} khoảng 10.000 đ.`}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Slider label={`Tổng tiền cả ${place} có`} value={money} min={50} max={250} step={10} onChange={setMoney} show={`${(money * 1000).toLocaleString("vi-VN")} đ`} />
        <Slider label={`Số ${item} làm ra`} value={apples} min={5} max={20} step={1} onChange={setApples} show={`${apples} ${item}`} />
      </div>
      <div className="flex flex-wrap gap-1.5 text-2xl" aria-label={`${apples} ${item}`}>
        {Array.from({ length: apples }, (_, i) => (
          <span key={i} className="w-6 h-6 rounded-full inline-block" style={{ background: "var(--down)" }} />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Stat label={`Giá một ${item}`} value={vnd(price)} />
        <Stat label="Giá thay đổi" value={pct(change, 0)} tone={change > 5 ? "down" : change < -5 ? "up" : "neutral"} note={change > 0 ? "Tiền tăng nhanh hơn hàng: lạm phát" : change < 0 ? "Hàng tăng nhanh hơn tiền: giá giảm" : "Tiền và hàng tăng ngang nhau"} />
      </div>
      <p className="text-sm text-muted leading-relaxed">Đây là phiên bản rất đơn giản. Ngoài đời còn có tốc độ tiền quay vòng, kỳ vọng và giá nhập khẩu, nhưng ý chính vẫn đúng: tiền tăng nhanh hơn hàng nhiều năm liền thì giá cả sẽ tăng.</p>
    </Card>
  );
}

export default function LessonWidget({ id }: { id: WidgetId }) {
  switch (id) {
    case "bakery":
      return <Bakery />;
    case "gdp-sort":
      return <GdpSort />;
    case "contributions":
      return (
        <Card title="Tăng trưởng GDP thật được ghép từ đâu?" hint="Mỗi cột là tốc độ tăng GDP của một năm, tách thành phần đóng góp của từng nhóm người mua. Đường chấm tròn là tăng trưởng thật.">
          <ContributionChart from={2010} />
        </Card>
      );
    case "loan":
      return <Loan />;
    case "real-rate":
      return <RealRate />;
    case "exchange":
      return <Exchange />;
    case "class-fund":
      return <ClassFund />;
    case "money-goods":
      return <MoneyGoods />;
    case "money-bread":
      return <MoneyGoods item="ổ bánh" place="phố" title="Cuộc đua giữa tiền và bánh" />;
  }
}
