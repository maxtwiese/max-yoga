export async function initMotion(prefersReduced) {
  if (prefersReduced) {
    document.documentElement.style.scrollBehavior = 'smooth';
    return;
  }

  let lenis = null;
  try {
    const { default: Lenis } = await import('https://esm.sh/lenis@1');
    lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  } catch (_) {
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  const objs = Array.from(document.querySelectorAll('.obj'));
  const pullInner = document.querySelector('.pull-band-inner');
  const pullBand  = document.querySelector('.pull-band');

  function applyScrollMotion(scroll) {
    for (const o of objs) {
      const depth = parseFloat(o.dataset.depth || '0.06');
      o.style.setProperty('--scroll-drift', (scroll * depth).toFixed(1) + 'px');
    }
    if (pullInner && pullBand) {
      const r = pullBand.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
      const offset = (progress - 0.5) * 56;
      pullInner.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    }
  }

  if (lenis) {
    lenis.on('scroll', ({ scroll }) => applyScrollMotion(scroll));
  } else {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        applyScrollMotion(window.scrollY);
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

  applyScrollMotion(window.scrollY);
}
