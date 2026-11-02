"use client";

import { useEffect, useSyncExternalStore } from "react";
import { audioSupported, CLOUD_VOICES, getServerState, getState, setPref, speak, stop, subscribe, vietVoice, vietVoices } from "@/lib/speech";

const noop = () => () => {};

function useSpeech() {
  const s = useSyncExternalStore(subscribe, getState, getServerState);
  const supported = useSyncExternalStore(noop, audioSupported, () => false);
  return { ...s, supported };
}

/**
 * Nút "Nghe" cho một khối chữ. Khi bật "Kể chuyện", khối có `auto` tự đọc mỗi lần nội dung đổi:
 * bấm chọn phương án thì nghe chuyện gì xảy ra, bấm sang quý sau thì nghe tiếp. Nhịp vẫn do bạn bấm.
 */
export default function SpeakButton({ id, text, auto = false, className = "" }: { id: string; text: string; auto?: boolean; className?: string }) {
  const { speaking, loading, supported, auto: autoOn } = useSpeech();
  const on = speaking === id;

  useEffect(() => {
    if (auto && autoOn && text) speak(id, text);
  }, [auto, autoOn, id, text]);

  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={() => (on ? stop() : speak(id, text))}
      aria-pressed={on}
      aria-label={on ? "Dừng đọc" : "Nghe đọc đoạn này"}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs shrink-0 ${on ? "bg-accent text-white border-accent" : "border-line text-muted hover:text-text hover:border-accent"} ${className}`}
    >
      {on ? (loading ? "… Đang tải giọng" : "■ Dừng") : "🔊 Nghe"}
    </button>
  );
}

const RATES = [0.8, 1, 1.25, 1.5];

/** Thanh cài đặt giọng đọc: kể chuyện theo từng bước, loại giọng, tốc độ. */
export function VoiceBar() {
  const { supported, auto, rate, speaking, engine, cloudVoice, voice: browserVoice, error } = useSpeech();
  // Rời màn chơi thì thôi đọc.
  useEffect(() => stop, []);
  if (!supported) return null;
  const local = vietVoices();
  const current = vietVoice();
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        onClick={() => setPref({ auto: !auto })}
        aria-pressed={auto}
        className={`px-2.5 py-1 rounded-full border ${auto ? "bg-accent text-white border-accent" : "border-line"}`}
        title="Bật: mỗi lần bạn chọn phương án hoặc bấm sang quý sau, người dẫn chuyện kể lại chuyện vừa xảy ra."
      >
        🎧 Kể chuyện: {auto ? "bật" : "tắt"}
      </button>
      <label className="inline-flex items-center gap-1 text-muted">
        Giọng
        <select
          value={engine === "cloud" ? `cloud:${cloudVoice}` : `browser:${current?.name ?? browserVoice}`}
          onChange={(e) => {
            const [kind, name] = [e.target.value.slice(0, e.target.value.indexOf(":")), e.target.value.slice(e.target.value.indexOf(":") + 1)];
            if (kind === "cloud") setPref({ engine: "cloud", cloudVoice: name });
            else setPref({ engine: "browser", voice: name });
          }}
          className="rounded border border-line bg-surface px-1 py-0.5 text-text max-w-56"
        >
          {CLOUD_VOICES.length > 0 && (
            <optgroup label="Google (tự nhiên)">
              {CLOUD_VOICES.map((v) => (
                <option key={v.name} value={`cloud:${v.name}`}>
                  {v.label}
                </option>
              ))}
            </optgroup>
          )}
          {local.length > 0 && (
            <optgroup label="Có sẵn trong trình duyệt">
              {local.map((v) => (
                <option key={v.name} value={`browser:${v.name}`}>
                  {v.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </label>
      <span className="text-muted">Tốc độ</span>
      {RATES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setPref({ rate: r })}
          aria-pressed={rate === r}
          className={`px-2 py-0.5 rounded-full border tabular-nums ${rate === r ? "border-accent text-accent" : "border-line text-muted"}`}
        >
          {r.toLocaleString("vi-VN")}×
        </button>
      ))}
      <button type="button" onClick={() => speak("test", "Xin chào. Tôi sẽ là người dẫn chuyện, kể cho bạn nghe chuyện gì xảy ra sau mỗi quyết định.")} className="px-2 py-0.5 rounded-full border border-line">
        Thử giọng
      </button>
      {speaking && (
        <button type="button" onClick={stop} className="px-2 py-0.5 rounded-full border border-line">
          ■ Dừng đọc
        </button>
      )}
      {error && <span style={{ color: "var(--down)" }}>{error}</span>}
    </div>
  );
}
