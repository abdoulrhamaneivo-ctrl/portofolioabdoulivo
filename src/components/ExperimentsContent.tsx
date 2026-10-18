import Link from 'next/link';
import type { PortfolioExperiment } from '@/lib/portfolio';

export default function ExperimentsContent({ experiments }: { experiments: PortfolioExperiment[] }) {
  return <section className="portfolio-lab-page">
    <header className="portfolio-page-heading">
      <p className="portfolio-page-kicker"><span /> ESPACE D’EXPLORATION / 01</p>
      <h1>Laboratoire</h1>
      <p className="portfolio-page-lead">Des questions testées, des prototypes et des pistes en cours — présentés comme des explorations, pas comme des projets finalisés.</p>
    </header>
    {experiments.length ? <div className="portfolio-lab-grid">{experiments.map((experiment, index) => <article className="portfolio-lab-card" key={experiment.id} style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}>
      <div className="portfolio-lab-card-top"><span>{experiment.category || 'EXPLORATION'}</span><span className="portfolio-lab-status"><i />{experiment.status || 'En cours'}</span></div>
      <div className="portfolio-lab-symbol" aria-hidden="true">{String(index + 1).padStart(2, '0')}<i>✳</i></div>
      <h2>{experiment.title}</h2>
      {experiment.description && <p>{experiment.description}</p>}
      {experiment.technologies && <div className="portfolio-lab-tags">{experiment.technologies.split(/[,;]+/).map((item) => item.trim()).filter(Boolean).map((item) => <span key={item}>{item}</span>)}</div>}
    </article>)}</div> : <div className="portfolio-lab-empty"><span aria-hidden="true">&lt;/&gt;</span><div><p className="portfolio-about-eyebrow">UN ESPACE POUR ESSAYER</p><h2>Les expérimentations viendront ici.</h2><p>Les prototypes peuvent être publiés séparément des projets finalisés depuis l’administration.</p><Link href="/admin">Ouvrir le studio admin <span aria-hidden="true">↗</span></Link></div></div>}
  </section>;
}
