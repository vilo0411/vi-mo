import { CAST_BY_ID, STREET, type Voice } from "@/content/world";

/** Tin nhắn từ phố: người thật chịu hậu quả của quyết định. */
export default function StreetFeed({ voices, title = `Tin nhắn từ ${STREET}` }: { voices: Voice[]; title?: string }) {
  if (!voices.length) return null;
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted">{title}</div>
      {voices.map((v) => {
        const c = CAST_BY_ID[v.by];
        return (
          <div key={v.by} className="flex gap-2.5 items-start">
            <span className="w-8 h-8 shrink-0 rounded-full bg-surface-2 grid place-items-center" aria-hidden>
              {c.icon}
            </span>
            <div className="rounded-xl rounded-tl-sm bg-surface-2 px-3 py-2 text-sm leading-relaxed">
              <span className="font-medium">{c.name}</span> <span className="text-xs text-muted">· {c.role}</span>
              <div>{v.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
