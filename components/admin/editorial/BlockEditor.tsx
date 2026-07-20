'use client';

import Image from 'next/image';
import type { ChangeEvent } from 'react';
import { FieldError } from '../FieldError';
import { uploadViaApi } from '../upload-client';
import type { ArticleBlock } from '@/lib/content/types';

interface BlockEditorProps {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
  onUploading?: (uploading: boolean) => void;
  error?: string;
}

// Repeatable paragraph/image block editor for articles, ported from
// admin-js/editorial-edit.js's renderBlocks().
export function BlockEditor({ blocks, onChange, onUploading, error }: BlockEditorProps) {
  function updateBlock(index: number, patch: Partial<ArticleBlock>) {
    onChange(blocks.map((b, i) => (i === index ? ({ ...b, ...patch } as ArticleBlock) : b)));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  async function handleImageUpload(index: number, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    onUploading?.(true);
    try {
      updateBlock(index, { src: await uploadViaApi(file, 'articles') });
    } finally {
      onUploading?.(false);
    }
  }

  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label>Corpo do artigo</label>
      <FieldError message={error} />
      <div>
        {blocks.length === 0 && <p className="hint">Nenhum bloco ainda. Adicione um parágrafo ou imagem abaixo.</p>}
        {blocks.map((block, i) => (
          <div className="block-item" key={i}>
            <div className="block-head">
              <span>{block.type === 'paragraph' ? 'Parágrafo' : 'Imagem'}</span>
              <div>
                <button type="button" disabled={i === 0} onClick={() => moveBlock(i, -1)}>
                  ↑
                </button>{' '}
                <button type="button" disabled={i === blocks.length - 1} onClick={() => moveBlock(i, 1)}>
                  ↓
                </button>{' '}
                <button type="button" className="danger" onClick={() => removeBlock(i)}>
                  Remover
                </button>
              </div>
            </div>

            {block.type === 'paragraph' ? (
              <textarea value={block.text} onChange={(e) => updateBlock(i, { text: e.target.value })} />
            ) : (
              <>
                <div className="thumb-row">
                  {block.src && (
                    <div className="thumb">
                      <Image src={block.src} alt="" width={72} height={72} />
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(i, e)} />
                <div className="field" style={{ marginTop: 10 }}>
                  <label>Texto alternativo</label>
                  <input type="text" value={block.alt} onChange={(e) => updateBlock(i, { alt: e.target.value })} />
                </div>
                <div className="field" style={{ marginTop: 10, marginBottom: 0 }}>
                  <label>Legenda (opcional)</label>
                  <input
                    type="text"
                    value={block.caption ?? ''}
                    onChange={(e) => updateBlock(i, { caption: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button type="button" className="secondary" onClick={() => onChange([...blocks, { type: 'paragraph', text: '' }])}>
          + Parágrafo
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => onChange([...blocks, { type: 'image', src: '', alt: '', caption: '' }])}
        >
          + Imagem
        </button>
      </div>
    </div>
  );
}
