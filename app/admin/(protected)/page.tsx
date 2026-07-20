import type { Metadata } from 'next';
import { PublishButton } from '@/components/admin/PublishButton';

export const metadata: Metadata = { title: 'Painel' };

export default function AdminDashboardPage() {
  return (
    <>
      <h1>Painel</h1>
      <p className="subtitle">Edite o conteúdo do site e publique quando estiver pronto.</p>
      <PublishButton />
    </>
  );
}
