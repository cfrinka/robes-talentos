'use client';

import { useState, type FormEvent } from 'react';
import { FieldError } from '../FieldError';
import { ImageUploadField } from '../ImageUploadField';
import { RepeaterField } from '../RepeaterField';
import { StatusMessage } from '../StatusMessage';
import { saveAboutPage } from '@/lib/actions/singletons';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { aboutPageSchema } from '@/lib/validation/schemas';
import type { AboutPageContent, Stat, ValueItem } from '@/lib/content/types';

export function AboutPageForm({ about }: { about: AboutPageContent | null }) {
  const [heroTitle, setHeroTitle] = useState(about?.heroTitle ?? '');
  const [heroSubtitle, setHeroSubtitle] = useState(about?.heroSubtitle ?? '');
  const [stats, setStats] = useState<Stat[]>(about?.stats ?? []);
  const [splitLead, setSplitLead] = useState(about?.splitLead ?? '');
  const [splitBody, setSplitBody] = useState(about?.splitBody ?? '');
  const [splitImage, setSplitImage] = useState(about?.splitImage ?? '');
  const [values, setValues] = useState<ValueItem[]>(about?.values ?? []);
  const [ctaLead, setCtaLead] = useState(about?.ctaLead ?? '');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ text: string; variant: 'ok' | 'error' | 'neutral' }>({
    text: '',
    variant: 'neutral',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const parsed = aboutPageSchema.safeParse({
      heroTitle,
      heroSubtitle,
      stats,
      splitLead,
      splitBody,
      splitImage,
      values,
      ctaLead,
    });
    if (!parsed.success) {
      const errors = fieldErrorsFromZod(parsed.error);
      setFieldErrors(errors);
      setStatus({ text: Object.values(errors)[0], variant: 'error' });
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    const result = await saveAboutPage(parsed.data);
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
      <div className={`field${fieldErrors.heroTitle ? ' has-error' : ''}`}>
        <label htmlFor="heroTitle">Título</label>
        <input type="text" id="heroTitle" required value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
        <FieldError message={fieldErrors.heroTitle} />
      </div>
      <div className={`field${fieldErrors.heroSubtitle ? ' has-error' : ''}`}>
        <label htmlFor="heroSubtitle">Subtítulo</label>
        <textarea id="heroSubtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
        <FieldError message={fieldErrors.heroSubtitle} />
      </div>

      <div className="field">
        <label>Estatísticas</label>
        <RepeaterField
          items={stats}
          columns={[
            { key: 'value', label: 'Valor (ex: 10+)' },
            { key: 'label', label: 'Legenda' },
          ]}
          emptyItem={{ value: '', label: '' }}
          addLabel="+ Estatística"
          onChange={setStats}
          error={fieldErrors.stats}
        />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '24px 0' }} />

      <div className={`field${fieldErrors.splitLead ? ' has-error' : ''}`}>
        <label htmlFor="splitLead">Parágrafo de destaque</label>
        <textarea id="splitLead" value={splitLead} onChange={(e) => setSplitLead(e.target.value)} />
        <FieldError message={fieldErrors.splitLead} />
      </div>
      <div className={`field${fieldErrors.splitBody ? ' has-error' : ''}`}>
        <label htmlFor="splitBody">Parágrafo secundário</label>
        <textarea id="splitBody" value={splitBody} onChange={(e) => setSplitBody(e.target.value)} />
        <FieldError message={fieldErrors.splitBody} />
      </div>
      <ImageUploadField label="Imagem" value={splitImage} onChange={setSplitImage} folder="about-page" onUploading={setUploading} />
      <FieldError message={fieldErrors.splitImage} />

      <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '24px 0' }} />

      <div className="field">
        <label>Valores</label>
        <RepeaterField
          items={values}
          columns={[
            { key: 'title', label: 'Título' },
            { key: 'desc', label: 'Descrição' },
          ]}
          emptyItem={{ title: '', desc: '' }}
          addLabel="+ Valor"
          onChange={setValues}
          error={fieldErrors.values}
        />
      </div>

      <div className={`field${fieldErrors.ctaLead ? ' has-error' : ''}`}>
        <label htmlFor="ctaLead">Texto de call-to-action (final da página)</label>
        <textarea id="ctaLead" value={ctaLead} onChange={(e) => setCtaLead(e.target.value)} />
        <FieldError message={fieldErrors.ctaLead} />
      </div>

      <button type="submit" disabled={submitting || uploading}>
        Salvar
      </button>
      <StatusMessage text={status.text} variant={status.variant} />
    </form>
  );
}
