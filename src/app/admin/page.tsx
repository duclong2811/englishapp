import type { Metadata } from "next";
import { AdminPage } from "@/components/account/admin-page";
import { PageHeading } from "@/components/empty-state";

export const metadata: Metadata = { title: "Quản trị", robots: { index: false } };

export default function Admin() {
  return (
    <>
      <PageHeading title="Quản trị" intro="Người dùng, quyền và lượt dùng AI." />
      <AdminPage />
    </>
  );
}
