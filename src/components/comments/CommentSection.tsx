'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import CommentItem from './CommentItem';
import { toast } from '../ui/use-toast';

interface CommentSectionProps {
  articleId: string;
  showModeration?: boolean;
}

export default function CommentSection({
  articleId,
  showModeration = false,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for article:', articleId); // Debug log
      const response = await fetch(`/api/comments?articleId=${articleId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commentaires');
      }
      const data = await response.json();
      console.log('Comments received:', data); // Debug log
      setComments(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les commentaires',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          articleId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission du commentaire');
      }

      const comment = await response.json();
      if (comment.isApproved) {
        setComments((prev) => [comment, ...prev]);
      }
      setNewComment('');
      toast({
        title: 'Succès',
        description: comment.isApproved
          ? 'Commentaire publié avec succès'
          : 'Commentaire soumis pour modération',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de publier le commentaire',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setComments((prev) => {
      const updateReplies = (comments: any[]) =>
        comments.filter((comment) => {
          if (comment.replies) {
            comment.replies = updateReplies(comment.replies);
          }
          return comment.id !== id;
        });

      return updateReplies(prev);
    });
  };

  const handleModerate = (id: string, isApproved: boolean) => {
    setComments((prev) => {
      const updateReplies = (comments: any[]) =>
        comments.map((comment) => {
          if (comment.id === id) {
            return { ...comment, isApproved };
          }
          if (comment.replies) {
            comment.replies = updateReplies(comment.replies);
          }
          return comment;
        });

      return updateReplies(prev);
    });
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          articleId,
          parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la soumission de la réponse');
      }

      const reply = await response.json();
      
      setComments((prev) => {
        return prev.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply],
            };
          }
          return comment;
        });
      });

      return reply;
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Chargement des commentaires...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Commentaires</h2>
      
      {session ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrivez votre commentaire..."
            className="w-full"
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? 'Publication...' : 'Publier'}
          </Button>
        </form>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          Connectez-vous pour laisser un commentaire.
        </p>
      )}

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
              onModerate={handleModerate}
              onReply={handleReply}
              showModeration={showModeration}
            />
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Aucun commentaire pour le moment. Soyez le premier à commenter !
          </p>
        )}
      </div>
    </div>
  );
}
