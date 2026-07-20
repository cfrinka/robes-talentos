'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { FieldError } from '../FieldError';
import { ImageUploadField } from '../ImageUploadField';
import { StatusMessage } from '../StatusMessage';
import { BlockEditor } from './BlockEditor';
import { createArticle, updateArticle } from '@/lib/actions/articles';
import { slugify } from '@/lib/slugify';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { articleSchema } from '@/lib/validation/schemas';
import type { Article, ArticleBlock, WithId } from '@/lib/content/types';

interface ArticleFormProps {
  article: WithId<Article> | null;
  id?: string;
}

export function ArticleForm({ article, id }: ArticleFormProps) {
  const router = useRouter();
  const isEditing = Boolean(article);

  const [title, setTitle] = useState(article?.title ?? '');
  const [slug, setSlug] = useState(article?.slug ?? id ?? '');
  const [category, setCategory] = useState(article?.category ?? '');
  const [date, setDate] = useState(article?.date ?? '');
  const [author, setAuthor] = useState(article?.author ?? '');
  const [readTime, setReadTime] = useState(article?.readTime ?? '');
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [image, setImage] = useState(article?.image ?? '');
  const [blocks, setBlocks] = useState<ArticleBlock[]>(article?.body ?? []);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleTitleBlur() {
    if (!isEditing && !slug) setSlug(slugify(title));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const parsed = articleSchema.safeParse({
      title,
      slug,
      category,
      date,
      author,
      readTime,
      excerpt,
      image,
      body: blocks,
    });
    if (!parsed.success) {
      const errors = fieldErrorsFromZod(parsed.error);
      setFieldErrors(errors);
      setError(Object.values(errors)[0]);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    const result = isEditing && id ? await updateArticle(id, parsed.data) : await createArticle(parsed.data);
    setSubmitting(false);

    if (result.ok) {
      setError('');
      router.push('/admin/editorial/?saved=1');
    } else {
      setError(`Falha ao salvar: ${result.error}`);
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  return (
    <>
      <h1>{isEditing ? 'Editar Artigo' : 'Novo Artigo'}</h1>

      <form className="admin-card" onSubmit={handleSubmit}>
        <div className="field-row">
          <div className={`field${fieldErrors.title ? ' has-error' : ''}`}>
            <label htmlFor="title">Título</label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
            />
            <FieldError message={fieldErrors.title} />
          </div>
          <div className={`field${fieldErrors.slug ? ' has-error' : ''}`}>
            <label htmlFor="slug">Slug (usado na URL)</label>
            <input
              type="text"
              id="slug"
              required
              readOnly={isEditing}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <div className="hint">Gerado automaticamente do título. Não pode ser alterado depois de criado.</div>
            <FieldError message={fieldErrors.slug} />
          </div>
        </div>

        <div className="field-row">
          <div className={`field${fieldErrors.category ? ' has-error' : ''}`}>
            <label htmlFor="category">Categoria</label>
            <input
              type="text"
              id="category"
              placeholder="Moda, Carreira, Produção..."
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <FieldError message={fieldErrors.category} />
          </div>
          <div className={`field${fieldErrors.date ? ' has-error' : ''}`}>
            <label htmlFor="date">Data</label>
            <input
              type="text"
              id="date"
              placeholder="12 de julho de 2026"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <FieldError message={fieldErrors.date} />
          </div>
        </div>

        <div className="field-row">
          <div className={`field${fieldErrors.author ? ' has-error' : ''}`}>
            <label htmlFor="author">Autor</label>
            <input type="text" id="author" required value={author} onChange={(e) => setAuthor(e.target.value)} />
            <FieldError message={fieldErrors.author} />
          </div>
          <div className={`field${fieldErrors.readTime ? ' has-error' : ''}`}>
            <label htmlFor="readTime">Tempo de leitura</label>
            <input
              type="text"
              id="readTime"
              placeholder="4 min de leitura"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
            />
            <FieldError message={fieldErrors.readTime} />
          </div>
        </div>

        <div className={`field${fieldErrors.excerpt ? ' has-error' : ''}`}>
          <label htmlFor="excerpt">Resumo</label>
          <textarea id="excerpt" required value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          <FieldError message={fieldErrors.excerpt} />
        </div>

        <ImageUploadField label="Imagem de capa" value={image} onChange={setImage} folder="articles" onUploading={setUploading} />
        <FieldError message={fieldErrors.image} />

        <BlockEditor blocks={blocks} onChange={setBlocks} onUploading={setUploading} error={fieldErrors.body} />

        <button type="submit" disabled={submitting || uploading}>
          Salvar
        </button>{' '}
        <a href="/admin/editorial/" className="btn secondary">
          Cancelar
        </a>
        <StatusMessage text={error} variant={error ? 'error' : 'neutral'} />
      </form>
    </>
  );
}
