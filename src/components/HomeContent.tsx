'use client';

import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Award, Code2, ExternalLink, Layers3, Network, PanelsTopLeft } from 'lucide-react';
import type { PortfolioCertificate, PortfolioData, PortfolioJourneyItem, PortfolioSkillGroup } from '@/lib/portfolio';
import JourneyTimeline from '@/components/JourneyTimeline';
import ProjectMediaFrame from '@/components/ProjectMediaFrame';
import { safeExternalUrl } from '@/lib/urls';

function list(value: string) {
  return Array.from(new Set(value.split(/[,;\n]/).map((part) => part.trim()).filter(Boolean)));
}

function sortJourney(items: PortfolioJourneyItem[]) {
  return [...items].filter((item) => item.published).sort((a, b) => {
    const year = (period: string) => Number(period.match(/\b(?:19|20)\d{2}\b/)?.[0] || 0);
    return year(b.period) - year(a.period);
  });
}

function certificateDate(value: string) {
  if (/^\d{4}-\d{2}$/.test(value)) return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${value}-01T12:00:00`));
  return value;
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
  const profile = data.profile;
  const name = profile.fullName.trim();
  const skills = useMemo(() => data.skillGroups.filter((group) => group.published), [data.skillGroups]);
  const journey = useMemo(() => sortJourney(data.journey), [data.journey]);
  const projects = useMemo(() => data.projects.filter((project) => project.published).sort((a, b) => Number(b.featured) - Number(a.featured)), [data.projects]);
  const certificates = useMemo(() => data.certificates.filter((certificate) => certificate.published), [data.certificates]);
  const featuredCertificates = useMemo(() => [...certificates].sort((a, b) => Number(b.featured) - Number(a.featured) || b.date.localeCompare(a.date)).slice(0, 3), [certificates]);
  const topics = useMemo(() => [
    'DIGITALISATION', 'RÉSEAUX & ASSISTANCE', 'GESTION DE PROJET', 'OUTILS OFFICE', 'PROGRAMMATION', 'CONCEPTION NUMÉRIQUE',
  ], []);

  return <div className="zip-home">
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

    <section className="zip-showcase" id="projets">
      <div className="zip-container">
        <header className="zip-section-head zip-reveal"><div><p className="zip-kicker">PROJETS <span>/</span> 01</p><h2>Des réalisations<br /><em>à voir en clair.</em></h2></div><p>Le contexte, ma contribution et les outils apparaissent directement ici, sans devoir ouvrir chaque fiche.</p><Link className="zip-text-link" href="/projects">Tous les projets <ArrowUpRight size={16} /></Link></header>
        {projects.length ? <div className="zip-project-grid">{projects.slice(0, 3).map((project, index) => <article className="zip-project-card zip-home-project-card zip-reveal" key={project.id}>
          <ProjectMediaFrame title={project.title} imageUrl={project.imageUrl} videoUrl={project.videoUrl} index={index} />
          <div className="zip-project-copy"><p>{project.featured ? 'PROJET À LA UNE' : 'ÉTUDE DE CAS'} <span>{project.featured ? '✳' : String(index + 1).padStart(2, '0')}</span></p><h3><Link href={`/projects/${project.id}`}>{project.title}</Link></h3>
            {project.summary && <span className="zip-home-project-summary">{project.summary}</span>}
            <div className="zip-home-project-facts">{project.problem && <div><strong>Le besoin</strong><p>{project.problem}</p></div>}{project.contribution && <div><strong>Ma contribution</strong><p>{project.contribution}</p></div>}{project.solution && <div><strong>La solution</strong><p>{project.solution}</p></div>}</div>
            {project.technologies && <div className="zip-project-tags">{project.technologies.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 6).map((item) => <span key={item}>{item}</span>)}</div>}
            <div className="zip-home-project-links"><Link href={`/projects/${project.id}`}>Étude complète <ArrowUpRight size={14} /></Link>{safeExternalUrl(project.proofUrl) && <a href={safeExternalUrl(project.proofUrl)!} target="_blank" rel="noreferrer">Preuve du travail <ExternalLink size={14} /></a>}{safeExternalUrl(project.link) && <a href={safeExternalUrl(project.link)!} target="_blank" rel="noreferrer">Voir le projet <ExternalLink size={14} /></a>}</div>
          </div>
        </article>)}</div> : <div className="zip-feature-empty zip-reveal"><span className="zip-empty-mark">00</span><div><p className="zip-kicker">RÉALISATIONS À PUBLIER</p><h3>Aucun projet n’est encore visible ici.</h3><p>Les projets publiés apparaîtront directement avec leur contexte, la contribution, les technologies et les preuves.</p></div><Link className="zip-text-link" href="/admin">Préparer une fiche projet <ArrowUpRight size={16} /></Link></div>}
      </div>
    </section>

    <section className="zip-cert-showcase" id="certifications">
      <div className="zip-container">
        <header className="zip-section-head zip-reveal"><div><p className="zip-kicker">CERTIFICATIONS <span>/</span> 02</p><h2>Les preuves de mon<br /><em>apprentissage.</em></h2></div><p>Organisme, date, compétences et document consultable sont affichés sur la page, pas cachés dans une fiche à ouvrir.</p><Link className="zip-text-link" href="/certifications">Toute la bibliothèque <ArrowUpRight size={16} /></Link></header>
        {featuredCertificates.length ? <div className="zip-cert-grid">{featuredCertificates.map((certificate: PortfolioCertificate, index) => {
          const verification = safeExternalUrl(certificate.verificationUrl);
          return <article className="zip-cert-card zip-reveal" key={certificate.id} style={{ '--delay': `${index * 70}ms` } as CSSProperties}>
            <div className="zip-cert-card-top"><span><Award size={17} /> {certificate.type || 'APPRENTISSAGE DOCUMENTÉ'}</span><strong>{String(index + 1).padStart(2, '0')}</strong></div>
            <h3>{certificate.title}</h3><p className="zip-cert-issuer">{certificate.issuer || 'Organisme à préciser'}{certificate.date && <><i>·</i><time>{certificateDate(certificate.date)}</time></>}</p>
            <div className="zip-cert-tags">{certificate.domain && <span>{certificate.domain}</span>}{certificate.level && <span>{certificate.level}</span>}{certificate.skills.split(/[,;\n]+/).map((skill) => skill.trim()).filter(Boolean).slice(0, 4).map((skill) => <span className="is-skill" key={skill}>{skill}</span>)}</div>
            <div className="zip-cert-links">{certificate.fileUrl && <a href={certificate.fileUrl} target="_blank" rel="noreferrer">Consulter le certificat <ArrowUpRight size={14} /></a>}{verification && <a href={verification} target="_blank" rel="noreferrer">Vérifier en ligne <ExternalLink size={14} /></a>}{!certificate.fileUrl && !verification && <span>Document à joindre</span>}</div>
          </article>;
        })}</div> : <div className="zip-feature-empty zip-feature-empty-cert zip-reveal"><span className="zip-empty-mark">00</span><div><p className="zip-kicker">CERTIFICATS À PUBLIER</p><h3>Aucune preuve n’est encore visible ici.</h3><p>Chaque certificat publié sera présenté avec son organisme, sa date, ses compétences et un accès direct au document ou au lien de vérification.</p></div><Link className="zip-text-link" href="/admin">Ajouter des certificats <ArrowUpRight size={16} /></Link></div>}
      </div>
    </section>

    <section className="zip-approach zip-container" id="demarche">
      <header className="zip-section-head zip-reveal"><div><p className="zip-kicker">MA DÉMARCHE <span>/</span> 03</p><h2>Du besoin à la <em>solution.</em></h2></div><p>Une approche concrète : comprendre le contexte, structurer les besoins, construire avec méthode et apprendre du résultat.</p></header>
      <div className="zip-approach-grid">
        {[
          ['01', 'Comprendre', 'Identifier le besoin, les personnes concernées et le résultat attendu.'],
          ['02', 'Concevoir', 'Organiser les idées, clarifier les fonctionnalités et penser l’usage.'],
          ['03', 'Construire', 'Choisir les outils adaptés et avancer par étapes lisibles.'],
          ['04', 'Évaluer', 'Vérifier ce qui fonctionne et documenter ce qui reste à améliorer.'],
        ].map(([index, title, copy]) => <article className="zip-approach-card zip-reveal" key={index}><span>{index} <i className="zip-line" /></span><h3>{title}</h3><p>{copy}</p></article>)}
      </div>
    </section>

    <section className="zip-visual-report" aria-labelledby="zip-visual-title">
      <div className="zip-container">
        <header className="zip-section-head zip-reveal"><div><p className="zip-kicker">UNIVERS NUMÉRIQUE <span>/</span> EN IMAGES</p><h2 id="zip-visual-title">Les idées prennent<br /><em>forme et matière.</em></h2></div><p>Des images d’ambiance donnent un aperçu des domaines qui m’intéressent. Les photos et vidéos de mes propres réalisations seront ajoutées sur chaque fiche projet.</p></header>
        <div className="zip-visual-grid">
          <figure className="zip-visual-card zip-reveal"><div className="zip-visual-photo"><Image src="/assets/images/editorial/ambient-code.webp" alt="Mains au clavier devant un écran de code" fill sizes="(max-width: 720px) 100vw, 58vw" unoptimized /><span>01 / CODE & CONCEPTION</span></div><figcaption><strong>Développement numérique</strong><a href="https://www.pexels.com/photo/programming-code-on-laptop-with-developer-hands-37880001/" target="_blank" rel="noreferrer">Photo d’Alicia Christin Gerald · Pexels <ArrowUpRight size={13} /></a></figcaption></figure>
          <figure className="zip-visual-card zip-reveal" style={{ '--delay': '90ms' } as CSSProperties}><div className="zip-visual-photo"><Image src="/assets/images/editorial/ambient-network.webp" alt="Équipements réseau et serveurs éclairés en bleu" fill sizes="(max-width: 720px) 100vw, 42vw" unoptimized /><span>02 / INFRASTRUCTURE</span></div><figcaption><strong>Réseaux & services numériques</strong><a href="https://www.pexels.com/photo/network-rack-17323801/" target="_blank" rel="noreferrer">Photo de Panumas Nikhomkhai · Pexels <ArrowUpRight size={13} /></a></figcaption></figure>
        </div>
      </div>
    </section>

    <section className="zip-skills" id="competences">
      <div className="zip-container">
        <header className="zip-section-head zip-reveal"><div><p className="zip-kicker">COMPÉTENCES <span>/</span> 04</p><h2>Ce que je sais <em>faire.</em></h2></div><p>Des domaines clairement séparés. Les langages précis et les preuves pourront être complétés dans l’administration.</p></header>
        <div className="zip-skill-grid">{skills.map((group, index) => <SkillTile group={group} index={index} key={group.id} />)}</div>
        {journey.length > 0 && <div className="zip-capability-strip zip-reveal"><span>PRATIQUE DOCUMENTÉE</span><p>{journey.slice(0, 2).map((item) => item.title).join(' · ')}</p><Link href="/competences">Détails <ArrowUpRight size={14} /></Link></div>}
        <Link href="/competences" className="zip-button zip-button-dark zip-skills-more">Explorer les compétences <ArrowRight size={16} /></Link>
      </div>
    </section>

    <section className="zip-journey" id="parcours">
      <div className="zip-container zip-journey-layout">
        <header className="zip-section-head zip-journey-head zip-reveal"><div><p className="zip-kicker">PARCOURS <span>/</span> 05</p><h2>Apprendre.<br /><em>Contribuer.</em><br />Avancer.</h2></div><p>Les étapes qui montrent comment mon intérêt pour le numérique se traduit en pratique.</p><Link className="zip-text-link" href="/about#parcours">Tout le parcours <ArrowUpRight size={16} /></Link></header>
        {journey.length ? <JourneyTimeline items={journey.slice(0, 4)} /> : <div className="zip-empty-inline zip-reveal"><span className="zip-empty-mark">01</span><div><h3>Le parcours sera détaillé ici.</h3><p>Formations, expériences et contributions apparaîtront à mesure qu’elles seront publiées.</p></div></div>}
      </div>
    </section>

    <section className="zip-explore zip-container" aria-labelledby="zip-explore-title">
      <header className="zip-section-head zip-reveal"><div><p className="zip-kicker">POURSUIVRE L’EXPLORATION <span>/</span> 06</p><h2 id="zip-explore-title">Un profil, plusieurs <em>facettes.</em></h2></div><p>Chaque espace apporte un autre angle sur mon travail et mon apprentissage.</p></header>
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
