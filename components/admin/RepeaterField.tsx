'use client';

import { FieldError } from './FieldError';

interface RepeaterFieldColumn<T> {
  key: keyof T & string;
  label: string;
}

interface RepeaterFieldProps<T extends object> {
  items: T[];
  columns: RepeaterFieldColumn<T>[];
  emptyItem: T;
  addLabel: string;
  onChange: (items: T[]) => void;
  error?: string;
}

// Generic key/value repeater used by the About Page singleton screen for
// both the "stats" and "values" lists (see admin-js/about-page.js's
// renderRepeater helper). Generic over T (rather than a fixed
// Record<string, string>) so callers keep their concrete Stat/ValueItem
// typing without an index-signature workaround.
export function RepeaterField<T extends object>({ items, columns, emptyItem, addLabel, onChange, error }: RepeaterFieldProps<T>) {
  function updateField(index: number, key: keyof T, value: string) {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div>
      <FieldError message={error} />
      {items.length === 0 && <p className="hint">Nenhum item ainda.</p>}
      {items.map((item, i) => (
        <div className="repeater-item" key={i}>
          <div className="repeater-head">
            <span>#{i + 1}</span>
            <button type="button" className="danger" onClick={() => removeItem(i)}>
              Remover
            </button>
          </div>
          <div className="field-row">
            {columns.map((column) => (
              <div className="field" style={{ marginBottom: 0 }} key={column.key}>
                <label>{column.label}</label>
                <input
                  type="text"
                  value={String(item[column.key] ?? '')}
                  onChange={(e) => updateField(i, column.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="secondary" style={{ marginTop: 6 }} onClick={() => onChange([...items, emptyItem])}>
        {addLabel}
      </button>
    </div>
  );
}
