'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, RotateCcw } from 'lucide-react';
import { safeExternalUrl } from '@/lib/urls';

type Props = {
  title: string;
  imageUrl: string;
  videoUrl: string;
  index: number;
  interactive?: boolean;
  detail?: boolean;
};

function videoSource(value: string) {
  const localUpload = /^\/uploads\/project-[\da-f-]+\.(?:mp4|webm)$/i.test(value) ? value : '';
  const safeUrl = localUpload || safeExternalUrl(value);
  if (!safeUrl) return null;

  try {
    const url = new URL(safeUrl, 'https://portfolio.local');
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host === 'youtu.be' || host === 'youtube.com' || host === 'm.youtube.com') {
      const id = host === 'youtu.be' ? url.pathname.split('/').filter(Boolean)[0] : (url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1]);
      return id && /^[\w-]{6,}$/.test(id) ? { type: 'embed' as const, src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1` } : null;
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const id = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
      return id ? { type: 'embed' as const, src: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` } : null;
    }
    return /\.(?:mp4|webm)$/i.test(url.pathname) ? { type: 'file' as const, src: safeUrl } : null;
  } catch {
    return null;
  }
}

export default function ProjectMediaFrame({ title, imageUrl, videoUrl, index, interactive = false, detail = false }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const source = videoSource(videoUrl);
  const poster = imageUrl && !imageFailed ? <Image src={imageUrl} alt={`Aperçu visuel du projet ${title}`} fill sizes={detail ? '(max-width: 900px) 100vw, 1180px' : '(max-width: 720px) 100vw, (max-width: 1000px) 50vw, 33vw'} unoptimized priority={detail} onError={() => setImageFailed(true)} /> : <div className="zip-project-art" aria-hidden="true"><span>{`{ ${String(index + 1).padStart(2, '0')} }`}</span><i /><b /></div>;

  return <div className={`zip-project-image zip-media-frame${detail ? ' zip-case-image is-detail' : ''}`}>
    {playing && source?.type === 'file' ? <video key={source.src} className="zip-media-player" controls autoPlay playsInline preload="metadata" poster={imageUrl || undefined} aria-label={`Vidéo du projet ${title}`}><source src={source.src} /></video> : playing && source?.type === 'embed' ? <iframe className="zip-media-player" src={source.src} title={`Vidéo du projet ${title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : poster}
    {!playing && source && <span className="zip-media-video-badge"><Play size={12} fill="currentColor" /> VIDÉO</span>}
    {interactive && source && (playing ? <button className="zip-media-replay" type="button" onClick={() => setPlaying(false)} aria-label="Revenir à l’image du projet"><RotateCcw size={15} /> Revoir l’image</button> : <button className="zip-media-play" type="button" onClick={() => setPlaying(true)} aria-label={`Lire la vidéo du projet ${title}`}><Play size={detail ? 20 : 15} fill="currentColor" /><span>{detail ? 'Voir la présentation' : 'Lire la vidéo'}</span></button>)}
    <span className="zip-project-image-index">PROJET / {String(index + 1).padStart(2, '0')}</span>
  </div>;
}
