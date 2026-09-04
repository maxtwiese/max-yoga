import { initMotion }  from './motion.js';
import { initTooltip } from './tooltip.js';
import { initFade }    from './fade.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

import('./classes.js').then(m => m.initClasses()).catch(function () {});
initMotion(prefersReduced);
initTooltip(prefersReduced);
initFade(prefersReduced);
