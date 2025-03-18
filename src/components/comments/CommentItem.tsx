'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, Check, X, Reply } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from '../ui/use-toast';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar } from '../ui/avatar';

interface CommentItemProps {
  comment: any;
  onDelete: (id: string) => void;
  onModerate?: (id: string, isApproved: boolean) => void;
  onReply?: (parentId: string, content: string) => void;
  showModeration?: boolean;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  onDelete,
  onModerate,
  onReply,
  showModeration = false,
  isReply = false,
}: CommentItemProps) {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModerating, setIsModerating] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      onDelete(comment.id);
      toast({
        title: 'Succès',
        description: 'Commentaire supprimé avec succès',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le commentaire',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModerate = async (isApproved: boolean) => {
    setIsModerating(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isApproved }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modération');
      }

      const updatedComment = await response.json();
      onModerate?.(comment.id, isApproved);
      toast({
        title: 'Succès',
        description: `Commentaire ${isApproved ? 'approuvé' : 'rejeté'} avec succès`,
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modérer le commentaire',
        variant: 'destructive',
      });
    } finally {
      setIsModerating(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await onReply?.(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
      toast({
        title: 'Succès',
        description: 'Réponse envoyée avec succès',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la réponse',
        variant: 'destructive',
      });
    }
  };

  const canDelete =
    session?.user?.id === comment.author.id || session?.user?.role === 'ADMIN';

  return (
    <div className={`flex space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm ${isReply ? 'ml-8' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Debug data */}
        <Avatar 
          src={comment.author.avatar}
          name={comment.author.name}
          size="sm"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {comment.author.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(comment.createdAt), 'dd MMMM yyyy à HH:mm', {
                  locale: fr,
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {showModeration && !comment.isApproved && (
                <>
                  <button
                    onClick={() => handleModerate(true)}
                    disabled={isModerating}
                    className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                    title="Approuver"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleModerate(false)}
                    disabled={isModerating}
                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                    title="Rejeter"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                  title="Supprimer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>

          {!isReply && session && (
            <div className="mt-2">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Reply className="h-4 w-4 mr-1" />
                Répondre
              </button>

              {isReplying && (
                <form onSubmit={handleReplySubmit} className="mt-2 space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Écrivez votre réponse..."
                    className="w-full"
                  />
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={!replyContent.trim()}>
                      Envoyer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsReplying(false);
                        setReplyContent('');
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply: any) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onDelete={onDelete}
                  onModerate={onModerate}
                  showModeration={showModeration}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
