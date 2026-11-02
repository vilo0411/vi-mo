import Link from "next/link";
import Glossary from "@/components/Glossary";
import { TERMS } from "@/content/glossary";

export const metadata = { title: "Thuật ngữ · Vĩ mô Việt Nam" };

export default function GlossaryPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Thuật ngữ kinh tế vĩ mô</h1>
        <p className="text-muted mt-2 max-w-3xl leading-relaxed">
          {TERMS.length} khái niệm hay gặp khi đọc tin kinh tế, giải thích bằng lời thường. Các chỉ số có trên bản đồ (GDP, CPI, tỷ giá…) được giải thích kỹ hơn trong{" "}
          <Link href="/tu-dien" className="text-accent">Từ điển chỉ số</Link>.
        </p>
      </div>
      <Glossary />
    </div>
  );
}
