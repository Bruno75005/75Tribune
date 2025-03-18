import { Metadata } from "next";
import { ClientRegisterForm } from "@/components/auth/ClientRegisterForm";

export const metadata: Metadata = {
  title: "Inscription | 75Tribune",
  description: "Inscrivez-vous à 75Tribune pour accéder à nos services",
};

export default function RegisterPage() {
  return (
    <div className="container relative h-[calc(100vh-4rem)] flex items-center justify-center lg:max-w-none lg:px-0 bg-darkBg">
      <div className="mx-auto w-full max-w-md p-6">
        <div className="bg-darkCard border-1 border-darkBorder rounded-xl shadow-sm p-7 space-y-5">
          <h1 className="text-3xl font-bold text-center text-darkText bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Inscription
          </h1>
          <ClientRegisterForm />
          <p className="text-center text-sm text-muted:foreground">
            Déjà un compte ?{" "}
            <a href="/login" className="text-primary hover:underline">
              Connectez-vous
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
