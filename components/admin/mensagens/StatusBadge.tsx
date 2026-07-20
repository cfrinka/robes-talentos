import type { InboxStatus } from '@/lib/content/types';

const LABELS: Record<InboxStatus, string> = { novo: 'Novo', lido: 'Lido', arquivado: 'Arquivado' };

export function StatusBadge({ status }: { status: InboxStatus }) {
  return <span className={`status-badge status-badge-${status}`}>{LABELS[status]}</span>;
}
