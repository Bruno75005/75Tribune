'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Sparkles, LogIn, Clock, Download } from 'lucide-react';
import { normalizeImagePath } from '@/lib/image';

// Composant Confetti amélioré
const Confetti = ({ isHovered }: { isHovered: boolean }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {isHovered && Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: "50%", 
            y: "50%", 
            scale: 0,
            opacity: 1 
          }}
          animate={{ 
            x: `${Math.random() * 400 - 200}%`,
            y: `${Math.random() * 400 - 200}%`,
            scale: Math.random() * 2.5,
            opacity: 0,
            rotate: Math.random() * 360
          }}
          transition={{ 
            duration: 1.2 + Math.random() * 0.8,
            ease: [0.23, 1, 0.32, 1],
            delay: Math.random() * 0.2
          }}
          className={`absolute w-3 h-3 rounded-full ${
            [
              'bg-primary shadow-lg shadow-primary/50',
              'bg-secondary shadow-lg shadow-secondary/50',
              'bg-blue-400 shadow-lg shadow-blue-400/50',
              'bg-purple-400 shadow-lg shadow-purple-400/50',
              'bg-emerald-400 shadow-lg shadow-emerald-400/50',
              'bg-pink-400 shadow-lg shadow-pink-400/50'
            ][Math.floor(Math.random() * 6)]
          }`}
          style={{
            clipPath: Math.random() > 0.5 ? 'polygon(50% 0%, 100% 100%, 0% 100%)' : 'none'
          }}
        />
      ))}
    </div>
  );
};

interface PremiumContentBlockProps {
  article: any;
  session: any;
}

export default function PremiumContentBlock({ article, session }: PremiumContentBlockProps) {
  const router = useRouter();
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 bg-lightBg dark:bg-darkBg">
      <article className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-lightText dark:text-darkText">{article.title}</h1>
          <p className="text-xl text-mutedLight:foreground dark:text-muted:foreground mb-6">{article.excerpt}</p>
          
          {article.featuredImage && (
            <div className="relative aspect-video rounded-xl overflow-hidden neumorphic-light dark:neumorphic">
              <Image
                src={normalizeImagePath(article.featuredImage)}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.4,
            type: "spring",
            stiffness: 100 
          }}
          className="relative"
        >
          <div className="relative backdrop-blur-md bg-white/10 dark:bg-black/10 border border-lightBorder dark:border-darkBorder rounded-3xl p-8 shadow-2xl neumorphic-light dark:neumorphic">
            <div className="flex flex-col items-center text-center space-y-6">
              <motion.div 
                className="space-y-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="space-y-3"
                >
                  <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    Contenu Premium
                  </h2>
                  <p className="text-lg md:text-xl text-mutedLight:foreground dark:text-muted:foreground">
                    Accédez à ce contenu et bien plus pour seulement{" "}
                    <span className="font-semibold text-primary">5€ TTC</span> par mois
                  </p>
                </motion.div>

                {/* Bouton d'action avec animation et confetti */}
                <motion.div 
                  className="flex justify-center mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="relative">
                    <Button
                      onClick={() => router.push('/pricing')}
                      className="btn-primary relative overflow-hidden group px-8"
                      size="lg"
                      onMouseEnter={() => setIsButtonHovered(true)}
                      onMouseLeave={() => setIsButtonHovered(false)}
                    >
                      <motion.div
                        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                        initial={false}
                        whileHover={{ scale: 2, x: 50 }}
                        transition={{ duration: 0.5 }}
                      />
                      <Sparkles className="mr-2 h-4 w-4" />
                      Débloquer l'accès
                    </Button>
                    <Confetti isHovered={isButtonHovered} />
                  </div>
                </motion.div>

                {/* Grille de fonctionnalités avec animation */}
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  {[
                    {
                      icon: Clock,
                      color: "blue",
                      title: "Accès anticipé",
                      description: "Visionnez les tutoriels en avance"
                    },
                    {
                      icon: Download,
                      color: "purple",
                      title: "Téléchargement",
                      description: "Téléchargez les vidéos et les sources"
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="group backdrop-blur-lg bg-white/5 dark:bg-white/5 border border-lightBorder dark:border-darkBorder rounded-xl p-6 hover:bg-white/10 transition-all duration-300 neumorphic-light dark:neumorphic"
                      whileHover={{ y: -5, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1 + (index * 0.1) }}
                    >
                      <motion.div 
                        className={`relative w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-${feature.color}-500/10`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div 
                          className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-xl opacity-20`}
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.3, 0.2] 
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut" 
                          }}
                        />
                        <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} strokeWidth={1.5} />
                      </motion.div>
                      <h3 className="font-semibold text-center mb-2 text-lightText dark:text-darkText">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-center text-mutedLight:foreground dark:text-muted:foreground">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </article>
    </div>
  );
}