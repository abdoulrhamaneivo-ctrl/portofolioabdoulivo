import { NextRequest, NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/admin-auth';
import { normalizePortfolioData, readPortfolio, writePortfolio } from '@/lib/portfolio';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  return NextResponse.json(await readPortfolio());
}

export async function PUT(request: NextRequest) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Contenu invalide.' }, { status: 400 });
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return NextResponse.json({ error: 'Les données du portfolio sont incomplètes.' }, { status: 400 });
  }

  const submitted = data as Record<string, unknown>;
  if (!submitted.profile || !Array.isArray(submitted.projects) || !Array.isArray(submitted.certificates) || !submitted.cv) {
    return NextResponse.json({ error: 'Les données du portfolio sont incomplètes.' }, { status: 400 });
  }

  const normalized = normalizePortfolioData(submitted);
  await writePortfolio(normalized);
  return NextResponse.json({ saved: true });
}
