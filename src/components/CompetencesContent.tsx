import Link from 'next/link';
import { ArrowUpRight, Blocks, Braces, Database, LockKeyhole, Palette, Sparkles } from 'lucide-react';
import type { PortfolioCertificate, PortfolioProject } from '@/lib/portfolio';

type Evidence = { label: string; href: string; kind: 'PROJET' | 'CERTIFICAT' };
type Skill = { name: string; evidence: Evidence[] };

function splitValues(value: string): string[] {
  return Array.from(new Set(value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean)));
}

const domains = [
  { title: 'Développement', icon: Braces, terms: /javascript|typescript|react|next|node|html|css|python|java|php|api|git|développement/i },
  { title: 'Conception numérique', icon: Blocks, terms: /produit|conception|architecture|prototype|méthode|agile|gestion/i },
  { title: 'UX / UI', icon: Palette, terms: /ux|ui|figma|design|interface|accessibilité|ergonomie/i },
  { title: 'Données', icon: Database, terms: /sql|data|donnée|base|analyse|power bi|excel/i },
  { title: 'Sécurité', icon: LockKeyhole, terms: /sécurité|cyber|réseau|owasp|cloud|système/i },
  { title: 'IA', icon: Sparkles, terms: /ia|intelligence artificielle|machine learning|modèle|prompt/i },
];

export default function CompetencesContent({ projects, certificates }: { projects: PortfolioProject[]; certificates: PortfolioCertificate[] }) {
  const byName = new Map<string, Skill>();
  const add = (name: string, evidence: Evidence) => {
    const key = name.toLocaleLowerCase('fr-FR');
    const skill = byName.get(key) || { name, evidence: [] };
    if (!skill.evidence.some((item) => item.href === evidence.href && item.kind === evidence.kind)) skill.evidence.push(evidence);
    byName.set(key, skill);
  };
  projects.forEach((project) => splitValues(project.technologies).forEach((name) => add(name, { label: project.title, href: `/projects/${project.id}`, kind: 'PROJET' })));
  certificates.forEach((certificate) => splitValues(certificate.skills).forEach((name) => add(name, { label: certificate.title, href: `/certifications#certificate-${certificate.id}`, kind: 'CERTIFICAT' })));
  const skills = Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const grouped = domains.map((domain) => ({ ...domain, skills: skills.filter((skill) => domain.terms.test(skill.name)) })).filter((domain) => domain.skills.length);
  const otherSkills = skills.filter((skill) => !grouped.some((group) => group.skills.includes(skill)));

  return <section className="portfolio-skills-page">
    <header className="portfolio-page-heading skills-heading">
      <p className="portfolio-page-kicker"><span /> CARTOGRAPHIE DES SAVOIR-FAIRE / 01</p>
      <h1>Des compétences<br /><em>reliées au réel.</em></h1>
      <p className="portfolio-page-lead">Chaque sujet est ici relié à un projet ou à une preuve d’apprentissage. Aucun niveau n’est affiché sans élément qui l’étaye.</p>
      <div className="skills-summary"><strong>{String(skills.length).padStart(2, '0')}</strong><span>notions documentées</span><i aria-hidden="true" /><strong>{String(projects.length + certificates.length).padStart(2, '0')}</strong><span>sources publiées</span></div>
    </header>

    {skills.length ? <div className="skills-domain-grid">{grouped.map((domain) => {
      const Icon = domain.icon;
      return <section className="skills-domain" key={domain.title}><header><span><Icon size={17} strokeWidth={1.6} /></span><div><p>DOMAINE</p><h2>{domain.title}</h2></div><small>{String(domain.skills.length).padStart(2, '0')}</small></header>
        <div className="skills-evidence-list">{domain.skills.map((skill) => <article className="skill-evidence-item" key={skill.name}><div className="skill-evidence-name"><span className="skill-evidence-node" /><h3>{skill.name}</h3><span>{String(skill.evidence.length).padStart(2, '0')} source{skill.evidence.length > 1 ? 's' : ''}</span></div>
          <ul>{skill.evidence.map((source) => <li key={`${source.kind}:${source.href}`}><span>{source.kind}</span><Link href={source.href}>{source.label}<ArrowUpRight size={13} /></Link></li>)}</ul>
        </article>)}</div>
      </section>;
    })}{otherSkills.length > 0 && <section className="skills-domain skills-domain-other"><header><span><Blocks size={17} strokeWidth={1.6} /></span><div><p>ÉLÉMENTS À CLASSER</p><h2>Autres sujets</h2></div><small>{String(otherSkills.length).padStart(2, '0')}</small></header><div className="skills-evidence-list">{otherSkills.map((skill) => <article className="skill-evidence-item" key={skill.name}><div className="skill-evidence-name"><span className="skill-evidence-node" /><h3>{skill.name}</h3><span>{String(skill.evidence.length).padStart(2, '0')} source{skill.evidence.length > 1 ? 's' : ''}</span></div><ul>{skill.evidence.map((source) => <li key={`${source.kind}:${source.href}`}><span>{source.kind}</span><Link href={source.href}>{source.label}<ArrowUpRight size={13} /></Link></li>)}</ul></article>)}</div></section>}</div> : <div className="portfolio-empty-state"><span>{'</>'}</span><div><p className="portfolio-about-eyebrow">PREUVES À RELIER</p><h2>Les savoir-faire apparaîtront avec les projets publiés.</h2><p>Renseigne les technologies d’un projet ou les compétences d’un certificat pour créer des liens vérifiables dans cette cartographie.</p></div></div>}
  </section>;
}
