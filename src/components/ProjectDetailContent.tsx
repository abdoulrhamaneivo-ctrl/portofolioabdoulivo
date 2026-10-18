'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { CSSProperties } from 'react';
import type { PortfolioProject } from '@/lib/portfolio';
import ProjectMediaFrame from '@/components/ProjectMediaFrame';

type ProjectDetailProps = { project: PortfolioProject; style: CSSProperties; proofUrl: string; projectUrl: string };

export default function ProjectDetailContent({ project, style, proofUrl, projectUrl }: ProjectDetailProps) {
  const technologies = project.technologies.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
  const chapters = [['01', 'Le problème', project.problem], ['02', 'Ma contribution', project.contribution], ['03', 'La solution', project.solution]].filter((item) => item[2]);

  return <main className="zip-case-page" style={style}>
    <Navbar />
    <article className="zip-case-shell">
      <Link href="/projects" className="zip-case-back"><ArrowLeft size={15} /> Galerie des projets</Link>
      <header className="zip-case-heading zip-reveal"><p className="zip-kicker">ÉTUDE DE CAS <span>/</span> {project.featured ? 'À LA UNE' : 'RÉALISATION'}</p><h1>{project.title}</h1><p>{project.summary}</p><div className="zip-case-index">COMPRENDRE <i>→</i> CONCEVOIR <i>→</i> CONSTRUIRE <i>→</i> ÉVALUER</div></header>
      <ProjectMediaFrame title={project.title} imageUrl={project.imageUrl} videoUrl={project.videoUrl} index={0} interactive detail />
      <div className="zip-case-layout"><div className="zip-case-story">
        {chapters.length ? chapters.map(([number, title, copy]) => <section className="zip-case-chapter zip-reveal" id={`chapter-${number}`} key={number}><span>{number}</span><div><p className="zip-kicker">ÉTAPE {number}</p><h2>{title}</h2><p>{copy}</p></div></section>) : <section className="zip-case-chapter zip-reveal"><span>01</span><div><p className="zip-kicker">ÉTUDE DE CAS</p><h2>Le récit de cette réalisation.</h2><p>Les détails du projet seront présentés ici au fur et à mesure de leur publication.</p></div></section>}
      </div><aside className="zip-case-aside zip-reveal"><p className="zip-kicker">OUTILS & PREUVES</p><h2>La boîte à outils</h2>{technologies.length ? <div className="zip-project-tags">{technologies.map((item) => <span key={item}>{item}</span>)}</div> : <p className="zip-case-aside-note">Les technologies seront précisées sur cette fiche.</p>}{(proofUrl || projectUrl) && <div className="zip-case-links">{proofUrl && <a href={proofUrl} target="_blank" rel="noreferrer">Preuves du travail <ExternalLink size={15} /></a>}{projectUrl && <a href={projectUrl} target="_blank" rel="noreferrer">Ouvrir le projet <ArrowUpRight size={15} /></a>}</div>}</aside></div>
      <Link href="/projects" className="zip-case-end"><span>RETOUR AUX PROJETS</span><ArrowLeft size={15} /></Link>
    </article>
    <Footer />
  </main>;
}
