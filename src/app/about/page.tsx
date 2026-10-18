import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutContent from "@/components/AboutContent";
import { portfolioCssVariables, readPortfolio } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function About() {
  const data = await readPortfolio();
  return (
    <main className="min-h-screen flex flex-col" style={portfolioCssVariables(data.settings, data)}>
      <div className="relative flex-grow flex flex-col">
        <Navbar />
        <div className="portfolio-page"><AboutContent data={data} /></div>
      </div>
      <Footer />
    </main>
  );
} 
