import { NextRequest, NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/admin-auth';
import { readPortfolio, writePortfolio, type PortfolioData } from '@/lib/portfolio';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  return NextResponse.json(await readPortfolio());
}

export async function PUT(request: NextRequest) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  let data: PortfolioData;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Contenu invalide.' }, { status: 400 });
  }

  if (!data || typeof data !== 'object' || !data.profile || !Array.isArray(data.projects) || !Array.isArray(data.certificates) || !data.cv) {
    return NextResponse.json({ error: 'Les données du portfolio sont incomplètes.' }, { status: 400 });
  }

  await writePortfolio(data);
  return NextResponse.json({ saved: true });
}
