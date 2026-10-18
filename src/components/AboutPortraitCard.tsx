'use client';

import Image from 'next/image';

export default function AboutPortraitCard({ name, title, portraitUrl, projectCount, certificateCount }: {
  name: string;
  title: string;
  portraitUrl: string;
  projectCount: number;
  certificateCount: number;
}) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return <aside className="portfolio-about-card" onPointerMove={(event) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty('--portrait-tilt-x', `${-y * 6}deg`);
    event.currentTarget.style.setProperty('--portrait-tilt-y', `${x * 8}deg`);
  }} onPointerLeave={(event) => {
    event.currentTarget.style.setProperty('--portrait-tilt-x', '0deg');
    event.currentTarget.style.setProperty('--portrait-tilt-y', '0deg');
  }}>
    <div className="portfolio-about-portrait">
      {portraitUrl ? <Image src={portraitUrl} alt={name ? `Portrait de ${name}` : 'Portrait du profil'} fill sizes="(max-width: 620px) 90vw, 390px" unoptimized /> : <span>{initials || '✳'}</span>}
      <span className="portfolio-about-portrait-tag">{portraitUrl ? 'PORTRAIT' : 'PORTRAIT · NON FOURNI'}</span>
    </div>
    <p>IDENTITÉ NUMÉRIQUE / 01</p>
    <h2>{name || 'Profil personnel'}</h2>
    <span>{title || 'Parcours numérique en construction'}</span>
    <div className="portfolio-about-statline"><span><strong>{projectCount.toString().padStart(2, '0')}</strong> PROJETS</span><span><strong>{certificateCount.toString().padStart(2, '0')}</strong> PREUVES</span></div>
  </aside>;
}
