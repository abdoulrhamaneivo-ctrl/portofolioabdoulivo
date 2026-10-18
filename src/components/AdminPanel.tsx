'use client';

import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import {
  ArrowUpRight,
  Award,
  Braces,
  Briefcase,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  FlaskConical,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  LogOut,
  Palette,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Upload,
  UserRound,
  Video,
  X,
} from 'lucide-react';
import { portfolioAccents, type PortfolioAccent, type PortfolioCertificate, type PortfolioData, type PortfolioExperiment, type PortfolioJourneyItem, type PortfolioProject } from '@/lib/portfolio-shared';
import ProjectMediaFrame from '@/components/ProjectMediaFrame';

type Section = 'overview' | 'profile' | 'skills' | 'journey' | 'projects' | 'certificates' | 'experiments' | 'cv' | 'studio';
type Session = { configured: boolean; authenticated: boolean };

const emptyProject = (): PortfolioProject => ({
  id: crypto.randomUUID(), title: '', summary: '', problem: '', contribution: '', solution: '',
  technologies: '', proofUrl: '', link: '', imageUrl: '', videoUrl: '', published: false, featured: false,
});

const emptyCertificate = (): PortfolioCertificate => ({
  id: crypto.randomUUID(), title: '', issuer: '', date: '', domain: '', level: '', type: '',
  skills: '', verificationUrl: '', fileUrl: '', published: false, featured: false,
});

const emptyJourneyItem = (): PortfolioJourneyItem => ({
  id: crypto.randomUUID(), category: 'Formation', period: '', title: '', organization: '', description: '', published: false,
});

const emptyExperiment = (): PortfolioExperiment => ({
  id: crypto.randomUUID(), title: '', category: 'Prototype', description: '', technologies: '', status: 'En cours', published: false,
});

const sections: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: 'profile', label: 'Profil', icon: UserRound },
  { id: 'skills', label: 'Compétences', icon: Braces },
  { id: 'journey', label: 'Parcours', icon: Briefcase },
  { id: 'projects', label: 'Projets', icon: FolderKanban },
  { id: 'certificates', label: 'Certificats', icon: Award },
  { id: 'experiments', label: 'Laboratoire', icon: FlaskConical },
  { id: 'cv', label: 'CV', icon: FileText },
  { id: 'studio', label: 'Identité visuelle', icon: Palette },
];

export default function AdminPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [section, setSection] = useState<Section>('overview');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [bulkProgress, setBulkProgress] = useState('');
  const [projectDraft, setProjectDraft] = useState<PortfolioProject | null>(null);
  const [certificateDraft, setCertificateDraft] = useState<PortfolioCertificate | null>(null);
  const [journeyDraft, setJourneyDraft] = useState<PortfolioJourneyItem | null>(null);
  const [experimentDraft, setExperimentDraft] = useState<PortfolioExperiment | null>(null);

  useEffect(() => {
    void checkSession();
  }, []);

  async function checkSession() {
    try {
      const response = await fetch('/api/admin/session', { cache: 'no-store' });
      const nextSession = (await response.json()) as Session;
      setSession(nextSession);
      if (nextSession.authenticated) await loadContent();
    } catch {
      setError('Le serveur ne répond pas. Relance le site puis réessaie.');
    }
  }

  async function loadContent() {
    const response = await fetch('/api/admin/content', { cache: 'no-store' });
    if (!response.ok) throw new Error('Impossible de charger les données du portfolio.');
    setData((await response.json()) as PortfolioData);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Connexion impossible.');
      setPassword('');
      await checkSession();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Connexion impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setSession({ configured: true, authenticated: false });
    setData(null);
  }

  async function saveData(next: PortfolioData, successMessage = 'Modifications enregistrées.') {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Enregistrement impossible.');
      setData(next);
      setNotice(successMessage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(file: File, kind: 'certificate' | 'cv' | 'project' | 'profile') {
    if (file.size > 4 * 1024 * 1024) throw new Error('Le fichier dépasse la limite de 4 Mo. Réduis sa taille puis réessaie.');
    const formData = new FormData();
    formData.set('file', file);
    formData.set('kind', kind);
    let response: Response;
    try {
      response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    } catch {
      throw new Error('Connexion au serveur impossible. Vérifie ta connexion puis réessaie.');
    }
    const body = await response.text();
    let result: { error?: string; url?: string; fileName?: string } = {};
    try {
      result = JSON.parse(body) as typeof result;
    } catch {
      if (response.status === 413) throw new Error('Le serveur a refusé ce fichier car il dépasse sa limite d’envoi. Utilise un fichier de moins de 4 Mo.');
      throw new Error('Le serveur a renvoyé une réponse invalide. Réessaie dans quelques instants.');
    }
    if (!response.ok) throw new Error(result.error || (response.status === 413 ? 'Fichier trop volumineux (4 Mo maximum).' : `Envoi impossible (erreur ${response.status}).`));
    if (!result.url || !result.fileName) throw new Error('Le serveur n’a pas confirmé la réception du fichier.');
    return result as { url: string; fileName: string };
  }

  function updateProfile(key: keyof PortfolioData['profile'], value: string) {
    setData((current) => current ? { ...current, profile: { ...current.profile, [key]: value } } : current);
  }

  async function uploadPortrait(file?: File) {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const uploaded = await uploadFile(file, 'profile');
      updateProfile('portraitUrl', uploaded.url);
      setNotice('Photo ajoutée. Enregistre le profil pour publier la modification.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Envoi impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadProjectImage(file?: File) {
    if (!file || !projectDraft) return;
    setBusy(true);
    setError('');
    try {
      const uploaded = await uploadFile(file, 'project');
      setProjectDraft({ ...projectDraft, imageUrl: uploaded.url });
      setNotice('Image ajoutée. Enregistre le projet pour publier le changement.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Envoi impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadProjectVideo(file?: File) {
    if (!file || !projectDraft) return;
    setBusy(true);
    setError('');
    try {
      const uploaded = await uploadFile(file, 'project');
      setProjectDraft({ ...projectDraft, videoUrl: uploaded.url });
      setNotice('Vidéo ajoutée. Enregistre le projet pour publier le changement.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Envoi impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadCertificateFile(file?: File) {
    if (!file || !certificateDraft) return;
    setBusy(true);
    setError('');
    try {
      const uploaded = await uploadFile(file, 'certificate');
      setCertificateDraft({ ...certificateDraft, fileUrl: uploaded.url });
      setNotice('Document ajouté. Enregistre la fiche pour publier le changement.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Envoi impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadCv(file?: File) {
    if (!file || !data) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const uploaded = await uploadFile(file, 'cv');
      const next = { ...data, cv: { fileUrl: uploaded.url, fileName: uploaded.fileName, updatedAt: new Date().toISOString() } };
      await saveData(next, 'CV envoyé et mis à jour.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Envoi impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function importCertificateFiles(files: FileList | null) {
    if (!files?.length || !data) return;
    const selectedFiles = Array.from(files);
    const imported: PortfolioCertificate[] = [];
    setBusy(true);
    setError('');
    setNotice('');
    try {
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const file = selectedFiles[index];
        setBulkProgress(`Import de ${index + 1} sur ${selectedFiles.length}…`);
        const uploaded = await uploadFile(file, 'certificate');
        const certificate = emptyCertificate();
        imported.push({ ...certificate, title: file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '), fileUrl: uploaded.url });
      }
      await saveData({ ...data, certificates: [...imported, ...data.certificates] }, `${imported.length} document${imported.length > 1 ? 's' : ''} importé${imported.length > 1 ? 's' : ''} en brouillon. Complète les informations avant publication.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Import impossible.');
    } finally {
      setBulkProgress('');
      setBusy(false);
    }
  }

  if (session === null) return <LoadingScreen />;

  if (!session.configured) {
    return (
      <AdminGate title="Active ton espace admin" detail="Ajoute ADMIN_EMAIL et ADMIN_PASSWORD dans le fichier .env.local à la racine du projet, puis redémarre le serveur. Cette étape protège l’accès à tes documents et à tes données." />
    );
  }

  if (!session.authenticated || !data) {
    return (
      <main className="admin-login min-h-screen flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <a href="/" className="admin-brand"><span className="admin-brand-mark">✦</span> Portfolio studio</a>
          <section className="admin-login-card mt-8">
            <div className="admin-icon-tile"><ShieldCheck size={22} /></div>
            <p className="admin-eyebrow mt-6">ESPACE PRIVÉ</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Content de te revoir.</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-500">Connecte-toi pour gérer ton portfolio, tes certificats et ton CV.</p>
            <form onSubmit={signIn} className="mt-7 space-y-4">
              <label className="admin-label" htmlFor="admin-email">Adresse e-mail</label>
              <input id="admin-email" className="admin-input" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <label className="admin-label" htmlFor="admin-password">Mot de passe administrateur</label>
              <div className="admin-password-field">
                <input id="admin-password" className="admin-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                <button type="button" className="admin-password-toggle" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {error && <p className="admin-error">{error}</p>}
              <button className="admin-primary w-full justify-center" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}<ChevronRight size={17} /></button>
            </form>
            <a href="/" className="admin-back-link">← Retour au portfolio</a>
          </section>
          <p className="mt-5 text-center text-xs text-neutral-400">Tes fichiers sont conservés dans l’espace de stockage du portfolio.</p>
        </div>
      </main>
    );
  }

  const projectCount = data.projects.filter((item) => item.published).length;
  const certificateCount = data.certificates.filter((item) => item.published).length;
  const heading = sections.find((item) => item.id === section)?.label || 'Vue d’ensemble';

  return (
    <main className="admin-shell min-h-screen">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand"><span className="admin-brand-mark">✦</span> Portfolio studio</a>
        <div className="admin-sidebar-divider" />
        <p className="admin-side-caption">ESPACE DE TRAVAIL</p>
        <nav className="mt-3 space-y-1" aria-label="Administration">
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setSection(id); setProjectDraft(null); setCertificateDraft(null); setJourneyDraft(null); setExperimentDraft(null); setError(''); setNotice(''); }} className={`admin-nav-item ${section === id ? 'is-active' : ''}`}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{section === id && <span className="admin-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <a className="admin-nav-item" href="/" target="_blank"><Globe2 size={17} /><span>Voir le site</span><ArrowUpRight size={14} className="ml-auto" /></a>
          <button className="admin-nav-item" onClick={signOut}><LogOut size={17} /><span>Déconnexion</span></button>
          <div className="admin-user-card"><span className="admin-user-avatar">{data.profile.fullName.trim().charAt(0) || 'A'}</span><span className="min-w-0"><span className="block truncate text-sm font-medium text-neutral-800">{data.profile.fullName || 'Administrateur'}</span><span className="block text-xs text-neutral-400">Espace personnel</span></span><Settings2 size={15} className="ml-auto text-neutral-400" /></div>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div><p className="admin-breadcrumb">Portfolio <ChevronRight size={13} /> {heading}</p><h1>{heading}</h1></div>
          <a href="/" target="_blank" className="admin-top-link">Aperçu du site<ArrowUpRight size={15} /></a>
        </header>

        <div className="admin-content">
          {error && <Notice tone="error" onClose={() => setError('')}>{error}</Notice>}
          {notice && <Notice tone="success" onClose={() => setNotice('')}>{notice}</Notice>}
          {section === 'overview' && <Overview data={data} projects={projectCount} certificates={certificateCount} onSelect={setSection} />}

          {section === 'profile' && (
            <section className="admin-card max-w-4xl">
              <SectionIntro title="Ton identité professionnelle" description="Ces informations apparaissent sur l’accueil et la page À propos. Reste fidèle à ce que tu maîtrises aujourd’hui." />
              <div className="admin-form-grid mt-7">
                <Field label="Nom affiché"><input className="admin-input" value={data.profile.fullName} onChange={(e) => updateProfile('fullName', e.target.value)} placeholder="Prénom Nom" /></Field>
                <Field label="Titre ou positionnement"><input className="admin-input" value={data.profile.title} onChange={(e) => updateProfile('title', e.target.value)} placeholder="Étudiant en ingénierie…" /></Field>
                <Field label="Photo de profil" hint="JPG, PNG ou WebP · 4 Mo maximum. Une photo personnelle rendra la présentation plus reconnaissable.">
                  <div className="flex items-center gap-3">
                    {data.profile.portraitUrl && <Image src={data.profile.portraitUrl} alt="Aperçu de la photo de profil" width={52} height={52} className="h-[52px] w-[52px] rounded-full border border-neutral-200 object-cover" unoptimized />}
                    <label className="admin-upload-button"><Upload size={15} />{data.profile.portraitUrl ? 'Remplacer la photo' : 'Choisir une photo'}<input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp" disabled={busy} onChange={(e) => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; void uploadPortrait(file); }} /></label>
                    {data.profile.portraitUrl && <button type="button" className="admin-row-action" onClick={() => updateProfile('portraitUrl', '')}>Retirer</button>}
                  </div>
                </Field>
                <Field label="Adresse e-mail"><input className="admin-input" type="email" value={data.profile.email} onChange={(e) => updateProfile('email', e.target.value)} placeholder="nom@exemple.com" /></Field>
                <Field label="Profil LinkedIn"><input className="admin-input" value={data.profile.linkedin} onChange={(e) => updateProfile('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" /></Field>
                <Field label="Profil GitHub"><input className="admin-input" value={data.profile.github} onChange={(e) => updateProfile('github', e.target.value)} placeholder="https://github.com/…" /></Field>
                <div className="admin-form-spacer" />
                <Field label="Phrase d’accueil" hint="Une phrase courte pour la page principale."><textarea className="admin-input min-h-24 resize-y" value={data.profile.introduction} onChange={(e) => updateProfile('introduction', e.target.value)} placeholder="Je conçois des solutions numériques…" /></Field>
                <Field label="Présentation" hint="Ton parcours, tes objectifs et ce qui t’intéresse."><textarea className="admin-input min-h-36 resize-y" value={data.profile.about} onChange={(e) => updateProfile('about', e.target.value)} placeholder="Présente-toi avec tes propres mots…" /></Field>
              </div>
              <div className="admin-card-footer"><span className="text-xs text-neutral-400">Les compétences seront valorisées à partir des preuves de tes projets et certificats.</span><button className="admin-primary" onClick={() => saveData(data)} disabled={busy}><Save size={16} />{busy ? 'Enregistrement…' : 'Enregistrer le profil'}</button></div>
            </section>
          )}

          {section === 'skills' && (
            <div className="max-w-5xl">
              <div className="admin-list-heading"><SectionIntro title="Domaines de compétences" description="Présente tes domaines sans exagérer ton niveau. Indique les langages exacts, les bases réseau, les outils Office et les méthodes de projet que tu maîtrises réellement." /><button className="admin-secondary" onClick={() => setData({ ...data, skillGroups: [...data.skillGroups, { id: crypto.randomUUID(), title: '', items: '', level: 'À préciser', summary: '', published: false }] })}><Plus size={16} />Ajouter un domaine</button></div>
              <div className="admin-skill-groups mt-6">{data.skillGroups.map((group, index) => <section className="admin-card" key={group.id}>
                <div className="admin-card-heading"><div><p className="admin-eyebrow">DOMAINE / {String(index + 1).padStart(2, '0')}</p><h2>{group.title || 'Nouveau domaine'}</h2></div><button className="admin-icon-button" aria-label={`Supprimer ${group.title || 'ce domaine'}`} onClick={() => setData({ ...data, skillGroups: data.skillGroups.filter((item) => item.id !== group.id) })}><X size={18} /></button></div>
                <div className="admin-form-grid mt-5">
                  <Field label="Domaine"><input className="admin-input" value={group.title} onChange={(event) => setData({ ...data, skillGroups: data.skillGroups.map((item) => item.id === group.id ? { ...item, title: event.target.value } : item) })} placeholder="Programmation, réseaux, gestion de projet…" /></Field>
                  <Field label="Niveau affiché"><input className="admin-input" value={group.level} onChange={(event) => setData({ ...data, skillGroups: data.skillGroups.map((item) => item.id === group.id ? { ...item, level: event.target.value } : item) })} placeholder="Bases, en apprentissage, pratique documentée…" /></Field>
                  <Field label="Langages, outils ou compétences" hint="Sépare chaque élément par une virgule. N’ajoute que ce que tu as réellement pratiqué."><textarea className="admin-input min-h-24 resize-y" value={group.items} onChange={(event) => setData({ ...data, skillGroups: data.skillGroups.map((item) => item.id === group.id ? { ...item, items: event.target.value } : item) })} placeholder={group.id === 'programming' ? 'Inscris ici les noms exacts des langages utilisés.' : 'Ex. notions, outils ou méthodes…'} /></Field>
                  <Field label="Contexte ou preuve"><textarea className="admin-input min-h-24 resize-y" value={group.summary} onChange={(event) => setData({ ...data, skillGroups: data.skillGroups.map((item) => item.id === group.id ? { ...item, summary: event.target.value } : item) })} placeholder="Où et comment as-tu mobilisé ces compétences ?" /></Field>
                </div>
                <div className="admin-check-row"><label><input type="checkbox" checked={group.published} onChange={(event) => setData({ ...data, skillGroups: data.skillGroups.map((item) => item.id === group.id ? { ...item, published: event.target.checked } : item) })} />Afficher ce domaine sur le site</label></div>
              </section>)}</div>
              <div className="admin-card-footer"><span className="text-xs text-neutral-400">Les compétences publiées apparaissent sur l’accueil et dans la cartographie.</span><button className="admin-primary" onClick={() => void saveData(data, 'Compétences enregistrées.')} disabled={busy}><Save size={16} />{busy ? 'Enregistrement…' : 'Enregistrer les compétences'}</button></div>
            </div>
          )}

          {section === 'journey' && (
            <div className="max-w-5xl">
              <div className="admin-list-heading"><SectionIntro title="Formation et expériences" description="Ajoute les étapes que tu peux présenter : études, stages, emplois ou contributions. Elles alimentent le récit chronologique de la page d’accueil." /><button className="admin-primary" onClick={() => setJourneyDraft(emptyJourneyItem())}><Plus size={16} />Ajouter une étape</button></div>
              {journeyDraft ? (
                <section className="admin-card mt-6">
                  <div className="admin-card-heading"><div><p className="admin-eyebrow">ÉTAPE DE PARCOURS</p><h2>{data.journey.some((item) => item.id === journeyDraft.id) ? 'Modifier cette étape' : 'Nouvelle étape'}</h2></div><button className="admin-icon-button" aria-label="Fermer" onClick={() => setJourneyDraft(null)}><X size={18} /></button></div>
                  <div className="admin-form-grid mt-6">
                    <Field label="Type d’étape"><select className="admin-input" value={journeyDraft.category} onChange={(e) => setJourneyDraft({ ...journeyDraft, category: e.target.value as PortfolioJourneyItem['category'] })}><option>Formation</option><option>Expérience</option><option>Contribution</option></select></Field>
                    <Field label="Période" hint="Ex. 2024 — aujourd’hui"><input className="admin-input" value={journeyDraft.period} onChange={(e) => setJourneyDraft({ ...journeyDraft, period: e.target.value })} placeholder="2024 — 2026" /></Field>
                    <Field label="Intitulé"><input className="admin-input" value={journeyDraft.title} onChange={(e) => setJourneyDraft({ ...journeyDraft, title: e.target.value })} placeholder="Formation, poste ou rôle" /></Field>
                    <Field label="Établissement ou organisation"><input className="admin-input" value={journeyDraft.organization} onChange={(e) => setJourneyDraft({ ...journeyDraft, organization: e.target.value })} placeholder="École, entreprise, association…" /></Field>
                    <div className="col-span-full"><Field label="Description" hint="Décris ce que tu as appris, fait ou apporté."><textarea className="admin-input min-h-28 resize-y" value={journeyDraft.description} onChange={(e) => setJourneyDraft({ ...journeyDraft, description: e.target.value })} placeholder="Quelques phrases sur cette étape…" /></Field></div>
                  </div>
                  <div className="admin-check-row"><label><input type="checkbox" checked={journeyDraft.published} onChange={(e) => setJourneyDraft({ ...journeyDraft, published: e.target.checked })} />Publier sur le site</label></div>
                  <div className="admin-card-footer"><button className="admin-secondary" onClick={() => setJourneyDraft(null)}>Annuler</button><button className="admin-primary" disabled={busy || !journeyDraft.title.trim()} onClick={() => {
                    const exists = data.journey.some((item) => item.id === journeyDraft.id);
                    const next = { ...data, journey: exists ? data.journey.map((item) => item.id === journeyDraft.id ? journeyDraft : item) : [journeyDraft, ...data.journey] };
                    void saveData(next, 'Étape de parcours enregistrée.'); setJourneyDraft(null);
                  }}><Save size={16} />Enregistrer l’étape</button></div>
                </section>
              ) : data.journey.length ? <div className="admin-entry-list mt-6">{data.journey.map((item) => <EntryRow key={item.id} title={item.title || 'Étape sans titre'} subtitle={[item.period, item.organization].filter(Boolean).join(' · ') || item.description || 'Détails à compléter'} published={item.published} tag={item.category} onEdit={() => setJourneyDraft({ ...item })} onDelete={() => {
                if (!window.confirm(`Supprimer « ${item.title || 'cette étape'} » ?`)) return;
                void saveData({ ...data, journey: data.journey.filter((entry) => entry.id !== item.id) }, 'Étape supprimée.');
              }} />)}</div> : <div className="admin-entry-list mt-6"><EmptyState icon={<Briefcase size={22} />} title="Ton parcours prendra forme ici" detail="Ajoute une formation, une expérience ou une contribution. Tu pourras la garder en brouillon avant publication." /></div>}
            </div>
          )}

          {section === 'projects' && (
            <div className="max-w-5xl">
              <div className="admin-list-heading"><SectionIntro title="Tes projets" description="Présente le problème traité, ta contribution, la solution et les preuves de ton travail." /><button className="admin-primary" onClick={() => setProjectDraft(emptyProject())}><Plus size={16} />Ajouter un projet</button></div>
              {projectDraft ? (
                <section className="admin-card mt-6">
                  <div className="admin-card-heading"><div><p className="admin-eyebrow">ÉTUDE DE CAS</p><h2>{data.projects.some((item) => item.id === projectDraft.id) ? 'Modifier le projet' : 'Nouveau projet'}</h2></div><button className="admin-icon-button" aria-label="Fermer" onClick={() => setProjectDraft(null)}><X size={18} /></button></div>
                  <div className="admin-form-grid mt-6">
                    <Field label="Nom du projet"><input className="admin-input" value={projectDraft.title} onChange={(e) => setProjectDraft({ ...projectDraft, title: e.target.value })} placeholder="Nom de ton projet" /></Field>
                    <Field label="Technologies"><input className="admin-input" value={projectDraft.technologies} onChange={(e) => setProjectDraft({ ...projectDraft, technologies: e.target.value })} placeholder="React, Python…" /></Field>
                    <Field label="Résumé"><textarea className="admin-input min-h-24 resize-y" value={projectDraft.summary} onChange={(e) => setProjectDraft({ ...projectDraft, summary: e.target.value })} placeholder="Une phrase pour présenter le projet." /></Field>
                    <Field label="Problème"><textarea className="admin-input min-h-24 resize-y" value={projectDraft.problem} onChange={(e) => setProjectDraft({ ...projectDraft, problem: e.target.value })} placeholder="Quel besoin ou problème as-tu abordé ?" /></Field>
                    <Field label="Ta contribution"><textarea className="admin-input min-h-24 resize-y" value={projectDraft.contribution} onChange={(e) => setProjectDraft({ ...projectDraft, contribution: e.target.value })} placeholder="Quel était ton rôle ?" /></Field>
                    <Field label="Solution et résultat"><textarea className="admin-input min-h-24 resize-y" value={projectDraft.solution} onChange={(e) => setProjectDraft({ ...projectDraft, solution: e.target.value })} placeholder="Qu’as-tu réalisé et quel a été le résultat ?" /></Field>
                    <Field label="Lien vers le projet"><input className="admin-input" type="url" value={projectDraft.link} onChange={(e) => setProjectDraft({ ...projectDraft, link: e.target.value })} placeholder="https://…" /></Field>
                    <Field label="Preuve du travail"><input className="admin-input" type="url" value={projectDraft.proofUrl} onChange={(e) => setProjectDraft({ ...projectDraft, proofUrl: e.target.value })} placeholder="Dépôt GitHub, démonstration…" /></Field>
                    <Field label="Image du projet" hint="PNG, JPG ou WebP · 4 Mo maximum.">
                      <div className="flex items-center gap-3"><label className="admin-upload-button"><Upload size={15} />Choisir une image<input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp" disabled={busy} onChange={(e) => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; void uploadProjectImage(file); }} /></label>{projectDraft.imageUrl && <><span className="truncate text-xs text-emerald-700">Image ajoutée</span><button type="button" className="admin-row-action" onClick={() => setProjectDraft({ ...projectDraft, imageUrl: '' })}>Retirer</button></>}</div>
                    </Field>
                    <Field label="Vidéo de présentation" hint="MP4 ou WebM · 4 Mo maximum. Pour un clip plus long, colle un lien YouTube, Vimeo ou MP4/WebM direct.">
                      <div className="flex flex-wrap items-center gap-3"><label className="admin-upload-button"><Video size={15} />Ajouter un clip<input type="file" className="sr-only" accept="video/mp4,video/webm,.mp4,.webm" disabled={busy} onChange={(e) => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; void uploadProjectVideo(file); }} /></label>{projectDraft.videoUrl && <><span className="truncate text-xs text-emerald-700">Vidéo ajoutée</span><button type="button" className="admin-row-action" onClick={() => setProjectDraft({ ...projectDraft, videoUrl: '' })}>Retirer</button></>}</div>
                    </Field>
                    <div className="col-span-full"><Field label="Ou lien vidéo" hint="Lien public YouTube, Vimeo ou URL directe terminant par .mp4 ou .webm. La vidéo se charge seulement quand le visiteur la lance."><input className="admin-input" type="url" value={projectDraft.videoUrl.startsWith('/uploads/') ? '' : projectDraft.videoUrl} onChange={(e) => setProjectDraft({ ...projectDraft, videoUrl: e.target.value })} placeholder="https://youtu.be/… ou https://…/demo.mp4" /></Field></div>
                    {(projectDraft.imageUrl || projectDraft.videoUrl) && <div className="col-span-full"><p className="admin-eyebrow mb-2">APERÇU DU CADRE MÉDIA</p><ProjectMediaFrame title={projectDraft.title || 'Projet'} imageUrl={projectDraft.imageUrl} videoUrl={projectDraft.videoUrl} index={0} interactive /></div>}
                  </div>
                  <div className="admin-check-row"><label><input type="checkbox" checked={projectDraft.published} onChange={(e) => setProjectDraft({ ...projectDraft, published: e.target.checked })} />Publier sur le site</label><label><input type="checkbox" checked={projectDraft.featured} onChange={(e) => setProjectDraft({ ...projectDraft, featured: e.target.checked })} />Mettre en avant</label></div>
                  <div className="admin-card-footer"><button className="admin-secondary" onClick={() => setProjectDraft(null)}>Annuler</button><button className="admin-primary" disabled={busy || !projectDraft.title.trim()} onClick={() => {
                    const exists = data.projects.some((item) => item.id === projectDraft.id);
                    const next = { ...data, projects: exists ? data.projects.map((item) => item.id === projectDraft.id ? projectDraft : item) : [projectDraft, ...data.projects] };
                    void saveData(next, 'Projet enregistré.'); setProjectDraft(null);
                  }}><Save size={16} />Enregistrer le projet</button></div>
                </section>
              ) : <div className="admin-entry-list mt-6">{data.projects.length ? data.projects.map((item) => <EntryRow key={item.id} title={item.title || 'Projet sans titre'} subtitle={item.summary || 'Résumé à compléter'} published={item.published} tag={item.technologies} onEdit={() => setProjectDraft({ ...item })} onDelete={() => {
                if (!window.confirm(`Supprimer « ${item.title || 'ce projet'} » ?`)) return;
                void saveData({ ...data, projects: data.projects.filter((project) => project.id !== item.id) }, 'Projet supprimé.');
              }} />) : <EmptyState icon={<Briefcase size={22} />} title="Aucun projet pour le moment" detail="Ajoute une réalisation, puis choisis si elle doit être visible sur ton site." />}</div>}
            </div>
          )}

          {section === 'certificates' && (
            <div className="max-w-5xl">
              <div className="admin-list-heading"><SectionIntro title="Bibliothèque de certificats" description="Ajoute les cours, attestations et certifications avec leur date, organisme et lien de vérification." /><div className="admin-list-actions flex gap-2"><label className="admin-secondary cursor-pointer"><Upload size={15} />{bulkProgress || 'Importer des fichiers'}<input type="file" className="sr-only" multiple accept="application/pdf,image/png,image/jpeg,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text,.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.odt" disabled={busy} onChange={(e) => { const files = e.currentTarget.files; e.currentTarget.value = ''; void importCertificateFiles(files); }} /></label><button className="admin-primary" disabled={busy} onClick={() => setCertificateDraft(emptyCertificate())}><Plus size={16} />Ajouter une fiche</button></div></div>
              {certificateDraft ? (
                <section className="admin-card mt-6">
                  <div className="admin-card-heading"><div><p className="admin-eyebrow">DOCUMENT & APPRENTISSAGE</p><h2>{data.certificates.some((item) => item.id === certificateDraft.id) ? 'Modifier le certificat' : 'Nouveau certificat'}</h2></div><button className="admin-icon-button" aria-label="Fermer" onClick={() => setCertificateDraft(null)}><X size={18} /></button></div>
                  <div className="admin-form-grid mt-6">
                    <Field label="Nom du certificat"><input className="admin-input" value={certificateDraft.title} onChange={(e) => setCertificateDraft({ ...certificateDraft, title: e.target.value })} placeholder="Intitulé exact figurant sur le document" /></Field>
                    <Field label="Organisme"><input className="admin-input" value={certificateDraft.issuer} onChange={(e) => setCertificateDraft({ ...certificateDraft, issuer: e.target.value })} placeholder="Établissement ou organisme" /></Field>
                    <Field label="Date d’obtention"><input className="admin-input" type="month" value={certificateDraft.date} onChange={(e) => setCertificateDraft({ ...certificateDraft, date: e.target.value })} /></Field>
                    <Field label="Domaine"><input className="admin-input" value={certificateDraft.domain} onChange={(e) => setCertificateDraft({ ...certificateDraft, domain: e.target.value })} placeholder="Développement, données…" /></Field>
                    <Field label="Niveau"><input className="admin-input" value={certificateDraft.level} onChange={(e) => setCertificateDraft({ ...certificateDraft, level: e.target.value })} placeholder="Débutant, intermédiaire…" /></Field>
                    <Field label="Nature du document"><select className="admin-input" value={certificateDraft.type} onChange={(e) => setCertificateDraft({ ...certificateDraft, type: e.target.value })}><option value="">Choisir une nature</option><option>Certification professionnelle</option><option>Cours suivi</option><option>Attestation de participation</option><option>Diplôme</option><option>Autre</option></select></Field>
                    <Field label="Compétences couvertes"><textarea className="admin-input min-h-24 resize-y" value={certificateDraft.skills} onChange={(e) => setCertificateDraft({ ...certificateDraft, skills: e.target.value })} placeholder="Sépare les compétences par des virgules." /></Field>
                    <Field label="Lien de vérification"><input className="admin-input" type="url" value={certificateDraft.verificationUrl} onChange={(e) => setCertificateDraft({ ...certificateDraft, verificationUrl: e.target.value })} placeholder="https://…" /></Field>
                    <Field label="Document du certificat" hint="PDF, DOC, DOCX, ODT, JPG, PNG ou WebP · 4 Mo maximum.">
                      <div className="flex items-center gap-3"><label className="admin-upload-button"><Upload size={15} />Joindre un document<input type="file" className="sr-only" accept="application/pdf,image/png,image/jpeg,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text,.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.odt" disabled={busy} onChange={(e) => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; void uploadCertificateFile(file); }} /></label>{certificateDraft.fileUrl && <span className="truncate text-xs text-emerald-700">Document ajouté</span>}</div>
                    </Field>
                  </div>
                  <div className="admin-check-row"><label><input type="checkbox" checked={certificateDraft.published} onChange={(e) => setCertificateDraft({ ...certificateDraft, published: e.target.checked })} />Publier dans la bibliothèque</label><label><input type="checkbox" checked={certificateDraft.featured} onChange={(e) => setCertificateDraft({ ...certificateDraft, featured: e.target.checked })} />Mettre en avant</label></div>
                  <div className="admin-card-footer"><button className="admin-secondary" onClick={() => setCertificateDraft(null)}>Annuler</button><button className="admin-primary" disabled={busy || !certificateDraft.title.trim()} onClick={() => {
                    const exists = data.certificates.some((item) => item.id === certificateDraft.id);
                    const next = { ...data, certificates: exists ? data.certificates.map((item) => item.id === certificateDraft.id ? certificateDraft : item) : [certificateDraft, ...data.certificates] };
                    void saveData(next, 'Certificat enregistré.'); setCertificateDraft(null);
                  }}><Save size={16} />Enregistrer le certificat</button></div>
                </section>
              ) : <div className="admin-entry-list mt-6">{data.certificates.length ? data.certificates.map((item) => <EntryRow key={item.id} title={item.title || 'Certificat sans titre'} subtitle={[item.issuer, item.date].filter(Boolean).join(' · ') || 'Informations à compléter'} published={item.published} tag={item.domain} onEdit={() => setCertificateDraft({ ...item })} onDelete={() => {
                if (!window.confirm(`Supprimer « ${item.title || 'ce certificat'} » ?`)) return;
                void saveData({ ...data, certificates: data.certificates.filter((certificate) => certificate.id !== item.id) }, 'Certificat supprimé.');
              }} />) : <EmptyState icon={<Award size={22} />} title="Ta bibliothèque est prête" detail="Ajoute tes documents un par un. Les visiteurs pourront les rechercher et les filtrer." />}</div>}
            </div>
          )}

          {section === 'experiments' && (
            <div className="max-w-5xl">
              <div className="admin-list-heading"><SectionIntro title="Expérimentations & prototypes" description="Garde les essais en cours dans un laboratoire séparé des projets terminés. Tu choisis lesquels montrer sur le site." /><button className="admin-primary" onClick={() => setExperimentDraft(emptyExperiment())}><Plus size={16} />Nouvelle expérimentation</button></div>
              {experimentDraft ? (
                <section className="admin-card mt-6">
                  <div className="admin-card-heading"><div><p className="admin-eyebrow">LABORATOIRE</p><h2>{data.experiments.some((item) => item.id === experimentDraft.id) ? 'Modifier l’expérimentation' : 'Nouvelle expérimentation'}</h2></div><button className="admin-icon-button" aria-label="Fermer" onClick={() => setExperimentDraft(null)}><X size={18} /></button></div>
                  <div className="admin-form-grid mt-6">
                    <Field label="Nom de l’expérimentation"><input className="admin-input" value={experimentDraft.title} onChange={(e) => setExperimentDraft({ ...experimentDraft, title: e.target.value })} placeholder="Ex. Interface de recherche vocale" /></Field>
                    <Field label="Domaine"><input className="admin-input" value={experimentDraft.category} onChange={(e) => setExperimentDraft({ ...experimentDraft, category: e.target.value })} placeholder="IA, UX, automatisation…" /></Field>
                    <Field label="État d’avancement"><select className="admin-input" value={experimentDraft.status} onChange={(e) => setExperimentDraft({ ...experimentDraft, status: e.target.value })}><option>En cours</option><option>Exploration</option><option>Prototype</option><option>Mis en pause</option><option>Terminé</option></select></Field>
                    <Field label="Technologies explorées"><input className="admin-input" value={experimentDraft.technologies} onChange={(e) => setExperimentDraft({ ...experimentDraft, technologies: e.target.value })} placeholder="Sépare les éléments par des virgules." /></Field>
                    <div className="col-span-full"><Field label="Question ou piste explorée"><textarea className="admin-input min-h-32 resize-y" value={experimentDraft.description} onChange={(e) => setExperimentDraft({ ...experimentDraft, description: e.target.value })} placeholder="Qu’essaies-tu de comprendre ou de vérifier ?" /></Field></div>
                  </div>
                  <div className="admin-check-row"><label><input type="checkbox" checked={experimentDraft.published} onChange={(e) => setExperimentDraft({ ...experimentDraft, published: e.target.checked })} />Afficher dans le laboratoire public</label></div>
                  <div className="admin-card-footer"><button className="admin-secondary" onClick={() => setExperimentDraft(null)}>Annuler</button><button className="admin-primary" disabled={busy || !experimentDraft.title.trim()} onClick={() => {
                    const exists = data.experiments.some((item) => item.id === experimentDraft.id);
                    const next = { ...data, experiments: exists ? data.experiments.map((item) => item.id === experimentDraft.id ? experimentDraft : item) : [experimentDraft, ...data.experiments] };
                    void saveData(next, 'Expérimentation enregistrée.'); setExperimentDraft(null);
                  }}><Save size={16} />Enregistrer</button></div>
                </section>
              ) : <div className="admin-entry-list mt-6">{data.experiments.length ? data.experiments.map((item) => <EntryRow key={item.id} title={item.title || 'Expérimentation sans titre'} subtitle={item.description || item.technologies || 'Détails à compléter'} published={item.published} tag={[item.category, item.status].filter(Boolean).join(' · ')} onEdit={() => setExperimentDraft({ ...item })} onDelete={() => {
                if (!window.confirm(`Supprimer « ${item.title || 'cette expérimentation'} » ?`)) return;
                void saveData({ ...data, experiments: data.experiments.filter((entry) => entry.id !== item.id) }, 'Expérimentation supprimée.');
              }} />) : <EmptyState icon={<FlaskConical size={22} />} title="Le laboratoire est prêt" detail="Ajoute une piste ou un prototype. Les essais restent distincts des projets présentés comme finalisés." />}</div>}
            </div>
          )}

          {section === 'cv' && (
            <section className="admin-card max-w-4xl">
              <SectionIntro title="Ton CV consultable" description="Envoie une version PDF. La page CV proposera ensuite la consultation et le téléchargement." />
              <div className="admin-cv-drop mt-7"><div className="admin-icon-tile"><FileText size={22} /></div><h2 className="mt-4 text-lg font-semibold text-neutral-900">{data.cv.fileUrl ? 'Remplacer ton CV' : 'Ajouter ton CV'}</h2><p className="mt-1 text-sm text-neutral-500">PDF, DOC, DOCX ou ODT · 4 Mo maximum. Le PDF reste le plus agréable à consulter.</p><label className="admin-primary mt-5 cursor-pointer"><Upload size={16} />{busy ? 'Envoi…' : 'Choisir un fichier'}<input type="file" className="sr-only" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text,.pdf,.doc,.docx,.odt" disabled={busy} onChange={(e) => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; void uploadCv(file); }} /></label>
                {data.cv.fileUrl && <div className="admin-cv-current"><span className="admin-file-icon"><FileText size={17} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-neutral-800">{data.cv.fileName || 'Mon CV.pdf'}</strong><span className="text-xs text-neutral-400">{data.cv.updatedAt ? `Mis à jour le ${new Date(data.cv.updatedAt).toLocaleDateString('fr-FR')}` : 'CV disponible'}</span></span><a href={data.cv.fileUrl} target="_blank" rel="noreferrer" className="admin-text-link">Consulter<ArrowUpRight size={14} /></a></div>}
              </div>
              <p className="mt-5 text-xs leading-5 text-neutral-400">Ton CV sera accessible publiquement depuis la page dédiée. Évite d’y inclure des données personnelles dont tu ne souhaites pas la diffusion.</p>
            </section>
          )}

          {section === 'studio' && (
            <section className="admin-card max-w-4xl">
              <SectionIntro title="Identité visuelle & mouvement" description="Le site reprend la palette ivoire, charbon et citron vert et la scène en couches du ZIP fourni. Ajuste l’accent et le rythme des animations." />
              <div className="admin-studio-grid mt-7">
                <div>
                  <Field label="Couleur de signature" hint="La palette conserve le contraste avec les surfaces sombres et claires.">
                    <div className="admin-accent-options" role="group" aria-label="Choisir la couleur de signature">
                      {(Object.entries(portfolioAccents) as [PortfolioAccent, string][]).map(([accent, color]) => <button type="button" key={accent} aria-label={`Choisir ${accent}`} aria-pressed={data.settings.accent === accent} className="admin-accent-swatch" style={{ '--swatch': color } as CSSProperties} onClick={() => setData({ ...data, settings: { ...data.settings, accent } })}><span />{accent === 'lime' ? 'Vert citron' : accent === 'mint' ? 'Menthe' : accent === 'blue' ? 'Bleu' : 'Corail'}</button>)}
                    </div>
                  </Field>
                  <Field label={`Profondeur des couches · ${data.settings.sceneDepth}%`} hint="Règle le relief de la scène du profil.">
                    <input className="admin-range" type="range" min="0" max="100" value={data.settings.sceneDepth} style={{ accentColor: portfolioAccents[data.settings.accent] }} onChange={(e) => setData({ ...data, settings: { ...data.settings, sceneDepth: Number(e.target.value) } })} />
                  </Field>
                  <Field label={`Rythme des animations · ${data.settings.motionSpeed.toFixed(2)}×`} hint="Le réglage respecte toujours la préférence système de réduction des animations.">
                    <input className="admin-range" type="range" min="0.65" max="1.35" step="0.05" value={data.settings.motionSpeed} style={{ accentColor: portfolioAccents[data.settings.accent] }} onChange={(e) => setData({ ...data, settings: { ...data.settings, motionSpeed: Number(e.target.value) } })} />
                  </Field>
                </div>
                  <div className="admin-studio-preview" style={{ '--portfolio-accent': portfolioAccents[data.settings.accent], '--portfolio-depth': `${data.settings.sceneDepth}px`, '--portfolio-motion-speed': data.settings.motionSpeed } as CSSProperties}>
                    <span className="admin-studio-preview-label">APERÇU DU STUDIO</span>
                    <div className="admin-studio-stack" aria-hidden="true"><span className="admin-studio-stack-back">01 / PROFIL</span><span className="admin-studio-stack-mid">THE LIVING PORTFOLIO</span><span className="admin-studio-stack-front">IVO ABDOULRHAMANE<br />COMPÉTENCES · PROJETS · PARCOURS</span></div>
                  </div>
              </div>
              <div className="admin-card-footer"><span className="text-xs text-neutral-400">Les changements deviennent visibles après l’enregistrement.</span><button className="admin-primary" onClick={() => saveData(data, 'Identité visuelle enregistrée.')} disabled={busy}><Save size={16} />Enregistrer les réglages</button></div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function Overview({ data, projects, certificates, onSelect }: { data: PortfolioData; projects: number; certificates: number; onSelect: (section: Section) => void }) {
  const setup = [
    { section: 'profile' as const, title: 'Présente ton profil', detail: 'Nom, positionnement, portrait et présentation', done: Boolean(data.profile.fullName && data.profile.title), icon: <UserRound size={14} /> },
    { section: 'skills' as const, title: 'Décris tes compétences', detail: 'Langages, réseaux, outils Office et gestion de projet', done: data.skillGroups.some((group) => group.published && group.items.trim()), icon: <Braces size={14} /> },
    { section: 'journey' as const, title: 'Raconte ton parcours', detail: 'Études, expériences et contributions', done: data.journey.some((item) => item.published), icon: <Briefcase size={14} /> },
    { section: 'projects' as const, title: 'Ajoute tes projets', detail: 'Réalisations, rôle et preuves', done: data.projects.some((item) => item.published), icon: <FolderKanban size={14} /> },
    { section: 'certificates' as const, title: 'Organise tes certificats', detail: 'Documents, compétences et vérification', done: data.certificates.some((item) => item.published), icon: <Award size={14} /> },
    { section: 'cv' as const, title: 'Rends ton CV consultable', detail: 'Dépose une version PDF à jour', done: Boolean(data.cv.fileUrl), icon: <FileText size={14} /> },
  ];
  const missing = setup.filter((item) => !item.done).map((item) => item.title.toLowerCase());
  const completed = setup.length - missing.length;
  return <div className="max-w-5xl">
    <div className="admin-welcome"><div><p className="admin-eyebrow">TON ESPACE PERSONNEL</p><h2>Bonjour{data.profile.fullName ? `, ${data.profile.fullName.split(' ')[0]}` : ''} <span>✦</span></h2><p>Gère les contenus de ton portfolio sans modifier le code.</p></div><a href="/" target="_blank" className="admin-outline-link">Voir le portfolio<ArrowUpRight size={15} /></a></div>
    <div className="admin-stats-grid mt-6"><StatCard label="Projets publiés" value={projects} icon={<FolderKanban size={18} />} note={`${data.projects.length} au total`} /><StatCard label="Certificats publiés" value={certificates} icon={<Award size={18} />} note={`${data.certificates.length} au total`} /><StatCard label="CV en ligne" value={data.cv.fileUrl ? 'Oui' : 'Non'} icon={<FileText size={18} />} note={data.cv.fileUrl ? 'Consultable par les visiteurs' : 'À ajouter en PDF'} /></div>
    <section className="admin-card mt-6">
      <div className="flex items-start justify-between gap-4"><div><p className="admin-eyebrow">MISE EN ROUTE</p><h2 className="mt-1 text-lg font-semibold text-neutral-900">Complète ton portfolio</h2></div><span className="admin-progress-count">{completed} / {setup.length}</span></div>
      <p className="mt-1 text-sm text-neutral-500">Les informations sont modifiables à tout moment.</p>
      <div className="admin-checklist mt-5">{setup.map((item) => <button key={item.section} onClick={() => onSelect(item.section)}><span className={`admin-step-icon ${item.done ? 'is-done' : ''}`}>{item.done ? <Check size={14} /> : item.icon}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><ChevronRight size={16} /></button>)}</div>
      {missing.length > 0 && <p className="mt-4 text-xs text-neutral-400">À compléter : {missing.join(', ')}.</p>}
    </section>
    <div className="admin-tip mt-5"><Award size={18} /><p><strong>Des preuves avant les listes.</strong> Pour chaque compétence, privilégie les projets et certificats qui montrent concrètement ce que tu sais faire.</p></div>
  </div>;
}

function StatCard({ label, value, icon, note }: { label: string; value: string | number; icon: ReactNode; note: string }) {
  return <div className="admin-stat-card"><span className="admin-stat-icon">{icon}</span><p>{label}</p><div><strong>{value}</strong><span>{note}</span></div></div>;
}

function EntryRow({ title, subtitle, published, tag, onEdit, onDelete }: { title: string; subtitle: string; published: boolean; tag: string; onEdit: () => void; onDelete: () => void }) {
  return <article className="admin-entry"><div className="admin-entry-icon"><FileText size={18} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold text-neutral-900">{title}</h3><span className={`admin-status ${published ? 'is-published' : ''}`}>{published ? 'Publié' : 'Brouillon'}</span></div><p className="mt-1 truncate text-xs text-neutral-500">{subtitle}</p>{tag && <p className="mt-1 truncate text-[11px] text-neutral-400">{tag}</p>}</div><button className="admin-row-action" onClick={onEdit}>Modifier</button><button className="admin-delete" onClick={onDelete} aria-label={`Supprimer ${title}`}><X size={16} /></button></article>;
}

function EmptyState({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return <div className="admin-empty"><span className="admin-icon-tile">{icon}</span><h2>{title}</h2><p>{detail}</p></div>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <div className="admin-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</div>;
}

function SectionIntro({ title, description }: { title: string; description: string }) {
  return <div><p className="admin-eyebrow">CONTENU DU SITE</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">{title}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">{description}</p></div>;
}

function Notice({ tone, onClose, children }: { tone: 'success' | 'error'; onClose: () => void; children: ReactNode }) {
  return <div className={`admin-notice ${tone === 'error' ? 'is-error' : ''}`}><span>{tone === 'error' ? <X size={16} /> : <Check size={16} />}</span><p>{children}</p><button onClick={onClose} aria-label="Fermer"><X size={15} /></button></div>;
}

function LoadingScreen() {
  return <div className="admin-login min-h-screen flex items-center justify-center text-sm text-neutral-500">Chargement de l’espace admin…</div>;
}

function AdminGate({ title, detail }: { title: string; detail: string }) {
  return <main className="admin-login min-h-screen flex items-center justify-center px-5"><section className="admin-login-card max-w-lg"><span className="admin-icon-tile"><ShieldCheck size={22} /></span><p className="admin-eyebrow mt-6">CONFIGURATION REQUISE</p><h1 className="mt-2 text-2xl font-semibold text-neutral-950">{title}</h1><p className="mt-3 text-sm leading-6 text-neutral-500">{detail}</p><div className="admin-code-note mt-5"><code>ADMIN_EMAIL=toi@exemple.com</code><code>ADMIN_PASSWORD=ton-mot-de-passe</code><span>Redémarre ensuite avec <code>npm run dev</code>.</span></div><a href="/" className="admin-back-link">← Retour au portfolio</a></section></main>;
}
