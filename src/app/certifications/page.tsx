import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CertificationsContent from '@/components/CertificationsContent';
import { portfolioCssVariables, readPortfolio } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function CertificationsPage() {
  const data = await readPortfolio();
  return <main className="min-h-screen flex flex-col" style={portfolioCssVariables(data.settings, data)}><div className="relative flex-grow"><Navbar /><div className="portfolio-page"><CertificationsContent certificates={data.certificates.filter((certificate) => certificate.published)} /></div></div><Footer /></main>;
}
