import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExperimentsContent from '@/components/ExperimentsContent';
import { portfolioCssVariables, readPortfolio } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function ExperimentsPage() {
  const data = await readPortfolio();
  const experiments = data.experiments.filter((experiment) => experiment.published);

  return <main className="min-h-screen flex flex-col" style={portfolioCssVariables(data.settings, data)}>
    <div className="relative flex-grow"><Navbar /><div className="portfolio-page"><ExperimentsContent experiments={experiments} /></div></div>
    <Footer />
  </main>;
}
