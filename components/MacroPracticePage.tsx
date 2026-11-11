import Link from "next/link";
import { PRACTICE_GAMES, type PracticeGameId } from "@/content/macro-practice";
import { loadPracticeQuestions } from "@/lib/macro-practice-data";
import MacroPracticePlayer from "./MacroPracticePlayer";

export default function MacroPracticePage({ gameId }: { gameId: PracticeGameId }) {
  const game = PRACTICE_GAMES[gameId];

  return (
    <div className="max-w-3xl space-y-5">
      <Link href="/thu-thach" className="inline-block text-sm text-muted hover:text-text">← Tất cả thử thách</Link>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">{game.title}</h1>
        <p className="text-muted leading-relaxed">{game.description}</p>
      </header>
      <MacroPracticePlayer gameId={gameId} questions={loadPracticeQuestions(gameId)} />
    </div>
  );
}
