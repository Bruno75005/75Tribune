'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, LogIn, BookOpen, FileText, Star } from 'lucide-react';
import { normalizeImagePath } from '@/lib/image';
import ArticleContent from '@/components/ArticleContent';

// Composant Confetti
const Confetti = ({ isHovered }: { isHovered: boolean }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {isHovered && Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: "50%", 
            y: "50%", 
            scale: 0,
            opacity: 1 
          }}
          animate={{ 
            x: `${Math.random() * 200 - 100}%`,
            y: `${Math.random() * 200 - 100}%`,
            scale: Math.random() * 1.5,
            opacity: 0
          }}
          transition={{ 
            duration: 0.8 + Math.random() * 0.5,
            ease: "easeOut"
          }}
          className={`absolute w-2 h-2 rounded-full ${
            ['bg-primary', 'bg-secondary', 'bg-blue-400', 'bg-amber-400'][Math.floor(Math.random() * 4)]
          }`}
        />
      ))}
    </div>
  );
};

export default function PremiumArticleView({ article, session }: { article: any, session: any }) {
  const router = useRouter();
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const moveX = useSpring(mouseX, springConfig);
  const moveY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(moveY, [-300, 300], [10, -10]);
  const rotateY = useTransform(moveX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 bg-lightBg dark:bg-darkBg">
      <article className="max-w-4xl mx-auto">
        {/* En-tête de l'article avec animation d'entrée */}
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

        {/* Aperçu du contenu avec transition fluide */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative prose dark:prose-invert max-w-none mb-8 text-lightText dark:text-darkText"
        >
          <div className="relative">
            <div className="line-clamp-3">
              <ArticleContent content={article.content.slice(0, 500)} />
            </div>
            {/* Effet de fondu pour la transition */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-lightBg dark:to-darkBg pointer-events-none" 
              style={{ 
                background: 'linear-gradient(to bottom, transparent 0%, transparent 50%, var(--background) 100%)',
                height: '150%',
                top: '0%'
              }} 
            />
          </div>
        </motion.div>

        {/* Section Premium avec Glassmorphism et effet de parallaxe */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.4,
            type: "spring",
            stiffness: 100 
          }}
          style={{ 
            perspective: 1000,
            rotateX,
            rotateY
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative transform-gpu"
        >
          {/* Effet de flou progressif */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-lightBg/50 dark:via-darkBg/50 to-lightBg dark:to-darkBg"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d"
            }}
          />

          <div className="relative backdrop-blur-md bg-white/10 dark:bg-black/10 border border-lightBorder dark:border-darkBorder rounded-3xl p-8 shadow-2xl neumorphic-light dark:neumorphic">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Badge Premium avec effet de lueur et animation */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="absolute -inset-4 bg-primary/20 blur-lg rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5] 
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                />
                <Badge variant="secondary" className="relative bg-primary text-primary-foreground px-4 py-1 text-sm">
                  Contenu Premium
                </Badge>
              </motion.div>

              {/* Icône de verrouillage avec effet de lueur et parallaxe */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  rotateX: useTransform(moveY, [-300, 300], [20, -20]),
                  rotateY: useTransform(moveX, [-300, 300], [-20, 20]),
                }}
              >
                <motion.div 
                  className="absolute -inset-6 bg-primary/20 blur-xl rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3] 
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                />
                <motion.div 
                  className="relative w-20 h-20 flex items-center justify-center"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 animate-pulse" />
                  <Lock className="w-12 h-12 text-primary" strokeWidth={1.5} />
                </motion.div>
              </motion.div>

              {/* Message principal avec animation */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h2 className="text-2xl font-semibold text-lightText dark:text-darkText">
                  Accédez au contenu premium
                </h2>
                <p className="text-mutedLight:foreground dark:text-muted:foreground">
                  Profitez d'analyses approfondies et de contenus exclusifs avec notre abonnement Premium.
                </p>
              </motion.div>

              {/* Boutons d'action avec animation et confetti */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="relative">
                  <Button
                    onClick={() => router.push('/pricing')}
                    className="btn-primary relative overflow-hidden group"
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
                    Voir les abonnements
                  </Button>
                  <Confetti isHovered={isButtonHovered} />
                </div>

                {!session && (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/login')}
                    size="lg"
                    className="relative overflow-hidden group border-lightBorder dark:border-darkBorder text-lightText dark:text-darkText hover:bg-lightCard/50 dark:hover:bg-darkCard/50"
                  >
                    <motion.div
                      className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10"
                      initial={false}
                      whileHover={{ scale: 2, x: 50 }}
                      transition={{ duration: 0.5 }}
                    />
                    <LogIn className="mr-2 h-4 w-4" />
                    Se connecter
                  </Button>
                )}
              </motion.div>

              {/* Grille de fonctionnalités avec animation */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                {[
                  {
                    icon: (
                      <motion.div 
                        className="relative w-12 h-12 flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl opacity-20"
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
                        <div className="absolute inset-0 bg-blue-500/10 rounded-xl backdrop-blur-sm" />
                        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                      </motion.div>
                    ),
                    title: "Articles exclusifs",
                    description: "Accédez à tous nos articles premium"
                  },
                  {
                    icon: (
                      <motion.div 
                        className="relative w-12 h-12 flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl opacity-20"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.3, 0.2] 
                          }}
                          transition={{ 
                            duration: 3,
                            delay: 1,
                            repeat: Infinity,
                            ease: "easeInOut" 
                          }}
                        />
                        <div className="absolute inset-0 bg-purple-500/10 rounded-xl backdrop-blur-sm" />
                        <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
                      </motion.div>
                    ),
                    title: "Analyses détaillées",
                    description: "Des analyses approfondies et expertises"
                  },
                  {
                    icon: (
                      <motion.div 
                        className="relative w-12 h-12 flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl opacity-20"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.3, 0.2] 
                          }}
                          transition={{ 
                            duration: 3,
                            delay: 2,
                            repeat: Infinity,
                            ease: "easeInOut" 
                          }}
                        />
                        <div className="absolute inset-0 bg-amber-500/10 rounded-xl backdrop-blur-sm" />
                        <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                      </motion.div>
                    ),
                    title: "Contenus spéciaux",
                    description: "Du contenu réservé aux membres premium"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="group backdrop-blur-lg bg-white/5 dark:bg-white/5 border border-lightBorder dark:border-darkBorder rounded-xl p-6 hover:bg-white/10 transition-all duration-300 neumorphic-light dark:neumorphic"
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 + (index * 0.1) }}
                  >
                    <div className="flex justify-center mb-4 transform group-hover:scale-105 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold mb-2 text-lightText dark:text-darkText">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-mutedLight:foreground dark:text-muted:foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </article>
    </div>
  );
}