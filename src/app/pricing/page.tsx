"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Clock, Video, Download, Code, Eye } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);

  const monthlyPrice = 5;
  const yearlyPrice = monthlyPrice * 10; // 2 mois gratuits

  const features = [
    {
      icon: Clock,
      text: "Visionner les tutoriels en avance",
    },
    {
      icon: Video,
      text: "Voir les vidéos premium",
    },
    {
      icon: Download,
      text: "Télécharger les vidéos",
    },
    {
      icon: Code,
      text: "Télécharger les sources",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold mb-4">Abonnement Premium</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Soutenez le projet et accédez à du contenu exclusif
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Colonne de gauche - Prix et fonctionnalités */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-primary-500 bg-primary-500/5 p-8"
          >
            <div className="space-y-6">
              {/* Toggle Mensuel/Annuel */}
              <div className="flex justify-center gap-4 mb-8">
                <Button
                  variant={!isYearly ? "default" : "outline"}
                  onClick={() => setIsYearly(false)}
                  className="relative"
                >
                  Mensuel
                  {!isYearly && (
                    <motion.div
                      layoutId="pricingSelector"
                      className="absolute inset-0 bg-primary rounded-md -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </Button>
                <Button
                  variant={isYearly ? "default" : "outline"}
                  onClick={() => setIsYearly(true)}
                  className="relative"
                >
                  Annuel
                  {isYearly && (
                    <motion.div
                      layoutId="pricingSelector"
                      className="absolute inset-0 bg-primary rounded-md -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </Button>
              </div>

              {/* Prix avec animation */}
              <div className="text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isYearly ? "yearly" : "monthly"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="text-4xl font-bold">
                      {isYearly ? `${yearlyPrice}€` : `${monthlyPrice}€`} TTC
                    </div>
                    <div className="text-sm text-muted-foreground">
                      /{isYearly ? "an" : "mois"}
                    </div>
                  </motion.div>
                </AnimatePresence>
                {isYearly && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm text-primary-500 font-medium mt-2"
                  >
                    2 mois gratuits !
                  </motion.div>
                )}
              </div>

              <motion.ul
                className="space-y-4 mt-8"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial="hidden"
                animate="show"
              >
                {features.map((feature, idx) => (
                  <motion.li
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 },
                    }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500/10">
                      <feature.icon className="h-5 w-5 text-primary-500" />
                    </div>
                    <span className="text-base">{feature.text}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-primary-500 text-white hover:bg-primary-600"
                size="lg"
              >
                Commencer maintenant
              </Button>
            </div>
          </motion.div>

          {/* Colonne de droite - Pourquoi cette offre */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold mb-6">
              Pourquoi cette offre ?
            </h2>

            <div className="prose dark:prose-invert">
              <p className="text-base leading-relaxed">
                Mon but à travers 75Tribune.fr est de partager mes connaissances
                avec le plus grand nombre, c&apos;est pourquoi j&apos;essaie de
                rendre un maximum de contenu gratuit et public.
              </p>

              <p className="text-base leading-relaxed mt-4">
                Malgré tout, la préparation, l&apos;enregistrement et le montage
                des tutoriels prend un temps considérable (10 à 20 heures par
                semaine). Du coup proposer des options payantes, comme le
                téléchargement des sources, me permet d&apos;amortir une partie
                du temps passé et de continuer à faire vivre le site.
              </p>
            </div>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                En vous abonnant, vous soutenez directement la création de
                contenu de qualité et permettez au projet de continuer à se
                développer.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
