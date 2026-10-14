import Link from 'next/link';
import type { PortfolioCertificate, PortfolioProject } from '@/lib/portfolio';

type SkillProof = { name: string; proof: string };

function splitValues(value: string): string[] {
  return Array.from(new Set(value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean)));
}

export default function CompetencesContent({ projects, certificates }: { projects: PortfolioProject[]; certificates: PortfolioCertificate[] }) {
  const certificateGroups = new Map<string, SkillProof[]>();
  for (const certificate of certificates) {
    const group = certificate.domain || 'Autres apprentissages';
    const entries = certificateGroups.get(group) || [];
    for (const name of splitValues(certificate.skills)) {
      if (!entries.some((entry) => entry.name.toLocaleLowerCase('fr') === name.toLocaleLowerCase('fr'))) entries.push({ name, proof: certificate.title });
    }
    certificateGroups.set(group, entries);
  }
  const technologies = projects.flatMap((project) => splitValues(project.technologies).map((name) => ({ name, proof: project })));
  const uniqueTechnologies = technologies.filter((item, index) => technologies.findIndex((entry) => entry.name.toLocaleLowerCase('fr') === item.name.toLocaleLowerCase('fr')) === index);
  const hasEvidence = uniqueTechnologies.length > 0 || Array.from(certificateGroups.values()).some((items) => items.length > 0);

  return <section className="relative z-20 max-w-4xl mx-auto mt-32 mb-12 px-7 lg:px-0">
    <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl lg:text-4xl">Compétences</h2>
    <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:leading-7 lg:leading-8 sm:text-base lg:text-lg">Les compétences présentées ici sont reliées aux technologies des projets publiés et aux certificats renseignés.</p>
    {hasEvidence ? <div className="mt-7 space-y-8">
      {uniqueTechnologies.length > 0 && <section><h3 className="mb-3 text-xl font-bold dark:text-neutral-200">Technologies utilisées dans les projets</h3><div className="flex flex-wrap gap-3">{uniqueTechnologies.map((item) => <span key={`${item.name}-${item.proof.id}`} className="px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-lg">{item.name}<Link className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 underline" href={`/projects/${item.proof.id}`}>{item.proof.title}</Link></span>)}</div></section>}
      {Array.from(certificateGroups.entries()).filter(([, items]) => items.length > 0).map(([domain, items]) => <section key={domain}><h3 className="mb-3 text-xl font-bold dark:text-neutral-200">{domain} · apprentissages documentés</h3><div className="flex flex-wrap gap-3">{items.map((item) => <span key={`${domain}-${item.name}`} className="px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-lg">{item.name}<Link className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 underline" href="/certifications">{item.proof}</Link></span>)}</div></section>)}
    </div> : <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">Les compétences apparaîtront ici avec leurs projets ou certificats associés.</p>}
  </section>;
}
