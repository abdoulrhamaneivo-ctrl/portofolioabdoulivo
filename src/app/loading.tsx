export default function Loading() {
  return (
    <main className="portfolio-loading" role="status" aria-live="polite">
      <div className="portfolio-loading-mark" aria-hidden="true">
        <span className="portfolio-loading-orbit portfolio-loading-orbit-one" />
        <span className="portfolio-loading-orbit portfolio-loading-orbit-two" />
        <span className="portfolio-loading-core">✳</span>
      </div>
      <p>THE LIVING PORTFOLIO</p>
      <span className="portfolio-loading-caption">Préparation du parcours…</span>
      <span className="portfolio-loading-track" aria-hidden="true"><i /></span>
    </main>
  );
}
