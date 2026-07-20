'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { FieldError } from '../FieldError';
import { ImageUploadField } from '../ImageUploadField';
import { GalleryUploadField } from '../GalleryUploadField';
import { StatusMessage } from '../StatusMessage';
import { createTalent, updateTalent, type TalentInput } from '@/lib/actions/talents';
import { slugify } from '@/lib/slugify';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { talentSchema } from '@/lib/validation/schemas';
import type { Availability, Category, Talent, WithId } from '@/lib/content/types';

const AVAILABILITY_OPTIONS: Availability[] = ['Disponível', 'Em turnê', 'Indisponível'];

interface TalentFormProps {
  categories: WithId<Category>[];
  talent: WithId<Talent> | null;
  id?: string;
}

export function TalentForm({ categories, talent, id }: TalentFormProps) {
  const router = useRouter();
  const isEditing = Boolean(talent);

  const [name, setName] = useState(talent?.name ?? '');
  const [slug, setSlug] = useState(talent?.slug ?? id ?? '');
  const [category, setCategory] = useState(talent?.category ?? categories[0]?.name ?? '');
  const [city, setCity] = useState(talent?.city ?? '');
  const [age, setAge] = useState(talent ? String(talent.age) : '');
  const [height, setHeight] = useState(talent?.height ?? '');
  const [gender, setGender] = useState(talent?.gender ?? '');
  const [languages, setLanguages] = useState(talent?.languages ?? '');
  const [availability, setAvailability] = useState<Availability>(talent?.availability ?? 'Disponível');
  const [bio, setBio] = useState(talent?.bio ?? '');
  const [skills, setSkills] = useState(talent?.skills?.join(', ') ?? '');
  const [image, setImage] = useState(talent?.image ?? '');
  const [gallery, setGallery] = useState<string[]>(talent?.gallery ?? []);
  const [reelThumbnail, setReelThumbnail] = useState(talent?.reelThumbnail ?? '');
  const [reelDuration, setReelDuration] = useState(talent?.reelDuration ?? '');
  const [reelUrl, setReelUrl] = useState(talent?.reelUrl ?? '');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleNameBlur() {
    if (!isEditing && !slug) setSlug(slugify(name));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const candidate: TalentInput = {
      slug,
      name,
      category,
      city,
      age: Number(age) || 0,
      height,
      gender,
      languages,
      availability,
      bio,
      skills: skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      image,
      gallery,
      reelThumbnail: reelThumbnail || null,
      reelDuration: reelDuration || null,
      reelUrl: reelUrl || null,
    };

    const parsed = talentSchema.safeParse(candidate);
    if (!parsed.success) {
      const errors = fieldErrorsFromZod(parsed.error);
      setFieldErrors(errors);
      setError(Object.values(errors)[0]);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    const result = isEditing && id ? await updateTalent(id, parsed.data) : await createTalent(parsed.data);
    setSubmitting(false);

    if (result.ok) {
      setError('');
      router.push('/admin/talentos/?saved=1');
    } else {
      setError(`Falha ao salvar: ${result.error}`);
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  return (
    <>
      <h1>{isEditing ? 'Editar Talento' : 'Novo Talento'}</h1>
      <p className="subtitle">Preencha os dados do talento.</p>

      <form className="admin-card" onSubmit={handleSubmit}>
        <div className="field-row">
          <div className={`field${fieldErrors.name ? ' has-error' : ''}`}>
            <label htmlFor="name">Nome</label>
            <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)} onBlur={handleNameBlur} />
            <FieldError message={fieldErrors.name} />
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
            <div className="hint">Gerado automaticamente do nome. Não pode ser alterado depois de criado.</div>
            <FieldError message={fieldErrors.slug} />
          </div>
        </div>

        <div className="field-row">
          <div className={`field${fieldErrors.category ? ' has-error' : ''}`}>
            <label htmlFor="category">Categoria</label>
            <select id="category" required value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.category} />
          </div>
          <div className={`field${fieldErrors.city ? ' has-error' : ''}`}>
            <label htmlFor="city">Cidade</label>
            <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            <FieldError message={fieldErrors.city} />
          </div>
        </div>

        <div className="field-row">
          <div className={`field${fieldErrors.age ? ' has-error' : ''}`}>
            <label htmlFor="age">Idade</label>
            <input type="number" id="age" min={0} value={age} onChange={(e) => setAge(e.target.value)} />
            <FieldError message={fieldErrors.age} />
          </div>
          <div className={`field${fieldErrors.height ? ' has-error' : ''}`}>
            <label htmlFor="height">Altura</label>
            <input type="text" id="height" placeholder="1,78m" value={height} onChange={(e) => setHeight(e.target.value)} />
            <FieldError message={fieldErrors.height} />
          </div>
        </div>

        <div className="field-row">
          <div className={`field${fieldErrors.gender ? ' has-error' : ''}`}>
            <label htmlFor="gender">Gênero</label>
            <input type="text" id="gender" value={gender} onChange={(e) => setGender(e.target.value)} />
            <FieldError message={fieldErrors.gender} />
          </div>
          <div className={`field${fieldErrors.languages ? ' has-error' : ''}`}>
            <label htmlFor="languages">Idiomas</label>
            <input
              type="text"
              id="languages"
              placeholder="PT, EN"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
            />
            <FieldError message={fieldErrors.languages} />
          </div>
        </div>

        <div className={`field${fieldErrors.availability ? ' has-error' : ''}`}>
          <label htmlFor="availability">Disponibilidade</label>
          <select id="availability" value={availability} onChange={(e) => setAvailability(e.target.value as Availability)}>
            {AVAILABILITY_OPTIONS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <FieldError message={fieldErrors.availability} />
        </div>

        <div className={`field${fieldErrors.bio ? ' has-error' : ''}`}>
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <FieldError message={fieldErrors.bio} />
        </div>

        <div className={`field${fieldErrors.skills ? ' has-error' : ''}`}>
          <label htmlFor="skills">Habilidades (separadas por vírgula)</label>
          <input
            type="text"
            id="skills"
            placeholder="Editorial, Passarela, Comercial"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <FieldError message={fieldErrors.skills} />
        </div>

        <ImageUploadField label="Foto principal" value={image} onChange={setImage} folder="talents" onUploading={setUploading} />
        <FieldError message={fieldErrors.image} />
        <GalleryUploadField
          label="Galeria de fotos"
          values={gallery}
          onChange={setGallery}
          folder="talents"
          onUploading={setUploading}
        />
        <ImageUploadField
          label="Thumbnail do reel"
          value={reelThumbnail}
          onChange={setReelThumbnail}
          folder="talents"
          onUploading={setUploading}
        />
        <FieldError message={fieldErrors.reelThumbnail} />

        <div className="field-row">
          <div className={`field${fieldErrors.reelDuration ? ' has-error' : ''}`}>
            <label htmlFor="reelDuration">Duração do reel</label>
            <input
              type="text"
              id="reelDuration"
              placeholder="0:45"
              value={reelDuration}
              onChange={(e) => setReelDuration(e.target.value)}
            />
            <FieldError message={fieldErrors.reelDuration} />
          </div>
          <div className={`field${fieldErrors.reelUrl ? ' has-error' : ''}`}>
            <label htmlFor="reelUrl">Link do reel (opcional)</label>
            <input
              type="url"
              id="reelUrl"
              placeholder="https://..."
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
            />
            <FieldError message={fieldErrors.reelUrl} />
          </div>
        </div>

        <button type="submit" disabled={submitting || uploading}>
          Salvar
        </button>{' '}
        <a href="/admin/talentos/" className="btn secondary">
          Cancelar
        </a>
        <StatusMessage text={error} variant={error ? 'error' : 'neutral'} />
      </form>
    </>
  );
}
