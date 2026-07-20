'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { FieldError } from '../FieldError';
import { ImageUploadField } from '../ImageUploadField';
import { StatusMessage } from '../StatusMessage';
import { createCasting, updateCasting } from '@/lib/actions/castings';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { castingSchema } from '@/lib/validation/schemas';
import type { Casting, WithId } from '@/lib/content/types';

interface CastingFormProps {
  casting: WithId<Casting> | null;
  id?: string;
}

export function CastingForm({ casting, id }: CastingFormProps) {
  const router = useRouter();
  const isEditing = Boolean(casting);

  const [title, setTitle] = useState(casting?.title ?? '');
  const [type, setType] = useState(casting?.type ?? '');
  const [city, setCity] = useState(casting?.city ?? '');
  const [ageRange, setAgeRange] = useState(casting?.ageRange ?? '');
  const [deadline, setDeadline] = useState(casting?.deadline ?? '');
  const [description, setDescription] = useState(casting?.description ?? '');
  const [requirements, setRequirements] = useState(casting?.requirements ?? '');
  const [compensation, setCompensation] = useState(casting?.compensation ?? '');
  const [image, setImage] = useState(casting?.image ?? '');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const parsed = castingSchema.safeParse({
      title,
      type,
      city,
      ageRange,
      deadline,
      description,
      requirements,
      compensation,
      image,
    });
    if (!parsed.success) {
      const errors = fieldErrorsFromZod(parsed.error);
      setFieldErrors(errors);
      setError(Object.values(errors)[0]);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    const result = isEditing && id ? await updateCasting(id, parsed.data) : await createCasting(parsed.data);
    setSubmitting(false);

    if (result.ok) {
      setError('');
      router.push('/admin/castings/?saved=1');
    } else {
      setError(`Falha ao salvar: ${result.error}`);
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  return (
    <>
      <h1>{isEditing ? 'Editar Casting' : 'Novo Casting'}</h1>
      <p className="subtitle">Preencha os dados do casting.</p>

      <form className="admin-card" onSubmit={handleSubmit}>
        <div className={`field${fieldErrors.title ? ' has-error' : ''}`}>
          <label htmlFor="title">Título</label>
          <input type="text" id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          <FieldError message={fieldErrors.title} />
        </div>

        <div className="field-row">
          <div className={`field${fieldErrors.type ? ' has-error' : ''}`}>
            <label htmlFor="type">Tipo</label>
            <input
              type="text"
              id="type"
              placeholder="Campanha Publicitária, Editorial, Audiovisual..."
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
            <FieldError message={fieldErrors.type} />
          </div>
          <div className={`field${fieldErrors.city ? ' has-error' : ''}`}>
            <label htmlFor="city">Cidade</label>
            <input type="text" id="city" required value={city} onChange={(e) => setCity(e.target.value)} />
            <FieldError message={fieldErrors.city} />
          </div>
        </div>

        <div className="field-row">
          <div className={`field${fieldErrors.ageRange ? ' has-error' : ''}`}>
            <label htmlFor="ageRange">Faixa etária</label>
            <input
              type="text"
              id="ageRange"
              placeholder="18–28 anos"
              required
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
            />
            <FieldError message={fieldErrors.ageRange} />
          </div>
          <div className={`field${fieldErrors.deadline ? ' has-error' : ''}`}>
            <label htmlFor="deadline">Prazo de inscrição</label>
            <input
              type="text"
              id="deadline"
              placeholder="30 de agosto"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <FieldError message={fieldErrors.deadline} />
          </div>
        </div>

        <div className={`field${fieldErrors.description ? ' has-error' : ''}`}>
          <label htmlFor="description">Descrição</label>
          <textarea id="description" required value={description} onChange={(e) => setDescription(e.target.value)} />
          <FieldError message={fieldErrors.description} />
        </div>

        <div className={`field${fieldErrors.requirements ? ' has-error' : ''}`}>
          <label htmlFor="requirements">Requisitos</label>
          <textarea id="requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
          <FieldError message={fieldErrors.requirements} />
        </div>

        <div className={`field${fieldErrors.compensation ? ' has-error' : ''}`}>
          <label htmlFor="compensation">Remuneração</label>
          <input type="text" id="compensation" value={compensation} onChange={(e) => setCompensation(e.target.value)} />
          <FieldError message={fieldErrors.compensation} />
        </div>

        <ImageUploadField label="Imagem" value={image} onChange={setImage} folder="castings" onUploading={setUploading} />
        <FieldError message={fieldErrors.image} />

        <button type="submit" disabled={submitting || uploading}>
          Salvar
        </button>{' '}
        <a href="/admin/castings/" className="btn secondary">
          Cancelar
        </a>
        <StatusMessage text={error} variant={error ? 'error' : 'neutral'} />
      </form>
    </>
  );
}
