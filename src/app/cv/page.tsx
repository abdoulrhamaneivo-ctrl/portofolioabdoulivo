import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { portfolioCssVariables, readPortfolio } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function CvPage() {
  const data = await readPortfolio();
  const { cv, profile } = data;
  const canPreviewCv = /\.pdf$/i.test(cv.fileName || cv.fileUrl.split(/[?#]/)[0]);
  return <main className="min-h-screen flex flex-col" style={portfolioCssVariables(data.settings)}><div className="relative flex-grow"><Navbar /><section className="portfolio-cv-page">
    <header className="portfolio-page-heading"><p className="portfolio-page-kicker"><span /> DOCUMENT PROFESSIONNEL / 01</p><h1>Le parcours,<br /><em>en un document.</em></h1><p className="portfolio-page-lead">{profile.fullName ? `Curriculum vitæ de ${profile.fullName}.` : 'Consulter et télécharger mon curriculum vitæ.'} La version publiée est consultable directement ici.</p></header>
    {cv.fileUrl ? <div className="portfolio-cv-document">
      <div className="portfolio-cv-filebar"><div><span className="portfolio-cv-fileicon">PDF</span><div><strong>{cv.fileName || 'CV.pdf'}</strong><span>{cv.updatedAt ? `Mis à jour le ${cv.updatedAt}` : 'Document consultable'}</span></div></div><a href={cv.fileUrl} download={cv.fileName || 'CV.pdf'}>Télécharger le CV <span aria-hidden="true">↓</span></a></div>
      {canPreviewCv ? <div className="portfolio-cv-viewer"><iframe src={`${cv.fileUrl}#view=FitH`} title={`CV de ${profile.fullName || 'la personne'}`} /></div> : <div className="portfolio-cv-format-note"><span aria-hidden="true">↗</span><div><strong>Le fichier est prêt à être consulté.</strong><p>Ce format ne peut pas être affiché directement dans la page. Télécharge-le pour l’ouvrir.</p><a href={cv.fileUrl} target="_blank" rel="noreferrer">Ouvrir le document <span aria-hidden="true">↗</span></a></div></div>}
    </div> : <div className="portfolio-empty-state"><span aria-hidden="true">▤</span><div><p className="portfolio-about-eyebrow">DOCUMENT À AJOUTER</p><h2>Le CV sera consultable depuis cette page.</h2><p>Ajoute le fichier dans l’administration pour permettre sa consultation et son téléchargement.</p><Link href="/admin">Ouvrir l’administration <span aria-hidden="true">↗</span></Link></div></div>}
    <Link href="/about" className="portfolio-cv-back">Retour au parcours <span aria-hidden="true">⟶</span></Link>
  </section></div><Footer /></main>;
}
