'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { PortfolioCertificate, PortfolioData, PortfolioProject } from '@/lib/portfolio';
import { safeExternalUrl } from '@/lib/urls';

function valuesFrom(items: string[]) {
  return Array.from(new Set(items.flatMap((item) => item.split(/[,;\n]/).map((value) => value.trim()).filter(Boolean))));
}

function OrbitScene({ projectCount, certificateCount, skillCount }: { projectCount: number; certificateCount: number; skillCount: number }) {
  return (
    <figure className="story-orbit-figure">
      <div
        className="story-orbit-stage"
        role="group"
        aria-label="Scène interactive en trois dimensions. Fais glisser le modèle pour le faire pivoter."
        onPointerMove={(event) => {
          if (event.pointerType === 'touch') return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          event.currentTarget.style.setProperty('--pointer-tilt-x', `${-y * 13}deg`);
          event.currentTarget.style.setProperty('--pointer-tilt-y', `${x * 13}deg`);
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty('--pointer-tilt-x', '0deg');
          event.currentTarget.style.setProperty('--pointer-tilt-y', '0deg');
        }}
      >
        <div className="story-orbit-backdrop" />
        <div className="story-orbit-grid" />
        <div className="story-orbit-object" aria-hidden="true">
          <span className="story-orbit-ring story-orbit-ring--one" />
          <span className="story-orbit-ring story-orbit-ring--two" />
          <span className="story-orbit-ring story-orbit-ring--three" />
          <span className="story-orbit-axis" />
          <span className="story-orbit-node story-orbit-node--one" />
          <span className="story-orbit-node story-orbit-node--two" />
          <span className="story-orbit-node story-orbit-node--three" />
        </div>
        <div className="story-sketchfab-shell">
          <iframe
            title="Modèle 3D interactif Cyber Orb sur Sketchfab"
            src="https://sketchfab.com/models/8a81aa847da74a5cb36bd8ba13f6ae5e/embed?autostart=1&autospin=0.14&dnt=1&scrollwheel=0&ui_theme=dark"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <span className="story-sketchfab-label">OBJET 3D / INTERACTIF</span>
        </div>
        <div className="story-orbit-note story-orbit-note--top"><span>01</span> Parcours en mouvement</div>
        <div className="story-orbit-note story-orbit-note--bottom"><span>02</span> Preuves concrètes</div>
        <div className="story-orbit-counts">
          <div><strong>{projectCount.toString().padStart(2, '0')}</strong><span>projets</span></div>
          <div><strong>{certificateCount.toString().padStart(2, '0')}</strong><span>certificats</span></div>
          <div><strong>{skillCount.toString().padStart(2, '0')}</strong><span>compétences</span></div>
        </div>
        <span className="story-orbit-caption">ESPACE PERSONNEL · NUMÉRIQUE</span>
      </div>
      <figcaption className="story-model-credit">Modèle « Cyber Orb » par <a href="https://sketchfab.com/3d-models/cyber-orb-8a81aa847da74a5cb36bd8ba13f6ae5e" target="_blank" rel="noreferrer">Tycho Magnetic Anomaly</a> · licence CC Attribution</figcaption>
    </figure>
  );
}

function ProjectStory({ project, index }: { project: PortfolioProject; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <Link
      href={`/projects/${project.id}`}
      className={`story-project story-project--${index % 2 ? 'reverse' : 'forward'} story-reveal`}
      onPointerMove={(event) => {
        if (event.pointerType === 'touch') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        event.currentTarget.style.setProperty('--project-tilt-x', `${-y * 6}deg`);
        event.currentTarget.style.setProperty('--project-tilt-y', `${x * 6}deg`);
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

function CertificateCard({ certificate, index }: { certificate: PortfolioCertificate; index: number }) {
  const verificationUrl = safeExternalUrl(certificate.verificationUrl);
  const content = (
    <>
      <span className="story-certificate-index">0{index + 1} / PREUVE</span>
      <span className="story-certificate-seal" aria-hidden="true">✳</span>
      <span className="story-certificate-title">{certificate.title}</span>
      <span className="story-certificate-meta">{[certificate.issuer, certificate.date && new Date(certificate.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })].filter(Boolean).join(' · ')}</span>
      {certificate.domain && <span className="story-certificate-domain">{certificate.domain}</span>}
      <span className="story-certificate-open">{verificationUrl ? 'Vérifier la certification ↗' : certificate.fileUrl ? 'Consulter le document ↗' : 'Voir dans la bibliothèque ↗'}</span>
    </>
  );

  return verificationUrl ? <a className="story-certificate-card story-reveal" href={verificationUrl} target="_blank" rel="noreferrer">{content}</a> : <Link className="story-certificate-card story-reveal" href={certificate.fileUrl || '/certifications'} target={certificate.fileUrl ? '_blank' : undefined} rel={certificate.fileUrl ? 'noreferrer' : undefined}>{content}</Link>;
}

export default function HomeContent({ data }: { data: PortfolioData }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const publishedJourney = useMemo(() => data.journey.filter((item) => item.published).sort((a, b) => {
    const startYear = (period: string) => Number(period.match(/\b(?:19|20)\d{2}\b/)?.[0] || 0);
    return startYear(b.period) - startYear(a.period);
  }), [data.journey]);
  const publishedProjects = useMemo(() => data.projects.filter((item) => item.published), [data.projects]);
  const selectedProjects = useMemo(() => {
    const featured = publishedProjects.filter((item) => item.featured);
    return (featured.length ? featured : publishedProjects).slice(0, 3);
  }, [publishedProjects]);
  const publishedCertificates = useMemo(() => data.certificates.filter((item) => item.published), [data.certificates]);
  const selectedCertificates = useMemo(() => {
    const featured = publishedCertificates.filter((item) => item.featured);
    return (featured.length ? featured : publishedCertificates).slice(0, 3);
  }, [publishedCertificates]);
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

    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      observer.disconnect();
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
      <div className="story-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>

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
        <div className="story-hero-art story-reveal"><OrbitScene projectCount={publishedProjects.length} certificateCount={publishedCertificates.length} skillCount={skills.length} /></div>
        <div className="story-side-label" aria-hidden="true">PORTFOLIO — {name ? name.toUpperCase() : 'DOSSIER PERSONNEL'}</div>
      </section>

      <div className="story-ribbon" aria-hidden="true"><div className="story-ribbon-track"><span>CONCEVOIR</span><i>✳</i><span>APPRENDRE</span><i>✳</i><span>EXPÉRIMENTER</span><i>✳</i><span>CONSTRUIRE</span><i>✳</i><span>CONCEVOIR</span><i>✳</i><span>APPRENDRE</span><i>✳</i><span>EXPÉRIMENTER</span><i>✳</i><span>CONSTRUIRE</span><i>✳</i></div></div>

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
          {publishedJourney.length ? <div className="story-timeline">{publishedJourney.map((item, index) => <article className="story-timeline-item story-reveal" key={item.id} style={{ transitionDelay: `${Math.min(index, 5) * 90}ms` }}><div className="story-timeline-marker"><span>{String(index + 1).padStart(2, '0')}</span></div><div className="story-timeline-copy"><div className="story-timeline-meta"><span>{item.category}</span>{item.period && <span>{item.period}</span>}</div><h3>{item.title}</h3>{item.organization && <p className="story-timeline-org">{item.organization}</p>}{item.description && <p className="story-timeline-description">{item.description}</p>}</div></article>)}</div> : <div className="story-timeline-empty"><span className="story-timeline-marker"><span>01</span></span><div><h3>Les étapes de ton histoire restent à raconter.</h3><p>Ajoute tes formations, expériences ou contributions dans l’administration. La frise se construira à partir des étapes publiées.</p></div></div>}
          {data.cv.fileUrl && <Link href="/cv" className="story-section-link">Consulter mon CV <span aria-hidden="true">⟶</span></Link>}
        </div>
      </section>

      <section className="story-section story-work" id="projets">
        <div className="story-section-heading story-reveal"><div><p className="story-kicker">04 / CE QUE JE FAIS</p><h2>Les idées deviennent réelles.</h2></div><p>Des projets documentés pour comprendre le besoin, le travail mené et ce qui a été appris.</p></div>
        {selectedProjects.length ? <div className="story-project-list">{selectedProjects.map((project, index) => <ProjectStory key={project.id} project={project} index={index} />)}</div> : <div className="story-empty-work story-reveal"><span className="story-empty-index">01 — PREMIÈRE ÉTUDE DE CAS</span><h3>Le prochain projet mérite d’être raconté.</h3><p>Ajoute une réalisation dans l’administration pour présenter son contexte, ta contribution, sa solution et les preuves associées.</p><div className="story-empty-diagram" aria-hidden="true"><span>PROBLÈME</span><i>⟶</i><span>IDÉE</span><i>⟶</i><span>SOLUTION</span></div></div>}
        {publishedProjects.length > selectedProjects.length && <Link href="/projects" className="story-section-link story-reveal">Parcourir toutes les réalisations <span aria-hidden="true">⟶</span></Link>}
      </section>

      <section className="story-section story-skills" id="competences">
        <div className="story-section-aside story-reveal"><span>05 / SAVOIR-FAIRE</span><span className="story-aside-rule" /><span>Des preuves, pas des promesses</span></div>
        <div className="story-skills-main story-reveal"><p className="story-kicker">Ce que j’apprends à maîtriser</p><h2>Les compétences se construisent, projet après projet.</h2><p className="story-skills-copy">Les domaines ci-dessous sont tirés des technologies utilisées dans les projets et des compétences mentionnées dans les certificats publiés.</p>
          {skills.length ? <div className="story-skill-cloud">{skills.slice(0, 14).map((skill, index) => <span key={skill} style={{ animationDelay: `${index * 45}ms` }}>{skill}<i aria-hidden="true">↗</i></span>)}</div> : <p className="story-skills-empty">Publie un projet ou un certificat pour faire apparaître ici les compétences appuyées par des réalisations réelles.</p>}
          <Link href="/competences" className="story-section-link">Voir les compétences détaillées <span aria-hidden="true">⟶</span></Link>
        </div>
      </section>

      <section className="story-section story-proof" id="certificats">
        <div className="story-section-heading story-reveal"><div><p className="story-kicker">06 / CE QUI LE PROUVE</p><h2>Apprendre, puis le montrer.</h2></div><p>Une sélection de certificats et de formations qui donnent du contexte aux compétences acquises.</p></div>
        {selectedCertificates.length ? <div className="story-certificate-grid">{selectedCertificates.map((certificate, index) => <CertificateCard key={certificate.id} certificate={certificate} index={index} />)}</div> : <div className="story-empty-proof story-reveal"><span className="story-proof-glyph">✳</span><div><h3>Une bibliothèque de preuves, pas un mur de logos.</h3><p>Ajoute tes certificats depuis l’administration : chaque fiche peut indiquer son organisme, son domaine, ses compétences et son lien de vérification.</p></div><Link href="/certifications">Découvrir la bibliothèque <span aria-hidden="true">⟶</span></Link></div>}
        {publishedCertificates.length > selectedCertificates.length && <Link href="/certifications" className="story-section-link story-reveal">Explorer les {publishedCertificates.length} certificats <span aria-hidden="true">⟶</span></Link>}
      </section>

      <section className="story-contact" id="contact">
        <div className="story-contact-noise" aria-hidden="true" />
        <div className="story-contact-heading story-reveal"><p className="story-kicker">07 / LA SUITE</p><h2>Un parcours se construit aussi dans la rencontre.</h2><p>Pour parler d’un projet, d’une idée ou d’une opportunité, voici où me joindre.</p></div>
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
