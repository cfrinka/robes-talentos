'use client';

import { useState, type FormEvent } from 'react';
import { FieldError } from '../FieldError';
import { StatusMessage } from '../StatusMessage';
import { saveSiteSettings, type SiteSettingsInput } from '@/lib/actions/singletons';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { siteSettingsSchema } from '@/lib/validation/schemas';
import type { SiteSettings } from '@/lib/content/types';

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [email, setEmail] = useState(settings?.email ?? '');
  const [phone, setPhone] = useState(settings?.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp ?? '');
  const [address, setAddress] = useState(settings?.address ?? '');
  const [instagramUrl, setInstagramUrl] = useState(settings?.instagramUrl ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState(settings?.linkedinUrl ?? '');

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ text: string; variant: 'ok' | 'error' | 'neutral' }>({
    text: '',
    variant: 'neutral',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const candidate: SiteSettingsInput = {
      email,
      phone,
      whatsapp: whatsapp || null,
      address,
      instagramUrl: instagramUrl || null,
      linkedinUrl: linkedinUrl || null,
    };

    const parsed = siteSettingsSchema.safeParse(candidate);
    if (!parsed.success) {
      const errors = fieldErrorsFromZod(parsed.error);
      setFieldErrors(errors);
      setStatus({ text: Object.values(errors)[0], variant: 'error' });
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    const result = await saveSiteSettings(parsed.data);
    setSubmitting(false);
    if (result.ok) {
      setStatus({ text: 'Salvo.', variant: 'ok' });
    } else {
      setStatus({ text: `Falha ao salvar: ${result.error}`, variant: 'error' });
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  return (
    <form className="admin-card" onSubmit={handleSubmit}>
      <div className={`field${fieldErrors.email ? ' has-error' : ''}`}>
        <label htmlFor="email">E-mail</label>
        <input type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <FieldError message={fieldErrors.email} />
      </div>
      <div className="field-row">
        <div className={`field${fieldErrors.phone ? ' has-error' : ''}`}>
          <label htmlFor="phone">Telefone / WhatsApp (exibido)</label>
          <input type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <FieldError message={fieldErrors.phone} />
        </div>
        <div className={`field${fieldErrors.whatsapp ? ' has-error' : ''}`}>
          <label htmlFor="whatsapp">WhatsApp (número para link, opcional)</label>
          <input
            type="text"
            id="whatsapp"
            placeholder="5511900000000"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
          <FieldError message={fieldErrors.whatsapp} />
        </div>
      </div>
      <div className={`field${fieldErrors.address ? ' has-error' : ''}`}>
        <label htmlFor="address">Localização</label>
        <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <FieldError message={fieldErrors.address} />
      </div>
      <div className="field-row">
        <div className={`field${fieldErrors.instagramUrl ? ' has-error' : ''}`}>
          <label htmlFor="instagramUrl">URL do Instagram</label>
          <input type="url" id="instagramUrl" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />
          <FieldError message={fieldErrors.instagramUrl} />
        </div>
        <div className={`field${fieldErrors.linkedinUrl ? ' has-error' : ''}`}>
          <label htmlFor="linkedinUrl">URL do LinkedIn</label>
          <input type="url" id="linkedinUrl" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
          <FieldError message={fieldErrors.linkedinUrl} />
        </div>
      </div>

      <button type="submit" disabled={submitting}>
        Salvar
      </button>
      <StatusMessage text={status.text} variant={status.variant} />
    </form>
  );
}
