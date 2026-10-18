'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Code2, Layers3, Network, PanelsTopLeft } from 'lucide-react';
import type { PortfolioCertificate, PortfolioJourneyItem, PortfolioProject, PortfolioSkillGroup } from '@/lib/portfolio';
import { getJourneyCapabilities } from '@/lib/competences';

function split(value: string) {
  return Array.from(new Set(value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean)));
}

const skillIcons = [Code2, Network, PanelsTopLeft, Layers3];

export default function CompetencesContent({ skillGroups, projects, certificates, journey }: { skillGroups: PortfolioSkillGroup[]; projects: PortfolioProject[]; certificates: PortfolioCertificate[]; journey: PortfolioJourneyItem[] }) {
  const visibleGroups = skillGroups.filter((group) => group.published);
  const [activeId, setActiveId] = useState(visibleGroups[0]?.id || '');
  const active = visibleGroups.find((group) => group.id === activeId) || visibleGroups[0];
  const capabilities = getJourneyCapabilities(journey);
  const projectCount = projects.length;
  const certificateCount = certificates.length;
  const tags = active ? split(active.items) : [];
  const Icon = active ? skillIcons[Math.max(0, visibleGroups.indexOf(active)) % skillIcons.length] : Layers3;

  return <section className="zip-skill-page zip-page-shell">
    <header className="zip-page-heading zip-reveal"><div><p className="zip-kicker">COMPÉTENCES <span>/</span> CARTOGRAPHIE</p><h1>Ce que je sais<br /><em>faire et développer.</em></h1></div><p>Mes domaines de pratique, affichés au même niveau et avec leurs preuves de parcours quand elles sont disponibles.</p><div className="zip-page-counts"><strong>{String(visibleGroups.length).padStart(2, '0')}</strong><span>domaines<br />présentés</span><i /><strong>{String(projectCount + certificateCount + capabilities.length).padStart(2, '0')}</strong><span>éléments<br />de parcours reliés</span></div></header>

    {visibleGroups.length ? <div className="zip-skills-explorer">
      <div className="zip-skill-picker" role="tablist" aria-label="Choisir un domaine de compétence">{visibleGroups.map((group, index) => {
        const ItemIcon = skillIcons[index % skillIcons.length];
        const selected = active?.id === group.id;
        return <button key={group.id} type="button" role="tab" id={`skill-tab-${group.id}`} aria-selected={selected} aria-controls="skill-domain-detail" onClick={() => setActiveId(group.id)}><span>{String(index + 1).padStart(2, '0')}</span><ItemIcon size={18} /><strong>{group.title}</strong><i aria-hidden="true">↗</i></button>;
      })}</div>

      {active && <section className="zip-skill-detail zip-reveal" id="skill-domain-detail" role="tabpanel" aria-labelledby={`skill-tab-${active.id}`} key={active.id}>
        <div className="zip-skill-detail-visual"><span className="zip-kicker">DOMAINE / {String(visibleGroups.indexOf(active) + 1).padStart(2, '0')}</span><div className="zip-skill-detail-symbol"><Icon size={62} strokeWidth={1.2} /><i /></div><span>{active.level || 'Niveau à préciser'}</span></div>
        <div className="zip-skill-detail-copy"><p className="zip-kicker">MON NIVEAU DE PRATIQUE</p><h2>{active.title}</h2><p>{active.summary || 'Les outils et compétences précisés ici sont administrables depuis le studio du portfolio.'}</p>
          <div className="zip-skill-detail-tags">{tags.length ? tags.map((item) => <span key={item}>{item}</span>) : <span>{active.id === 'programming' ? 'Langages de programmation à préciser' : 'Éléments à compléter'}</span>}</div>
          <div className="zip-skill-detail-note"><i />{active.level === 'Bases' ? 'Bases déclarées' : active.level === 'À préciser' ? 'Niveau à préciser' : active.level || 'Pratique documentée'}</div>
        </div>
      </section>}
    </div> : <div className="zip-empty-inline"><span className="zip-empty-mark">01</span><div><h2>Aucun domaine n’est publié.</h2><p>Les catégories se gèrent dans l’administration du portfolio.</p></div></div>}

    {capabilities.length > 0 && <section className="zip-skill-proof-section"><header className="zip-section-head zip-reveal"><div><p className="zip-kicker">PARCOURS <span>/</span> PREUVES LIÉES</p><h2>La pratique <em>en contexte.</em></h2></div><p>Ces capacités renvoient vers l’étape de formation, d’expérience ou de contribution qui les documente.</p></header><div className="zip-proof-grid">{capabilities.map((capability, index) => <article className="zip-proof-card zip-reveal" key={`${capability.name}-${capability.source.id}`}><span>{String(index + 1).padStart(2, '0')} / {capability.status}</span><h3>{capability.name}</h3><p>{capability.summary}</p><Link href={`/about#experience-${capability.source.id}`}>{capability.source.title}<ArrowUpRight size={14} /></Link></article>)}</div></section>}

    <section className="zip-skills-ledger"><div className="zip-section-head zip-reveal"><div><p className="zip-kicker">APPRENTISSAGES <span>/</span> 02</p><h2>Langages, outils & <em>méthodes.</em></h2></div><p>Les détails techniques associés aux réalisations et certificats restent liés à leurs fiches publiques.</p></div><div className="zip-ledger-grid"><Link href="/projects" className="zip-ledger-cell"><span>01 / TECHNOLOGIES DE PROJET</span><strong>{projectCount ? `${projectCount} projet${projectCount > 1 ? 's' : ''} publié${projectCount > 1 ? 's' : ''}` : 'Projets en attente de publication'}</strong><i>Voir les réalisations <ArrowUpRight size={15} /></i></Link><Link href="/certifications" className="zip-ledger-cell"><span>02 / COMPÉTENCES CERTIFIÉES</span><strong>{certificateCount ? `${certificateCount} certificat${certificateCount > 1 ? 's' : ''} publié${certificateCount > 1 ? 's' : ''}` : 'Aucun certificat publié'}</strong><i>Parcourir les certificats <ArrowUpRight size={15} /></i></Link></div></section>
  </section>;
}
