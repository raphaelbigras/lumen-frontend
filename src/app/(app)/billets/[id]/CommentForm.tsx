'use client';
import { useState, useTransition } from 'react';
import { addCommentAction } from './actions';

export function CommentForm({ ticketId }: { ticketId: string }) {
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!body.trim()) return;
    startTransition(async () => {
      await addCommentAction(ticketId, body.trim());
      setBody('');
    });
  };

  return (
    <div className="mt-4 border-t border-lumen-border-secondary pt-4">
      <textarea
        rows={3}
        placeholder="Ajouter un commentaire..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-sm text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none focus:border-primary resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={isPending || !body.trim()}
        className="mt-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg disabled:opacity-50 text-xs font-semibold"
      >
        {isPending ? 'Envoi...' : 'Commenter'}
      </button>
    </div>
  );
}
