import { Metadata } from "next";
import { ClientLoginForm } from "@/components/auth/ClientLoginForm";

export const metadata: Metadata = {
  title: "Connexion | 75Tribune",
  description: "Connectez-vous à votre compte 75Tribune",
};

export default function LoginPage() {
  return (
    <div className="container relative h-[calc(100vh-4rem)] flex items-center justify-center lg:max-w-none lg:px-0 bg-darkBg">
      <div className="mx-auto w-full max-w-md p-6">
        <div className="bg-darkCard border-1 border-darkBorder rounded-xl shadow-sm p-7 space-y-5">
          <h1 className="text-3xl font-bold text-center text-darkText bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Connexion
          </h1>
          <ClientLoginForm />
          <p className="text-center text-sm text-muted:foreground">
            Pas encore de compte ?{" "}
            <a href="/register" className="text-primary hover:underline">
              Inscrivez-vous
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
