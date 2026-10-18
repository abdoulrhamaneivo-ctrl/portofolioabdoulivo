'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { PortfolioCertificate, PortfolioData, PortfolioProject } from '@/lib/portfolio';
import { safeExternalUrl } from '@/lib/urls';

function valuesFrom(items: string[]) {
  return Array.from(new Set(items.flatMap((item) => item.split(/[,;\n]/).map((value) => value.trim()).filter(Boolean))));
}

function useReducedMotionFlag() {
  const reducedMotion = useRef(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reducedMotion.current = preference.matches; };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  return reducedMotion;
}

function PortfolioScene({ data, projectCount, certificateCount, skillCount }: { data: PortfolioData; projectCount: number; certificateCount: number; skillCount: number }) {
  const reducedMotion = useReducedMotionFlag();
  const depth = 0.72 + data.settings.sceneDepth / 100 * 0.55;
  const sections = [
    { label: 'Mon profil', href: '#recit' },
    { label: 'Projets', href: '#projets' },
    { label: 'Parcours', href: '#parcours' },
    { label: 'Compétences', href: '#competences' },
    { label: 'Certificats', href: '#certificats' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <div className="story-zip-scene-wrap">
      <div
        className="story-zip-stage"
        role="group"
        aria-label="Navigation orbitale du portfolio"
        onPointerMove={(event) => {
          if (event.pointerType !== 'mouse' || reducedMotion.current) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          event.currentTarget.style.setProperty('--scene-tilt-x', `${-y * 12 * depth}deg`);
          event.currentTarget.style.setProperty('--scene-tilt-y', `${x * 18 * depth}deg`);
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty('--scene-tilt-x', '0deg');
          event.currentTarget.style.setProperty('--scene-tilt-y', '0deg');
        }}
      >
        <span className="story-zip-scene-label">NAVIGATION / 06 SECTIONS</span>
        <div className="story-zip-scene-photo" aria-hidden="true"><Image src="/assets/images/projects/project5.jpg" alt="" fill sizes="(max-width: 680px) 170px, 280px" className="story-zip-scene-photo-image" unoptimized /></div>
        <div className="story-zip-rig story-zip-rig--orbit">
          <div className="story-zip-orbit-ring" aria-label="Sections à explorer" style={{ '--orbit-radius-config': `${190 * depth}px` } as CSSProperties}>
            {sections.map((section, index) => <Link href={section.href} className="story-zip-orbit-node" key={section.href} style={{ transform: `rotateY(${index * 60}deg) translateZ(var(--orbit-radius))` }}>{section.label}</Link>)}
          </div>
        </div>
        <span className="story-zip-beam" aria-hidden="true" />
        <span className="story-zip-scene-hint">Survole pour faire tourner · choisis une section</span>
      </div>
      <div className="story-zip-scene-caption"><span>THE LIVING PORTFOLIO</span><span>{projectCount} projets · {certificateCount} certificats · {skillCount} compétences</span></div>
    </div>
  );
}

function ProjectStory({ project, index }: { project: PortfolioProject; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const reducedMotion = useReducedMotionFlag();
  return (
    <Link
      href={`/projects/${project.id}`}
      className={`story-project story-project--${index % 2 ? 'reverse' : 'forward'} story-reveal`}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse' || reducedMotion.current) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        const depth = Number(getComputedStyle(event.currentTarget.closest('main') || document.documentElement).getPropertyValue('--portfolio-depth')) || 0;
        event.currentTarget.style.setProperty('--project-tilt-x', `${-y * 12 * depth}deg`);
        event.currentTarget.style.setProperty('--project-tilt-y', `${x * 12 * depth}deg`);
        event.currentTarget.style.setProperty('--project-light-x', `${(x + 0.5) * 100}%`);
        event.currentTarget.style.setProperty('--project-light-y', `${(y + 0.5) * 100}%`);
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty('--project-tilt-x', '0deg');
        event.currentTarget.style.setProperty('--project-tilt-y', '0deg');
        event.currentTarget.style.setProperty('--project-light-x', '50%');
        event.currentTarget.style.setProperty('--project-light-y', '45%');
      }}
    >
      <div className="story-project-visual">
        <span className="story-project-frame" />
        {project.imageUrl && !imageFailed ? (
          <Image src={project.imageUrl} alt={project.title} fill sizes="(max-width: 800px) 100vw, 55vw" className="story-project-image" unoptimized onError={() => setImageFailed(true)} />
        ) : (
          <div className="story-project-placeholder" aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span><i>✳</i></div>
        )}
        <span className="story-project-index">PROJET / {String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="story-project-copy">
        <p className="story-kicker">Étude de cas <span>↗</span></p>
        <h3>{project.title}</h3>
        {project.summary && <p className="story-project-summary">{project.summary}</p>}
        {project.contribution && <p className="story-project-contribution"><span>MON RÔLE</span>{project.contribution}</p>}
        {project.technologies && <p className="story-project-tech">{project.technologies.split(/[,;]+/).map((tech) => <span key={tech.trim()}>{tech.trim()}</span>)}</p>}
        <span className="story-read-link">Explorer le projet <span aria-hidden="true">⟶</span></span>
      </div>
    </Link>
  );
}

type SkillEvidence = {
  name: string;
  projects: PortfolioProject[];
  certificates: PortfolioCertificate[];
};

function SkillEvidenceExplorer({ projects, certificates }: { projects: PortfolioProject[]; certificates: PortfolioCertificate[] }) {
  const evidence = useMemo(() => {
    const entries = new Map<string, SkillEvidence>();
    const getEntry = (name: string) => {
      const key = name.toLocaleLowerCase('fr-FR');
      let entry = entries.get(key);
      if (!entry) {
        entry = { name, projects: [], certificates: [] };
        entries.set(key, entry);
      }
      return entry;
    };

    projects.forEach((project) => {
      valuesFrom([project.technologies]).forEach((name) => getEntry(name).projects.push(project));
    });
    certificates.forEach((certificate) => {
      valuesFrom([certificate.skills]).forEach((name) => getEntry(name).certificates.push(certificate));
    });

    return Array.from(entries.values())
      .sort((a, b) => (b.projects.length + b.certificates.length) - (a.projects.length + a.certificates.length) || a.name.localeCompare(b.name, 'fr'))
      .slice(0, 14);
  }, [projects, certificates]);
  const [activeName, setActiveName] = useState('');
  const active = evidence.find((item) => item.name === activeName) || evidence[0];

  if (!evidence.length) return null;

  return (
    <div className="story-skill-explorer">
      <div className="story-skill-explorer-head">
        <span><i aria-hidden="true" /> CARTOGRAPHIE DES SAVOIR-FAIRE</span>
        <span>{evidence.length.toString().padStart(2, '0')} NŒUDS · SOURCES PUBLIÉES</span>
      </div>
      <div className="story-skill-node-grid" role="group" aria-label="Choisir une compétence pour afficher les projets et certificats associés">
        {evidence.map((item, index) => {
          const isActive = item.name === active.name;
          const evidenceCount = item.projects.length + item.certificates.length;
          return (
            <button
              key={item.name}
              type="button"
              className={`story-skill-node${isActive ? ' is-active' : ''}`}
              aria-pressed={isActive}
              aria-label={`${item.name}, ${evidenceCount} preuve${evidenceCount === 1 ? '' : 's'}`}
              onClick={() => setActiveName(item.name)}
              style={{ transitionDelay: `${Math.min(index, 10) * 25}ms` }}
            >
              <span className="story-skill-node-label">{item.name}</span>
              <span className="story-skill-node-count">{evidenceCount.toString().padStart(2, '0')} preuve{evidenceCount === 1 ? '' : 's'}</span>
            </button>
          );
        })}
      </div>
      <div className="story-skill-evidence" key={active.name} aria-live="polite" aria-atomic="true">
        <div className="story-skill-evidence-heading">
          <div><span>RELATIONS / {active.projects.length + active.certificates.length} SOURCES</span><h3>{active.name}</h3></div>
          <span className="story-skill-evidence-pulse"><i /> LIÉ AUX PREUVES</span>
        </div>
        <div className="story-skill-evidence-grid">
          <div className="story-skill-evidence-group">
            <div className="story-skill-evidence-label"><span>PROJETS</span><span>{active.projects.length.toString().padStart(2, '0')}</span></div>
            {active.projects.length ? active.projects.map((project) => (
              <Link className="story-skill-source" key={project.id} href={`/projects/${project.id}`}>
                <small>TECHNOLOGIE UTILISÉE</small>
                <strong>{project.title}</strong>
                <span>{project.contribution || project.summary || 'Voir l’étude de cas et sa réalisation.'}</span>
                <i aria-hidden="true">↗</i>
              </Link>
            )) : <p className="story-skill-source-empty">Aucun projet publié ne cite encore cette compétence.</p>}
          </div>
          <div className="story-skill-evidence-group">
            <div className="story-skill-evidence-label"><span>CERTIFICATS</span><span>{active.certificates.length.toString().padStart(2, '0')}</span></div>
            {active.certificates.length ? active.certificates.map((certificate) => (
              <Link className="story-skill-source" key={certificate.id} href={`/certifications#certificate-${certificate.id}`}>
                <small>{certificate.issuer || certificate.type || 'APPRENTISSAGE DOCUMENTÉ'}</small>
                <strong>{certificate.title}</strong>
                <span>{[certificate.domain, certificate.date].filter(Boolean).join(' · ') || 'Consulter la fiche de cette preuve.'}</span>
                <i aria-hidden="true">↗</i>
              </Link>
            )) : <p className="story-skill-source-empty">Aucun certificat publié ne détaille encore cette compétence.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function CertificateCard({ certificate, index }: { certificate: PortfolioCertificate; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const frontButtonRef = useRef<HTMLButtonElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const verificationUrl = safeExternalUrl(certificate.verificationUrl);
  const certificateSkills = valuesFrom([certificate.skills]);
  const actionLabel = verificationUrl ? 'Vérifier la certification ↗' : certificate.fileUrl ? 'Consulter le document ↗' : 'Voir dans la bibliothèque ↗';
  const certificateLink = (label: string, tabIndex: number) => verificationUrl
    ? <a href={verificationUrl} target="_blank" rel="noreferrer" tabIndex={tabIndex}>{label}</a>
    : <Link href={certificate.fileUrl || '/certifications'} target={certificate.fileUrl ? '_blank' : undefined} rel={certificate.fileUrl ? 'noreferrer' : undefined} tabIndex={tabIndex}>{label}</Link>;

  return (
    <article
      id={`certificate-${certificate.id}`}
      className={`story-certificate-card story-reveal${isFlipped ? ' is-flipped' : ''}`}
      onPointerLeave={(event) => { if (event.pointerType === 'mouse' && !event.currentTarget.contains(document.activeElement)) setIsFlipped(false); }}
    >
      <div className="story-certificate-card-inner">
        <div className="story-certificate-face story-certificate-front" aria-hidden={isFlipped}>
          <span className="story-certificate-index">0{index + 1} / PREUVE</span>
          <span className="story-certificate-seal" aria-hidden="true">✳</span>
          <span className="story-certificate-title">{certificate.title}</span>
          <span className="story-certificate-meta">{[certificate.issuer, certificate.date && new Date(certificate.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })].filter(Boolean).join(' · ')}</span>
          {certificate.domain && <span className="story-certificate-domain">{certificate.domain}</span>}
          <div className="story-certificate-actions">
            <button ref={frontButtonRef} type="button" tabIndex={isFlipped ? -1 : 0} onClick={() => { setIsFlipped(true); requestAnimationFrame(() => backButtonRef.current?.focus()); }}>Détails ↗</button>
            {certificateLink(actionLabel, isFlipped ? -1 : 0)}
          </div>
        </div>
        <div className="story-certificate-face story-certificate-back" aria-hidden={!isFlipped}>
          <span className="story-certificate-index">DÉTAILS / 0{index + 1}</span>
          <strong className="story-certificate-back-title">Ce que cette preuve couvre</strong>
          <span className="story-certificate-type">{certificate.type || 'Certification'}{certificate.level ? ` · ${certificate.level}` : ''}</span>
          {certificateSkills.length ? <div className="story-certificate-skills">{certificateSkills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p className="story-certificate-missing">Ajoute les compétences couvertes depuis l’administration pour documenter cette preuve.</p>}
          <div className="story-certificate-actions">
            <button ref={backButtonRef} type="button" tabIndex={isFlipped ? 0 : -1} onClick={() => { setIsFlipped(false); requestAnimationFrame(() => frontButtonRef.current?.focus()); }}>Retour ↶</button>
            {certificateLink(actionLabel, isFlipped ? 0 : -1)}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HomeContent({ data }: { data: PortfolioData }) {
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotionFlag();
  const publishedJourney = useMemo(() => data.journey.filter((item) => item.published).sort((a, b) => {
    const startYear = (period: string) => Number(period.match(/\b(?:19|20)\d{2}\b/)?.[0] || 0);
    return startYear(b.period) - startYear(a.period);
  }), [data.journey]);
  const publishedProjects = useMemo(() => data.projects.filter((item) => item.published), [data.projects]);
  const publishedExperiments = useMemo(() => data.experiments.filter((item) => item.published), [data.experiments]);
  const selectedProjects = useMemo(() => {
    const featured = publishedProjects.filter((item) => item.featured);
    return (featured.length ? featured : publishedProjects).slice(0, 3);
  }, [publishedProjects]);
  const publishedCertificates = useMemo(() => data.certificates.filter((item) => item.published), [data.certificates]);
  const selectedCertificates = useMemo(() => {
    const featured = publishedCertificates.filter((item) => item.featured);
    return (featured.length ? featured : publishedCertificates).slice(0, 3);
  }, [publishedCertificates]);
  const movingTopics = useMemo(() => {
    const content = [
      { title: data.profile.title || 'Mon profil', category: 'IDENTITÉ', imageUrl: '' },
      ...publishedProjects.map((item) => ({ title: item.title, category: 'PROJET', imageUrl: item.imageUrl })),
      ...publishedCertificates.map((item) => ({ title: item.title, category: 'CERTIFICAT', imageUrl: '' })),
      ...publishedJourney.map((item) => ({ title: item.title, category: item.category.toUpperCase(), imageUrl: '' })),
      ...publishedExperiments.map((item) => ({ title: item.title, category: 'LABORATOIRE', imageUrl: '' })),
    ];
    const fallback = [
      { title: 'Projets', category: 'ÉTUDES DE CAS', imageUrl: '/assets/images/projects/project5.jpg' },
      { title: 'Parcours', category: 'ÉTAPES', imageUrl: '/assets/images/about/coder.jpg' },
      { title: 'Compétences', category: 'SAVOIR-FAIRE', imageUrl: '/assets/images/projects/project3.png' },
      { title: 'Certificats', category: 'APPRENTISSAGES', imageUrl: '/assets/images/posts/post2.jpg' },
      { title: 'Expérimentations', category: 'LABORATOIRE', imageUrl: '/assets/images/posts/post3.jpg' },
      { title: 'Contact', category: 'LA SUITE', imageUrl: '/assets/images/projects/project2.jpg' },
      { title: 'Curriculum vitæ', category: 'DOCUMENT', imageUrl: '/assets/images/posts/post1.jpg' },
    ];
    const unique = content.filter((item, index, items) => items.findIndex((candidate) => candidate.title === item.title) === index);
    return [...unique, ...fallback.filter((item) => !unique.some((candidate) => candidate.title === item.title))].slice(0, 8);
  }, [data.profile.title, publishedProjects, publishedCertificates, publishedJourney, publishedExperiments]);
  const skills = useMemo(() => valuesFrom([
    ...publishedProjects.map((item) => item.technologies),
    ...publishedCertificates.map((item) => item.skills),
  ]), [publishedProjects, publishedCertificates]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('motion-ready');
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('.story-reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -48px 0px' });
    reveals.forEach((item) => observer.observe(item));

    const timeline = document.querySelector<HTMLElement>('.story-timeline');
    let frame: number | null = null;
    const updateProgress = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
        progressBarRef.current?.style.setProperty('transform', `scaleX(${progress})`);
        if (timeline) {
          const top = timeline.getBoundingClientRect().top;
          const beamHeight = Math.max(0, Math.min(timeline.offsetHeight - 21, window.innerHeight * 0.68 - top));
          timeline.style.setProperty('--timeline-beam-progress', `${beamHeight}px`);
        }
      });
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      root.classList.remove('motion-ready');
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  const name = data.profile.fullName.trim();
  const email = data.profile.email.trim();
  const linkedin = safeExternalUrl(data.profile.linkedin);
  const github = safeExternalUrl(data.profile.github);

  return (
    <div className="home-story">
      <div className="story-progress" aria-hidden="true"><span ref={progressBarRef} /></div>

      <section className="story-hero" id="accueil">
        <div className="story-hero-copy">
          <p className="story-kicker story-reveal"><span className="story-live-dot" /> Portfolio personnel <span className="story-kicker-divider">/</span> Parcours numérique</p>
          <p className="story-hero-index story-reveal">01 <span>—</span> QUI JE SUIS</p>
          <h1 className="story-reveal">
            <span>{name ? `Je suis ${name}.` : 'Je construis mon parcours.'}</span>
            <em>{data.profile.title || 'Le numérique, en mouvement.'}</em>
          </h1>
          <p className="story-hero-intro story-reveal">
            {data.profile.introduction || 'Une présentation vivante de mon parcours, des idées que je transforme et des compétences que je développe.'}
          </p>
          <div className="story-hero-meta story-reveal">
            <a href="#recit" className="story-scroll-cue"><span className="story-scroll-line" />Faire défiler pour découvrir <span aria-hidden="true">↓</span></a>
            <span className="story-hero-meta-note">Une histoire racontée par les réalisations</span>
          </div>
        </div>
        <div className="story-hero-art story-reveal"><PortfolioScene data={data} projectCount={publishedProjects.length} certificateCount={publishedCertificates.length} skillCount={skills.length} /></div>
        <div className="story-side-label" aria-hidden="true">PORTFOLIO — {name ? name.toUpperCase() : 'DOSSIER PERSONNEL'}</div>
      </section>

      <div className="story-ribbon" aria-hidden="true"><div className="story-ribbon-track"><span>CONCEVOIR</span><i>✳</i><span>APPRENDRE</span><i>✳</i><span>EXPÉRIMENTER</span><i>✳</i><span>CONSTRUIRE</span><i>✳</i><span>CONCEVOIR</span><i>✳</i><span>APPRENDRE</span><i>✳</i><span>EXPÉRIMENTER</span><i>✳</i><span>CONSTRUIRE</span><i>✳</i></div></div>

      <section className="story-tile-marquee" aria-hidden="true">
        {[movingTopics, [...movingTopics].reverse()].map((row, rowIndex) => <div className={`story-tile-track${rowIndex ? ' is-reverse' : ''}`} key={rowIndex}>
          {[...row, ...row].map((item, index) => <div className="story-tile-card" key={`${rowIndex}:${index}`}>
            {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="220px" className="story-tile-image" unoptimized />}
            <span>{item.category}</span><i>{String((index % row.length) + 1).padStart(2, '0')}</i><strong>{item.title}</strong>
          </div>)}
        </div>)}
      </section>

      <section className="story-section story-about" id="recit">
        <div className="story-section-aside story-reveal"><span>02 / LE RÉCIT</span><span className="story-aside-rule" /><span>Au-delà du titre</span></div>
        <div className="story-about-content story-reveal">
          <p className="story-kicker">Derrière les projets</p>
          <h2>{data.profile.about ? 'Un parcours, une façon de voir.' : 'Chaque parcours commence par une curiosité.'}</h2>
          <p className="story-about-text">{data.profile.about || 'Ici, tu pourras raconter ce qui t’a conduit vers le numérique, ce qui t’intéresse et la direction que tu veux prendre. Ajoute ton histoire depuis l’administration : elle prendra sa place dans ce récit.'}</p>
          <div className="story-about-foot"><span className="story-about-mark">{name ? name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() : '✦'}</span><span><strong>{name || 'Mon parcours'}</strong><small>{data.profile.title || 'Profil en construction'}</small></span><Link href="/about" aria-label="Lire la présentation complète">Lire la suite <span aria-hidden="true">↗</span></Link></div>
        </div>
        <div className="story-about-visual story-reveal" aria-hidden="true"><div className="story-about-visual-orbit"><span /><span /><span /></div><div className="story-about-visual-center">{data.profile.portraitUrl ? <Image src={data.profile.portraitUrl} alt="" fill sizes="90px" className="story-about-portrait" unoptimized /> : name ? name.trim().slice(0, 1).toUpperCase() : '✦'}</div><span className="story-about-visual-label">ÉVOLUER<br />PAR L’ACTION</span></div>
      </section>

      <section className="story-section story-journey" id="parcours">
        <div className="story-section-aside story-reveal"><span>03 / LES ÉTAPES</span><span className="story-aside-rule" /><span>Apprendre, contribuer, avancer</span></div>
        <div className="story-journey-main story-reveal"><p className="story-kicker">Un parcours qui se construit</p><h2>Chaque étape laisse une trace.</h2>
          {publishedJourney.length > 0 && <div className="story-journey-summary"><strong>{String(publishedJourney.length).padStart(2, '0')}</strong><span>étapes publiées</span><i aria-hidden="true" /><span>Études · expériences · contributions</span></div>}
          {publishedJourney.length ? <div className="story-timeline">{publishedJourney.map((item, index) => <article className="story-timeline-item story-reveal" key={item.id} style={{ transitionDelay: `${Math.min(index, 5) * 90}ms` }}><div className="story-timeline-marker"><span>{String(index + 1).padStart(2, '0')}</span></div><div className="story-timeline-copy"><div className="story-timeline-meta"><span>{item.category}</span>{item.period && <span>{item.period}</span>}</div><h3>{item.title}</h3>{item.organization && <p className="story-timeline-org">{item.organization}</p>}{item.description && <p className="story-timeline-description">{item.description}</p>}</div></article>)}</div> : <div className="story-timeline-empty"><span className="story-timeline-marker"><span>01</span></span><div><h3>Les étapes de ton histoire restent à raconter.</h3><p>Ajoute tes formations, expériences ou contributions dans l’administration. La frise se construira à partir des étapes publiées.</p></div></div>}
          {data.cv.fileUrl && <Link href="/cv" className="story-section-link">Consulter mon CV <span aria-hidden="true">⟶</span></Link>}
        </div>
      </section>

      <section className="story-section story-work" id="projets">
        <div className="story-section-heading story-reveal"><div><p className="story-kicker">04 / CE QUE JE FAIS</p><h2>Les idées deviennent réelles.</h2></div><p>Des projets documentés pour comprendre le besoin, le travail mené et ce qui a été appris.</p></div>
        {selectedProjects.length ? <div className="story-project-list">{selectedProjects.map((project, index) => <ProjectStory key={project.id} project={project} index={index} />)}</div> : <div className="story-empty-work story-reveal"><div className="story-empty-work-copy"><span className="story-empty-index">01 — PREMIÈRE ÉTUDE DE CAS</span><h3>Le prochain projet mérite d’être raconté.</h3><p>Ajoute une réalisation dans l’administration pour présenter son contexte, ta contribution, sa solution et les preuves associées.</p><div className="story-empty-diagram" aria-hidden="true"><span>PROBLÈME</span><i>⟶</i><span>IDÉE</span><i>⟶</i><span>SOLUTION</span></div></div><div className="story-empty-work-visual" aria-hidden="true"><Image src="/assets/images/projects/project1.jpg" alt="" fill sizes="(max-width: 760px) 100vw, 38vw" className="story-empty-work-image" unoptimized /><div className="story-empty-work-visual-caption"><span>STRUCTURE D’UNE ÉTUDE DE CAS</span><span>VISUEL D’AMBIANCE · À REMPLACER PAR UN PROJET PUBLIÉ</span></div><div className="story-empty-work-visual-grid"><span>CONTEXTE</span><i>01</i><span>CONTRIBUTION</span><i>02</i><span>RÉSULTAT</span><i>03</i></div></div></div>}
        {publishedProjects.length > selectedProjects.length && <Link href="/projects" className="story-section-link story-reveal">Parcourir toutes les réalisations <span aria-hidden="true">⟶</span></Link>}
      </section>

      {publishedExperiments.length > 0 && <section className="story-lab-section" id="laboratoire">
        <div className="story-lab-heading"><div><p className="story-kicker">05 / CE QUE J’EXPLORE</p><h2>Des idées encore en mouvement.</h2><p>Prototypes et questions ouvertes, gardés distincts des projets finalisés.</p></div><Link href="/experiments">Explorer le laboratoire <span aria-hidden="true">⟶</span></Link></div>
        <div className="story-lab-grid">{publishedExperiments.slice(0, 3).map((experiment, index) => <Link className="story-lab-card" href="/experiments" key={experiment.id} style={{ animationDelay: `${index * 80}ms` }}>
          <div><span>{experiment.category || 'EXPLORATION'}</span><span className="story-lab-state"><i />{experiment.status || 'En cours'}</span></div>
          <span className="story-lab-mark" aria-hidden="true">{String(index + 1).padStart(2, '0')}<i>✳</i></span>
          <h3>{experiment.title}</h3>{experiment.description && <p>{experiment.description}</p>}
          {experiment.technologies && <span className="story-lab-tech">{experiment.technologies}</span>}
        </Link>)}</div>
      </section>}

      <section className="story-section story-skills" id="competences">
        <div className="story-section-aside story-reveal"><span>{publishedExperiments.length ? '06' : '05'} / SAVOIR-FAIRE</span><span className="story-aside-rule" /><span>Des preuves, pas des promesses</span></div>
        <div className="story-skills-main story-reveal"><p className="story-kicker">Ce que j’apprends à maîtriser</p><h2>Les compétences se construisent, projet après projet.</h2><p className="story-skills-copy">Les domaines ci-dessous sont tirés des technologies utilisées dans les projets et des compétences mentionnées dans les certificats publiés.</p>
          {skills.length ? <SkillEvidenceExplorer projects={publishedProjects} certificates={publishedCertificates} /> : <div className="story-skills-empty"><div className="story-skills-empty-heading"><span>COMMENT LES COMPÉTENCES APPARAISSENT</span><p>Chaque compétence affichée sera reliée à une preuve publiée, pour distinguer ce qui est appris de ce qui est déjà mis en pratique.</p></div><ol><li><span>01</span><strong>Projet ou certificat</strong><small>Une preuve publiée</small></li><li><span>02</span><strong>Technologies et acquis</strong><small>Les éléments documentés</small></li><li><span>03</span><strong>Compétence reliée</strong><small>Une information vérifiable</small></li></ol></div>}
          <Link href="/competences" className="story-section-link">Voir les compétences détaillées <span aria-hidden="true">⟶</span></Link>
        </div>
      </section>

      <section className="story-section story-proof" id="certificats">
        <div className="story-section-heading story-reveal"><div><p className="story-kicker">{publishedExperiments.length ? '07' : '06'} / CE QUI LE PROUVE</p><h2>Apprendre, puis le montrer.</h2></div><p>Une sélection de certificats et de formations qui donnent du contexte aux compétences acquises.</p></div>
        {selectedCertificates.length ? <div className="story-certificate-grid">{selectedCertificates.map((certificate, index) => <CertificateCard key={certificate.id} certificate={certificate} index={index} />)}</div> : <div className="story-empty-proof story-reveal"><div className="story-proof-stack" aria-hidden="true"><span>01 / PREUVE</span><i /><i /><i /></div><div><h3>Une bibliothèque de preuves, pas un mur de logos.</h3><p>Ajoute tes certificats depuis l’administration : chaque fiche peut indiquer son organisme, son domaine, ses compétences et son lien de vérification.</p></div><Link href="/certifications">Découvrir la bibliothèque <span aria-hidden="true">⟶</span></Link></div>}
        {publishedCertificates.length > selectedCertificates.length && <Link href="/certifications" className="story-section-link story-reveal">Explorer les {publishedCertificates.length} certificats <span aria-hidden="true">⟶</span></Link>}
      </section>

      <section className="story-contact" id="contact">
        <div className="story-contact-noise" aria-hidden="true" />
        <div className="story-contact-heading story-reveal"><p className="story-kicker">{publishedExperiments.length ? '08' : '07'} / LA SUITE</p><h2>Un parcours se construit aussi dans la rencontre.</h2><p>Pour parler d’un projet, d’une idée ou d’une opportunité, voici où me joindre.</p></div>
        <div className="story-contact-links story-reveal">
          {email ? <a href={`mailto:${email}`}><span>ÉCRIRE</span><strong>{email}</strong><i aria-hidden="true">↗</i></a> : <div><span>CONTACT</span><strong>Ajoute ton adresse e-mail dans l’administration.</strong></div>}
          {linkedin && <a href={linkedin} target="_blank" rel="noreferrer"><span>LINKEDIN</span><strong>Échanger sur mon parcours</strong><i aria-hidden="true">↗</i></a>}
          {github && <a href={github} target="_blank" rel="noreferrer"><span>GITHUB</span><strong>Voir mon travail technique</strong><i aria-hidden="true">↗</i></a>}
          {data.cv.fileUrl && <Link href="/cv"><span>CURRICULUM VITAE</span><strong>Lire mon CV</strong><i aria-hidden="true">↗</i></Link>}
        </div>
        <Link href="/admin" className="story-admin-hint">Mettre à jour cette présentation <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}
