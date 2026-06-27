import { Suspense } from "react";
import LoginForm from "@/components/forms/auth/login-form";
import LayoutLoader from "@/components/layout-loader";

export default function LoginPage() {
  return (
    <Suspense fallback={<LayoutLoader />}>
      <LoginForm />
    </Suspense>
  );
}
