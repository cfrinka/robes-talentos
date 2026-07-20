'use client';

import Image from 'next/image';
import { useRef, type ChangeEvent } from 'react';
import { uploadViaApi } from './upload-client';

interface GalleryUploadFieldProps {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  onUploading?: (uploading: boolean) => void;
}

export function GalleryUploadField({ label, values, onChange, folder, onUploading }: GalleryUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    onUploading?.(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        uploaded.push(await uploadViaApi(file, folder));
      }
      onChange([...values, ...uploaded]);
    } finally {
      onUploading?.(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleRemove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="thumb-row">
        {values.map((url, i) => (
          <div className="thumb" key={`${i}-${url}`}>
            <Image src={url} alt="" width={72} height={72} />
            <button type="button" onClick={() => handleRemove(i)} aria-label="Remover imagem">
              ×
            </button>
          </div>
        ))}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleChange} />
    </div>
  );
}
