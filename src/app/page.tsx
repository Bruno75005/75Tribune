import Image from "next/image";
import Link from "next/link";
import { ArticleService } from "@/services/article.service";

export default async function Home() {
  const { articles } = await ArticleService.list({
    status: "PUBLISHED",
    page: 1,
    limit: 3,
  });

  return (
    <section>
      {/* Section Hero */}
      <div className="relative w-full h-96 mb-8">
        <Image src="/hero-image.jpg" alt="Hero" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-white">
          <h1 className="text-4xl font-bold mb-4">Bienvenue sur 75Tribune</h1>
          <p className="text-lg mb-6">Découvrez nos derniers articles</p>
          <Link
            href="/articles"
            className="px-6 py-3 bg-brandBorder text-black hover:bg-white transition-colors rounded"
          >
            Voir les articles
          </Link>
        </div>
      </div>

      {/* Liste d’articles */}
      <h2 className="text-2xl font-headline mb-4">Derniers Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div
            key={article.id}
            className="p-4 border border-brandBorder rounded"
          >
            {article.featuredImage && (
              <div className="relative w-full h-40 mb-2">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h3 className="text-xl font-bold mb-2">{article.title}</h3>
            <p className="mb-4">{article.excerpt}</p>
            <Link
              href={`/articles/${article.slug}`}
              className="text-brandText hover:text-white transition-colors"
            >
              Lire la suite
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
