'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, CalendarDays, X } from 'lucide-react';
import type { PortfolioGalleryItem } from '@/lib/portfolio';

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export default function MomentsGallery({ items }: { items: PortfolioGalleryItem[] }) {
  const [active, setActive] = useState<PortfolioGalleryItem | null>(null);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [active]);

  return <>
    <section className="zip-moments" aria-labelledby="zip-moments-title">
      <div className="zip-container">
        <header className="zip-section-head zip-reveal"><div><p className="zip-kicker">EN DEHORS DES ÉCRANS <span>/</span> MOMENTS</p><h2 id="zip-moments-title">Des rencontres,<br /><em>des moments vécus.</em></h2></div><p>Quelques images personnelles et événements qui racontent aussi mon parcours dans le numérique.</p></header>
        <div className="zip-moments-grid">
          {items.map((item, index) => <button type="button" className="zip-moment-card zip-reveal" style={{ '--delay': `${Math.min(index, 6) * 65}ms` } as React.CSSProperties} key={item.id} onClick={() => setActive(item)} aria-label={`Agrandir la photo : ${item.caption}`}>
            <span className="zip-moment-photo"><Image src={item.imageUrl} alt={item.caption} fill sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 40vw" unoptimized /><i aria-hidden="true" /></span>
            <span className="zip-moment-copy"><span className="zip-moment-occasion">{item.occasion || 'MOMENT DU PARCOURS'}{item.date && <span><CalendarDays size={12} />{formatDate(item.date)}</span>}</span><strong>{item.caption}</strong><span className="zip-moment-open">Agrandir <ArrowUpRight size={14} /></span></span>
          </button>)}
        </div>
      </div>
    </section>

    {active && <div className="zip-moment-lightbox" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
      <section className="zip-moment-dialog" role="dialog" aria-modal="true" aria-label={active.caption}>
        <button type="button" className="zip-moment-close" onClick={() => setActive(null)} aria-label="Fermer la photo"><X size={20} /></button>
        <div className="zip-moment-expanded"><Image src={active.imageUrl} alt={active.caption} fill sizes="(max-width: 800px) 96vw, 1200px" unoptimized /></div>
        <div className="zip-moment-dialog-caption"><div><p>{active.occasion || 'MOMENT DU PARCOURS'}{active.date && <> <span>/</span> {formatDate(active.date)}</>}</p><h2>{active.caption}</h2></div><span>ÉCHAP POUR FERMER <kbd>ESC</kbd></span></div>
      </section>
    </div>}
  </>;
}
