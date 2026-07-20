'use client';

import { useState, type FormEvent } from 'react';
import { FieldError } from '../FieldError';
import { ImageUploadField } from '../ImageUploadField';
import { StatusMessage } from '../StatusMessage';
import { saveHomePage } from '@/lib/actions/singletons';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { homePageSchema } from '@/lib/validation/schemas';
import type { HomePageContent } from '@/lib/content/types';

export function HomePageForm({ home }: { home: HomePageContent | null }) {
  const [heroKicker, setHeroKicker] = useState(home?.heroKicker ?? '');
  const [heroTitleLine1, setHeroTitleLine1] = useState(home?.heroTitleLine1 ?? '');
  const [heroTitleLine2, setHeroTitleLine2] = useState(home?.heroTitleLine2 ?? '');
  const [heroImage, setHeroImage] = useState(home?.heroImage ?? '');
  const [aboutKicker, setAboutKicker] = useState(home?.aboutKicker ?? '');
  const [aboutLead, setAboutLead] = useState(home?.aboutLead ?? '');
  const [aboutBody, setAboutBody] = useState(home?.aboutBody ?? '');
  const [aboutImage, setAboutImage] = useState(home?.aboutImage ?? '');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ text: string; variant: 'ok' | 'error' | 'neutral' }>({
    text: '',
    variant: 'neutral',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const parsed = homePageSchema.safeParse({
      heroKicker,
      heroTitleLine1,
      heroTitleLine2,
      heroImage,
      aboutKicker,
      aboutLead,
      aboutBody,
      aboutImage,
    });
    if (!parsed.success) {
      const errors = fieldErrorsFromZod(parsed.error);
      setFieldErrors(errors);
      setStatus({ text: Object.values(errors)[0], variant: 'error' });
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    const result = await saveHomePage(parsed.data);
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
      <div className={`field${fieldErrors.heroKicker ? ' has-error' : ''}`}>
        <label htmlFor="heroKicker">Hero — kicker</label>
        <input type="text" id="heroKicker" value={heroKicker} onChange={(e) => setHeroKicker(e.target.value)} />
        <FieldError message={fieldErrors.heroKicker} />
      </div>
      <div className="field-row">
        <div className={`field${fieldErrors.heroTitleLine1 ? ' has-error' : ''}`}>
          <label htmlFor="heroTitleLine1">Hero — título (linha 1)</label>
          <input
            type="text"
            id="heroTitleLine1"
            required
            value={heroTitleLine1}
            onChange={(e) => setHeroTitleLine1(e.target.value)}
          />
          <FieldError message={fieldErrors.heroTitleLine1} />
        </div>
        <div className={`field${fieldErrors.heroTitleLine2 ? ' has-error' : ''}`}>
          <label htmlFor="heroTitleLine2">Hero — título (linha 2)</label>
          <input
            type="text"
            id="heroTitleLine2"
            value={heroTitleLine2}
            onChange={(e) => setHeroTitleLine2(e.target.value)}
          />
          <FieldError message={fieldErrors.heroTitleLine2} />
        </div>
      </div>
      <ImageUploadField label="Hero — imagem" value={heroImage} onChange={setHeroImage} folder="home-page" onUploading={setUploading} />
      <FieldError message={fieldErrors.heroImage} />

      <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '24px 0' }} />

      <div className={`field${fieldErrors.aboutKicker ? ' has-error' : ''}`}>
        <label htmlFor="aboutKicker">Seção &quot;A Agência&quot; — kicker</label>
        <input type="text" id="aboutKicker" value={aboutKicker} onChange={(e) => setAboutKicker(e.target.value)} />
        <FieldError message={fieldErrors.aboutKicker} />
      </div>
      <div className={`field${fieldErrors.aboutLead ? ' has-error' : ''}`}>
        <label htmlFor="aboutLead">Parágrafo de destaque</label>
        <textarea id="aboutLead" value={aboutLead} onChange={(e) => setAboutLead(e.target.value)} />
        <FieldError message={fieldErrors.aboutLead} />
      </div>
      <div className={`field${fieldErrors.aboutBody ? ' has-error' : ''}`}>
        <label htmlFor="aboutBody">Parágrafo secundário</label>
        <textarea id="aboutBody" value={aboutBody} onChange={(e) => setAboutBody(e.target.value)} />
        <FieldError message={fieldErrors.aboutBody} />
      </div>
      <ImageUploadField label="Imagem" value={aboutImage} onChange={setAboutImage} folder="home-page" onUploading={setUploading} />
      <FieldError message={fieldErrors.aboutImage} />

      <button type="submit" disabled={submitting || uploading}>
        Salvar
      </button>
      <StatusMessage text={status.text} variant={status.variant} />
    </form>
  );
}
