# max.yoga

Static single-page site.

## File map

```
.
├── index.html
├── src/
│   ├── lib/                 # JS modules
│   │   ├── main.js          # entry — imports + inits
│   │   ├── motion.js        # smooth scroll + parallax
│   │   ├── tooltip.js       # hover label on floating objects
│   │   └── fade.js          # IntersectionObserver reveal
│   └── styles/              # CSS modules
│       ├── main.css         # entry — @imports the rest
│       ├── tokens.css       # design tokens (colors, spacing, fonts)
│       ├── base.css         # reset, body, links, skip link
│       ├── layout.css       # container, section
│       ├── typography.css   # display, num, hero-subtitle
│       ├── floating-objects.css
│       ├── components.css   # hero, blurb, offerings, subscribe, footer
│       └── animations.css   # fade + responsive + reduced-motion
├── img/
│   ├── web/                 # WebPs served to the browser
│   └── objects/             # PNG/JPEG originals (gitignored)
├── icons/                   # favicon assets + site.webmanifest
├── favicon.ico              # root for browser auto-request
└── scripts/
    └── optimize-images.sh   # regenerates img/web/ from originals
```

## Run locally

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

A real HTTP server is required (`file://` won't load ES modules or root-relative paths).

## Update images

1. Drop the source (PNG with transparency, or JPEG) into `img/objects/`.
2. Run:

   ```bash
   ./scripts/optimize-images.sh             # rebuild all
   ./scripts/optimize-images.sh iris        # rebuild one
   ```

3. Reference the output in HTML: `src="/img/web/<name>.webp"`.

Requires `cwebp` (`brew install webp`). Outputs ≈100–250 KB at 1200 px max edge.

## Deploy

Hosted on **Cloudflare Pages** with native Git integration. Push to `main` → auto-deploys.

### One-time setup

1. Push the repo to GitHub.
2. Cloudflare → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Pick the repo. Build command: empty. Output directory: empty.
4. **Save and Deploy**.
5. **Custom domains** → add `max.yoga` and `www.max.yoga`.

### Subsequent deploys

```bash
git push origin main
```

Rolls out in ~30 s.

### Rollback

Cloudflare → Pages project → **Deployments** → pick a prior deploy → **Rollback**.
