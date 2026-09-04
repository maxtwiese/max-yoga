export async function initClasses() {
  const container = document.getElementById('offerings-list');
  if (!container) return;

  let classes;
  try {
    const res = await fetch('/data/classes.json');
    if (!res.ok) return;
    classes = await res.json();
  } catch (e) { return; }

  if (!classes.length) return;

  container.innerHTML = '';

  for (const cls of classes) {
    const article = document.createElement('article');
    article.className = 'offering-item fade-child';

    let inner =
      `<div class="offering-date">${esc(cls.date)}</div>` +
      '<div class="offering-info">' +
        `<h3 class="offering-name">${esc(cls.title)}</h3>` +
        `<div class="offering-meta">${esc(cls.time)}${cls.location ? ' · ' + esc(cls.location) : ''}</div>` +
      '</div>';

    if (cls.link) {
      inner += `<a class="offering-link" href="${esc(cls.link)}" rel="noopener" target="_blank">${esc(cls.linkLabel || 'Info')} →</a>`;
    }

    article.innerHTML = inner;
    container.appendChild(article);
  }

  const fadeParent = container.closest('.fade');
  if (fadeParent && fadeParent.classList.contains('in')) {
    container.querySelectorAll('.fade-child').forEach((el, i) => {
      el.style.transitionDelay = (i * 90) + 'ms';
      el.classList.add('in');
    });
  }
}

function esc(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}
