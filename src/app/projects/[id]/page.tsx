import { notFound } from 'next/navigation';
import ProjectDetailContent from '@/components/ProjectDetailContent';
import { portfolioCssVariables, readPortfolio } from '@/lib/portfolio';
import { safeExternalUrl } from '@/lib/urls';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readPortfolio();
  const project = data.projects.find((item) => item.id === id && item.published);
  if (!project) notFound();

  return <ProjectDetailContent
    project={project}
    style={portfolioCssVariables(data.settings, data)}
    proofUrl={safeExternalUrl(project.proofUrl) || ''}
    projectUrl={safeExternalUrl(project.link) || ''}
  />;
}
