'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { FieldError } from '../FieldError';
import { ImageUploadField } from '../ImageUploadField';
import { StatusMessage } from '../StatusMessage';
import { createCategory, updateCategory } from '@/lib/actions/categories';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { categorySchema } from '@/lib/validation/schemas';
import type { Category, WithId } from '@/lib/content/types';

interface CategoriaFormProps {
  category: WithId<Category> | null;
  id?: string;
}

export function CategoriaForm({ category, id }: CategoriaFormProps) {
  const router = useRouter();
  const isEditing = Boolean(category);

  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [image, setImage] = useState(category?.image ?? '');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const parsed = categorySchema.safeParse({ name, description, image });
    if (!parsed.success) {
      const errors = fieldErrorsFromZod(parsed.error);
      setFieldErrors(errors);
      setError(Object.values(errors)[0]);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    const result = isEditing && id ? await updateCategory(id, parsed.data) : await createCategory(parsed.data);
    setSubmitting(false);

    if (result.ok) {
      setError('');
      router.push('/admin/categorias/?saved=1');
    } else {
      setError(`Falha ao salvar: ${result.error}`);
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  return (
    <>
      <h1>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h1>

      <form className="admin-card" onSubmit={handleSubmit}>
        <div className={`field${fieldErrors.name ? ' has-error' : ''}`}>
          <label htmlFor="name">Nome</label>
          <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <FieldError message={fieldErrors.name} />
        </div>

        <div className={`field${fieldErrors.description ? ' has-error' : ''}`}>
          <label htmlFor="description">Descrição</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <FieldError message={fieldErrors.description} />
        </div>

        <ImageUploadField label="Imagem" value={image} onChange={setImage} folder="categories" onUploading={setUploading} />
        <FieldError message={fieldErrors.image} />

        <button type="submit" disabled={submitting || uploading}>
          Salvar
        </button>{' '}
        <a href="/admin/categorias/" className="btn secondary">
          Cancelar
        </a>
        <StatusMessage text={error} variant={error ? 'error' : 'neutral'} />
      </form>
    </>
  );
}
