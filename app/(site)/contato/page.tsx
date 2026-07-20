import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';
import { getSiteSettings } from '@/lib/content/repository';

export const metadata: Metadata = { title: 'Contato' };
export const revalidate = 31536000;

export default async function ContatoPage() {
  const settings = await getSiteSettings();

  return (
    <main className="contato-page">
      <div className="kicker">Fale Conosco</div>
      <h1>Contato</h1>
      <p className="page-subtitle">Para parcerias, castings, ou para representar seu talento, fale com a nossa equipe.</p>

      <div className="contact-grid reveal">
        <div>
          <div className="contact-item">
            <div className="contact-label">E-mail</div>
            <div className="contact-value">
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-label">Telefone / WhatsApp</div>
            <div className="contact-value">{settings.phone}</div>
          </div>
          <div className="contact-item">
            <div className="contact-label">Localização</div>
            <div className="contact-value">{settings.address}</div>
          </div>
          <div className="contact-item">
            <div className="contact-label">Redes Sociais</div>
            <div className="contact-value">
              {settings.instagramUrl && <a href={settings.instagramUrl}>Instagram</a>}
              {settings.instagramUrl && settings.linkedinUrl && ' · '}
              {settings.linkedinUrl && <a href={settings.linkedinUrl}>LinkedIn</a>}
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </main>
  );
}
