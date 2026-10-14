import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { readPortfolio } from '@/lib/portfolio';
import { safeExternalUrl } from '@/lib/urls';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readPortfolio();
  const project = data.projects.find((item) => item.id === id && item.published);
  if (!project) notFound();

  const sections = [
    ['Le problème', project.problem],
    ['Ma contribution', project.contribution],
    ['La solution', project.solution],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return <main className="min-h-screen flex flex-col"><div className="relative flex-grow"><Navbar /><article className="relative z-20 max-w-4xl mx-auto mt-32 mb-12 px-7 lg:px-0">
    <Link href="/projects" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">← Tous les projets</Link>
    <h1 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl lg:text-4xl">{project.title}</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:leading-7 sm:text-base">{project.summary}</p>
    {project.imageUrl && <div className="relative mt-7 w-full aspect-[16/9] overflow-hidden rounded-xl"><Image src={project.imageUrl} alt={project.title} fill sizes="(max-width: 768px) 100vw, 896px" className="object-cover" unoptimized /></div>}
    <div className="mt-8 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] gap-8">
      <div className="space-y-6">{sections.map(([title, body]) => <section key={title}><h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2><p className="mt-2 text-sm leading-7 text-neutral-600 dark:text-neutral-400 whitespace-pre-line">{body}</p></section>)}</div>
      <aside className="h-fit p-5 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl"><h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Technologies</h2><p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{project.technologies || 'À préciser'}</p>{safeExternalUrl(project.proofUrl) && <a href={safeExternalUrl(project.proofUrl)} target="_blank" rel="noreferrer" className="mt-4 block text-sm text-indigo-600 dark:text-indigo-400 underline">Voir les preuves du travail ↗</a>}{safeExternalUrl(project.link) && <a href={safeExternalUrl(project.link)} target="_blank" rel="noreferrer" className="mt-3 block text-sm text-indigo-600 dark:text-indigo-400 underline">Ouvrir le projet ↗</a>}</aside>
    </div>
  </article></div><Footer /></main>;
}
