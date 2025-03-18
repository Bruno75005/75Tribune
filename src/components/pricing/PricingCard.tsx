'use client';

import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: PricingFeature[];
  isPopular?: boolean;
  buttonText?: string;
  onSubscribe?: () => void;
  index?: number;
}

export default function PricingCard({
  title,
  price,
  description,
  features,
  isPopular = false,
  buttonText = "Choisir",
  onSubscribe,
  index = 0,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "relative rounded-2xl border p-8",
        isPopular
          ? "border-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/20"
          : "border-border bg-card"
      )}
    >
      {isPopular && (
        <div className="absolute -top-5 left-0 right-0 mx-auto w-fit">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-sm font-medium text-white"
          >
            <Star className="h-3.5 w-3.5" />
            Plus populaire
          </motion.div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>

        <div className="flex items-baseline">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Gratuit" && <span className="ml-1 text-muted-foreground">/mois</span>}
        </div>

        <motion.ul 
          className="space-y-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
              },
            },
          }}
        >
          {features.map((feature, idx) => (
            <motion.li
              key={idx}
              variants={{
                hidden: { opacity: 0, x: -10 },
                show: { opacity: 1, x: 0 },
              }}
              className="flex items-center gap-3"
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  feature.included
                    ? "bg-primary-500"
                    : "bg-muted"
                )}
              >
                <Check className={cn(
                  "h-4 w-4",
                  feature.included ? "text-white" : "text-muted-foreground/40"
                )} />
              </div>
              <span className={cn(
                "text-sm",
                !feature.included && "text-muted-foreground"
              )}>
                {feature.text}
              </span>
            </motion.li>
          ))}
        </motion.ul>

        <Button
          onClick={onSubscribe}
          className={cn(
            "w-full",
            isPopular
              ? "bg-primary-500 text-white hover:bg-primary-600"
              : "bg-card"
          )}
          variant={isPopular ? "default" : "outline"}
          size="lg"
        >
          {buttonText}
        </Button>
      </div>
    </motion.div>
  );
}
