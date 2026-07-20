'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <span className="logo small">
            robes<span className="accent">b</span>ritto
          </span>
          <p className="footer-tagline">m.o.d.a | p.r.o.d.u.ç.ã.o | a.r.t.e | d.i.r.e.ç.ã.o c.r.i.a.t.i.v.a</p>
        </div>
        <div>
          <div className="footer-heading">Navegação</div>
          <div className="footer-links">
            <Link href="/">Início</Link>
            <Link href="/talentos">Talentos</Link>
            <Link href="/editorial">Editorial</Link>
            <Link href="/castings">Castings</Link>
            <Link href="/sobre">Sobre</Link>
            <Link href="/contato">Contato</Link>
          </div>
        </div>
        <div>
          <div className="footer-heading">Categorias</div>
          <div className="footer-links">
            <span>Atores</span>
            <span>Modelos</span>
            <span>Cantores</span>
            <span>Dançarinos</span>
            <span>Influenciadores</span>
          </div>
        </div>
        <div>
          <div className="footer-heading">Newsletter</div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="seu e-mail" required />
            <button type="submit">Enviar</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; 2026 Robes Britto. Todos os direitos reservados.</span>
        <div className="footer-social">
          <span>Instagram</span>
          <span>LinkedIn</span>
          <span>WhatsApp</span>
        </div>
      </div>
    </footer>
  );
}
