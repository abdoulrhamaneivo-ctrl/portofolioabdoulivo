'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { PortfolioProject } from '@/lib/portfolio';

type ProjectDetailProps = {
  project: PortfolioProject;
  style: CSSProperties;
  proofUrl: string;
  projectUrl: string;
};

export default function ProjectDetailContent({ project, style, proofUrl, projectUrl }: ProjectDetailProps) {
  const pageRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const projectArtRef = useRef<HTMLDivElement>(null);
  const pointerFrameRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<{ x: number; y: number } | null>(null);
  const reducedMotionRef = useRef(false);
  const [imageFailed, setImageFailed] = useState(false);
  const technologies = project.technologies.split(/[,;]+/).map((technology) => technology.trim()).filter(Boolean);
  const sections = [
    ['01', 'Le problème', project.problem],
    ['02', 'Ma contribution', project.contribution],
    ['03', 'La solution', project.solution],
  ].filter((item): item is [string, string, string] => Boolean(item[2]));
  const [activeChapter, setActiveChapter] = useState(sections[0]?.[0] || '01');

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

    const chapterObserver = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setActiveChapter(current.target.id.replace('project-chapter-', ''));
    }, { threshold: [0, 0.2, 0.45], rootMargin: '-24% 0px -60% 0px' });
    page.querySelectorAll<HTMLElement>('[data-project-chapter]').forEach((chapter) => chapterObserver.observe(chapter));

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
      observer.disconnect();
      chapterObserver.disconnect();
      if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
      motionPreference.removeEventListener('change', updateMotionPreference);
      root.classList.remove('project-motion-ready');
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  const handleProjectArtPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || reducedMotionRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    pendingPointerRef.current = { x, y };
    if (pointerFrameRef.current !== null) return;
    pointerFrameRef.current = requestAnimationFrame(() => {
      pointerFrameRef.current = null;
      const pointer = pendingPointerRef.current;
      if (!pointer) return;
      const depth = Number(getComputedStyle(pageRef.current || document.documentElement).getPropertyValue('--portfolio-depth')) || 0;
      projectArtRef.current?.style.setProperty('--detail-tilt-x', `${-pointer.y * 7 * depth}deg`);
      projectArtRef.current?.style.setProperty('--detail-tilt-y', `${pointer.x * 7 * depth}deg`);
      projectArtRef.current?.style.setProperty('--detail-light-x', `${(pointer.x + 0.5) * 100}%`);
      projectArtRef.current?.style.setProperty('--detail-light-y', `${(pointer.y + 0.5) * 100}%`);
    });
  };

  const resetProjectArtPointer = () => {
    if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = null;
    pendingPointerRef.current = null;
    projectArtRef.current?.style.setProperty('--detail-tilt-x', '0deg');
    projectArtRef.current?.style.setProperty('--detail-tilt-y', '0deg');
    projectArtRef.current?.style.setProperty('--detail-light-x', '50%');
    projectArtRef.current?.style.setProperty('--detail-light-y', '50%');
  };

  const scrollToChapter = (number: string) => {
    document.getElementById(`project-chapter-${number}`)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return <main ref={pageRef} className="project-detail-page" style={style}>
    <div className="project-scroll-progress" aria-hidden="true"><span ref={progressRef} /></div>
    <div className="project-detail-shell">
      <Navbar />
      <article>
        <Link href="/projects" className="project-back-link project-reveal"><ArrowLeft size={15} /> Tous les projets</Link>
        <header className="project-detail-hero project-reveal">
          <p className="project-page-kicker"><span className="project-status-dot" /> ÉTUDE DE CAS / {project.featured ? 'PROJET À LA UNE' : 'RÉALISATION'}</p>
          <h1>{project.title}</h1>
          <p className="project-detail-summary">{project.summary}</p>
          <div className="project-detail-index"><span>CONCEVOIR</span><i>→</i><span>RÉALISER</span><i>→</i><span>APPRENDRE</span></div>
        </header>

        <div
          ref={projectArtRef}
          className="project-detail-art project-reveal"
          onPointerMove={handleProjectArtPointerMove}
          onPointerLeave={resetProjectArtPointer}
        >
          {project.imageUrl && !imageFailed ? <Image src={project.imageUrl} alt={`Aperçu du projet ${project.title}`} fill sizes="(max-width: 900px) 100vw, 1120px" className="project-detail-image" priority unoptimized onError={() => setImageFailed(true)} /> : <div className="project-detail-fallback"><span>APERÇU DU PROJET</span><i aria-hidden="true">&lt; / &gt;</i><small>CONSTRUIT PAR L’EXPÉRIMENTATION</small></div>}
          <div className="project-detail-art-grid" aria-hidden="true" />
          <span className="project-detail-art-label">CASE STUDY / 01</span>
        </div>

        <div className="project-detail-layout">
          <div className="project-detail-story">
            {sections.length ? sections.map(([number, title, body]) => <section id={`project-chapter-${number}`} data-project-chapter className="project-detail-section project-reveal" key={number}><span className="project-detail-section-number">{number}</span><div><p className="project-page-kicker">ÉTAPE {number}</p><h2>{title}</h2><p>{body}</p></div></section>) : <section className="project-detail-section project-reveal"><span className="project-detail-section-number">01</span><div><p className="project-page-kicker">ÉTUDE EN COURS</p><h2>Le récit du projet arrive.</h2><p>Les détails de cette réalisation seront ajoutés prochainement.</p></div></section>}
          </div>
          <aside className="project-detail-aside project-reveal">
            {sections.length > 0 && <nav className="project-chapter-nav" aria-label="Navigation dans l’étude de cas">
              <p className="project-page-kicker">PARCOURS DU PROJET</p>
              <ol>{sections.map(([number, title]) => <li key={number}><button type="button" aria-current={activeChapter === number ? 'step' : undefined} onClick={() => scrollToChapter(number)}><span>{number}</span><strong>{title}</strong><i aria-hidden="true">↘</i></button></li>)}</ol>
            </nav>}
            <p className="project-page-kicker">OUTILS & PREUVES</p>
            <h2>La boîte à outils</h2>
            {technologies.length ? <div className="project-detail-tags">{technologies.map((technology) => <span key={technology}>{technology}</span>)}</div> : <p className="project-aside-empty">Technologies à préciser.</p>}
            {(proofUrl || projectUrl) && <div className="project-detail-links">{proofUrl && <a href={proofUrl} target="_blank" rel="noreferrer"><span>Preuves du travail</span><ExternalLink size={15} /></a>}{projectUrl && <a href={projectUrl} target="_blank" rel="noreferrer"><span>Ouvrir le projet</span><ArrowUpRight size={16} /></a>}</div>}
          </aside>
        </div>
        <Link href="/projects" className="project-next-link project-reveal"><span>RETOUR À LA GALERIE</span><ArrowLeft size={16} /></Link>
      </article>
    </div>
    <Footer />
  </main>;
}
