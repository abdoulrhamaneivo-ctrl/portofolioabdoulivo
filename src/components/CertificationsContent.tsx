'use client';

import { useMemo, useState } from 'react';
import type { PortfolioCertificate } from '@/lib/portfolio';
import { safeExternalUrl } from '@/lib/urls';

export default function CertificationsContent({ certificates }: { certificates: PortfolioCertificate[] }) {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('Tous les domaines');
  const [issuer, setIssuer] = useState('Tous les organismes');
  const [year, setYear] = useState('Toutes les années');
  const [level, setLevel] = useState('Tous les niveaux');
  const domains = ['Tous les domaines', ...Array.from(new Set(certificates.map((item) => item.domain).filter(Boolean))).sort()];
  const issuers = ['Tous les organismes', ...Array.from(new Set(certificates.map((item) => item.issuer).filter(Boolean))).sort()];
  const years = ['Toutes les années', ...Array.from(new Set(certificates.map((item) => item.date.slice(0, 4)).filter((value) => /^\d{4}$/.test(value)))).sort().reverse()];
  const levels = ['Tous les niveaux', ...Array.from(new Set(certificates.map((item) => item.level).filter(Boolean))).sort()];
  const results = useMemo(() => certificates.filter((item) => {
    const text = `${item.title} ${item.issuer} ${item.skills} ${item.domain} ${item.level} ${item.type}`.toLocaleLowerCase('fr');
    return text.includes(query.toLocaleLowerCase('fr'))
      && (domain === 'Tous les domaines' || item.domain === domain)
      && (issuer === 'Tous les organismes' || item.issuer === issuer)
      && (year === 'Toutes les années' || item.date.startsWith(year))
      && (level === 'Tous les niveaux' || item.level === level);
  }), [certificates, query, domain, issuer, year, level]);

  const selectClass = 'px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200';
  return <section className="relative z-20 max-w-4xl mx-auto mt-32 mb-12 px-7 lg:px-0">
    <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl lg:text-4xl">Certificats</h2>
    <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:leading-7 lg:leading-8 sm:text-base lg:text-lg">Certifications, formations et attestations de participation.</p>
    <div className="mt-6 flex flex-wrap gap-2">
      <input className={`${selectClass} min-w-[220px] flex-1`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher par nom…" aria-label="Rechercher un certificat" />
      <select className={selectClass} value={domain} onChange={(event) => setDomain(event.target.value)} aria-label="Filtrer par domaine">{domains.map((item) => <option key={item}>{item}</option>)}</select>
      <select className={selectClass} value={issuer} onChange={(event) => setIssuer(event.target.value)} aria-label="Filtrer par organisme">{issuers.map((item) => <option key={item}>{item}</option>)}</select>
      <select className={selectClass} value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filtrer par année">{years.map((item) => <option key={item}>{item}</option>)}</select>
      <select className={selectClass} value={level} onChange={(event) => setLevel(event.target.value)} aria-label="Filtrer par niveau">{levels.map((item) => <option key={item}>{item}</option>)}</select>
    </div>
    <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">{results.length} document{results.length === 1 ? '' : 's'}</p>
    {results.length ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">{results.map((item) => <article id={`certificate-${item.id}`} key={item.id} className="relative scroll-mt-28 p-6 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-2xl bg-white dark:bg-neutral-950">
      <div className="flex items-start justify-between gap-3"><span className="px-2.5 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">{item.type || 'Certificat'}</span>{item.date && <span className="text-xs text-neutral-500">{formatMonth(item.date)}</span>}</div>
      <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</h3>
      {item.issuer && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{item.issuer}</p>}
      <div className="mt-3 flex flex-wrap gap-2">{item.domain && <span className="px-2.5 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">{item.domain}</span>}{item.level && <span className="px-2.5 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">{item.level}</span>}</div>
      {item.skills && <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">Compétences : {item.skills}</p>}
      <div className="mt-5 flex flex-wrap gap-4 text-sm">{item.fileUrl && <a className="text-indigo-600 dark:text-indigo-400 underline" href={item.fileUrl} target="_blank" rel="noreferrer">Consulter le document</a>}{safeExternalUrl(item.verificationUrl) && <a className="text-indigo-600 dark:text-indigo-400 underline" href={safeExternalUrl(item.verificationUrl)} target="_blank" rel="noreferrer">Vérifier le certificat</a>}</div>
    </article>)}</div> : <p className="mt-7 text-sm text-neutral-500 dark:text-neutral-400">{certificates.length ? 'Aucun résultat pour ces filtres.' : 'Les certificats publiés apparaîtront ici.'}</p>}
  </section>;
}

function formatMonth(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${value}-01T12:00:00`));
}
