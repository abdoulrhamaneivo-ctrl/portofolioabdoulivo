'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { PortfolioJourneyItem, PortfolioProject } from '@/lib/portfolio';

function ProjectImage({ project, index }: { project: PortfolioProject; index: number }) {
  const [failed, setFailed] = useState(false);
  return <div className="zip-project-image">
    {project.imageUrl && !failed ? <Image src={project.imageUrl} alt={`Aperçu du projet ${project.title}`} fill sizes="(max-width: 720px) 100vw, (max-width: 1000px) 50vw, 33vw" unoptimized onError={() => setFailed(true)} /> : <div className="zip-project-art" aria-hidden="true"><span>{`{ ${String(index + 1).padStart(2, '0')} }`}</span><i /><b /></div>}
    <span className="zip-project-image-index">PROJET / {String(index + 1).padStart(2, '0')}</span>
  </div>;
}

export default function ProjectsContent({ projects, journey }: { projects: PortfolioProject[]; journey: PortfolioJourneyItem[] }) {
  const contributions = journey.filter((item) => item.published && item.category === 'Contribution');
  const techCount = new Set(projects.flatMap((project) => project.technologies.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean))).size;

  return <section className="zip-projects-page zip-page-shell">
    <header className="zip-page-heading zip-reveal"><div><p className="zip-kicker">PROJETS <span>/</span> ÉTUDES DE CAS</p><h1>Des idées mises<br /><em>à l’épreuve du réel.</em></h1></div><p>Problème, contribution, solution et technologies : chaque fiche raconte le travail derrière le résultat.</p><div className="zip-page-counts"><strong>{String(projects.length).padStart(2, '0')}</strong><span>projets<br />publiés</span><i /><strong>{String(techCount).padStart(2, '0')}</strong><span>technologies<br />documentées</span></div></header>

    <section className="zip-project-gallery" id="realisations"><div className="zip-subheading zip-reveal"><h2>Réalisations sélectionnées</h2><span>{String(projects.length).padStart(2, '0')} ÉTUDES DE CAS</span></div>
      {projects.length ? <div className="zip-project-grid">{projects.map((project, index) => <Link href={`/projects/${project.id}`} className="zip-project-card zip-reveal" key={project.id}>
        <ProjectImage project={project} index={index} />
        <div className="zip-project-copy"><p>{project.featured ? 'À LA UNE' : 'ÉTUDE DE CAS'} <ArrowUpRight size={14} /></p><h3>{project.title}</h3>{project.summary && <span>{project.summary}</span>}{project.technologies && <div className="zip-project-tags">{project.technologies.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div>}</div>
      </Link>)}</div> : <div className="zip-empty-inline zip-reveal"><span className="zip-empty-mark">01</span><div><h3>Aucune étude de cas autonome n’est publiée.</h3><p>Les contributions déjà documentées dans le parcours restent accessibles ci-dessous.</p></div></div>}
    </section>

    {contributions.length > 0 && <section className="zip-contributions"><div className="zip-subheading zip-reveal"><h2>Contributions documentées</h2><Link href="/about#parcours">Voir le parcours <ArrowUpRight size={15} /></Link></div><div className="zip-contribution-grid">{contributions.map((item, index) => <Link className="zip-contribution-card zip-reveal" href={`/about#experience-${item.id}`} key={item.id}><span>{String(index + 1).padStart(2, '0')} / {item.period}</span><h3>{item.title}</h3>{item.organization && <strong>{item.organization}</strong>}{item.description && <p>{item.description}</p>}<i>Lire le contexte <ArrowUpRight size={14} /></i></Link>)}</div></section>}
  </section>;
}
