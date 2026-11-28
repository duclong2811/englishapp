import { TodayView } from "@/components/today/today-view";
import { getLearningCatalog } from "@/lib/account/catalog";

export default async function TodayPage() {
  const catalog = await getLearningCatalog();
  return <TodayView catalog={catalog} />;
}
