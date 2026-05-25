export function initFade(prefersReduced) {
  const fadeNodes = document.querySelectorAll('.fade');
  if (!fadeNodes.length) return;

  if (!('IntersectionObserver' in window) || prefersReduced) {
    fadeNodes.forEach(n => {
      n.classList.add('in');
      n.querySelectorAll('.fade-child').forEach(c => c.classList.add('in'));
    });
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      const kids = e.target.querySelectorAll('.fade-child');
      let i = 0;
      for (const k of kids) {
        k.style.transitionDelay = (i * 90) + 'ms';
        k.classList.add('in');
        i++;
      }
      obs.unobserve(e.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  fadeNodes.forEach(n => obs.observe(n));
}
