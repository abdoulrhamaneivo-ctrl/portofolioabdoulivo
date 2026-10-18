'use client';

import { useEffect, useRef } from 'react';

export default function ScrollMotionRuntime() {
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let observer: IntersectionObserver | null = null;

    if (!reducedMotion && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer?.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
    }

    const reveal = (node: Element) => {
      if (!(node instanceof HTMLElement) || !node.matches('.zip-reveal') || node.classList.contains('is-visible')) return;
      if (observer) observer.observe(node);
      else node.classList.add('is-visible');
    };
    const revealTree = (node: Node) => {
      if (!(node instanceof Element)) return;
      reveal(node);
      node.querySelectorAll('.zip-reveal').forEach(reveal);
    };

    root.classList.add('zip-motion-ready');
    document.querySelectorAll('.zip-reveal').forEach(reveal);
    const mutations = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach(revealTree)));
    mutations.observe(document.body, { childList: true, subtree: true });

    let frame = 0;
    const updateProgress = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const range = document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current?.style.setProperty('transform', `scaleX(${range > 0 ? Math.min(1, window.scrollY / range) : 0})`);
      });
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      mutations.disconnect();
      observer?.disconnect();
      root.classList.remove('zip-motion-ready');
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return <div className="zip-progress zip-route-progress" aria-hidden="true"><span ref={progressRef} /></div>;
}
