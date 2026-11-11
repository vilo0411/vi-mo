import { PRACTICE_QUESTIONS, type PracticeGameId, type PracticeQuestion } from "@/content/macro-practice";
import { getSeries, valueAt } from "./data";

export function loadPracticeQuestions(gameId: PracticeGameId): PracticeQuestion[] {
  return PRACTICE_QUESTIONS[gameId].map(({ seriesId, ...question }) => {
    const series = getSeries(seriesId);
    const previous = valueAt(series, question.year - 1);
    const current = valueAt(series, question.year);
    if (!series || previous === undefined || current === undefined) {
      throw new Error(`Thiếu dữ liệu luyện đọc cho ${seriesId} (${question.year - 1}–${question.year})`);
    }

    const unit = gameId === "uoc-luong" ? "tỷ USD" : seriesId === "fx_rate" ? "VND/USD" : "%";
    const answer = unit === "tỷ USD" ? Number(current.toFixed(1)) : current;
    const { url, source, code, updatedAt } = series;
    return { ...question, previous, answer, unit, source: { url, source, code, updatedAt } };
  });
}
