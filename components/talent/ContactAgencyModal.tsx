'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useIsClient } from '@/lib/hooks/useIsClient';
import { submitTalentInquiry } from '@/lib/actions/talent-inquiries';
import { talentInquirySchema } from '@/lib/validation/schemas';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';

interface ContactAgencyModalProps {
  open: boolean;
  onClose: () => void;
  talentSlug: string;
  talentName: string;
}

// Same overlay/portal/escape-key pattern as ApplyModal (components/casting/ApplyModal.tsx).
// Writes a real TalentInquiry doc via submitTalentInquiry -- admins read
// these back in /admin/mensagens.
export function ContactAgencyModal({ open, onClose, talentSlug, talentName }: ContactAgencyModalProps) {
  const isClient = useIsClient();
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  function handleClose() {
    onClose();
    setSubmitted(false);
    setFieldErrors({});
    setError('');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const honeypot = String(formData.get('website') ?? '');

    const candidate = {
      talentSlug,
      talentName,
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      message: String(formData.get('message') ?? ''),
    };

    const parsed = talentInquirySchema.safeParse(candidate);
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }
    setFieldErrors({});
    setError('');

    setSubmitting(true);
    const result = await submitTalentInquiry(parsed.data, honeypot);
    setSubmitting(false);

    if (result.ok) {
      setSubmitted(true);
    } else {
      setError(`Falha ao enviar mensagem: ${result.error}`);
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  if (!isClient) return null;

  return createPortal(
    <div
      className={`apply-modal${open ? ' open' : ''}`}
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="apply-modal-panel">
        <button className="apply-modal-close" aria-label="Fechar" type="button" onClick={handleClose}>
          Fechar ✕
        </button>

        {!submitted ? (
          <div>
            <div className="apply-modal-kicker">Fale com a agência</div>
            <div className="apply-modal-title">Sobre {talentName}</div>

            <form className="apply-form" onSubmit={handleSubmit} noValidate>
              <div className="hp-field" aria-hidden="true">
                <label htmlFor="contactWebsite">Deixe em branco</label>
                <input type="text" id="contactWebsite" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="field-row">
                <div>
                  <label className="field-label" htmlFor="contactName">
                    Nome
                  </label>
                  <input
                    className={`field-input${fieldErrors.name ? ' has-error' : ''}`}
                    type="text"
                    id="contactName"
                    name="name"
                    required
                  />
                  {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
                </div>
                <div>
                  <label className="field-label" htmlFor="contactEmail">
                    E-mail
                  </label>
                  <input
                    className={`field-input${fieldErrors.email ? ' has-error' : ''}`}
                    type="email"
                    id="contactEmail"
                    name="email"
                    required
                  />
                  {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
                </div>
              </div>
              <div>
                <label className="field-label" htmlFor="contactPhone">
                  Telefone / WhatsApp (opcional)
                </label>
                <input className="field-input" type="tel" id="contactPhone" name="phone" />
              </div>
              <div>
                <label className="field-label" htmlFor="contactMessage">
                  Mensagem
                </label>
                <textarea
                  className={`field-textarea${fieldErrors.message ? ' has-error' : ''}`}
                  id="contactMessage"
                  name="message"
                  rows={4}
                  required
                />
                {fieldErrors.message && <div className="field-error">{fieldErrors.message}</div>}
              </div>
              <button className="btn-accent" type="submit" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
              {error && <div className="field-error">{error}</div>}
            </form>
          </div>
        ) : (
          <div className="apply-success">
            <div className="apply-success-title">Mensagem enviada!</div>
            <p className="apply-success-text">
              Recebemos sua mensagem sobre <strong>{talentName}</strong>. Nossa equipe vai responder pelo e-mail
              informado em breve.
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
