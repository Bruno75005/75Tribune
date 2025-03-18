import { Metadata } from "next";
import { ClientForgotPasswordForm } from "@/components/auth/ClientForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié | 75Tribune",
  description: "Réinitialisez votre mot de passe 75Tribune",
};

export default function ForgotPasswordPage() {
  return (
    <div className="container relative h-[calc(100vh-4rem)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <ClientForgotPasswordForm />
      </div>
    </div>
  );
}
