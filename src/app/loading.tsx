export default function Loading() {
  return (
    <main className="portfolio-loading" role="status" aria-live="polite">
      <div className="portfolio-loading-mark" aria-hidden="true">
        <span className="portfolio-loading-layer portfolio-loading-layer-back">IN / 01</span>
        <span className="portfolio-loading-layer portfolio-loading-layer-mid">THE LIVING</span>
        <span className="portfolio-loading-core">✳</span>
      </div>
      <p>THE LIVING PORTFOLIO</p>
      <span className="portfolio-loading-caption">Préparation du parcours…</span>
      <span className="portfolio-loading-track" aria-hidden="true"><i /></span>
    </main>
  );
}
