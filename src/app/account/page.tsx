import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";
import { PageHeading } from "@/components/empty-state";
import { getLearningCatalog } from "@/lib/account/catalog";

export const metadata: Metadata = { title: "Trang cá nhân", robots: { index: false } };

export default async function Account() {
  const catalog = await getLearningCatalog();
  return (
    <>
      <PageHeading title="Trang cá nhân" intro="Thông tin tài khoản, lượt dùng AI hôm nay và tiến độ học của bạn." />
      <AccountPage catalog={catalog} />
    </>
  );
}
