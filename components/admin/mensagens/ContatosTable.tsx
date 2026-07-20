'use client';

import { Fragment, useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { StatusMessage } from '../StatusMessage';
import { deleteTalentInquiry, updateTalentInquiryStatus } from '@/lib/actions/talent-inquiries';
import type { InboxStatus, TalentInquiry, WithId } from '@/lib/content/types';

export function ContatosTable({ rows }: { rows: WithId<TalentInquiry>[] }) {
  const [items, setItems] = useState(rows);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ text: string; variant: 'ok' | 'error' | 'neutral' }>({
    text: '',
    variant: 'neutral',
  });

  async function toggleExpand(row: WithId<TalentInquiry>) {
    const opening = expandedId !== row.id;
    setExpandedId(opening ? row.id : null);
    if (opening && row.status === 'novo') {
      const result = await updateTalentInquiryStatus(row.id, 'lido');
      if (result.ok) {
        setItems((prev) => prev.map((it) => (it.id === row.id ? { ...it, status: 'lido' } : it)));
      }
    }
  }

  async function setRowStatus(row: WithId<TalentInquiry>, newStatus: InboxStatus) {
    setPendingId(row.id);
    setStatus({ text: '', variant: 'neutral' });
    const result = await updateTalentInquiryStatus(row.id, newStatus);
    setPendingId(null);
    if (result.ok) {
      setItems((prev) => prev.map((it) => (it.id === row.id ? { ...it, status: newStatus } : it)));
      setStatus({ text: newStatus === 'arquivado' ? 'Mensagem arquivada.' : 'Mensagem reaberta.', variant: 'ok' });
    } else {
      setStatus({ text: `Falha ao atualizar: ${result.error}`, variant: 'error' });
    }
  }

  async function handleDelete(row: WithId<TalentInquiry>) {
    if (!window.confirm(`Excluir a mensagem de "${row.name}"? Essa ação não pode ser desfeita.`)) return;
    setPendingId(row.id);
    setStatus({ text: '', variant: 'neutral' });
    const result = await deleteTalentInquiry(row.id);
    setPendingId(null);
    if (result.ok) {
      setItems((prev) => prev.filter((it) => it.id !== row.id));
      if (expandedId === row.id) setExpandedId(null);
      setStatus({ text: 'Mensagem excluída com sucesso.', variant: 'ok' });
    } else {
      setStatus({ text: `Falha ao excluir: ${result.error}`, variant: 'error' });
    }
  }

  return (
    <>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Talento</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={4}>Nenhuma mensagem recebida ainda.</td>
            </tr>
          )}
          {items.map((row) => (
            <Fragment key={row.id}>
              <tr className="inbox-row" onClick={() => toggleExpand(row)}>
                <td>{row.name}</td>
                <td>{row.talentName}</td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
                <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="secondary"
                    disabled={pendingId === row.id}
                    onClick={() => setRowStatus(row, row.status === 'arquivado' ? 'lido' : 'arquivado')}
                  >
                    {row.status === 'arquivado' ? 'Reabrir' : 'Arquivar'}
                  </button>
                  <button type="button" className="danger" disabled={pendingId === row.id} onClick={() => handleDelete(row)}>
                    Excluir
                  </button>
                </td>
              </tr>
              {expandedId === row.id && (
                <tr className="inbox-detail-row">
                  <td colSpan={4}>
                    <div className="inbox-detail">
                      <div className="inbox-detail-grid">
                        <div>
                          <span className="inbox-field-label">E-mail</span>
                          <a href={`mailto:${row.email}`}>{row.email}</a>
                        </div>
                        {row.phone && (
                          <div>
                            <span className="inbox-field-label">Telefone</span>
                            {row.phone}
                          </div>
                        )}
                        <div>
                          <span className="inbox-field-label">Sobre</span>
                          {row.talentName}
                        </div>
                      </div>
                      <p className="inbox-message">{row.message}</p>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      <StatusMessage text={status.text} variant={status.variant} />
    </>
  );
}
