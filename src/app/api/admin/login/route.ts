import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { adminCookieOptions, adminEmail, adminPassword, createAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const configuredPassword = adminPassword();
  if (!configuredPassword) {
    return NextResponse.json({ error: 'Configure ADMIN_PASSWORD dans .env.local pour activer l’administration.' }, { status: 503 });
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const configuredEmail = adminEmail();
  const providedEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const expectedEmail = Buffer.from(configuredEmail || '');
  const emailBuffer = Buffer.from(providedEmail);
  const provided = typeof body.password === 'string' ? Buffer.from(body.password) : Buffer.alloc(0);
  const expected = Buffer.from(configuredPassword);
  const emailMatches = !configuredEmail || (emailBuffer.length === expectedEmail.length && timingSafeEqual(emailBuffer, expectedEmail));
  if (!emailMatches || provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Adresse e-mail ou mot de passe incorrect.' }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set('portfolio_admin', createAdminSession(), adminCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set('portfolio_admin', '', { ...adminCookieOptions(), maxAge: 0 });
  return response;
}
