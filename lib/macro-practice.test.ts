import { describe, expect, it } from "vitest";
import { loadPracticeQuestions } from "./macro-practice-data";
import { classifyDirection, directionChange, parseInterval, scoreInterval } from "./macro-practice";

describe("luyện đọc số liệu", () => {
  it("có sáu câu cho mỗi trò, với đủ dữ liệu so sánh và nguồn", () => {
    const direction = loadPracticeQuestions("doan-chieu");
    const estimation = loadPracticeQuestions("uoc-luong");
    expect(direction).toHaveLength(6);
    expect(estimation).toHaveLength(6);

    for (const question of [...direction, ...estimation]) {
      expect(Number.isFinite(question.previous)).toBe(true);
      expect(Number.isFinite(question.answer)).toBe(true);
      expect(question.source.url).toMatch(/^https:\/\//);
      expect(question.source.code).toBeTruthy();
    }

    expect(direction.map(({ previous, answer, unit }) => classifyDirection(directionChange(previous, answer, unit === "VND/USD"))))
      .toEqual(["down", "flat", "down", "up", "down", "up"]);
    expect(estimation.map(({ answer }) => answer)).toEqual([334.4, 292.5, 340.2, 433.8, 376.3, 398.8]);
  });

  it("phân loại đúng hai đầu ngưỡng và phân biệt % với điểm phần trăm", () => {
    expect(classifyDirection(directionChange(3, 3.1, false))).toBe("up");
    expect(classifyDirection(directionChange(3, 2.9, false))).toBe("down");
    expect(classifyDirection(directionChange(3, 3.099, false))).toBe("flat");
    expect(classifyDirection(directionChange(3, 2.901, false))).toBe("flat");
    expect(directionChange(20_000, 20_100, true)).toBe(0.5);
    expect(classifyDirection(directionChange(20_000, 20_020, true))).toBe("up");
  });

  it("chấm trúng ở cả hai đầu mút và thưởng khoảng hẹp hơn", () => {
    expect(scoreInterval(200, 200, 400)).toEqual({ correct: true, points: 50 });
    expect(scoreInterval(400, 200, 400)).toEqual({ correct: true, points: 50 });
    expect(scoreInterval(400.1, 200, 400)).toEqual({ correct: false, points: 0 });
    expect(scoreInterval(300, 290, 310).points).toBeGreaterThan(scoreInterval(300, 200, 400).points);
  });

  it("đọc hai kiểu dấu thập phân và loại bỏ khoảng không hợp lệ", () => {
    expect(parseInterval(" 330,4 ", "340.2")).toEqual({ low: 330.4, high: 340.2 });
    for (const [low, high] of [["0", "2"], ["-1", "2"], ["2", "2"], ["3", "2"], ["", "2"], ["1,2.3", "2"], ["1", "Infinity"], ["1", "9".repeat(400)]]) {
      expect(parseInterval(low, high)).toBeNull();
    }
  });
});
