'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { clientAuth } from '@/lib/firebase/client';
import { StatusMessage } from './StatusMessage';

export function PublishButton() {
  const [user, setUser] = useState<User | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<{ text: string; variant: 'ok' | 'error' | 'neutral' }>({
    text: '',
    variant: 'neutral',
  });

  useEffect(() => onAuthStateChanged(clientAuth, setUser), []);

  async function handlePublish() {
    if (!user) return;
    setPublishing(true);
    setStatus({ text: 'Publicando... isso pode levar um minuto.', variant: 'neutral' });
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus({ text: 'Site publicado com sucesso.', variant: 'ok' });
    } catch (err) {
      setStatus({
        text: `Falha ao publicar: ${err instanceof Error ? err.message : 'erro desconhecido'}`,
        variant: 'error',
      });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="admin-card">
      <div className="field-row" style={{ alignItems: 'center' }}>
        <div>
          <strong>Publicar site</strong>
          <p className="hint" style={{ marginTop: 4 }}>
            Suas edições são salvas imediatamente, mas o site público só é atualizado quando você publica -- isso
            reconstrói o site estático com o conteúdo mais recente.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button type="button" onClick={handlePublish} disabled={publishing || !user}>
            Publicar
          </button>
        </div>
      </div>
      <StatusMessage text={status.text} variant={status.variant} />
    </div>
  );
}
