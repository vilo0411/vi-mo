import Link from "next/link";
import { CASES } from "@/content/cases";

export const metadata = { title: "Case study · Vĩ mô Việt Nam" };

export default function CasesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold">Case study: những giai đoạn đáng nhớ của kinh tế Việt Nam</h1>
        <p className="text-sm text-muted mt-1 max-w-3xl">
          Mỗi bài kể lại một giai đoạn thật theo từng bước, mỗi bước tô sáng các chỉ số và mũi tên liên quan trên bản đồ. Nên đọc theo thứ tự thời gian vì giai đoạn sau thường là hậu quả của giai đoạn trước.
        </p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2">
        {CASES.map((c, k) => (
          <li key={c.slug}>
            <Link href={`/case-study/${c.slug}`} className="block h-full bg-surface border border-line rounded-xl p-5 hover:border-accent transition-colors">
              <div className="text-xs text-muted">
                {k + 1} · {c.period}
              </div>
              <div className="font-semibold mt-1">{c.title}</div>
              <p className="text-sm text-muted mt-2 leading-relaxed">{c.summary}</p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
