import MacroPracticePage from "@/components/MacroPracticePage";
import { PRACTICE_GAMES } from "@/content/macro-practice";

export const metadata = { title: `${PRACTICE_GAMES["doan-chieu"].title} · Vĩ mô Việt Nam` };

export default function DirectionPage() {
  return <MacroPracticePage gameId="doan-chieu" />;
}
