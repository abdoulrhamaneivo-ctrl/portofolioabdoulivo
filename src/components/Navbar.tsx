'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { globalConfig } from '@/config/global';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setIsMenuOpen(false), [pathname]);

  const isActive = (path: string) => path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <header className="portfolio-navbar">
      <div className="portfolio-navbar-inner">
        <Link href="/" className="portfolio-brand" aria-label="Retour à l’accueil du portfolio">
          <span className="portfolio-brand-mark" aria-hidden="true">✳</span>
          <span>THE LIVING<br className="portfolio-brand-break" /> PORTFOLIO</span>
        </Link>

        <button
          type="button"
          className="portfolio-menu-toggle"
          aria-label={isMenuOpen ? 'Fermer la navigation' : 'Ouvrir la navigation'}
          aria-expanded={isMenuOpen}
          aria-controls="portfolio-primary-nav"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>

        <nav id="portfolio-primary-nav" className={`portfolio-nav${isMenuOpen ? ' is-open' : ''}`} aria-label={globalConfig.navigation.aria}>
          {globalConfig.navigation.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="portfolio-nav-link"
              aria-current={isActive(item.href) ? 'page' : undefined}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.title}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
        {isMenuOpen && <button className="portfolio-nav-backdrop" aria-label="Fermer la navigation" onClick={() => setIsMenuOpen(false)} />}
      </div>
    </header>
  );
}
