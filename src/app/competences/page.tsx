import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CompetencesContent from '@/components/CompetencesContent';
import { portfolioCssVariables, readPortfolio } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function CompetencesPage() {
  const data = await readPortfolio();
  return <main className="min-h-screen flex flex-col" style={portfolioCssVariables(data.settings)}><div className="relative flex-grow"><Navbar /><div className="portfolio-page"><CompetencesContent projects={data.projects.filter((item) => item.published)} certificates={data.certificates.filter((item) => item.published)} journey={data.journey.filter((item) => item.published)} /></div></div><Footer /></main>;
}
