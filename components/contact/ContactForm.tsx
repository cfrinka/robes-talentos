'use client';

import { useState, type FormEvent } from 'react';
import { contactSchema } from '@/lib/validation/schemas';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';

// No real backend yet -- validates client-side with zod and fake-submits
// (shows a success message) once the data is valid.
export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse({ name, email, subject, message });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }
    setFieldErrors({});
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="contact-form">
        <p className="body-text">Mensagem enviada! Nossa equipe vai responder pelo e-mail informado em breve.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div>
        <label className="field-label" htmlFor="name">
          Nome
        </label>
        <input
          className={`field-input${fieldErrors.name ? ' has-error' : ''}`}
          type="text"
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
      </div>
      <div>
        <label className="field-label" htmlFor="email">
          E-mail
        </label>
        <input
          className={`field-input${fieldErrors.email ? ' has-error' : ''}`}
          type="email"
          id="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
      </div>
      <div>
        <label className="field-label" htmlFor="subject">
          Assunto
        </label>
        <input
          className="field-input"
          type="text"
          id="subject"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="message">
          Mensagem
        </label>
        <textarea
          className={`field-textarea${fieldErrors.message ? ' has-error' : ''}`}
          id="message"
          name="message"
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {fieldErrors.message && <div className="field-error">{fieldErrors.message}</div>}
      </div>
      <button className="btn-accent" type="submit">
        Enviar Mensagem
      </button>
    </form>
  );
}
