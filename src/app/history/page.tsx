import type { Metadata } from "next";
import { HistoryDashboard } from "./HistoryDashboard";

export const metadata: Metadata = { title: "All-time" };

export default function HistoryPage() {
  return <HistoryDashboard />;
}
