/**
 * Nettoie et normalise un chemin d'image
 * @param path Chemin de l'image à nettoyer
 * @returns Chemin normalisé
 */
export function normalizeImagePath(path: string | undefined | null): string {
  if (!path) return '';
  
  // Si c'est une URL complète, la retourner telle quelle
  if (path.startsWith('http')) return path;
  
  // Supprimer les slashes au début et à la fin
  let cleanPath = path.trim().replace(/^\/+|\/+$/g, '');
  
  // Supprimer tous les "uploads/" multiples
  cleanPath = cleanPath.replace(/^(uploads\/)+/, '');
  
  // Si le chemin ne commence pas par "uploads/", l'ajouter
  if (!cleanPath.startsWith('uploads/')) {
    cleanPath = `uploads/${cleanPath}`;
  }
  
  // Ajouter un seul slash au début
  return `/${cleanPath}`;
}
