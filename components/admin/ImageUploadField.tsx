'use client';

import Image from 'next/image';
import { useRef, type ChangeEvent } from 'react';
import { uploadViaApi } from './upload-client';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  onUploading?: (uploading: boolean) => void;
  removable?: boolean;
}

export function ImageUploadField({ label, value, onChange, folder, onUploading, removable = false }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploading?.(true);
    try {
      onChange(await uploadViaApi(file, folder));
    } finally {
      onUploading?.(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="thumb-row">
        {value && (
          <div className="thumb">
            <Image src={value} alt="" width={72} height={72} />
            {removable && (
              <button type="button" onClick={() => onChange('')} aria-label="Remover imagem">
                ×
              </button>
            )}
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} />
    </div>
  );
}
