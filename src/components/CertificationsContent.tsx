'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, Award, Search, SlidersHorizontal } from 'lucide-react';
import type { PortfolioCertificate } from '@/lib/portfolio';
import { safeExternalUrl } from '@/lib/urls';

export default function CertificationsContent({ certificates }: { certificates: PortfolioCertificate[] }) {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [issuer, setIssuer] = useState('');
  const [year, setYear] = useState('');
  const [level, setLevel] = useState('');
  const domains = Array.from(new Set(certificates.map((item) => item.domain).filter(Boolean))).sort();
  const issuers = Array.from(new Set(certificates.map((item) => item.issuer).filter(Boolean))).sort();
  const years = Array.from(new Set(certificates.map((item) => item.date.slice(0, 4)).filter((value) => /^\d{4}$/.test(value)))).sort().reverse();
  const levels = Array.from(new Set(certificates.map((item) => item.level).filter(Boolean))).sort();
  const results = useMemo(() => certificates.filter((item) => {
    const text = `${item.title} ${item.issuer} ${item.skills} ${item.domain} ${item.level} ${item.type}`.toLocaleLowerCase('fr');
    return text.includes(query.toLocaleLowerCase('fr')) && (!domain || item.domain === domain) && (!issuer || item.issuer === issuer) && (!year || item.date.startsWith(year)) && (!level || item.level === level);
  }), [certificates, query, domain, issuer, year, level]);
  const select = (label: string, value: string, setValue: (value: string) => void, options: string[]) => <label className="certificate-filter"><span>{label}</span><select value={value} onChange={(event) => setValue(event.target.value)}><option value="">Tous</option>{options.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>;

  return <section className="portfolio-cert-page">
    <header className="portfolio-page-heading certificate-heading">
      <p className="portfolio-page-kicker"><span /> ARCHIVES D’APPRENTISSAGE / 01</p>
      <h1>Les preuves<br /><em>de ce que j’apprends.</em></h1>
      <p className="portfolio-page-lead">Certifications, cours et attestations documentés par leur organisme, leur date et les compétences qu’ils couvrent.</p>
      <div className="certificate-totals"><strong>{String(certificates.length).padStart(2, '0')}</strong><span>éléments publiés<br />dans la bibliothèque</span><i aria-hidden="true" /></div>
    </header>

    <div className="certificate-toolbar">
      <div className="certificate-search"><Search size={17} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une preuve…" aria-label="Rechercher par nom, organisme ou compétence" /></div>
      <span className="certificate-toolbar-count"><SlidersHorizontal size={15} aria-hidden="true" /> {results.length} / {certificates.length}</span>
    </div>
    <div className="certificate-filters" aria-label="Filtres de la bibliothèque">
      {select('DOMAINE', domain, setDomain, domains)}{select('ORGANISME', issuer, setIssuer, issuers)}{select('ANNÉE', year, setYear, years)}{select('NIVEAU', level, setLevel, levels)}
    </div>

    {results.length ? <div className="certificate-library" aria-live="polite">{results.map((item, index) => {
      const verification = safeExternalUrl(item.verificationUrl);
      const date = item.date && /^\d{4}-\d{2}$/.test(item.date) ? new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${item.date}-01T12:00:00`)) : item.date;
      return <article id={`certificate-${item.id}`} key={item.id} className="certificate-entry" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
        <div className="certificate-entry-number">{String(index + 1).padStart(2, '0')}<span> / {String(results.length).padStart(2, '0')}</span></div>
        <div className="certificate-entry-seal"><Award size={22} strokeWidth={1.4} aria-hidden="true" /></div>
        <div className="certificate-entry-main"><div className="certificate-entry-meta"><span>{item.type || 'APPRENTISSAGE DOCUMENTÉ'}</span>{item.date && <time>{date}</time>}</div><h2>{item.title}</h2><p className="certificate-entry-issuer">{item.issuer || 'Organisme non renseigné'}</p>
          <div className="certificate-entry-tags">{item.domain && <span>{item.domain}</span>}{item.level && <span>{item.level}</span>}{item.skills && item.skills.split(/[,;\n]+/).map((skill) => skill.trim()).filter(Boolean).slice(0, 4).map((skill) => <span className="is-skill" key={skill}>{skill}</span>)}</div>
        </div>
        <div className="certificate-entry-actions">{item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noreferrer">Consulter le document <ArrowUpRight size={15} /></a>}{verification && <a href={verification} target="_blank" rel="noreferrer">Vérifier la preuve <ArrowUpRight size={15} /></a>}{!item.fileUrl && !verification && <span>Référence à compléter</span>}</div>
      </article>;
    })}</div> : <div className="portfolio-empty-state"><span>∅</span><div><p className="portfolio-about-eyebrow">AUCUNE CORRESPONDANCE</p><h2>{certificates.length ? 'Aucune preuve ne correspond à ces filtres.' : 'La bibliothèque attend ses premières preuves.'}</h2><p>{certificates.length ? 'Efface un filtre ou essaie un autre terme de recherche.' : 'Les certificats publiés depuis l’administration apparaîtront ici avec leurs informations de vérification.'}</p></div></div>}
  </section>;
}
