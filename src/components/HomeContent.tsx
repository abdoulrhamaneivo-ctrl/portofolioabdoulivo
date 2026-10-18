'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Code2, Layers3, Network, PanelsTopLeft } from 'lucide-react';
import type { PortfolioData, PortfolioJourneyItem, PortfolioSkillGroup } from '@/lib/portfolio';

function list(value: string) {
  return Array.from(new Set(value.split(/[,;\n]/).map((part) => part.trim()).filter(Boolean)));
}

function sortJourney(items: PortfolioJourneyItem[]) {
  return [...items].filter((item) => item.published).sort((a, b) => {
    const year = (period: string) => Number(period.match(/\b(?:19|20)\d{2}\b/)?.[0] || 0);
    return year(b.period) - year(a.period);
  });
}

function SkillTile({ group, index }: { group: PortfolioSkillGroup; index: number }) {
  const tags = list(group.items);
  const icons = [Code2, Network, PanelsTopLeft, Layers3];
  const Icon = icons[index % icons.length];
  return <article className="zip-skill-card zip-reveal" style={{ '--delay': `${index * 65}ms` } as CSSProperties}>
    <div className="zip-skill-card-top"><span className="zip-skill-icon"><Icon size={18} strokeWidth={1.7} /></span><span className="zip-skill-index">{String(index + 1).padStart(2, '0')}</span></div>
    <h3>{group.title}</h3>
    <div className="zip-skill-tags">{tags.length ? tags.map((tag) => <span key={tag}>{tag}</span>) : <span>Langages à préciser</span>}</div>
    {group.summary && <p>{group.summary}</p>}
    <div className="zip-skill-status"><i aria-hidden="true" />{group.level || 'Niveau à préciser'}</div>
  </article>;
}

function HeroScene({ data }: { data: PortfolioData }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const name = data.profile.fullName.trim() || 'Mon profil';
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();

  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    event.currentTarget.style.setProperty('--tilt-x', `${-y * 8}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${x * 10}deg`);
  };
  const resetTilt = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  };

  return <div className="zip-scene-wrap zip-reveal">
    <div ref={sceneRef} className={`zip-scene${opened ? ' is-open' : ''}`} onPointerMove={tilt} onPointerLeave={resetTilt}>
      <span className="zip-scene-cross zip-scene-cross-a" aria-hidden="true">+</span><span className="zip-scene-cross zip-scene-cross-b" aria-hidden="true">+</span>
      <div className="zip-scene-grid" aria-hidden="true" />
      <div className="zip-scene-object" aria-hidden="true" style={{ '--scene-back-z': `${-24 - data.settings.sceneDepth * .48}px`, '--scene-mid-z': `${-9 - data.settings.sceneDepth * .16}px`, '--scene-front-z': `${15 + data.settings.sceneDepth * .22}px` } as CSSProperties}>
        <div className="zip-scene-layer zip-scene-layer-back"><span>01 / PROFIL</span><b>{initials}</b><small>IVO ABDOULRHAMANE NESTOR</small></div>
        <div className="zip-scene-layer zip-scene-layer-mid"><span>PORTFOLIO NUMÉRIQUE</span><div className="zip-scene-photo">{data.profile.portraitUrl ? <Image src={data.profile.portraitUrl} alt="" fill sizes="(max-width: 800px) 40vw, 270px" unoptimized /> : <b>{initials}</b>}</div><i className="zip-scene-beam" /></div>
        <div className="zip-scene-layer zip-scene-layer-front"><span>PARCOURS / SAVOIR-FAIRE</span><strong>{name}</strong><small>{data.profile.title || 'Solutions numériques & transformation digitale'}</small><div className="zip-scene-bars"><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
        <span className="zip-scene-float zip-scene-float-one">PROJETS <b>↗</b></span><span className="zip-scene-float zip-scene-float-two">SKILLS <b>✳</b></span>
      </div>
      <button className="zip-scene-toggle" type="button" aria-pressed={opened} onClick={() => setOpened((value) => !value)}>{opened ? 'Rassembler les couches' : 'Explorer les couches'} <ArrowUpRight size={15} /></button>
      <span className="zip-scene-caption">INTERFACE EN MOUVEMENT · SURVOLE OU ACTIVE</span>
    </div>
    <div className="zip-scene-foot"><span>01 / LE PROFIL</span><span>Une présentation qui se découvre en profondeur</span></div>
  </div>;
}

export default function HomeContent({ data }: { data: PortfolioData }) {
  const progressRef = useRef<HTMLSpanElement>(null);
  const profile = data.profile;
  const name = profile.fullName.trim();
  const skills = useMemo(() => data.skillGroups.filter((group) => group.published), [data.skillGroups]);
  const journey = useMemo(() => sortJourney(data.journey), [data.journey]);
  const projects = useMemo(() => data.projects.filter((project) => project.published), [data.projects]);
  const certificates = useMemo(() => data.certificates.filter((certificate) => certificate.published), [data.certificates]);
  const topics = useMemo(() => [
    'DIGITALISATION', 'RÉSEAUX & ASSISTANCE', 'GESTION DE PROJET', 'OUTILS OFFICE', 'PROGRAMMATION', 'CONCEPTION NUMÉRIQUE',
  ], []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.zip-reveal'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = reducedMotion ? null : new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer?.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -30px 0px' });
    document.documentElement.classList.add('zip-motion-ready');
    if (observer) nodes.forEach((node) => observer.observe(node));
    else nodes.forEach((node) => node.classList.add('is-visible'));
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current?.style.setProperty('transform', `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { if (frame) window.cancelAnimationFrame(frame); observer?.disconnect(); document.documentElement.classList.remove('zip-motion-ready'); window.removeEventListener('scroll', onScroll); };
  }, []);

  return <div className="zip-home">
    <div className="zip-progress" aria-hidden="true"><span ref={progressRef} /></div>
    <section className="zip-hero" id="accueil">
      <div className="zip-hero-copy">
        <p className="zip-eyebrow zip-reveal"><i /> PORTFOLIO PERSONNEL <span>/</span> TRANSFORMATION DIGITALE</p>
        <h1 className="zip-reveal">{name || 'IVO ABDOULRHAMANE NESTOR'}<em>{profile.title || 'Ingénierie & solutions numériques'}</em></h1>
        <p className="zip-hero-intro zip-reveal">{profile.introduction || 'Je développe mes compétences dans le numérique, l’assistance informatique et la gestion de projets. Ici, mon parcours et mes réalisations prennent forme.'}</p>
        <div className="zip-hero-actions zip-reveal"><Link className="zip-button zip-button-accent" href="/projects">Voir mes réalisations <ArrowRight size={16} /></Link><Link className="zip-button zip-button-outline" href="/about">Mon parcours <ArrowDownRight size={16} /></Link></div>
        <div className="zip-hero-meta zip-reveal"><span><i /> DISPONIBLE POUR ÉCHANGER</span><span>{String(projects.length).padStart(2, '0')} PROJETS · {String(skills.length).padStart(2, '0')} DOMAINES</span></div>
      </div>
      <HeroScene data={data} />
      <span className="zip-hero-side" aria-hidden="true">THE LIVING PORTFOLIO · {name || 'IVO'}</span>
    </section>

    <div className="zip-ribbon" aria-hidden="true"><div className="zip-ribbon-track">{[...topics, ...topics].map((topic, index) => <span key={`${topic}-${index}`}>{topic}<i>✳</i></span>)}</div></div>

    <section className="zip-approach zip-container" id="demarche">
      <header className="zip-section-head zip-reveal"><div><p className="zip-kicker">MA DÉMARCHE <span>/</span> 01</p><h2>Du besoin à la <em>solution.</em></h2></div><p>Une approche concrète : comprendre le contexte, structurer les besoins, construire avec méthode et apprendre du résultat.</p></header>
      <div className="zip-approach-grid">
        {[
          ['01', 'Comprendre', 'Identifier le besoin, les personnes concernées et le résultat attendu.'],
          ['02', 'Concevoir', 'Organiser les idées, clarifier les fonctionnalités et penser l’usage.'],
          ['03', 'Construire', 'Choisir les outils adaptés et avancer par étapes lisibles.'],
          ['04', 'Évaluer', 'Vérifier ce qui fonctionne et documenter ce qui reste à améliorer.'],
        ].map(([index, title, copy]) => <article className="zip-approach-card zip-reveal" key={index}><span>{index} <i className="zip-line" /></span><h3>{title}</h3><p>{copy}</p></article>)}
      </div>
    </section>

    <section className="zip-showcase" id="projets">
      <div className="zip-container">
        <header className="zip-section-head zip-reveal"><div><p className="zip-kicker">TRAVAIL DOCUMENTÉ <span>/</span> 02</p><h2>Projets & <em>contributions.</em></h2></div><Link className="zip-text-link" href="/projects">Tous les projets <ArrowUpRight size={16} /></Link></header>
        {projects.length ? <div className="zip-project-grid">{projects.slice(0, 3).map((project, index) => <Link className="zip-project-card zip-reveal" href={`/projects/${project.id}`} key={project.id}>
          <div className="zip-project-image">{project.imageUrl ? <Image src={project.imageUrl} alt={`Aperçu de ${project.title}`} fill sizes="(max-width: 720px) 100vw, 33vw" unoptimized /> : <div className="zip-project-art" aria-hidden="true"><span>{`{ ${String(index + 1).padStart(2, '0')} }`}</span><i /><b /></div>}<span className="zip-project-image-index">PROJET / {String(index + 1).padStart(2, '0')}</span></div>
          <div className="zip-project-copy"><p>{project.featured ? 'À LA UNE' : 'ÉTUDE DE CAS'} <ArrowUpRight size={14} /></p><h3>{project.title}</h3><span>{project.summary}</span></div>
        </Link>)}</div> : <div className="zip-empty-inline zip-reveal"><span className="zip-empty-mark">01</span><div><h3>Les réalisations publiées apparaîtront ici.</h3><p>Chaque fiche montrera le problème, ma contribution, la solution et les technologies utilisées.</p></div><Link className="zip-text-link" href="/about#parcours">Voir mes contributions <ArrowUpRight size={16} /></Link></div>}
      </div>
    </section>

    <section className="zip-skills" id="competences">
      <div className="zip-container">
        <header className="zip-section-head zip-reveal"><div><p className="zip-kicker">COMPÉTENCES <span>/</span> 03</p><h2>Ce que je sais <em>faire.</em></h2></div><p>Des domaines clairement séparés. Les langages précis et les preuves pourront être complétés dans l’administration.</p></header>
        <div className="zip-skill-grid">{skills.map((group, index) => <SkillTile group={group} index={index} key={group.id} />)}</div>
        {journey.length > 0 && <div className="zip-capability-strip zip-reveal"><span>PRATIQUE DOCUMENTÉE</span><p>{journey.slice(0, 2).map((item) => item.title).join(' · ')}</p><Link href="/competences">Détails <ArrowUpRight size={14} /></Link></div>}
        <Link href="/competences" className="zip-button zip-button-dark zip-skills-more">Explorer les compétences <ArrowRight size={16} /></Link>
      </div>
    </section>

    <section className="zip-journey" id="parcours">
      <div className="zip-container zip-journey-layout">
        <header className="zip-section-head zip-journey-head zip-reveal"><div><p className="zip-kicker">PARCOURS <span>/</span> 04</p><h2>Apprendre.<br /><em>Contribuer.</em><br />Avancer.</h2></div><p>Les étapes qui montrent comment mon intérêt pour le numérique se traduit en pratique.</p><Link className="zip-text-link" href="/about#parcours">Tout le parcours <ArrowUpRight size={16} /></Link></header>
        {journey.length ? <div className="zip-timeline">{journey.slice(0, 4).map((item, index) => <article className="zip-timeline-item zip-reveal" key={item.id} style={{ '--delay': `${index * 80}ms` } as CSSProperties}><span className="zip-timeline-marker">{String(index + 1).padStart(2, '0')}</span><div><p>{item.category} <span>/</span> {item.period}</p><h3>{item.title}</h3>{item.organization && <small>{item.organization}</small>}<p className="zip-timeline-copy">{item.description}</p></div></article>)}</div> : <div className="zip-empty-inline zip-reveal"><span className="zip-empty-mark">01</span><div><h3>Le parcours sera détaillé ici.</h3><p>Formations, expériences et contributions apparaîtront à mesure qu’elles seront publiées.</p></div></div>}
      </div>
    </section>

    <section className="zip-explore zip-container" aria-labelledby="zip-explore-title">
      <header className="zip-section-head zip-reveal"><div><p className="zip-kicker">POURSUIVRE L’EXPLORATION <span>/</span> 05</p><h2 id="zip-explore-title">Un profil, plusieurs <em>facettes.</em></h2></div><p>Chaque espace apporte un autre angle sur mon travail et mon apprentissage.</p></header>
      <div className="zip-explore-grid">
        {[
          { label: 'Profil', href: '/about', count: '01', detail: profile.about ? 'Mon histoire et mes objectifs' : 'Présentation et objectifs' },
          { label: 'Certifications', href: '/certifications', count: String(certificates.length).padStart(2, '0'), detail: 'Formations et preuves' },
          { label: 'Laboratoire', href: '/experiments', count: String(data.experiments.filter((item) => item.published).length).padStart(2, '0'), detail: 'Essais et prototypes' },
          { label: 'CV consultable', href: '/cv', count: data.cv.fileUrl ? 'PDF' : '↗', detail: data.cv.fileUrl ? 'Lire ou télécharger' : 'Consulter le document' },
        ].map((tile) => <Link href={tile.href} className="zip-explore-tile zip-reveal" key={tile.href}><span>{tile.count}</span><div><h3>{tile.label}</h3><p>{tile.detail}</p></div><ArrowUpRight size={17} /></Link>)}
      </div>
    </section>

    <section className="zip-contact" id="contact">
      <div className="zip-container zip-contact-inner"><div className="zip-contact-copy zip-reveal"><p className="zip-kicker">CONTACT <span>/</span> LA SUITE</p><h2>Échangeons autour<br />d’une <em>idée concrète.</em></h2><p>{profile.email ? 'Pour parler d’un projet, d’une collaboration ou d’une opportunité professionnelle.' : 'Retrouve mes coordonnées professionnelles et mes profils dans ma présentation.'}</p></div><div className="zip-contact-actions zip-reveal">{profile.email ? <a href={`mailto:${profile.email}`} className="zip-button zip-button-accent">M’écrire <ArrowUpRight size={16} /></a> : <Link href="/about#contact" className="zip-button zip-button-accent">Mes coordonnées <ArrowUpRight size={16} /></Link>}<Link href="/cv" className="zip-button zip-button-outline">Consulter mon CV <ArrowUpRight size={16} /></Link></div><span className="zip-contact-signature" aria-hidden="true">IN</span></div>
    </section>
  </div>;
}
