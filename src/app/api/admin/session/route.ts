import { NextRequest, NextResponse } from 'next/server';
import { hasAdminSession, adminPassword } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  return NextResponse.json({ configured: Boolean(adminPassword()), authenticated: hasAdminSession(request) });
}
