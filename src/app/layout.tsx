import './globals.css'
import type { Metadata } from 'next'
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import ThemeProvider from '@/components/ThemeProvider'
import { readPortfolio } from '@/lib/portfolio'

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const jetBrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await readPortfolio();
  const brand = profile.fullName || 'The Living Portfolio';
  return {
    title: `${brand} — Portfolio numérique`,
    description: profile.introduction || 'Projets, parcours, expérimentations et apprentissages documentés.',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${hanken.variable} ${bricolage.variable} ${jetBrains.variable}`}>
        <ThemeProvider>
          <div className="relative min-h-screen">
            <div className="relative z-10 flex min-h-screen flex-col">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
} 
