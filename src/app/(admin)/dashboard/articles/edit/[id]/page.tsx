'use client';

import ArticleFormPage from '../../[action]/page';

export default function EditArticlePage({ params }: { params: { id: string } }) {
  return <ArticleFormPage params={{ action: 'edit', id: params.id }} />;
}