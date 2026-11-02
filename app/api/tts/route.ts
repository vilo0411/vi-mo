import { synthesize, ttsConfigured } from "@/lib/server/tts";

const MAX_CHARS = 1200;
const VOICE = /^vi-VN-[A-Za-z0-9-]{1,40}$/;

/** Đổi một đoạn chữ tiếng Việt thành MP3 bằng Google Cloud Text-to-Speech. */
export async function POST(req: Request) {
  if (!ttsConfigured()) return Response.json({ error: "Chưa cấu hình GCP_SA_KEY" }, { status: 503 });
  let body: { text?: unknown; voice?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body không phải JSON" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const voice = typeof body.voice === "string" && VOICE.test(body.voice) ? body.voice : "vi-VN-Chirp3-HD-Aoede";
  if (!text || text.length > MAX_CHARS) return Response.json({ error: `Cần 1–${MAX_CHARS} ký tự` }, { status: 400 });
  try {
    const mp3 = await synthesize(text, voice);
    return new Response(new Uint8Array(mp3), { headers: { "content-type": "audio/mpeg", "cache-control": "private, max-age=86400" } });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Lỗi tạo giọng" }, { status: 502 });
  }
}
