import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CompetencesContent from '@/components/CompetencesContent';
import { readPortfolio } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function CompetencesPage() {
  const data = await readPortfolio();
  return <main className="min-h-screen flex flex-col"><div className="relative flex-grow"><Navbar /><CompetencesContent projects={data.projects.filter((item) => item.published)} certificates={data.certificates.filter((item) => item.published)} /></div><Footer /></main>;
}
