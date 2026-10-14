import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { AwsClient } from 'aws4fetch';
import { hasAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Vercel Functions cap incoming request bodies at 4.5 MB, including multipart overhead.
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const BUCKET = 'portfolio-public-assets';
const allowedTypes: Record<string, Set<string>> = {
  certificate: new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  cv: new Set(['application/pdf']),
  project: new Set(['image/jpeg', 'image/png', 'image/webp']),
  profile: new Set(['image/jpeg', 'image/png', 'image/webp']),
};

const extensions: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export async function POST(request: NextRequest) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file');
  const kind = formData.get('kind');
  if (!(file instanceof File) || typeof kind !== 'string' || !allowedTypes[kind]) {
    return NextResponse.json({ error: 'Fichier ou catégorie invalide.' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Le fichier doit peser 4 Mo maximum.' }, { status: 400 });
  }
  if (!allowedTypes[kind].has(file.type)) {
    return NextResponse.json({ error: 'Format accepté : PDF ou image selon la catégorie.' }, { status: 415 });
  }

  const fileName = `${kind}-${randomUUID()}${extensions[file.type]}`;

  if (process.env.AWS_ENDPOINT_URL_S3 && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const endpoint = process.env.AWS_ENDPOINT_URL_S3.replace(/\/$/, '');
    const client = new AwsClient({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      service: 's3',
      region: process.env.AWS_REGION || 'eu-central-1',
    });
    const upload = await client.fetch(`${endpoint}/${BUCKET}/${fileName}`, {
      method: 'PUT',
      body: new Uint8Array(await file.arrayBuffer()),
      headers: { 'content-type': file.type },
    });
    if (!upload.ok) return NextResponse.json({ error: 'Le stockage du fichier a échoué.' }, { status: 502 });
    return NextResponse.json({ url: `/uploads/${fileName}`, fileName: file.name });
  }

  if (process.env.VERCEL) {
    return NextResponse.json({ error: 'Le stockage Neon doit être configuré avant les téléversements.' }, { status: 503 });
  }

  const directory = path.join(process.cwd(), 'data', 'uploads');
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), Buffer.from(await file.arrayBuffer()), { flag: 'wx' });

  return NextResponse.json({ url: `/uploads/${fileName}`, fileName: file.name });
}
