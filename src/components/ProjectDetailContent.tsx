'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { PortfolioProject } from '@/lib/portfolio';

type ProjectDetailProps = {
  project: PortfolioProject;
  proofUrl: string;
  projectUrl: string;
};

export default function ProjectDetailContent({ project, proofUrl, projectUrl }: ProjectDetailProps) {
  const pageRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const technologies = project.technologies.split(/[,;]+/).map((technology) => technology.trim()).filter(Boolean);
  const sections = [
    ['01', 'Le problème', project.problem],
    ['02', 'Ma contribution', project.contribution],
    ['03', 'La solution', project.solution],
  ].filter((item): item is [string, string, string] => Boolean(item[2]));

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
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

    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
      });
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.classList.remove('project-motion-ready');
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return <main ref={pageRef} className="project-detail-page">
    <div className="project-scroll-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
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

        <div className="project-detail-art project-reveal">
          {project.imageUrl && !imageFailed ? <Image src={project.imageUrl} alt={`Aperçu du projet ${project.title}`} fill sizes="(max-width: 900px) 100vw, 1120px" className="project-detail-image" priority unoptimized onError={() => setImageFailed(true)} /> : <div className="project-detail-fallback"><span>APERÇU DU PROJET</span><i aria-hidden="true">&lt; / &gt;</i><small>CONSTRUIT PAR L’EXPÉRIMENTATION</small></div>}
          <div className="project-detail-art-grid" aria-hidden="true" />
          <span className="project-detail-art-label">CASE STUDY / 01</span>
        </div>

        <div className="project-detail-layout">
          <div className="project-detail-story">
            {sections.length ? sections.map(([number, title, body]) => <section className="project-detail-section project-reveal" key={number}><span className="project-detail-section-number">{number}</span><div><p className="project-page-kicker">ÉTAPE {number}</p><h2>{title}</h2><p>{body}</p></div></section>) : <section className="project-detail-section project-reveal"><span className="project-detail-section-number">01</span><div><p className="project-page-kicker">ÉTUDE EN COURS</p><h2>Le récit du projet arrive.</h2><p>Les détails de cette réalisation seront ajoutés prochainement.</p></div></section>}
          </div>
          <aside className="project-detail-aside project-reveal">
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
