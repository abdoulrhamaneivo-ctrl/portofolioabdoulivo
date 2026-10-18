import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import type { CSSProperties } from 'react';

import { emptyPortfolio, portfolioAccents, type PortfolioAccent, type PortfolioCertificate, type PortfolioData, type PortfolioExperiment, type PortfolioGalleryItem, type PortfolioJourneyItem, type PortfolioProfile, type PortfolioProject, type PortfolioSettings, type PortfolioSkillGroup } from './portfolio-shared';
export { emptyPortfolio, portfolioAccents } from './portfolio-shared';
export type { PortfolioAccent, PortfolioCertificate, PortfolioData, PortfolioExperiment, PortfolioGalleryItem, PortfolioJourneyItem, PortfolioProfile, PortfolioProject, PortfolioSettings, PortfolioSkillGroup } from './portfolio-shared';

export function portfolioCssVariables(settings: PortfolioSettings): CSSProperties {
  return {
    '--portfolio-accent': portfolioAccents[settings.accent],
    '--portfolio-depth': String(settings.sceneDepth / 100),
    '--motion-speed': String(settings.motionSpeed),
  } as CSSProperties;
}

const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  return neon(connectionString);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, maxLength = 8000) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function textFields<T extends object>(value: unknown, fields: Partial<Record<keyof T, number>>): T {
  const source = isRecord(value) ? value : {};
  return Object.fromEntries(Object.entries(fields).map(([key, maxLength]) => [key, stringValue(source[key], typeof maxLength === 'number' ? maxLength : undefined)])) as T;
}

function booleanValue(value: unknown) {
  return value === true;
}

function listOf<T>(value: unknown, mapper: (item: unknown) => T): T[] {
  return Array.isArray(value) ? value.slice(0, 500).filter(isRecord).map(mapper) : [];
}

export function normalizePortfolioData(value: unknown): PortfolioData {
  const saved = isRecord(value) ? value : {};
  const profile = textFields<PortfolioProfile>(saved.profile, {
    fullName: 160, portraitUrl: 2000, title: 240, introduction: 5000, about: 8000,
    email: 254, linkedin: 2000, github: 2000,
  });
  const settingsSource = isRecord(saved.settings) ? saved.settings : {};
  const accent = ['lime', 'mint', 'blue', 'coral'].includes(String(settingsSource.accent))
    ? settingsSource.accent as PortfolioAccent
    : emptyPortfolio.settings.accent;
  const depth = Number(settingsSource.sceneDepth);
  const motionSpeed = Number(settingsSource.motionSpeed);

  return {
    profile: { ...emptyPortfolio.profile, ...profile },
    journey: listOf(saved.journey, (item) => {
      const result = textFields<PortfolioJourneyItem>(item, { id: 100, category: 40, period: 80, title: 240, organization: 240, description: 5000 });
      return { ...result, category: ['Formation', 'Expérience', 'Contribution'].includes(result.category) ? result.category as PortfolioJourneyItem['category'] : 'Formation', published: booleanValue((item as Record<string, unknown>).published) };
    }),
    projects: listOf(saved.projects, (item) => ({
      ...textFields<PortfolioProject>(item, { id: 100, title: 240, summary: 4000, problem: 8000, contribution: 8000, solution: 8000, technologies: 2000, proofUrl: 2000, link: 2000, imageUrl: 2000, videoUrl: 2000 }),
      published: booleanValue((item as Record<string, unknown>).published),
      featured: booleanValue((item as Record<string, unknown>).featured),
    })),
    certificates: listOf(saved.certificates, (item) => ({
      ...textFields<PortfolioCertificate>(item, { id: 100, title: 240, issuer: 240, date: 40, domain: 120, level: 120, type: 120, skills: 4000, verificationUrl: 2000, fileUrl: 2000 }),
      published: booleanValue((item as Record<string, unknown>).published),
      featured: booleanValue((item as Record<string, unknown>).featured),
    })),
    skillGroups: Array.isArray(saved.skillGroups) ? listOf<PortfolioSkillGroup>(saved.skillGroups, (item) => ({
      ...textFields<PortfolioSkillGroup>(item, { id: 100, title: 120, items: 3000, level: 100, summary: 2000 }),
      published: booleanValue((item as Record<string, unknown>).published),
    })) : emptyPortfolio.skillGroups,
    experiments: listOf(saved.experiments, (item) => ({
      ...textFields<PortfolioExperiment>(item, { id: 100, title: 240, category: 120, description: 5000, technologies: 2000, status: 80 }),
      published: booleanValue((item as Record<string, unknown>).published),
    })),
    gallery: listOf(saved.gallery, (item) => ({
      ...textFields<PortfolioGalleryItem>(item, { id: 100, imageUrl: 2000, caption: 300, occasion: 160, date: 40 }),
      published: booleanValue((item as Record<string, unknown>).published),
    })),
    settings: {
      accent,
      sceneDepth: Number.isFinite(depth) ? Math.max(0, Math.min(100, depth)) : emptyPortfolio.settings.sceneDepth,
      motionSpeed: Number.isFinite(motionSpeed) ? Math.max(0.65, Math.min(1.35, motionSpeed)) : emptyPortfolio.settings.motionSpeed,
    },
    cv: { ...emptyPortfolio.cv, ...textFields<PortfolioData['cv']>(saved.cv, { fileUrl: 2000, fileName: 240, updatedAt: 100 }) },
  };
}

export async function readPortfolio(): Promise<PortfolioData> {
  const sql = database();
  if (sql) {
    const rows = await sql`SELECT data FROM portfolio_content WHERE id = 1`;
    return normalizePortfolioData(rows[0]?.data);
  }

  if (process.env.VERCEL) throw new Error('DATABASE_URL doit être configuré pour utiliser le portfolio sur Vercel.');
  try {
    const raw = await readFile(dataPath, 'utf8');
    return normalizePortfolioData(JSON.parse(raw));
  } catch {
    return emptyPortfolio;
  }
}

export async function writePortfolio(data: PortfolioData): Promise<void> {
  const normalized = normalizePortfolioData(data);
  const sql = database();
  if (sql) {
    const serialized = JSON.stringify(normalized);
    await sql`INSERT INTO portfolio_content (id, data) VALUES (1, ${serialized}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`;
    return;
  }

  if (process.env.VERCEL) throw new Error('DATABASE_URL doit être configuré pour enregistrer le portfolio sur Vercel.');
  await mkdir(path.dirname(dataPath), { recursive: true });
  const temporaryPath = `${dataPath}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(normalized, null, 2), 'utf8');
  await rename(temporaryPath, dataPath);
}
