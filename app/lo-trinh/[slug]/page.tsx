import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INDICATOR_BY_ID } from "@/content/indicators";
import { LESSONS } from "@/content/lessons";
import { formatValue, getSeries, latest } from "@/lib/data";
import LessonQuiz from "@/components/LessonQuiz";
import LessonWidget from "@/components/LessonWidgets";
import { FEYNMAN } from "@/content/feynman";
import RichText from "@/components/RichText";
import LessonBeats from "@/components/lesson/LessonBeats";
import { LessonMap } from "@/components/lesson/GrowingMap";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${LESSONS.find((l) => l.slug === slug)?.title ?? "Bài học"} · Vĩ mô Việt Nam` };
}

export default function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense>
      <LessonContent params={params} />
    </Suspense>
  );
}

async function LessonContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idx = LESSONS.findIndex((l) => l.slug === slug);
  if (idx < 0) notFound();
  const lesson = LESSONS[idx];
  const feynman = FEYNMAN[lesson.slug];
  const widgets = feynman?.widgets ?? [];
  const next = LESSONS[idx + 1];

  if (lesson.beats) {
    return (
      <div className="max-w-3xl space-y-8">
        <div>
          <Link href="/lo-trinh" className="text-sm text-muted hover:text-text">← Lộ trình</Link>
          <div className="text-sm text-muted mt-3">
            Phố Cầu Tre · Tập {idx + 1} · khoảng {lesson.minutes} phút
          </div>
          <h1 className="text-2xl font-semibold">{lesson.title}</h1>
          <p className="text-lg text-muted mt-1">{lesson.question}</p>
          {lesson.recap && <p className="text-sm text-muted italic mt-3">{lesson.recap}</p>}
        </div>

        <LessonBeats slug={lesson.slug} beats={lesson.beats}>
          <LessonMap slug={lesson.slug} />
          <section>
            <h2 className="text-lg font-semibold mb-3">Thử xem đã chắc chưa</h2>
            <LessonQuiz slug={lesson.slug} quiz={lesson.quiz} />
          </section>
          <section className="space-y-4 border-t border-line pt-6">
            {lesson.hook && (
              <p className="text-lg font-medium leading-relaxed">
                <RichText text={lesson.hook} />
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {lesson.boss ? (
                <Link href={lesson.boss.href} className="px-4 py-2 rounded-lg bg-accent text-white">
                  {lesson.boss.label} →
                </Link>
              ) : (
                next && (
                  <Link href={`/lo-trinh/${next.slug}`} className="px-4 py-2 rounded-lg bg-accent text-white">
                    Tập {idx + 2}: {next.title} →
                  </Link>
                )
              )}
              <Link href={lesson.tryIt.href} className="px-4 py-2 rounded-lg border border-accent text-accent">
                {lesson.tryIt.label}
              </Link>
            </div>
          </section>
        </LessonBeats>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link href="/lo-trinh" className="text-sm text-muted hover:text-text">← Lộ trình</Link>
        <div className="text-sm text-muted mt-3">
          Bài {idx + 1}/{LESSONS.length} · khoảng {lesson.minutes} phút
        </div>
        <h1 className="text-2xl font-semibold">{lesson.title}</h1>
        <p className="text-lg text-muted mt-1">{lesson.question}</p>
      </div>

      {feynman && (
        <section className="rounded-xl border border-accent bg-accent-soft p-5 space-y-3">
          <div className="text-xs font-medium text-accent">Giải thích như cho một bạn nhỏ</div>
          <h2 className="text-lg font-semibold">{feynman.title}</h2>
          {feynman.story.map((p, k) => (
            <p key={k} className="leading-relaxed">
              {p}
            </p>
          ))}
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">Ý chính, nói kỹ hơn</h2>
        <ul className="space-y-2.5">
          {lesson.ideas?.map((idea, k) => (
            <li key={k} className="flex gap-3 leading-relaxed">
              <span className="text-accent font-semibold">{k + 1}.</span>
              <span>{idea}</span>
            </li>
          ))}
        </ul>
      </section>

      {widgets.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Tự tay thử</h2>
          {widgets.map((w) => (
            <LessonWidget key={w} id={w} />
          ))}
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">Các chỉ số trong bài</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {lesson.indicators.map((id) => {
            const ind = INDICATOR_BY_ID[id];
            const s = getSeries(ind.seriesId);
            const last = latest(s);
            return (
              <Link key={id} href={`/tu-dien/${id}`} className="block bg-surface border border-line rounded-xl p-4 hover:border-accent">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-medium">{ind.name}</span>
                  {last && (
                    <span className="text-sm tabular-nums text-muted">
                      {formatValue(last.value, s?.unit)} ({last.year})
                    </span>
                  )}
                </div>
                <p className="text-sm mt-1.5 leading-relaxed">{ind.plain}</p>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">Ví dụ: {ind.example}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Câu hỏi nhanh</h2>
        <LessonQuiz slug={lesson.slug} quiz={lesson.quiz} />
      </section>

      <section className="flex flex-wrap gap-3 border-t border-line pt-6">
        <Link href={lesson.tryIt.href} className="px-4 py-2 rounded-lg border border-accent text-accent">
          Thử ngay: {lesson.tryIt.label}
        </Link>
        {next ? (
          <Link href={`/lo-trinh/${next.slug}`} className="px-4 py-2 rounded-lg bg-accent text-white">
            Bài tiếp: {next.title} →
          </Link>
        ) : (
          <Link href="/thu-thach" className="px-4 py-2 rounded-lg bg-accent text-white">
            Thử làm Thống đốc →
          </Link>
        )}
      </section>
    </div>
  );
}
