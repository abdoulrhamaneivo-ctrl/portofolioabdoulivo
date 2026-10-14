import Link from 'next/link';
import Image from 'next/image';
import type { PortfolioProject } from '@/lib/portfolio';

export default function ProjectsContent({ projects }: { projects: PortfolioProject[] }) {
  return <section className="relative z-20 max-w-4xl mx-auto mt-32 mb-12 px-7 lg:px-0">
    <div className="relative z-20 w-full mx-auto lg:mx-0">
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl lg:text-4xl">Mes projets</h2>
      <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:leading-7 lg:leading-8 sm:text-base lg:text-lg">Des réalisations concrètes, leurs objectifs et les technologies mises en œuvre.</p>
    </div>
    {projects.length ? <div className="z-50 grid items-stretch w-full grid-cols-1 my-8 gap-7 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => <Link key={project.id} href={`/projects/${project.id}`} className="relative flex flex-col items-stretch duration-300 ease-out p-7 sm:p-3 group rounded-2xl">
        <span className="absolute inset-0 z-20 block w-full h-full duration-300 ease-out bg-transparent border border-transparent border-dashed group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:border-neutral-300 dark:group-hover:border-neutral-600 group-hover:bg-white dark:group-hover:bg-neutral-950 rounded-2xl" />
        <span className="absolute inset-0 z-10 block w-full h-full duration-300 ease-out border border-dashed rounded-2xl border-neutral-300 dark:border-neutral-600 group-hover:translate-x-1 group-hover:translate-y-1" />
        <span className="relative z-30 block duration-300 ease-out group-hover:-translate-x-1 group-hover:-translate-y-1">
          <span className="block w-full">{project.imageUrl ? <Image src={project.imageUrl} alt={project.title} width={800} height={450} className="w-full h-auto rounded-lg aspect-[16/9] object-cover" unoptimized /> : <span className="flex w-full items-center justify-center rounded-lg aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 text-neutral-400">Projet</span>}</span>
          <span className="block w-full px-1 mt-5 mb-1 sm:mt-3">
            <span className="flex items-center mb-1 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{project.title}<span className="ml-1 text-xs">↗</span></span>
            <span className="text-sm text-neutral-600 dark:text-neutral-400 block">{project.summary}</span>
            {project.technologies && <span className="mt-2 text-xs text-neutral-500 dark:text-neutral-500 block">{project.technologies}</span>}
          </span>
        </span>
      </Link>)}
    </div> : <p className="my-8 text-sm text-neutral-500 dark:text-neutral-400">Les projets publiés apparaîtront ici.</p>}
  </section>;
}
