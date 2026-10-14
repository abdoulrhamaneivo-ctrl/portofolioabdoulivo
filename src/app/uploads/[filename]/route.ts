import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

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
};

const inlineExtensions = new Set(['pdf', 'jpg', 'png', 'webp']);

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^(certificate|cv|project|profile)-[0-9a-f-]+\.(pdf|jpg|png|webp|doc|docx|odt)$/.test(filename)) {
    return new NextResponse('Fichier introuvable.', { status: 404 });
  }

  if (process.env.AWS_ENDPOINT_URL_S3) {
    const endpoint = process.env.AWS_ENDPOINT_URL_S3.replace(/\/$/, '');
    return NextResponse.redirect(`${endpoint}/portfolio-public-assets/${filename}`, 307);
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
