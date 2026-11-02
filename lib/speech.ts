"use client";

/**
 * Giọng đọc. Mặc định dùng Google Cloud Text-to-Speech qua route /api/tts (giọng Chirp3-HD, tự nhiên như người kể chuyện).
 * Nếu máy chủ chưa có khoá hoặc mạng lỗi thì lùi về giọng có sẵn của trình duyệt (Web Speech API).
 * Chỉ một đoạn được đọc tại một thời điểm; đoạn mới bắt đầu thì đoạn cũ dừng.
 */

export type Engine = "cloud" | "browser";

type State = {
  speaking: string | null;
  /** Đang chờ máy chủ tạo giọng cho đoạn này */
  loading: boolean;
  rate: number;
  auto: boolean;
  engine: Engine;
  cloudVoice: string;
  /** Giọng trình duyệt đã chọn hoặc đã chạy được */
  voice: string;
  voices: number;
  error: string;
};

/** Bản tĩnh (GitHub Pages) không có máy chủ /api/tts, nên chỉ dùng giọng trình duyệt. */
export const CLOUD_AVAILABLE = process.env.NEXT_PUBLIC_STATIC_EXPORT !== "1";

const ALL_CLOUD_VOICES: { name: string; label: string }[] = [
  { name: "vi-VN-Chirp3-HD-Aoede", label: "Aoede · nữ, ấm" },
  { name: "vi-VN-Chirp3-HD-Kore", label: "Kore · nữ, rõ ràng" },
  { name: "vi-VN-Chirp3-HD-Leda", label: "Leda · nữ, trẻ" },
  { name: "vi-VN-Chirp3-HD-Charon", label: "Charon · nam, trầm" },
  { name: "vi-VN-Chirp3-HD-Orus", label: "Orus · nam, chắc" },
  { name: "vi-VN-Chirp3-HD-Puck", label: "Puck · nam, vui" },
];
export const CLOUD_VOICES = CLOUD_AVAILABLE ? ALL_CLOUD_VOICES : [];

const PREF_KEY = "vi-mo:voice:v2";
const listeners = new Set<() => void>();
const DEFAULTS: State = { speaking: null, loading: false, rate: 1, auto: true, engine: CLOUD_AVAILABLE ? "cloud" : "browser", cloudVoice: ALL_CLOUD_VOICES[0].name, voice: "", voices: 0, error: "" };
let state: State = DEFAULTS;
let loadedPrefs = false;

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  for (const l of listeners) l();
}

function loadPrefs() {
  if (loadedPrefs || typeof window === "undefined") return;
  loadedPrefs = true;
  try {
    const p = JSON.parse(localStorage.getItem(PREF_KEY) ?? "{}") as Partial<State>;
    state = {
      ...state,
      rate: typeof p.rate === "number" ? p.rate : 1,
      auto: typeof p.auto === "boolean" ? p.auto : true,
      engine: p.engine === "browser" || !CLOUD_AVAILABLE ? "browser" : "cloud",
      cloudVoice: ALL_CLOUD_VOICES.some((v) => v.name === p.cloudVoice) ? p.cloudVoice! : ALL_CLOUD_VOICES[0].name,
      voice: typeof p.voice === "string" ? p.voice : "",
    };
  } catch {}
  if ("speechSynthesis" in window) {
    // Danh sách giọng của trình duyệt nạp trễ trên Chrome: báo lại khi có.
    state = { ...state, voices: speechSynthesis.getVoices().length };
    speechSynthesis.addEventListener("voiceschanged", () => set({ voices: speechSynthesis.getVoices().length }));
  }
}

function savePrefs() {
  try {
    const { rate, auto, engine, cloudVoice, voice } = state;
    localStorage.setItem(PREF_KEY, JSON.stringify({ rate, auto, engine, cloudVoice, voice }));
  } catch {}
}

export function subscribe(l: () => void) {
  loadPrefs();
  listeners.add(l);
  return () => listeners.delete(l);
}

export const getState = () => state;
export const getServerState = () => DEFAULTS;

/** Có phát được tiếng không: trình duyệt nào cũng có thẻ audio, nên luôn có giọng Google; giọng trình duyệt là phần thêm. */
const browserTts = () => typeof window !== "undefined" && "speechSynthesis" in window;
export const audioSupported = () => (CLOUD_AVAILABLE ? typeof window !== "undefined" && typeof Audio !== "undefined" : browserTts());

/** Các giọng tiếng Việt của trình duyệt, giọng tốt nhất trước. */
export function vietVoices(): SpeechSynthesisVoice[] {
  if (!browserTts()) return [];
  const vi = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith("vi"));
  const rank = (v: SpeechSynthesisVoice) => (/natural|online|neural/i.test(v.name) ? 0 : v.localService ? 1 : 2);
  return vi.sort((a, b) => rank(a) - rank(b));
}

function candidates(): (SpeechSynthesisVoice | null)[] {
  const list = vietVoices();
  const pref = list.find((v) => v.name === state.voice);
  return [...(pref ? [pref] : []), ...list.filter((v) => v !== pref), null];
}

export function vietVoice(): SpeechSynthesisVoice | undefined {
  return candidates()[0] ?? undefined;
}

/** Làm sạch chữ trước khi đọc: bỏ emoji, đọc ký hiệu bằng lời. */
export function toSpeech(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .replace(/\s*→\s*/g, ", sang ")
    .replace(/≤/g, " không quá ")
    .replace(/≥/g, " ít nhất ")
    .replace(/−/g, "âm ")
    .replace(/\+(?=\d)/g, "cộng ")
    .replace(/(\d)\s*%/g, "$1 phần trăm")
    .replace(/%/g, " phần trăm")
    .replace(/(\d)\s*đ(?!\p{L})/gu, "$1 đồng")
    .replace(/(\d)\.(\d{3})/g, "$1$2")
    .replace(/(\d),0(?!\d)/g, "$1")
    .replace(/(\d),(\d)/g, "$1 phẩy $2")
    .replace(/\s*·\s*/g, ". ")
    .replace(/[“”"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cắt thành từng câu (cho giọng trình duyệt) hoặc từng cụm câu tới `max` ký tự (cho Google, ít lượt gọi hơn). */
export function chunks(text: string, max = 220): string[] {
  const out: string[] = [];
  let cur = "";
  for (const s of text.split(/(?<=[.!?:;])\s+/)) {
    if (!s.trim()) continue;
    const pieces = s.length <= max ? [s] : s.split(/(?<=,)\s+/);
    for (const p of pieces) {
      if (cur && cur.length + p.length + 1 > max) {
        out.push(cur);
        cur = p;
      } else cur = cur ? `${cur} ${p}` : p;
    }
  }
  if (cur) out.push(cur);
  return out;
}

// ---------- Giọng Google ----------

const CLOUD_CHUNK = 600;

const audioCache = new Map<string, Promise<string>>();
let audio: HTMLAudioElement | null = null;
let endCurrent: (() => void) | null = null;
let ticket = 0;

function fetchAudio(text: string, voice: string): Promise<string> {
  const key = `${voice}|${text}`;
  let p = audioCache.get(key);
  if (!p) {
    p = fetch("/api/tts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, voice }) }).then(async (r) => {
      if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { error?: string }).error ?? `HTTP ${r.status}`);
      return URL.createObjectURL(await r.blob());
    });
    p.catch(() => audioCache.delete(key));
    audioCache.set(key, p);
  }
  return p;
}

// Tải trước: xếp hàng các đoạn sắp đọc, gọi tối đa 3 đoạn cùng lúc để không tranh băng thông với đoạn đang đọc.
const prefetchQueue: { text: string; voice: string }[] = [];
let prefetching = 0;
const PREFETCH_PARALLEL = 3;

function pump() {
  while (prefetching < PREFETCH_PARALLEL && prefetchQueue.length) {
    const job = prefetchQueue.shift()!;
    if (audioCache.has(`${job.voice}|${job.text}`)) continue;
    prefetching++;
    fetchAudio(job.text, job.voice)
      .catch(() => {})
      .finally(() => {
        prefetching--;
        pump();
      });
  }
}

/**
 * Tải trước giọng đọc cho những đoạn sắp tới (ví dụ các quý còn lại của năm), để khi bấm là nghe ngay.
 * Chỉ áp dụng cho giọng Google; cắt đoạn đúng như lúc đọc nên dùng lại được bản đã tải.
 */
export function prefetch(texts: string[]) {
  loadPrefs();
  if (state.engine !== "cloud" || !audioSupported()) return;
  const voice = state.cloudVoice;
  for (const t of texts) {
    const clean = toSpeech(t);
    if (!clean) continue;
    for (const c of chunks(clean, CLOUD_CHUNK)) if (!audioCache.has(`${voice}|${c}`)) prefetchQueue.push({ text: c, voice });
  }
  pump();
}

function playUrl(url: string): Promise<void> {
  audio ??= new Audio();
  const a = audio;
  return new Promise<void>((resolve, reject) => {
    endCurrent = resolve;
    a.onended = () => resolve();
    a.onerror = () => reject(new Error("Không phát được âm thanh"));
    a.src = url;
    a.playbackRate = state.rate;
    a.play().catch(reject);
  });
}

async function runCloud(id: string, parts: string[], my: number) {
  const voice = state.cloudVoice;
  // Gọi trước mọi đoạn cùng lúc để đoạn sau sẵn sàng khi đoạn trước đọc xong.
  const urls = parts.map((p) => fetchAudio(p, voice));
  for (const u of urls) {
    const url = await u;
    if (my !== ticket) return;
    if (state.loading) set({ loading: false });
    await playUrl(url);
    if (my !== ticket) return;
  }
  finish(id);
}

// ---------- Giọng trình duyệt ----------

// Giữ tham chiếu tới các lượt đọc: Chrome dọn rác utterance đang đọc thì im bặt và không báo onend.
let queue: SpeechSynthesisUtterance[] = [];

function runBrowser(id: string, parts: string[], from = 0, tried = 0) {
  const list = candidates();
  const voice = list[tried];
  if (tried >= list.length) return finish(id);
  queue = parts.slice(from).map((p, j) => {
    const k = from + j;
    const u = new SpeechSynthesisUtterance(p);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else u.lang = "vi-VN";
    u.rate = state.rate;
    u.onerror = (e) => {
      if (e.error === "interrupted" || e.error === "canceled" || state.speaking !== id) return;
      console.warn("[vi-mo:speech]", e.error, voice?.name ?? "(mặc định)");
      if (["synthesis-failed", "voice-unavailable", "language-unavailable"].includes(e.error) && tried + 1 < list.length) {
        speechSynthesis.cancel();
        setTimeout(() => state.speaking === id && runBrowser(id, parts, k, tried + 1), 120);
        return;
      }
      set({ error: `${e.error} (${voice?.name ?? "giọng mặc định"})` });
      finish(id);
    };
    u.onstart = () => {
      if (voice && state.voice !== voice.name) {
        set({ voice: voice.name });
        savePrefs();
      }
    };
    if (k === parts.length - 1) u.onend = () => finish(id);
    return u;
  });
  speechSynthesis.resume();
  for (const u of queue) speechSynthesis.speak(u);
}

// ---------- Điều khiển chung ----------

function finish(id: string) {
  if (state.speaking === id) set({ speaking: null, loading: false });
}

function halt() {
  ticket++;
  if (audio) audio.pause();
  endCurrent?.();
  endCurrent = null;
  if (browserTts()) speechSynthesis.cancel();
}

export function stop() {
  halt();
  if (state.speaking !== null || state.loading) set({ speaking: null, loading: false });
}

export function speak(id: string, text: string) {
  if (!audioSupported()) return;
  const clean = toSpeech(text);
  if (!clean) return;
  const wasBrowser = browserTts() && (speechSynthesis.speaking || speechSynthesis.pending);
  halt();
  const my = ticket;
  set({ speaking: id, error: "", loading: state.engine === "cloud" });
  const viaBrowser = () => {
    if (!browserTts()) return finish(id);
    const parts = chunks(clean);
    // Chrome bỏ qua lệnh đọc gọi ngay sau cancel(), nên chờ một nhịp khi vừa dừng đoạn cũ.
    if (wasBrowser) setTimeout(() => my === ticket && runBrowser(id, parts), 120);
    else runBrowser(id, parts);
  };
  if (state.engine === "browser") return viaBrowser();
  runCloud(id, chunks(clean, CLOUD_CHUNK), my).catch((e: Error) => {
    if (my !== ticket) return;
    console.warn("[vi-mo:speech] giọng Google lỗi, chuyển sang giọng trình duyệt:", e.message);
    set({ loading: false, error: /NotAllowed/i.test(e.name) ? "Trình duyệt chặn tự phát tiếng: bấm Nghe một lần để cho phép." : `Giọng Google lỗi: ${e.message}` });
    if (!/NotAllowed/i.test(e.name)) viaBrowser();
    else finish(id);
  });
}

export function setPref(patch: Partial<Pick<State, "rate" | "auto" | "engine" | "cloudVoice" | "voice">>) {
  set(patch);
  savePrefs();
  if (patch.auto === false) stop();
  if (patch.rate && audio) audio.playbackRate = patch.rate;
}
