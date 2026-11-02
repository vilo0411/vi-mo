// Tải dữ liệu vĩ mô Việt Nam từ World Bank và IMF về data/series/*.json.
// Chạy: npm run fetch-data
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Point = { year: number; value: number };
type Series = {
  id: string;
  source: string;
  code: string;
  url: string;
  unit: string;
  frequency: "annual";
  updatedAt: string;
  points: Point[];
};

const WB: { id: string; code: string; unit: string; scale?: number }[] = [
  { id: "gdp_growth", code: "NY.GDP.MKTP.KD.ZG", unit: "%/năm" },
  { id: "cpi", code: "FP.CPI.TOTL.ZG", unit: "%/năm" },
  { id: "unemployment", code: "SL.UEM.TOTL.ZS", unit: "% lực lượng lao động" },
  { id: "lending_rate", code: "FR.INR.LEND", unit: "%/năm" },
  { id: "deposit_rate", code: "FR.INR.DPST", unit: "%/năm" },
  { id: "real_rate", code: "FR.INR.RINR", unit: "%/năm" },
  { id: "m2_growth", code: "FM.LBL.BMNY.ZG", unit: "%/năm" },
  { id: "private_credit", code: "FS.AST.PRVT.GD.ZS", unit: "% GDP" },
  { id: "fx_rate", code: "PA.NUS.FCRF", unit: "VND/USD (bình quân năm)" },
  { id: "exports", code: "NE.EXP.GNFS.ZS", unit: "% GDP" },
  { id: "imports", code: "NE.IMP.GNFS.ZS", unit: "% GDP" },
  { id: "current_account", code: "BN.CAB.XOKA.GD.ZS", unit: "% GDP" },
  { id: "fdi", code: "BX.KLT.DINV.WD.GD.ZS", unit: "% GDP" },
  { id: "reserves", code: "FI.RES.TOTL.CD", unit: "tỷ USD", scale: 1e9 },
  { id: "reserves_months", code: "FI.RES.TOTL.MO", unit: "tháng nhập khẩu" },
  { id: "consumption", code: "NE.CON.PRVT.ZS", unit: "% GDP" },
  { id: "investment", code: "NE.GDI.TOTL.ZS", unit: "% GDP" },
  { id: "gov_consumption", code: "NE.CON.GOVT.ZS", unit: "% GDP" },
  // Tốc độ tăng thực (giá so sánh) của từng thành phần GDP, dùng để tính đóng góp vào tăng trưởng.
  { id: "consumption_growth", code: "NE.CON.PRVT.KD.ZG", unit: "%/năm" },
  { id: "gov_consumption_growth", code: "NE.CON.GOVT.KD.ZG", unit: "%/năm" },
  { id: "investment_growth", code: "NE.GDI.TOTL.KD.ZG", unit: "%/năm" },
  { id: "exports_growth", code: "NE.EXP.GNFS.KD.ZG", unit: "%/năm" },
  { id: "imports_growth", code: "NE.IMP.GNFS.KD.ZG", unit: "%/năm" },
  { id: "gdp_usd", code: "NY.GDP.MKTP.CD", unit: "tỷ USD", scale: 1e9 },
  // Đầu tư gián tiếp ròng theo cán cân thanh toán: số âm là vốn ngoại vào ròng, nên đổi dấu để "vào" là số dương.
  { id: "fpi", code: "BN.KLT.PTXL.CD", unit: "tỷ USD (vào ròng)", scale: -1e9 },
  { id: "gdp_per_capita", code: "NY.GDP.PCAP.CD", unit: "USD/người" },
  { id: "gdp_deflator", code: "NY.GDP.DEFL.KD.ZG", unit: "%/năm" },
  { id: "imports_usd", code: "NE.IMP.GNFS.CD", unit: "tỷ USD", scale: 1e9 },
  { id: "exports_usd", code: "NE.EXP.GNFS.CD", unit: "tỷ USD", scale: 1e9 },
  { id: "savings", code: "NY.GNS.ICTR.ZS", unit: "% GDP" },
];

const IMF: { id: string; code: string; unit: string }[] = [
  { id: "public_debt", code: "GGXWDG_NGDP", unit: "% GDP" },
  { id: "fiscal_balance", code: "GGXCNL_NGDP", unit: "% GDP" },
  { id: "gov_revenue", code: "rev", unit: "% GDP" },
];

// Cú sốc từ bên ngoài: lấy từ FRED (St. Louis Fed), bình quân theo năm.
const FRED: { id: string; code: string; unit: string }[] = [
  { id: "fed_rate", code: "FEDFUNDS", unit: "%/năm" },
  { id: "oil_price", code: "POILBREUSDM", unit: "USD/thùng (Brent)" },
];

// Những năm mà lãi suất tái cấp vốn cuối năm xác định được từ các mốc trong file nhập tay.
// Các năm khác bị thiếu mốc điều chỉnh nên không suy ra.
const POLICY_COVERED_YEARS = [2010, 2011, 2017, 2018, 2019, 2020, 2021, 2022, 2023];

const OUT = path.join(process.cwd(), "data", "series");
const MANUAL = path.join(process.cwd(), "data", "manual");
const today = new Date().toISOString().slice(0, 10);

async function getJson(url: string): Promise<unknown> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "vi-mo-learning-app" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt >= 3) throw new Error(`${url}: ${(err as Error).message}`);
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function fetchWorldBank(def: (typeof WB)[number]): Promise<Series> {
  const url = `https://api.worldbank.org/v2/country/VNM/indicator/${def.code}?format=json&per_page=200`;
  const json = (await getJson(url)) as [unknown, { date: string; value: number | null }[] | null];
  const rows = json[1] ?? [];
  const scale = def.scale ?? 1;
  const points = rows
    .filter((r) => r.value !== null)
    .map((r) => ({ year: Number(r.date), value: round(r.value! / scale) }))
    .sort((a, b) => a.year - b.year);
  return { id: def.id, source: "World Bank WDI", code: def.code, url, unit: def.unit, frequency: "annual", updatedAt: today, points };
}

async function fetchImf(def: (typeof IMF)[number]): Promise<Series> {
  const url = `https://www.imf.org/external/datamapper/api/v1/${def.code}/VNM`;
  const json = (await getJson(url)) as { values?: Record<string, { VNM?: Record<string, number> }> };
  const byYear = json.values?.[def.code]?.VNM ?? {};
  const thisYear = new Date().getFullYear();
  // IMF WEO trộn số thực tế với dự báo; chỉ giữ tới năm trước để tránh nhầm dự báo là dữ liệu thật.
  const points = Object.entries(byYear)
    .map(([y, v]) => ({ year: Number(y), value: round(v) }))
    .filter((p) => p.year < thisYear)
    .sort((a, b) => a.year - b.year);
  return { id: def.id, source: "IMF World Economic Outlook", code: def.code, url, unit: def.unit, frequency: "annual", updatedAt: today, points };
}

async function fetchFred(def: (typeof FRED)[number]): Promise<Series> {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${def.code}`;
  let text = "";
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      text = await res.text();
      break;
    } catch (err) {
      if (attempt >= 3) throw new Error(`${url}: ${(err as Error).message}`);
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  const byYear = new Map<number, number[]>();
  for (const line of text.trim().split("\n").slice(1)) {
    const [date, raw] = line.split(",");
    const v = Number(raw);
    if (!Number.isFinite(v)) continue;
    const y = Number(date.slice(0, 4));
    byYear.set(y, [...(byYear.get(y) ?? []), v]);
  }
  // Chỉ lấy năm đủ 12 tháng để bình quân năm không bị lệch.
  const points = [...byYear]
    .filter(([y, vs]) => y >= 1985 && vs.length === 12)
    .map(([year, vs]) => ({ year, value: round(vs.reduce((a, b) => a + b, 0) / vs.length) }));
  return { id: def.id, source: "FRED (Federal Reserve Bank of St. Louis)", code: def.code, url, unit: def.unit, frequency: "annual", updatedAt: today, points };
}

async function policyRate(): Promise<Series> {
  const file = path.join(MANUAL, "sbv-refinancing-rate.json");
  const manual = JSON.parse(await readFile(file, "utf8")) as { changes: { date: string; value: number }[] };
  const changes = [...manual.changes].sort((a, b) => a.date.localeCompare(b.date));
  const points = POLICY_COVERED_YEARS.map((year) => {
    const last = changes.filter((c) => Number(c.date.slice(0, 4)) <= year).at(-1)!;
    return { year, value: last.value };
  });
  return {
    id: "policy_rate",
    source: "Ngân hàng Nhà nước (tổng hợp thủ công)",
    code: "data/manual/sbv-refinancing-rate.json",
    url: "https://www.sbv.gov.vn",
    unit: "%/năm (cuối năm)",
    frequency: "annual",
    updatedAt: today,
    points,
  };
}

function netExports(exp: Series, imp: Series): Series {
  const im = new Map(imp.points.map((p) => [p.year, p.value]));
  const points = exp.points
    .filter((p) => im.has(p.year))
    .map((p) => ({ year: p.year, value: round(p.value - im.get(p.year)!) }));
  return { ...exp, id: "net_exports", code: `${exp.code} − ${imp.code}`, unit: "% GDP", points };
}

function round(v: number) {
  return Math.round(v * 100) / 100;
}

function report(s: Series) {
  const years = s.points.map((p) => p.year);
  if (!years.length) return `${s.id.padEnd(16)} TRỐNG`;
  const first = years[0];
  const last = years[years.length - 1];
  const missing = last - first + 1 - years.length;
  return `${s.id.padEnd(16)} ${first}–${last}  ${String(years.length).padStart(2)} năm  thiếu ${missing}`;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const all: Record<string, Series> = {};
  const jobs = [...WB.map(fetchWorldBank), ...IMF.map(fetchImf), ...FRED.map(fetchFred), policyRate()];
  const results = await Promise.allSettled(jobs);
  const defs = [...WB, ...IMF, ...FRED, { id: "policy_rate" }];
  let failed = 0;
  for (const [i, r] of results.entries()) {
    if (r.status === "rejected") {
      failed++;
      console.error(`LỖI ${defs[i].id}: ${r.reason}`);
      // Giữ bản cũ nếu có, để một lần mạng lỗi không xóa dữ liệu.
      try {
        all[defs[i].id] = JSON.parse(await readFile(path.join(OUT, `${defs[i].id}.json`), "utf8"));
      } catch {}
      continue;
    }
    all[r.value.id] = r.value;
    await writeFile(path.join(OUT, `${r.value.id}.json`), JSON.stringify(r.value, null, 2) + "\n");
    console.log(report(r.value));
  }
  if (all.exports && all.imports) {
    all.net_exports = netExports(all.exports, all.imports);
    await writeFile(path.join(OUT, "net_exports.json"), JSON.stringify(all.net_exports, null, 2) + "\n");
    console.log(report(all.net_exports));
  }
  await writeFile(path.join(OUT, "all.json"), JSON.stringify(all) + "\n");
  if (failed) process.exitCode = 1;
}

main();
