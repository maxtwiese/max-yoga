import { initMotion }  from './motion.js';
import { initTooltip } from './tooltip.js';
import { initFade }    from './fade.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initMotion(prefersReduced);
initTooltip(prefersReduced);
initFade(prefersReduced);
