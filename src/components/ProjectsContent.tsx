'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { PortfolioProject } from '@/lib/portfolio';

function ProjectImage({ project, index }: { project: PortfolioProject; index: number }) {
  const [failed, setFailed] = useState(false);
  return <div className="tech-project-art">
    {project.imageUrl && !failed ? <Image src={project.imageUrl} alt={`Aperçu du projet ${project.title}`} fill sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" className="tech-project-image" unoptimized onError={() => setFailed(true)} /> : <div className="tech-project-art-fallback" aria-label="Aperçu illustré du projet"><span>{`0${index + 1} / VISUAL`}</span><i aria-hidden="true">{`{ }`}</i><small>IMAGE DU PROJET</small></div>}
    <div className="tech-project-art-grid" aria-hidden="true" />
    <span className="tech-project-art-index">PROJET / {String(index + 1).padStart(2, '0')}</span>
    <span className="tech-project-art-open" aria-hidden="true"><ArrowUpRight size={17} /></span>
  </div>;
}

export default function ProjectsContent({ projects }: { projects: PortfolioProject[] }) {
  const pageRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const pointerFrameRef = useRef<number | null>(null);
  const pointerCardRef = useRef<HTMLAnchorElement | null>(null);
  const pointerValueRef = useRef<{ tiltX: number; tiltY: number; x: number; y: number } | null>(null);
  const reducedMotionRef = useRef(false);
  const totalTechnologies = new Set(projects.flatMap((project) => project.technologies.split(/[,;]+/).map((item) => item.trim()).filter(Boolean))).size;

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => { reducedMotionRef.current = motionPreference.matches; };
    updateMotionPreference();
    motionPreference.addEventListener('change', updateMotionPreference);
    const root = document.documentElement;
    root.classList.add('project-motion-ready');
    const revealNodes = Array.from(page.querySelectorAll<HTMLElement>('.project-reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealNodes.forEach((node) => observer.observe(node));

    let frame: number | null = null;
    const updateProgress = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
        progressRef.current?.style.setProperty('transform', `scaleX(${progress})`);
      });
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
      observer.disconnect();
      motionPreference.removeEventListener('change', updateMotionPreference);
      root.classList.remove('project-motion-ready');
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [projects.length]);

  return <section ref={pageRef} className="portfolio-projects-page">
    <div className="project-scroll-progress" aria-hidden="true"><span ref={progressRef} /></div>
    <div className="project-page-shell">
      <header className="project-page-hero">
        <div className="project-page-intro project-reveal">
          <p className="project-page-kicker"><span className="project-status-dot" /> PORTFOLIO / RÉALISATIONS</p>
          <p className="project-page-index">01 <span>—</span> LE LABORATOIRE</p>
          <h1>Des idées mises<br /><em>à l’épreuve du réel.</em></h1>
          <p className="project-page-lead">Chaque projet raconte un problème, les choix de conception, le code et ce qui en est ressorti. Voici le travail derrière les lignes de technologies.</p>
          <a className="project-scroll-link" href="#realisations"><span>Explorer les projets</span><ArrowDownRight size={17} /></a>
        </div>
        <div className="project-hero-orbit project-reveal" aria-hidden="true">
          <div className="project-hero-orbit-image"><Image src="/assets/images/projects/project1.jpg" alt="" fill sizes="(max-width: 680px) 160px, 260px" className="project-hero-orbit-image-source" unoptimized /></div>
          <div className="project-hero-orbit-glow" />
          <div className="project-hero-orbit-ring">
            {['PROBLÈME', 'IDÉE', 'UX / UI', 'CODE', 'TEST', 'RÉSULTAT'].map((step, index) => <span key={step} style={{ transform: `rotateY(${index * 60}deg) translateZ(var(--project-orbit-radius))` }}>{step}</span>)}
          </div>
          <span className="project-hero-orbit-label">ÉTUDES DE CAS / 06 TEMPS</span>
        </div>
        <div className="project-hero-footnote"><span>SCROLL POUR DÉCOUVRIR</span><span className="project-footnote-line" /><span>↓</span></div>
      </header>

      <div className="project-list-heading project-reveal" id="realisations">
        <div><p className="project-page-kicker">02 / LE TRAVAIL</p><h2>Réalisations sélectionnées</h2></div>
        <div className="project-counts"><span><strong>{String(projects.length).padStart(2, '0')}</strong> projets</span><span><strong>{String(totalTechnologies).padStart(2, '0')}</strong> technologies</span></div>
      </div>

      {projects.length ? <div className="tech-project-grid">{projects.map((project, index) => {
        const technologies = project.technologies.split(/[,;]+/).map((item) => item.trim()).filter(Boolean);
        return <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="tech-project-card project-reveal"
          style={{ transitionDelay: `${Math.min(index % 3, 2) * 90}ms` }}
          onPointerMove={(event) => {
            if (event.pointerType !== 'mouse' || reducedMotionRef.current) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;
            const depth = Number(getComputedStyle(event.currentTarget.closest('main') || document.documentElement).getPropertyValue('--portfolio-depth')) || 0;
            pointerCardRef.current = event.currentTarget;
            pointerValueRef.current = { tiltX: (0.5 - y) * 14 * depth, tiltY: (x - 0.5) * 14 * depth, x: x * 100, y: y * 100 };
            if (pointerFrameRef.current !== null) return;
            pointerFrameRef.current = requestAnimationFrame(() => {
              pointerFrameRef.current = null;
              const card = pointerCardRef.current;
              const pointer = pointerValueRef.current;
              if (!card || !pointer) return;
              card.style.setProperty('--card-tilt-x', `${pointer.tiltX}deg`);
              card.style.setProperty('--card-tilt-y', `${pointer.tiltY}deg`);
              card.style.setProperty('--card-pointer-x', `${pointer.x}%`);
              card.style.setProperty('--card-pointer-y', `${pointer.y}%`);
            });
          }}
          onPointerLeave={(event) => {
            if (pointerCardRef.current === event.currentTarget) {
              if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
              pointerFrameRef.current = null;
              pointerCardRef.current = null;
              pointerValueRef.current = null;
            }
            event.currentTarget.style.setProperty('--card-tilt-x', '0deg');
            event.currentTarget.style.setProperty('--card-tilt-y', '0deg');
            event.currentTarget.style.setProperty('--card-pointer-x', '50%');
            event.currentTarget.style.setProperty('--card-pointer-y', '40%');
          }}
        >
          <ProjectImage project={project} index={index} />
          <div className="tech-project-copy"><p className="tech-project-meta"><span>ÉTUDE DE CAS / {String(index + 1).padStart(2, '0')}</span><span>{project.featured ? 'À LA UNE' : 'PROJET'}</span></p><h3>{project.title}<span aria-hidden="true"> ↗</span></h3><p className="tech-project-summary">{project.summary}</p>{technologies.length > 0 && <div className="tech-project-tags">{technologies.slice(0, 4).map((technology) => <span key={technology}>{technology}</span>)}</div>}</div>
        </Link>;
      })}</div> : <div className="project-empty project-reveal"><span className="project-empty-mark">&lt;/&gt;</span><div><p className="project-page-kicker">PREMIÈRE ITÉRATION</p><h2>Le prochain projet commence ici.</h2><p>Les réalisations publiées apparaîtront dans cette galerie. Chaque fiche pourra raconter le problème, ta contribution, la solution et les preuves du travail.</p></div></div>}
      <div className="project-bottom-note project-reveal"><span>DES PROBLÈMES CONCRETS. DES SOLUTIONS QUI ÉVOLUENT.</span><span className="project-bottom-rule" /><span>FIN DE LA SÉLECTION</span></div>
    </div>
  </section>;
}
