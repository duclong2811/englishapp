import type { Metadata } from "next";
import Link from "next/link";
import { AdminUserPage } from "@/components/account/admin-user";
import { getLearningCatalog } from "@/lib/account/catalog";

export const metadata: Metadata = { title: "Hồ sơ học sinh", robots: { index: false } };

export default async function AdminUser({ params }: PageProps<"/admin/users/[id]">) {
  const { id } = await params;
  const catalog = await getLearningCatalog();
  return (
    <>
      <Link href="/admin" className="back-link">
        Quản trị
      </Link>
      <h1 className="mb-6 mt-3 text-3xl font-semibold tracking-tight">Hồ sơ học sinh</h1>
      <AdminUserPage id={id} catalog={catalog} />
    </>
  );
}
