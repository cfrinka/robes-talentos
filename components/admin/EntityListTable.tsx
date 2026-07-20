'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { StatusMessage } from './StatusMessage';
import type { ActionResult } from '@/lib/actions/result';
import type { WithId } from '@/lib/content/types';

export interface EntityListColumn<T extends object> {
  header: string;
  render: (row: WithId<T>) => ReactNode;
}

interface EntityListTableProps<T extends object> {
  rows: WithId<T>[];
  columns: EntityListColumn<T>[];
  editHref: (row: WithId<T>) => string;
  getLabel: (row: WithId<T>) => string;
  deleteAction: (id: string) => Promise<ActionResult>;
  emptyMessage: string;
  confirmMessage?: (label: string) => string;
}

// Generic admin list table: thumbnail/name-ish columns + Edit link + Excluir
// button with the same confirm() + status-on-failure UX as the old
// admin-js/*-list.js scripts. Entity-specific wrappers (e.g.
// components/admin/talentos/TalentsTable.tsx) supply the columns.
export function EntityListTable<T extends object>({
  rows,
  columns,
  editHref,
  getLabel,
  deleteAction,
  emptyMessage,
  confirmMessage = (label) => `Excluir "${label}"? Essa ação não pode ser desfeita.`,
}: EntityListTableProps<T>) {
  const router = useRouter();
  const [status, setStatus] = useState<{ text: string; variant: 'ok' | 'error' | 'neutral' }>({
    text: '',
    variant: 'neutral',
  });
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDelete(row: WithId<T>) {
    const label = getLabel(row);
    if (!window.confirm(confirmMessage(label))) return;
    setPendingId(row.id);
    setStatus({ text: '', variant: 'neutral' });
    const result = await deleteAction(row.id);
    setPendingId(null);
    if (result.ok) {
      setStatus({ text: `"${label}" excluído com sucesso.`, variant: 'ok' });
      router.refresh();
    } else {
      setStatus({ text: `Falha ao excluir: ${result.error}`, variant: 'error' });
    }
  }

  return (
    <>
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header}>{c.header}</th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1}>{emptyMessage}</td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.header}>{c.render(row)}</td>
              ))}
              <td className="row-actions">
                <Link href={editHref(row)}>Editar</Link>
                <button type="button" className="danger" disabled={pendingId === row.id} onClick={() => handleDelete(row)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <StatusMessage text={status.text} variant={status.variant} />
    </>
  );
}
