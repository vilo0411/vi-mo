import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Gọi Google Cloud Text-to-Speech bằng service account trong biến môi trường GCP_SA_KEY (JSON của khoá).
 * Chỉ chạy trên máy chủ: khoá không bao giờ được gửi xuống trình duyệt.
 */

type ServiceAccount = { client_email: string; private_key: string; token_uri: string };

let account: ServiceAccount | null | undefined;
function serviceAccount(): ServiceAccount | null {
  if (account !== undefined) return account;
  const raw = process.env.GCP_SA_KEY?.trim();
  if (!raw) return (account = null);
  try {
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const k = JSON.parse(json) as ServiceAccount;
    account = { client_email: k.client_email, private_key: k.private_key, token_uri: k.token_uri ?? "https://oauth2.googleapis.com/token" };
  } catch {
    account = null;
  }
  return account;
}

export const ttsConfigured = () => serviceAccount() !== null;

let token: { value: string; exp: number } | null = null;

async function accessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (token && token.exp - 60 > now) return token.value;
  const sa = serviceAccount();
  if (!sa) throw new Error("GCP_SA_KEY chưa được cấu hình");
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/cloud-platform", aud: sa.token_uri, iat: now, exp: now + 3600 })}`;
  const sig = crypto.createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  });
  const j = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!j.access_token) throw new Error(`Không lấy được token Google: ${j.error_description ?? res.status}`);
  token = { value: j.access_token, exp: now + (j.expires_in ?? 3600) };
  return token.value;
}

// Bộ nhớ đệm trong tiến trình: cùng một câu với cùng một giọng thì không gọi Google lần nữa.
const cache = new Map<string, Buffer>();
const CACHE_MAX = 400;

// Bộ nhớ đệm trên đĩa: khởi động lại máy chủ vẫn không phải gọi Google lại. Ghi lỗi (ví dụ ổ chỉ đọc) thì bỏ qua.
const DISK_DIR = process.env.TTS_CACHE_DIR ?? path.join(process.cwd(), ".cache", "tts");

async function readDisk(key: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(path.join(DISK_DIR, `${key}.mp3`));
  } catch {
    return null;
  }
}

async function writeDisk(key: string, buf: Buffer) {
  try {
    await fs.mkdir(DISK_DIR, { recursive: true });
    await fs.writeFile(path.join(DISK_DIR, `${key}.mp3`), buf);
  } catch {}
}

const inflight = new Map<string, Promise<Buffer>>();

export async function synthesize(text: string, voice: string): Promise<Buffer> {
  const key = crypto.createHash("sha1").update(`${voice}|${text}`).digest("hex");
  const hit = cache.get(key) ?? (await readDisk(key));
  if (hit) {
    cache.set(key, hit);
    return hit;
  }
  // Hai yêu cầu cùng câu cùng lúc (tải trước và bấm nghe) thì chỉ gọi Google một lần.
  let job = inflight.get(key);
  if (!job) {
    job = callGoogle(text, voice, key).finally(() => inflight.delete(key));
    inflight.set(key, job);
  }
  return job;
}

async function callGoogle(text: string, voice: string, key: string): Promise<Buffer> {
  const res = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
    method: "POST",
    headers: { authorization: `Bearer ${await accessToken()}`, "content-type": "application/json" },
    body: JSON.stringify({ input: { text }, voice: { languageCode: "vi-VN", name: voice }, audioConfig: { audioEncoding: "MP3" } }),
  });
  const j = (await res.json()) as { audioContent?: string; error?: { message?: string } };
  if (!j.audioContent) throw new Error(j.error?.message ?? `Google TTS lỗi ${res.status}`);
  const buf = Buffer.from(j.audioContent, "base64");
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
  cache.set(key, buf);
  void writeDisk(key, buf);
  return buf;
}
