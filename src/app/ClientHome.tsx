"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// Définir une interface pour les articles
interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  // Ajoutez d'autres champs si nécessaire
}

interface ClientHomeProps {
  articles: Article[];
}

export default function ClientHome({ articles }: ClientHomeProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Héroïque avec animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-96 mb-8 neumorphic-light dark:neumorphic"
      >
        <Image
          src="/hero-image.jpg" // Remplacez par votre image héroïque
          alt="Hero Image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold mb-4"
          >
            Bienvenue sur 75Tribune
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg mb-6"
          >
            Découvrez nos derniers articles
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link href="/articles" className="btn-primary">
              Voir les articles
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <h1 className="text-4xl font-headline mb-8 text-lightText dark:text-darkText">
        Latest News
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-lightCard dark:bg-darkCard shadow-sm rounded-lg overflow-hidden neumorphic-light dark:neumorphic"
            >
              {article.featuredImage && (
                <div className="relative w-full h-48">
                  <Image
                    src={article.featuredImage}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-headline mb-2 text-lightText dark:text-darkText">
                  <Link
                    href={`/articles/${article.slug}`}
                    className="hover:text-primary"
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="text-mutedLight:foreground dark:text-muted:foreground font-body">
                  {article.excerpt}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="col-span-full text-center text-mutedLight:foreground dark:text-muted:foreground">
            Aucun article disponible pour le moment.
          </p>
        )}
      </div>
    </main>
  );
}
