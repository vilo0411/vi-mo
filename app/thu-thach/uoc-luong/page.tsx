import MacroPracticePage from "@/components/MacroPracticePage";
import { PRACTICE_GAMES } from "@/content/macro-practice";

export const metadata = { title: `${PRACTICE_GAMES["uoc-luong"].title} · Vĩ mô Việt Nam` };

export default function EstimationPage() {
  return <MacroPracticePage gameId="uoc-luong" />;
}
