import Link from 'next/link';
import { globalConfig } from '@/config/global';

export default function Footer() {
  return <footer className="portfolio-footer">
    <div className="portfolio-footer-inner">
      <Link href="/" className="portfolio-footer-brand"><span aria-hidden="true">✳</span>THE LIVING PORTFOLIO</Link>
      <p>{globalConfig.footer.copyright}</p>
      <Link href="/admin" className="portfolio-footer-admin">Administration <span aria-hidden="true">↗</span></Link>
    </div>
  </footer>;
}
