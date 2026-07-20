'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useIsClient } from '@/lib/hooks/useIsClient';
import { submitCastingApplication } from '@/lib/actions/casting-applications';
import { castingApplicationSchema } from '@/lib/validation/schemas';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';

export interface ApplyModalTarget {
  title: string;
  type: string;
  deadline: string;
}

interface ApplyModalProps {
  casting: ApplyModalTarget | null;
  onClose: () => void;
}

// Ported from the inline script in src/pages/castings.astro. Validates with
// zod and writes a real CastingApplication doc via submitCastingApplication
// (see lib/actions/casting-applications.ts) -- admins read these back in
// /admin/mensagens.
export function ApplyModal({ casting, onClose }: ApplyModalProps) {
  const isClient = useIsClient();
  const [submitted, setSubmitted] = useState(false);
  const [prevCasting, setPrevCasting] = useState(casting);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const open = casting !== null;

  // Reset to the intro form whenever a new casting is opened -- mirrors the
  // original's `form?.reset(); intro.hidden = false;` on every openModal()
  // call. This is a render-time state adjustment (not an effect), per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (casting !== prevCasting) {
    setPrevCasting(casting);
    if (casting) {
      setSubmitted(false);
      setFieldErrors({});
      setError('');
    }
  }

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!casting) return;
    const formData = new FormData(e.currentTarget);
    const honeypot = String(formData.get('website') ?? '');

    const candidate = {
      castingTitle: casting.title,
      castingType: casting.type,
      castingDeadline: casting.deadline,
      name: String(formData.get('name') ?? ''),
      age: Number(formData.get('age')) || 0,
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      city: String(formData.get('city') ?? ''),
      portfolioLink: String(formData.get('portfolio') ?? ''),
      photosLink: String(formData.get('photosLink') ?? ''),
      reelLink: String(formData.get('reelLink') ?? ''),
      message: String(formData.get('message') ?? ''),
    };

    const parsed = castingApplicationSchema.safeParse(candidate);
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }
    setFieldErrors({});
    setError('');

    setSubmitting(true);
    const result = await submitCastingApplication(parsed.data, honeypot);
    setSubmitting(false);

    if (result.ok) {
      setSubmitted(true);
    } else {
      setError(`Falha ao enviar candidatura: ${result.error}`);
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  if (!isClient) return null;

  return createPortal(
    <div
      className={`apply-modal${open ? ' open' : ''}`}
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="apply-modal-panel">
        <button className="apply-modal-close" aria-label="Fechar" type="button" onClick={onClose}>
          Fechar ✕
        </button>

        {!submitted ? (
          <div>
            <div className="apply-modal-kicker">{casting?.type || 'Casting'}</div>
            <div className="apply-modal-title">{casting?.title ?? ''}</div>
            <div className="apply-modal-deadline">Inscrições até {casting?.deadline ?? '—'}</div>

            <form key={casting?.title ?? 'none'} className="apply-form" onSubmit={handleSubmit} noValidate>
              <div className="hp-field" aria-hidden="true">
                <label htmlFor="applyWebsite">Deixe em branco</label>
                <input type="text" id="applyWebsite" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="field-row">
                <div>
                  <label className="field-label" htmlFor="applyName">
                    Nome completo
                  </label>
                  <input
                    className={`field-input${fieldErrors.name ? ' has-error' : ''}`}
                    type="text"
                    id="applyName"
                    name="name"
                    required
                  />
                  {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
                </div>
                <div>
                  <label className="field-label" htmlFor="applyAge">
                    Idade
                  </label>
                  <input
                    className={`field-input${fieldErrors.age ? ' has-error' : ''}`}
                    type="number"
                    id="applyAge"
                    name="age"
                    min={0}
                    required
                  />
                  {fieldErrors.age && <div className="field-error">{fieldErrors.age}</div>}
                </div>
              </div>
              <div className="field-row">
                <div>
                  <label className="field-label" htmlFor="applyEmail">
                    E-mail
                  </label>
                  <input
                    className={`field-input${fieldErrors.email ? ' has-error' : ''}`}
                    type="email"
                    id="applyEmail"
                    name="email"
                    required
                  />
                  {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
                </div>
                <div>
                  <label className="field-label" htmlFor="applyPhone">
                    Telefone / WhatsApp
                  </label>
                  <input
                    className={`field-input${fieldErrors.phone ? ' has-error' : ''}`}
                    type="tel"
                    id="applyPhone"
                    name="phone"
                    required
                  />
                  {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
                </div>
              </div>
              <div className="field-row">
                <div>
                  <label className="field-label" htmlFor="applyCity">
                    Cidade
                  </label>
                  <input
                    className={`field-input${fieldErrors.city ? ' has-error' : ''}`}
                    type="text"
                    id="applyCity"
                    name="city"
                    required
                  />
                  {fieldErrors.city && <div className="field-error">{fieldErrors.city}</div>}
                </div>
                <div>
                  <label className="field-label" htmlFor="applyPortfolio">
                    Instagram / Portfólio
                  </label>
                  <input
                    className={`field-input${fieldErrors.portfolioLink ? ' has-error' : ''}`}
                    type="text"
                    id="applyPortfolio"
                    name="portfolio"
                    placeholder="https://instagram.com/seuperfil"
                  />
                  {fieldErrors.portfolioLink && <div className="field-error">{fieldErrors.portfolioLink}</div>}
                </div>
              </div>
              <div>
                <label className="field-label" htmlFor="applyPhotosLink">
                  Link para fotos / book
                </label>
                <input
                  className={`field-input${fieldErrors.photosLink ? ' has-error' : ''}`}
                  type="text"
                  id="applyPhotosLink"
                  name="photosLink"
                  placeholder="Google Drive, Dropbox, WeTransfer..."
                  required
                />
                <div className="field-hint">Envie um link com 1 a 5 fotos recentes (rosto, corpo inteiro e perfil).</div>
                {fieldErrors.photosLink && <div className="field-error">{fieldErrors.photosLink}</div>}
              </div>
              <div>
                <label className="field-label" htmlFor="applyReelLink">
                  Link do reel ou currículo (opcional)
                </label>
                <input
                  className={`field-input${fieldErrors.reelLink ? ' has-error' : ''}`}
                  type="text"
                  id="applyReelLink"
                  name="reelLink"
                  placeholder="https://..."
                />
                {fieldErrors.reelLink && <div className="field-error">{fieldErrors.reelLink}</div>}
              </div>
              <div>
                <label className="field-label" htmlFor="applyMessage">
                  Mensagem
                </label>
                <textarea
                  className="field-textarea"
                  id="applyMessage"
                  name="message"
                  rows={4}
                  placeholder="Conte um pouco sobre sua experiência (opcional)"
                />
              </div>
              <button className="btn-accent" type="submit" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Candidatura'}
              </button>
              {error && <div className="field-error">{error}</div>}
            </form>
          </div>
        ) : (
          <div className="apply-success">
            <div className="apply-success-title">Candidatura enviada!</div>
            <p className="apply-success-text">
              Recebemos sua inscrição para <strong>{casting?.title}</strong>. Nossa equipe vai analisar seu material e
              entrar em contato pelo e-mail ou telefone informado.
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
