import Link from 'next/link';

interface HeaderProps {
  onOpenMenu: () => void;
}

export function Header({ onOpenMenu }: HeaderProps) {
  return (
    <header className="site-header">
      <button className="menu-btn" aria-label="Abrir menu" onClick={onOpenMenu}>
        <span />
        <span />
        <span />
      </button>
      <Link href="/" className="logo">
        robes<span className="accent">b</span>ritto
      </Link>
      <span className="header-region">BR</span>
    </header>
  );
}
