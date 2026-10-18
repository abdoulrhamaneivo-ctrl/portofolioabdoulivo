import Image from 'next/image';
import Link from 'next/link';
import type { PortfolioData } from '@/lib/portfolio';
import { safeExternalUrl } from '@/lib/urls';

function splitValues(value: string) {
  return Array.from(new Set(value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean)));
}

export default function AboutContent({ data }: { data: PortfolioData }) {
  const name = data.profile.fullName.trim();
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const skills = Array.from(new Set([
    ...data.projects.filter((project) => project.published).flatMap((project) => splitValues(project.technologies)),
    ...data.certificates.filter((certificate) => certificate.published).flatMap((certificate) => splitValues(certificate.skills)),
  ]));
  const journey = data.journey.filter((item) => item.published).sort((a, b) => {
    const year = (period: string) => Number(period.match(/\b(?:19|20)\d{2}\b/)?.[0] || 0);
    return year(b.period) - year(a.period);
  });
  const linkedin = safeExternalUrl(data.profile.linkedin);
  const github = safeExternalUrl(data.profile.github);

  return <section className="portfolio-about-page">
    <header className="portfolio-page-heading">
      <p className="portfolio-page-kicker"><span /> LE RÉCIT / 01</p>
      <h1>{name ? `À propos de ${name}` : 'Un parcours, une façon de voir.'}</h1>
      {data.profile.title && <p className="portfolio-page-lead">{data.profile.title}</p>}
    </header>

    <div className="portfolio-about-grid">
      <section className="portfolio-about-story">
        <p className="portfolio-about-eyebrow">DERRIÈRE LES PROJETS</p>
        <h2>{data.profile.about ? 'Ce qui me met en mouvement.' : 'Chaque parcours commence par une curiosité.'}</h2>
        <p className="portfolio-about-copy">{data.profile.about || data.profile.introduction || 'Cette page raconte le parcours, les objectifs et les sujets qui comptent. Complète le profil depuis l’administration pour présenter ton histoire avec tes propres mots.'}</p>
        {skills.length > 0 && <div className="portfolio-about-skills" aria-label="Compétences reliées aux projets et certificats">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>}
        <div className="portfolio-about-links">
          <Link href="/projects">Voir les projets <span aria-hidden="true">↗</span></Link>
          <Link href="/certifications">Parcourir les preuves <span aria-hidden="true">↗</span></Link>
          <Link href="/cv">Consulter le CV <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <aside className="portfolio-about-card">
        <div className="portfolio-about-avatar">
          {data.profile.portraitUrl ? <Image src={data.profile.portraitUrl} alt={name ? `Portrait de ${name}` : 'Portrait du profil'} fill sizes="120px" unoptimized /> : <span>{initials || '✳'}</span>}
        </div>
        <p>IDENTITÉ NUMÉRIQUE / 01</p>
        <h2>{name || 'Profil personnel'}</h2>
        <span>{data.profile.title || 'Parcours numérique en construction'}</span>
        <div className="portfolio-about-statline"><span><strong>{data.projects.filter((item) => item.published).length.toString().padStart(2, '0')}</strong> PROJETS</span><span><strong>{data.certificates.filter((item) => item.published).length.toString().padStart(2, '0')}</strong> PREUVES</span></div>
      </aside>
    </div>

    <section className="portfolio-about-timeline" id="parcours">
      <header><p className="portfolio-about-eyebrow">02 / LES ÉTAPES</p><h2>Apprendre, contribuer, avancer.</h2><p>Une chronologie nourrie par les expériences et formations publiées dans l’administration.</p></header>
      {journey.length ? <ol>{journey.map((item, index) => <li key={item.id} className="portfolio-timeline-entry">
        <span className="portfolio-timeline-index">{String(index + 1).padStart(2, '0')}</span>
        <div><p className="portfolio-timeline-meta"><span>{item.category}</span>{item.period && <span>{item.period}</span>}</p><h3>{item.title}</h3>{item.organization && <p className="portfolio-timeline-org">{item.organization}</p>}{item.description && <p className="portfolio-timeline-copy">{item.description}</p>}</div>
      </li>)}</ol> : <div className="portfolio-timeline-empty"><span>01</span><p>Les étapes du parcours apparaîtront ici après leur publication dans l’administration.</p></div>}
    </section>

    <section className="portfolio-about-contact">
      <div><p className="portfolio-about-eyebrow">03 / RESTONS EN CONTACT</p><h2>La suite se construit dans l’échange.</h2><p>Pour parler d’un projet, d’une collaboration ou d’une opportunité professionnelle.</p></div>
      <div className="portfolio-about-contact-links">
        {data.profile.email && <a href={`mailto:${data.profile.email}`}><span>E-MAIL</span><strong>{data.profile.email}</strong><i aria-hidden="true">↗</i></a>}
        {linkedin && <a href={linkedin} target="_blank" rel="noreferrer"><span>LINKEDIN</span><strong>Échanger sur mon parcours</strong><i aria-hidden="true">↗</i></a>}
        {github && <a href={github} target="_blank" rel="noreferrer"><span>GITHUB</span><strong>Voir les réalisations</strong><i aria-hidden="true">↗</i></a>}
        {!data.profile.email && !linkedin && !github && <Link href="/admin">Ajouter les coordonnées depuis l’administration <span aria-hidden="true">↗</span></Link>}
      </div>
    </section>
  </section>;
}
