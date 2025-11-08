import SuspenseWrapper from "@/components/Suspense";
import ForgotPasswordClient from "./ForgotPasswordForm";

export default function Page() {
  return (
    <SuspenseWrapper>
      <ForgotPasswordClient />
    </SuspenseWrapper>
  );
}
