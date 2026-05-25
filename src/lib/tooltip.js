export function initTooltip(prefersReduced) {
  if (prefersReduced) return;
  if (!window.matchMedia('(hover: hover)').matches) return;

  const tip = document.createElement('div');
  tip.className = 'obj-tip';
  tip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tip);

  let visible = false;

  const show = (text, x, y) => {
    if (!text) return;
    tip.textContent = text;
    const px = Math.min(x + 16, window.innerWidth  - tip.offsetWidth  - 8);
    const py = Math.min(y + 16, window.innerHeight - tip.offsetHeight - 8);
    tip.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    if (!visible) { tip.classList.add('visible'); visible = true; }
  };

  const hide = () => {
    if (visible) { tip.classList.remove('visible'); visible = false; }
  };

  document.addEventListener('pointermove', (e) => {
    const target = e.target.closest && e.target.closest('img.obj');
    if (target) {
      show(target.getAttribute('data-tip') || target.getAttribute('alt') || '', e.clientX, e.clientY);
    } else {
      hide();
    }
  }, { passive: true });

  document.addEventListener('pointerleave', hide, { passive: true });
  window.addEventListener('scroll', hide, { passive: true });
}
