export const PORTFOLIO_STORAGE_BUCKET = 'portfolio-public-assets';

function cleanStorageSetting(value?: string) {
  return value?.replace(/(?:\\r\\n|\\n|\\r)+$/g, '').trim() || undefined;
}

export function objectStorageEndpoint() {
  return cleanStorageSetting(process.env.AWS_ENDPOINT_URL_S3)?.replace(/\/+$/, '');
}

export function objectStorageSigningRegion() {
  const configuredRegion = cleanStorageSetting(process.env.AWS_REGION) || 'eu-central-1';
  // Neon may expose its region as `aws-eu-central-1`; SigV4 expects the AWS region alone.
  return configuredRegion.replace(/^aws-/i, '');
}
