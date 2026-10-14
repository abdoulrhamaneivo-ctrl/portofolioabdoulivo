import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export const ADMIN_COOKIE = 'portfolio_admin';
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 14;

export function adminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

export function adminEmail(): string | undefined {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase();
}

function sign(value: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) return '';
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function createAdminSession(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_AGE_SECONDS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

export function hasAdminSession(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token || !adminPassword()) return false;
  const [expiresAt, signature, extra] = token.split('.');
  if (!expiresAt || !signature || extra || Number(expiresAt) <= Date.now() / 1000) return false;
  const expected = sign(expiresAt);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_AGE_SECONDS,
  };
}
