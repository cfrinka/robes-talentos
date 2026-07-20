'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { clientAuth } from '@/lib/firebase/client';

const LINKS = [
  { href: '/admin/', label: 'Painel', exact: true },
  { href: '/admin/mensagens/', label: 'Mensagens' },
  { href: '/admin/talentos/', label: 'Talentos' },
  { href: '/admin/castings/', label: 'Castings' },
  { href: '/admin/editorial/', label: 'Editorial' },
  { href: '/admin/categorias/', label: 'Categorias' },
  { href: '/admin/site-settings', label: 'Configurações do Site' },
  { href: '/admin/home-page', label: 'Página Inicial' },
  { href: '/admin/about-page', label: 'Página Sobre' },
];

interface AdminNavProps {
  initialUnreadMensagens?: number;
}

export function AdminNav({ initialUnreadMensagens = 0 }: AdminNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadMensagens, setUnreadMensagens] = useState(initialUnreadMensagens);

  // Live-updates via SSE (app/api/admin/mensagens/unread-count) instead of
  // only refreshing on navigation. EventSource reconnects on its own after
  // a dropped connection, so no manual retry logic is needed here.
  useEffect(() => {
    const source = new EventSource('/api/admin/mensagens/unread-count');
    source.onmessage = (e) => {
      const count = Number(e.data);
      if (!Number.isNaN(count)) setUnreadMensagens(count);
    };
    return () => source.close();
  }, []);

  async function handleLogout() {
    await signOut(clientAuth).catch(() => undefined);
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/admin/login');
  }

  return (
    <nav className="admin-nav">
      <span className="brand">
        Robes Britto <span className="kicker">Painel</span>
      </span>
      {LINKS.map((link) => {
        const path = (pathname ?? '').replace(/\/$/, '') || '/';
        const href = link.href.replace(/\/$/, '') || '/';
        const active = link.exact ? path === '/admin' : path === href || path.startsWith(`${href}/`);
        return (
          <Link key={link.href} href={link.href} className={active ? 'active' : undefined}>
            {link.label}
            {link.href === '/admin/mensagens/' && unreadMensagens > 0 && (
              <span className="nav-badge">{unreadMensagens}</span>
            )}
          </Link>
        );
      })}
      <button className="secondary" type="button" onClick={handleLogout}>
        Sair
      </button>
    </nav>
  );
}
