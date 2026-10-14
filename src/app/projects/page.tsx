import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectsContent from '@/components/ProjectsContent';
import { readPortfolio } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function Projects() {
  const data = await readPortfolio();
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <ProjectsContent projects={data.projects.filter((project) => project.published)} />
      <Footer />
    </main>
  );
}
