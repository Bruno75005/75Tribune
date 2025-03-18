import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation | 75Tribune",
  description: "Conditions d'utilisation de la plateforme 75Tribune",
};

export default function TermsPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Conditions d&apos;utilisation</h1>
          <p className="mt-2 text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString()}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            1. Acceptation des conditions
          </h2>
          <p>
            En accédant et en utilisant la plateforme 75Tribune, vous acceptez
            d&apos;être lié par ces conditions d&apos;utilisation. Si vous
            n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre
            service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Description du service</h2>
          <p>
            75Tribune est une plateforme SaaS qui fournit [description de vos
            services]. Nous nous réservons le droit de modifier, suspendre ou
            interrompre tout aspect du service à tout moment.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Confidentialité</h2>
          <p>
            Votre utilisation de 75Tribune est également régie par notre
            politique de confidentialité. Veuillez consulter notre politique de
            confidentialité pour comprendre nos pratiques.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Comptes utilisateurs</h2>
          <p>
            Vous êtes responsable du maintien de la confidentialité de votre
            compte et mot de passe. Vous acceptez de nous notifier immédiatement
            de toute utilisation non autorisée de votre compte.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            5. Propriété intellectuelle
          </h2>
          <p>
            Tout le contenu présent sur 75Tribune, incluant mais non limité aux
            textes, graphiques, logos, et code source, est la propriété de
            75Tribune et est protégé par les lois sur la propriété
            intellectuelle.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            6. Limitation de responsabilité
          </h2>
          <p>
            75Tribune ne sera pas responsable des dommages directs, indirects,
            accessoires, spéciaux ou consécutifs résultant de l&apos;utilisation
            ou de l&apos;impossibilité d&apos;utiliser nos services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            7. Modifications des conditions
          </h2>
          <p>
            Nous nous réservons le droit de modifier ces conditions à tout
            moment. Les modifications entrent en vigueur dès leur publication
            sur cette page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Contact</h2>
          <p>
            Si vous avez des questions concernant ces conditions, veuillez nous
            contacter à{" "}
            <a
              href="mailto:contact@75Tribune.com"
              className="text-primary hover:underline"
            >
              contact@75Tribune.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
