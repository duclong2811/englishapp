import { AI_FEATURE_VI, type AiFeature } from "@/lib/ai/policy";

export const date = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "—");
export const featureName = (f: string) => (f === "transcribe" ? "Nhận giọng nói" : (AI_FEATURE_VI[f as AiFeature] ?? f));

/** Millionths of a dollar as "$0.0123" (small amounts need more digits). */
export function usd(micro: number) {
  const v = micro / 1_000_000;
  return `$${v >= 10 ? v.toFixed(2) : v >= 0.1 ? v.toFixed(3) : v.toFixed(4)}`;
}

/** "3 ngày trước" style relative time. */
export function ago(iso: string | null | undefined) {
  if (!iso) return "chưa có";
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (mins < 2) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days} ngày trước` : date(iso);
}
