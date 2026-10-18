import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { objectStorageEndpoint, PORTFOLIO_STORAGE_BUCKET } from '@/lib/object-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const contentTypes: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
  mp4: 'video/mp4',
  webm: 'video/webm',
};

const inlineExtensions = new Set(['pdf', 'jpg', 'png', 'webp', 'mp4', 'webm']);

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^(certificate|cv|project|profile|gallery)-[0-9a-f-]+\.(pdf|jpg|png|webp|doc|docx|odt|mp4|webm)$/.test(filename)) {
    return new NextResponse('Fichier introuvable.', { status: 404 });
  }

  const endpoint = objectStorageEndpoint();
  if (endpoint) {
    return NextResponse.redirect(`${endpoint}/${PORTFOLIO_STORAGE_BUCKET}/${filename}`, 307);
  }

  const extension = filename.split('.').pop() || '';
  try {
    const content = await readFile(path.join(process.cwd(), 'data', 'uploads', filename));
    return new NextResponse(new Uint8Array(content), {
      headers: {
        'Content-Type': contentTypes[extension] || 'application/octet-stream',
        'Content-Disposition': `${inlineExtensions.has(extension) ? 'inline' : 'attachment'}; filename="${filename}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    });
  } catch {
    return new NextResponse('Fichier introuvable.', { status: 404 });
  }
}
