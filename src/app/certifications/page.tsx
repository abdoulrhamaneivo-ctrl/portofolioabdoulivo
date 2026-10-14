import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CertificationsContent from '@/components/CertificationsContent';
import { readPortfolio } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function CertificationsPage() {
  const data = await readPortfolio();
  return <main className="min-h-screen flex flex-col"><div className="relative flex-grow"><Navbar /><CertificationsContent certificates={data.certificates.filter((certificate) => certificate.published)} /></div><Footer /></main>;
}
