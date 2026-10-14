import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { AwsClient } from 'aws4fetch';
import { hasAdminSession } from '@/lib/admin-auth';
import { objectStorageEndpoint, objectStorageSigningRegion, PORTFOLIO_STORAGE_BUCKET } from '@/lib/object-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Vercel Functions cap incoming request bodies at 4.5 MB, including multipart overhead.
const MAX_FILE_SIZE = 4 * 1024 * 1024;

const mimeByExtension: Record<string, { mime: string; extension: string }> = {
  pdf: { mime: 'application/pdf', extension: '.pdf' },
  jpg: { mime: 'image/jpeg', extension: '.jpg' },
  jpeg: { mime: 'image/jpeg', extension: '.jpg' },
  png: { mime: 'image/png', extension: '.png' },
  webp: { mime: 'image/webp', extension: '.webp' },
  doc: { mime: 'application/msword', extension: '.doc' },
  docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: '.docx' },
  odt: { mime: 'application/vnd.oasis.opendocument.text', extension: '.odt' },
};

const allowedTypes: Record<string, Set<string>> = {
  certificate: new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', mimeByExtension.docx.mime, mimeByExtension.odt.mime]),
  cv: new Set(['application/pdf', 'application/msword', mimeByExtension.docx.mime, mimeByExtension.odt.mime]),
  project: new Set(['image/jpeg', 'image/png', 'image/webp']),
  profile: new Set(['image/jpeg', 'image/png', 'image/webp']),
};

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: NextRequest) {
  if (!hasAdminSession(request)) return jsonError('Session expirée. Reconnecte-toi à l’administration.', 401);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError('Le fichier n’a pas pu être lu. Réessaie avec un fichier de moins de 4 Mo.', 400);
  }

  const file = formData.get('file');
  const kind = formData.get('kind');
  if (!(file instanceof File) || typeof kind !== 'string' || !allowedTypes[kind]) {
    return jsonError('Fichier ou catégorie invalide.', 400);
  }

  if (file.size === 0) return jsonError('Le fichier est vide.', 400);
  if (file.size > MAX_FILE_SIZE) return jsonError('Le fichier dépasse la limite de 4 Mo. Réduis sa taille puis réessaie.', 413);

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const fileType = mimeByExtension[extension];
  const providedType = file.type.toLowerCase();
  const mime = allowedTypes[kind].has(providedType)
    ? providedType
    : (!providedType || providedType === 'application/octet-stream' || providedType === 'application/x-pdf')
      ? fileType?.mime
      : undefined;

  if (!mime || !allowedTypes[kind].has(mime)) {
    return jsonError(kind === 'cv'
      ? 'Format accepté pour le CV : PDF, DOC, DOCX ou ODT.'
      : kind === 'certificate'
        ? 'Format accepté : PDF, DOC, DOCX, ODT ou image JPG, PNG, WebP.'
        : 'Format accepté : image JPG, PNG ou WebP.', 415);
  }

  const fileName = `${kind}-${randomUUID()}${fileType?.extension || Object.values(mimeByExtension).find((entry) => entry.mime === mime)?.extension}`;
  const content = new Uint8Array(await file.arrayBuffer());

  const missingStorageConfig = ['AWS_ENDPOINT_URL_S3', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']
    .filter((name) => !process.env[name]);
  if (missingStorageConfig.length === 0) {
    try {
      const endpoint = objectStorageEndpoint();
      if (!endpoint) return jsonError('Le stockage du site est incomplet (AWS_ENDPOINT_URL_S3). Contacte l’administrateur du site.', 503);
      const client = new AwsClient({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        service: 's3',
        region: objectStorageSigningRegion(),
      });
      const upload = await client.fetch(`${endpoint}/${PORTFOLIO_STORAGE_BUCKET}/${fileName}`, {
        method: 'PUT',
        body: content,
        headers: { 'content-type': mime },
      });

      if (!upload.ok) {
        const responseBody = await upload.text();
        const storageCode = responseBody.match(/<Code>([^<]+)<\/Code>/i)?.[1] || 'Code inconnu';
        const storageMessage = responseBody.match(/<Message>([^<]+)<\/Message>/i)?.[1] || '';
        console.error('Portfolio file upload rejected by storage', {
          status: upload.status,
          code: storageCode,
          message: storageMessage.slice(0, 220),
          region: objectStorageSigningRegion(),
          kind,
          size: file.size,
        });
        return jsonError(`Le stockage a refusé le fichier (HTTP ${upload.status}, ${storageCode}). Réessaie ; si le problème continue, contacte l’administrateur.`, 502);
      }

      return NextResponse.json({ url: `/uploads/${fileName}`, fileName: file.name });
    } catch (error) {
      console.error('Portfolio file upload could not reach storage', error instanceof Error ? error.message : 'Unknown storage error');
      return jsonError('Connexion au stockage impossible. Réessaie dans quelques instants.', 502);
    }
  }

  if (process.env.VERCEL) {
    console.error('Portfolio storage configuration is incomplete', { missing: missingStorageConfig });
    return jsonError(`Le stockage du site est incomplet (${missingStorageConfig.join(', ')}). Contacte l’administrateur du site.`, 503);
  }

  const directory = path.join(process.cwd(), 'data', 'uploads');
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), Buffer.from(content), { flag: 'wx' });

  return NextResponse.json({ url: `/uploads/${fileName}`, fileName: file.name });
}
