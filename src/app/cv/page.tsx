import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { readPortfolio } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function CvPage() {
  const { cv, profile } = await readPortfolio();
  return <main className="min-h-screen flex flex-col"><div className="relative flex-grow"><Navbar /><section className="relative z-20 max-w-4xl mx-auto mt-32 mb-12 px-7 lg:px-0">
    <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl lg:text-4xl">Mon CV</h2>
    <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:leading-7 lg:leading-8 sm:text-base lg:text-lg">{profile.fullName ? `Curriculum vitæ de ${profile.fullName}.` : 'Consulter et télécharger mon curriculum vitæ.'}</p>
    {cv.fileUrl ? <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3"><span className="text-sm text-neutral-600 dark:text-neutral-400">{cv.fileName || 'CV.pdf'}</span><a href={cv.fileUrl} download={cv.fileName || 'CV.pdf'} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 dark:bg-white dark:text-neutral-900">Télécharger le CV</a></div>
      <div className="overflow-hidden border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-100 dark:bg-neutral-900"><iframe src={`${cv.fileUrl}#view=FitH`} title={`CV de ${profile.fullName || 'la personne'}`} className="w-full h-[78vh] min-h-[500px]" /></div>
    </div> : <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">Le CV sera disponible ici après son ajout dans l’administration.</p>}
    <Link href="/about" className="mt-6 inline-block text-sm text-indigo-600 dark:text-indigo-400 underline">Retour à la page À propos</Link>
  </section></div><Footer /></main>;
}
