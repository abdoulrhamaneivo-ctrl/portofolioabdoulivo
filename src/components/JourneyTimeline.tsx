'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { PortfolioJourneyItem } from '@/lib/portfolio';

function toneFor(category: PortfolioJourneyItem['category']) {
  if (category === 'Expérience') return 'blue';
  if (category === 'Contribution') return 'coral';
  return 'lime';
}

export default function JourneyTimeline({ items, variant = 'compact' }: { items: PortfolioJourneyItem[]; variant?: 'compact' | 'full' }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const isFull = variant === 'full';

  return <ol className={isFull ? 'zip-about-timeline' : 'zip-timeline'} aria-label="Étapes du parcours">
    {items.map((item, index) => {
      const open = openId === item.id;
      const detailId = `journey-detail-${item.id}`;
      return <li
        className={`${isFull ? 'zip-about-step' : 'zip-timeline-item'} zip-reveal${open ? ' is-open' : ''}`}
        data-tone={toneFor(item.category)}
        id={isFull ? `experience-${item.id}` : undefined}
        key={item.id}
        style={{ '--delay': `${index * (isFull ? 65 : 80)}ms` } as CSSProperties}
      >
        <span className={isFull ? 'zip-about-step-number' : 'zip-timeline-marker'} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <div className={isFull ? 'zip-about-step-content' : 'zip-timeline-content'}>
          <p className={isFull ? 'zip-about-step-meta' : 'zip-timeline-meta'}><span>{item.category}</span>{item.period && <i>{item.period}</i>}</p>
          <h3>{item.title}</h3>
          {item.organization && <strong className="zip-journey-organization">{item.organization}</strong>}
          <button
            type="button"
            className="zip-journey-toggle"
            aria-expanded={open}
            aria-controls={detailId}
            onClick={() => setOpenId(open ? null : item.id)}
          >
            <span>{open ? 'Réduire les détails' : isFull ? 'Découvrir cette étape' : 'Voir les détails'}</span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          <div className="zip-journey-detail" id={detailId} aria-hidden={!open}>
            <div className="zip-journey-detail-inner">
              <p>{item.description || 'Les détails de cette étape seront complétés depuis l’administration.'}</p>
              <span>{item.category} {item.period && `· ${item.period}`}</span>
            </div>
          </div>
        </div>
      </li>;
    })}
  </ol>;
}
