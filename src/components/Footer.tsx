import Link from 'next/link';
import { globalConfig } from '@/config/global';

export default function Footer() {
  return <footer className="text-gray-700 bg-white border-t dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
    <div className="container flex flex-col items-center justify-center min-h-[48px] mx-auto px-7 max-w-7xl sm:flex-row">
      <Link href="/" className="h-5 text-base group relative z-30 flex items-center space-x-1.5 text-black dark:text-white font-semibold"><span className="text-xl -translate-y-0.5">✦</span><span>{globalConfig.site.author}</span></Link>
      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-100 sm:ml-4 sm:pl-4 sm:border-l sm:border-neutral-300 dark:sm:border-neutral-700 sm:mt-0">{globalConfig.footer.copyright}</p>
      <Link href="/admin" className="mt-2 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white sm:ml-auto sm:mt-0">Administration</Link>
    </div>
  </footer>;
}
