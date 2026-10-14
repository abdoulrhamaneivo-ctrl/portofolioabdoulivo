import Image from 'next/image';
import Link from 'next/link';
import type { PortfolioData } from '@/lib/portfolio';
import { safeExternalUrl } from '@/lib/urls';

function splitValues(value: string) {
  return Array.from(new Set(value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean)));
}

export default function AboutContent({ data }: { data: PortfolioData }) {
  const skills = Array.from(new Set([
    ...data.projects.filter((project) => project.published).flatMap((project) => splitValues(project.technologies)),
    ...data.certificates.filter((certificate) => certificate.published).flatMap((certificate) => splitValues(certificate.skills)),
  ]));

  return <section className="relative z-20 max-w-4xl mx-auto mt-32 mb-12 px-7 lg:px-0">
    <div className="relative z-20 w-full mx-auto lg:mx-0">
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl lg:text-4xl">{data.profile.fullName ? `À propos de ${data.profile.fullName}` : 'À propos'}</h2>
      {data.profile.title && <p className="mt-3 text-base font-medium text-neutral-700 dark:text-neutral-300">{data.profile.title}</p>}
      <div className="flex flex-col md:flex-row gap-8 mt-3 sm:mt-4 lg:mt-6">
        <div className="w-full md:w-1/2 flex flex-col">
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:leading-7 lg:leading-8 sm:text-base lg:text-lg whitespace-pre-line">
            {data.profile.about || data.profile.introduction || 'Ma présentation sera bientôt disponible.'}
          </p>
          {skills.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="px-3 py-1 text-sm bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full">{skill}</span>)}</div>}
          {data.profile.email && <a href={`mailto:${data.profile.email}`} className="mt-5 text-sm text-indigo-600 dark:text-indigo-400 underline">Me contacter par e-mail</a>}
          <div className="mt-4 flex gap-4 text-sm text-indigo-600 dark:text-indigo-400">{safeExternalUrl(data.profile.linkedin) && <a href={safeExternalUrl(data.profile.linkedin)} target="_blank" rel="noreferrer">LinkedIn ↗</a>}{safeExternalUrl(data.profile.github) && <a href={safeExternalUrl(data.profile.github)} target="_blank" rel="noreferrer">GitHub ↗</a>}</div>
        </div>
        <div className="w-full md:w-1/2 flex justify-end">
          <div className="relative w-full max-w-[360px] h-[300px] md:h-[360px]">
            <Image src="/assets/images/about/coder.jpg" alt="Illustration du travail numérique" fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover rounded-xl" priority />
          </div>
        </div>
      </div>
    </div>
    <div className="flex flex-col md:flex-row gap-8 mt-16">
      <div className="flex-1"><h2 className="mb-4 text-2xl font-bold dark:text-neutral-200">Parcours et réalisations</h2><p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">Les projets et les certificats publiés présentent les étapes et les apprentissages de mon parcours.</p><div className="mt-5 flex flex-wrap gap-4 text-sm"><Link className="text-indigo-600 dark:text-indigo-400 underline" href="/projects">Voir les projets</Link><Link className="text-indigo-600 dark:text-indigo-400 underline" href="/certifications">Consulter les certificats</Link><Link className="text-indigo-600 dark:text-indigo-400 underline" href="/cv">Voir mon CV</Link></div></div>
      <div className="w-full md:w-[320px] md:ml-8"><h2 className="mb-2 text-2xl font-bold dark:text-neutral-200">Restons en contact</h2><p className="text-sm leading-6 text-gray-600 dark:text-neutral-400 sm:leading-7 lg:leading-8">Pour échanger au sujet d’un projet, d’une collaboration ou d’une opportunité professionnelle.</p>{data.profile.email && <a href={`mailto:${data.profile.email}`} className="mt-3 inline-block text-indigo-600 dark:text-indigo-400 underline">{data.profile.email}</a>}</div>
    </div>
  </section>;
}
