import type { ReactNode } from 'react';
import ScrollMotionRuntime from '@/components/ScrollMotionRuntime';

export default function PortfolioTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="portfolio-route-transition">
      <ScrollMotionRuntime />
      <div className="portfolio-route-content">{children}</div>
      <div className="portfolio-route-curtain" aria-hidden="true">
        <span className="portfolio-route-curtain-top" />
        <span className="portfolio-route-curtain-bottom" />
        <span className="portfolio-route-curtain-title">THE LIVING PORTFOLIO<i>✳</i></span>
      </div>
    </div>
  );
}
