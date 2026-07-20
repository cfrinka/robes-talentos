'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { clientAuth } from '@/lib/firebase/client';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(clientAuth, (user) => {
      if (user) router.replace('/admin/');
    });
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(clientAuth, email, password);
      const idToken = await credential.user.getIdToken();
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error('session exchange failed');
      router.push('/admin/');
    } catch {
      setError('E-mail ou senha inválidos.');
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-card" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Senha</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" disabled={submitting}>
        Entrar
      </button>
      <div className={`status${error ? ' error' : ''}`}>{error}</div>
    </form>
  );
}
