import { GROUPS, measureOf, type Indicator } from "@/content/indicators";
import { formatValue, getSeries, latest } from "@/lib/data";
import { latestState } from "./MacroGraph";

/** Hướng dẫn người mới đọc từng phần của một thẻ chỉ số, bằng chính con số trên thẻ. */
export default function CardGuide({ ind }: { ind: Indicator }) {
  const s = getSeries(ind.seriesId);
  const last = latest(s);
  if (!s || !last) return null;
  const st = latestState(ind);
  const m = measureOf(ind, s.unit);
  const y = last.year;
  const value = `${st.value}${st.suffix ? ` ${st.suffix}` : ""}`;

  const big =
    m.kind === "ty-trong"
      ? last.value > 100
        ? `${ind.name} bằng ${formatValue(last.value, s.unit)} quy mô GDP năm ${y}, tức lớn hơn cả GDP (khoảng ${(last.value / 100).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} lần).`
        : `${ind.name} bằng ${formatValue(last.value, s.unit)} quy mô GDP năm ${y}. Đây là tỷ trọng, không phải tốc độ tăng.`
      : m.kind === "toc-do"
        ? `Năm ${y}, ${ind.name.toLowerCase()} là ${formatValue(last.value, s.unit)}: phần trăm thay đổi so với năm ${y - 1}.`
        : m.kind === "lai-suat"
          ? `Mức lãi suất năm ${y} là ${formatValue(last.value, s.unit)} một năm. Vay 100 triệu đồng thì mỗi năm trả khoảng ${Math.round(last.value).toLocaleString("vi-VN")} triệu tiền lãi.`
          : `Giá trị năm ${y} là ${formatValue(last.value, s.unit)} (đơn vị: ${s.unit}).`;

  const small = s.unit.startsWith("%")
    ? "Mũi tên ↑ ↓ và số điểm: thay đổi bao nhiêu điểm phần trăm so với năm trước. \"Điểm\" là hiệu của hai con số phần trăm: từ 53,6% xuống 53,2% là giảm 0,4 điểm, không phải giảm 0,4%."
    : "Mũi tên ↑ ↓: thay đổi bao nhiêu phần trăm so với năm trước.";

  const color =
    ind.goodWhen === "neutral"
      ? "Chữ màu xám: chỉ số này cao hay thấp không hẳn là tốt hay xấu, tùy bối cảnh."
      : ind.goodWhen === "up"
        ? "Chữ xanh lá nghĩa là tăng (tốt), đỏ nghĩa là giảm (xấu)."
        : "Chữ xanh lá nghĩa là giảm (tốt), đỏ nghĩa là tăng (xấu).";

  const vals = s.points.filter((p) => p.year >= 1995);
  const min = vals.reduce((a, b) => (b.value < a.value ? b : a));
  const max = vals.reduce((a, b) => (b.value > a.value ? b : a));
  const avg = vals.reduce((a, b) => a + b.value, 0) / vals.length;
  const level = last.value > avg * 1.1 ? "cao hơn" : last.value < avg * 0.9 ? "thấp hơn" : "gần với";

  return (
    <div className="rounded-lg border border-line p-3 space-y-2.5 text-sm">
      <div className="text-xs font-medium text-accent">Cách đọc thẻ này</div>
      <div className="rounded-md bg-surface-2 px-3 py-2">
        <div className="flex justify-between text-xs text-muted">
          <span>{ind.name}</span>
          <span className="uppercase font-semibold" style={{ color: `var(--g-${ind.group})` }}>
            {GROUPS[ind.group].tag}
          </span>
        </div>
        <div className="text-xl tabular-nums">
          {value}
          {st.yearTag && <span className="text-xs text-muted ml-1.5">(năm {st.yearTag})</span>}
        </div>
        <div className="text-xs text-muted">{st.note}</div>
      </div>
      <dl className="space-y-1.5 leading-relaxed">
        <Row term="Số lớn" desc={big} />
        {st.yearTag && <Row term="Ô năm nhỏ" desc={`Nguồn dữ liệu mới công bố tới năm ${st.yearTag}, nên thẻ ghi rõ năm để bạn không nhầm là số năm nay.`} />}
        <Row term="Dòng nhỏ" desc={`${small} ${color}`} />
        <Row term="Nhãn góc phải" desc={`${GROUPS[ind.group].tag}: ${GROUPS[ind.group].hint.toLowerCase()}.`} />
        <Row
          term="Cao hay thấp?"
          desc={`Từ ${vals[0].year} tới ${y}, trung bình khoảng ${formatValue(avg, s.unit)}; thấp nhất ${formatValue(min.value, s.unit)} (${min.year}), cao nhất ${formatValue(max.value, s.unit)} (${max.year}). Năm ${y} ${level} mức trung bình.`}
        />
      </dl>
    </div>
  );
}

function Row({ term, desc }: { term: string; desc: string }) {
  return (
    <div>
      <dt className="inline font-medium">{term}: </dt>
      <dd className="inline">{desc}</dd>
    </div>
  );
}
