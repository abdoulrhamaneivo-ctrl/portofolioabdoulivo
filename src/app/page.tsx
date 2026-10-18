import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeContent from '@/components/HomeContent';
import { portfolioCssVariables, readPortfolio } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await readPortfolio();
  return (
    <main className="min-h-screen flex flex-col" style={portfolioCssVariables(data.settings, data)}>
      <Navbar />
      <HomeContent data={data} />
      <Footer />
    </main>
  );
} 
