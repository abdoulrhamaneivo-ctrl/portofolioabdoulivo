import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Download, Mail } from 'lucide-react';
import type { PortfolioData } from '@/lib/portfolio';
import { safeExternalUrl } from '@/lib/urls';

function sortJourney(items: PortfolioData['journey']) {
  return [...items].filter((item) => item.published).sort((a, b) => {
    const year = (period: string) => Number(period.match(/\b(?:19|20)\d{2}\b/)?.[0] || 0);
    return year(b.period) - year(a.period);
  });
}

export default function AboutContent({ data }: { data: PortfolioData }) {
  const { profile, cv } = data;
  const name = profile.fullName.trim() || 'Mon parcours';
  const journey = sortJourney(data.journey);
  const skills = data.skillGroups.filter((group) => group.published);
  const linkedin = safeExternalUrl(profile.linkedin);
  const github = safeExternalUrl(profile.github);

  return <section className="zip-about-page zip-page-shell">
    <header className="zip-page-heading zip-reveal"><div><p className="zip-kicker">PROFIL <span>/</span> PRÉSENTATION</p><h1>Un parcours,<br /><em>des solutions.</em></h1></div><p>{profile.title || 'Transformation digitale, assistance informatique et conception de solutions numériques.'}</p><div className="zip-page-counts"><strong>{String(journey.length).padStart(2, '0')}</strong><span>étapes<br />de parcours</span><i /><strong>{String(skills.length).padStart(2, '0')}</strong><span>domaines<br />de compétence</span></div></header>

    <section className="zip-profile-block zip-reveal" id="presentation">
      <div className="zip-profile-image">{profile.portraitUrl ? <Image src={profile.portraitUrl} alt={`Portrait de ${name}`} fill sizes="(max-width: 800px) 100vw, 40vw" priority unoptimized /> : <div className="zip-profile-placeholder"><span>{name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><small>PORTRAIT À AJOUTER</small></div>}<span>IVO / PROFIL</span></div>
      <div className="zip-profile-copy"><p className="zip-kicker">QUI JE SUIS</p><h2>{name}<em>{profile.title || 'Acteur de la transformation digitale'}</em></h2><p>{profile.about || profile.introduction || 'Cette présentation se complète depuis l’administration avec ton histoire, tes objectifs et les expériences qui comptent pour toi.'}</p><div className="zip-profile-tags">{skills.map((group) => <span key={group.id}>{group.title}</span>)}</div><div className="zip-profile-actions"><Link className="zip-button zip-button-accent" href="/competences">Mes compétences <ArrowUpRight size={15} /></Link>{cv.fileUrl && <Link className="zip-button zip-button-outline" href="/cv">CV consultable <Download size={15} /></Link>}</div></div>
    </section>

    <section className="zip-about-journey" id="parcours"><header className="zip-section-head zip-reveal"><div><p className="zip-kicker">PARCOURS <span>/</span> EXPÉRIENCES</p><h2>Les étapes qui <em>comptent.</em></h2></div><p>Études, expériences et contributions, réunies dans un fil chronologique compact.</p></header>
      {journey.length ? <ol className="zip-about-timeline">{journey.map((item, index) => <li className="zip-about-step zip-reveal" id={`experience-${item.id}`} key={item.id}><span className="zip-about-step-number">{String(index + 1).padStart(2, '0')}</span><div><p className="zip-about-step-meta">{item.category}{item.period && <span>{item.period}</span>}</p><h3>{item.title}</h3>{item.organization && <strong>{item.organization}</strong>}{item.description && <p>{item.description}</p>}</div></li>)}</ol> : <div className="zip-empty-inline"><span className="zip-empty-mark">01</span><div><h3>Le parcours détaillé apparaîtra ici.</h3><p>Les étapes publiées depuis l’administration s’afficheront dans cette chronologie.</p></div></div>}
    </section>

    <section className="zip-about-contact" id="contact"><div className="zip-about-contact-copy zip-reveal"><p className="zip-kicker">RESTONS EN CONTACT</p><h2>À propos d’un projet,<br /><em>parlons-en.</em></h2><p>Une opportunité, une collaboration ou une question sur mon parcours.</p></div><div className="zip-about-contact-links zip-reveal">
      {profile.email && <a href={`mailto:${profile.email}`}><Mail size={16} /><span><small>E-MAIL</small><strong>{profile.email}</strong></span><ArrowUpRight size={16} /></a>}
      {linkedin && <a href={linkedin} target="_blank" rel="noreferrer"><span className="zip-social-mark">in</span><span><small>LINKEDIN</small><strong>Voir mon profil</strong></span><ArrowUpRight size={16} /></a>}
      {github && <a href={github} target="_blank" rel="noreferrer"><span className="zip-social-mark">GH</span><span><small>GITHUB</small><strong>Voir mes réalisations</strong></span><ArrowUpRight size={16} /></a>}
      {!profile.email && !linkedin && !github && <Link href="/admin"><span className="zip-social-mark">↗</span><span><small>COORDONNÉES</small><strong>Mes liens professionnels</strong></span><ArrowUpRight size={16} /></Link>}
    </div></section>
  </section>;
}
