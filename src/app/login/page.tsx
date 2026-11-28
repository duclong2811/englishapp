import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/account/login-form";
import { PageHeading } from "@/components/empty-state";

export const metadata: Metadata = { title: "Đăng nhập", robots: { index: false } };

export default function LoginPage() {
  return (
    <>
      <PageHeading title="Tài khoản" intro="Đăng nhập để dùng các tính năng AI và lưu tiến độ học trên mọi thiết bị." />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </>
  );
}
