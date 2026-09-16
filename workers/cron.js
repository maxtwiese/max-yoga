export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    const res = await fetch(
      'https://api.github.com/repos/maxtwiese/max-yoga/actions/workflows/update-classes.yml/dispatches',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'max-yoga-cron',
        },
        body: JSON.stringify({ ref: 'main' }),
      },
    );
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    }
  },
};
