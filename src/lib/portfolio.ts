import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

export type PortfolioProfile = {
  fullName: string;
  portraitUrl: string;
  title: string;
  introduction: string;
  about: string;
  email: string;
  linkedin: string;
  github: string;
};

export type PortfolioProject = {
  id: string;
  title: string;
  summary: string;
  problem: string;
  contribution: string;
  solution: string;
  technologies: string;
  proofUrl: string;
  link: string;
  imageUrl: string;
  published: boolean;
  featured: boolean;
};

export type PortfolioJourneyItem = {
  id: string;
  category: 'Formation' | 'Expérience' | 'Contribution';
  period: string;
  title: string;
  organization: string;
  description: string;
  published: boolean;
};

export type PortfolioCertificate = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  domain: string;
  level: string;
  type: string;
  skills: string;
  verificationUrl: string;
  fileUrl: string;
  published: boolean;
  featured: boolean;
};

export type PortfolioData = {
  profile: PortfolioProfile;
  journey: PortfolioJourneyItem[];
  projects: PortfolioProject[];
  certificates: PortfolioCertificate[];
  cv: { fileUrl: string; fileName: string; updatedAt: string };
};

export const emptyPortfolio: PortfolioData = {
  profile: {
    fullName: '',
    portraitUrl: '',
    title: '',
    introduction: '',
    about: '',
    email: '',
    linkedin: '',
    github: '',
  },
  journey: [],
  projects: [],
  certificates: [],
  cv: { fileUrl: '', fileName: '', updatedAt: '' },
};

const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  return neon(connectionString);
}

export async function readPortfolio(): Promise<PortfolioData> {
  const sql = database();
  if (sql) {
    const rows = await sql`SELECT data FROM portfolio_content WHERE id = 1`;
    const saved = rows[0]?.data as Partial<PortfolioData> | undefined;
    if (!saved) return emptyPortfolio;
    return {
      ...emptyPortfolio,
      ...saved,
      profile: { ...emptyPortfolio.profile, ...saved.profile },
      cv: { ...emptyPortfolio.cv, ...saved.cv },
      journey: Array.isArray(saved.journey) ? saved.journey : [],
      projects: Array.isArray(saved.projects) ? saved.projects : [],
      certificates: Array.isArray(saved.certificates) ? saved.certificates : [],
    };
  }

  if (process.env.VERCEL) throw new Error('DATABASE_URL doit être configuré pour utiliser le portfolio sur Vercel.');
  try {
    const raw = await readFile(dataPath, 'utf8');
    const saved = JSON.parse(raw) as Partial<PortfolioData>;
    return {
      ...emptyPortfolio,
      ...saved,
      profile: { ...emptyPortfolio.profile, ...saved.profile },
      cv: { ...emptyPortfolio.cv, ...saved.cv },
      journey: Array.isArray(saved.journey) ? saved.journey : [],
      projects: Array.isArray(saved.projects) ? saved.projects : [],
      certificates: Array.isArray(saved.certificates) ? saved.certificates : [],
    };
  } catch {
    return emptyPortfolio;
  }
}

export async function writePortfolio(data: PortfolioData): Promise<void> {
  const sql = database();
  if (sql) {
    const serialized = JSON.stringify(data);
    await sql`INSERT INTO portfolio_content (id, data) VALUES (1, ${serialized}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`;
    return;
  }

  if (process.env.VERCEL) throw new Error('DATABASE_URL doit être configuré pour enregistrer le portfolio sur Vercel.');
  await mkdir(path.dirname(dataPath), { recursive: true });
  const temporaryPath = `${dataPath}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(data, null, 2), 'utf8');
  await rename(temporaryPath, dataPath);
}
