// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// URL pública: defina SITE_URL na Vercel (ou use o domínio de produção que a Vercel injeta).
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://matheusandrell.vercel.app');

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  redirects: { '/': '/pt' },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'pt', locales: { pt: 'pt-BR', en: 'en-US' } },
      filter: (page) => /\/(pt|en)\/?$/.test(page),
    }),
  ],
  build: { inlineStylesheets: 'always' },
});
