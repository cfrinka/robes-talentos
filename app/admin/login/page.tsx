import type { Metadata } from 'next';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata: Metadata = { title: 'Entrar' };

export default function AdminLoginPage() {
  return (
    <div className="login-wrap">
      <h1>Robes Britto</h1>
      <p className="subtitle">Painel</p>
      <LoginForm />
    </div>
  );
}
