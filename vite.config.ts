import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

function vercelOutputDirSyncPlugin() {
  return {
    name: 'vercel-output-dir-sync',
    enforce: 'pre' as const,
    transformIndexHtml(html: string) {
      let cleaned = html;
      if (cleaned.includes('assets/index')) {
        cleaned = cleaned
          .replace(/<script[^>]*src=['"][^'"]*assets\/index[^'"]*['"][^>]*>\s*<\/script>/gi, '')
          .replace(/<link[^>]*href=['"][^'"]*assets\/index[^'"]*['"][^>]*>/gi, '');
        if (!cleaned.includes('/src/main.tsx')) {
          cleaned = cleaned.replace('</body>', '<script type="module" src="/src/main.tsx"></script>\n</body>');
        }
      }
      return cleaned;
    },
    closeBundle() {
      try {
        const rootDir = process.cwd();
        const distDir = path.resolve(rootDir, 'dist');
        if (!fs.existsSync(distDir)) return;

        // Ensure Google Search Console verification file, .well-known/assetlinks.json, sitemap.xml, and robots.txt are always in dist
        const wellKnownDist = path.resolve(distDir, '.well-known');
        fs.mkdirSync(wellKnownDist, { recursive: true });
        fs.writeFileSync(
          path.resolve(wellKnownDist, 'assetlinks.json'),
          JSON.stringify(
            [
              {
                relation: [
                  'delegate_permission/common.handle_all_urls',
                  'delegate_permission/common.get_login_creds'
                ],
                target: {
                  namespace: 'android_app',
                  package_name: 'dz.khadam.app',
                  sha256_cert_fingerprints: [
                    '14:6D:E9:7F:0F:52:EA:CB:25:4B:E4:3E:92:02:18:2B:A3:16:32:86:C4:42:0F:7B:69:0E:64:14:CE:00:8F:A9',
                    '15:82:10:24:85:D1:F5:ED:27:FF:80:48:1F:25:8A:A2:A7:3E:DD:0A:72:8E:33:9D:1B:17:72:10:96:C2:13:5B',
                    'DA:76:1B:A0:D3:98:19:36:6D:98:F5:2A:27:3B:36:0A:D3:00:51:22:28:25:6B:CE:43:EA:24:CD:D7:39:95:8C',
                    'A8:97:4D:23:4B:11:98:51:B4:86:EB:C8:A2:6B:6E:9B:A8:84:2C:97:84:1C:32:ED:80:BC:77:8C:5A:AB:9F:68'
                  ]
                }
              },
              {
                relation: [
                  'delegate_permission/common.handle_all_urls'
                ],
                target: {
                  namespace: 'android_app',
                  package_name: 'com.example.khadam_dz',
                  sha256_cert_fingerprints: [
                    '14:6D:E9:7F:0F:52:EA:CB:25:4B:E4:3E:92:02:18:2B:A3:16:32:86:C4:42:0F:7B:69:0E:64:14:CE:00:8F:A9'
                  ]
                }
              }
            ],
            null,
            2
          ),
          'utf8'
        );
        fs.writeFileSync(
          path.resolve(distDir, 'googlea428081754d85133.html'),
          'google-site-verification: googlea428081754d85133.html',
          'utf8'
        );
        fs.writeFileSync(
          path.resolve(distDir, 'CNAME'),
          'www.khadmadz.com\n',
          'utf8'
        );
        fs.writeFileSync(
          path.resolve(distDir, 'sitemap.xml'),
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://www.khadmadz.com/</loc>\n    <lastmod>2026-11-10</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://khadmadz.com/</loc>\n    <lastmod>2026-11-10</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://khadmadz.vercel.app/</loc>\n    <lastmod>2026-11-10</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://khadam-dz-qsw8.vercel.app/</loc>\n    <lastmod>2026-11-10</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://khadam-dz-2q6o.vercel.app/</loc>\n    <lastmod>2026-11-10</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://khadam-dz-adua.vercel.app/</loc>\n    <lastmod>2026-11-10</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://chifablida-create.github.io/khadam-dz/</loc>\n    <lastmod>2026-11-10</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>\n`,
          'utf8'
        );
        fs.writeFileSync(
          path.resolve(distDir, 'robots.txt'),
          `User-agent: *\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nSitemap: https://www.khadmadz.com/sitemap.xml\nSitemap: https://khadmadz.com/sitemap.xml\nSitemap: https://khadmadz.vercel.app/sitemap.xml\nSitemap: https://khadam-dz-qsw8.vercel.app/sitemap.xml\nSitemap: https://khadam-dz-2q6o.vercel.app/sitemap.xml\nSitemap: https://khadam-dz-adua.vercel.app/sitemap.xml\nSitemap: https://chifablida-create.github.io/khadam-dz/sitemap.xml\n`,
          'utf8'
        );

        // Sanitize any manifest JSON in dist and dist/assets so start_url is always "./"
        const cleanManifestStr = JSON.stringify(
          {
            id: './?v=5',
            name: 'خدّام ديزاد - Khadam DZ',
            short_name: 'خدّام DZ',
            description: 'المنصة الجزائرية الأولى لربط الحرفيين وأصحاب المهن مع الزبائن عبر 58 ولاية',
            start_url: './',
            scope: './',
            display: 'standalone',
            orientation: 'portrait',
            background_color: '#080a12',
            theme_color: '#16a34a',
            lang: 'ar',
            dir: 'rtl',
            icons: [
              { src: './pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
              { src: './pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
              { src: './pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
            ]
          },
          null,
          2
        );
        fs.writeFileSync(path.resolve(distDir, 'manifest.json'), cleanManifestStr, 'utf8');
        const distAssetsDir = path.resolve(distDir, 'assets');
        if (fs.existsSync(distAssetsDir)) {
          for (const f of fs.readdirSync(distAssetsDir)) {
            if (f.startsWith('manifest') && f.endsWith('.json')) {
              fs.writeFileSync(path.resolve(distAssetsDir, f), cleanManifestStr, 'utf8');
            }
          }
        }

        // Create dist/404.html and dist/khadam-dz/ mirror so legacy PWA start_url (/khadam-dz/?v=4) never fails to load ./assets/*
        const indexHtmlPath = path.resolve(distDir, 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
          fs.copyFileSync(indexHtmlPath, path.resolve(distDir, '404.html'));
          const khadamSubDir = path.resolve(distDir, 'khadam-dz');
          fs.mkdirSync(khadamSubDir, { recursive: true });
          fs.copyFileSync(indexHtmlPath, path.resolve(khadamSubDir, 'index.html'));
          if (fs.existsSync(distAssetsDir)) {
            fs.cpSync(distAssetsDir, path.resolve(khadamSubDir, 'assets'), { recursive: true, force: true });
          }
        }

        const initCwd = process.env.INIT_CWD ? path.resolve(process.env.INIT_CWD) : rootDir;
        const isVercelOrSubdir = Boolean(
          process.env.VERCEL || process.env.CI || initCwd !== rootDir
        );
        if (!isVercelOrSubdir) return;

        const targets = new Set<string>();
        if (initCwd !== rootDir) {
          targets.add(path.resolve(initCwd, 'dist'));
        }
        targets.add(path.resolve(rootDir, 'api', 'dist'));
        targets.add(path.resolve(rootDir, 'public', 'dist'));

        for (const targetDist of targets) {
          if (targetDist !== distDir) {
            fs.mkdirSync(targetDist, { recursive: true });
            fs.cpSync(distDir, targetDist, { recursive: true, force: true });
          }
        }
      } catch (err) {
        console.warn('vercel-output-dir-sync warning:', err);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(
        process.env.VITE_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          'https://rtohqtpkkhmmshcthnbl.supabase.co'
      ),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        process.env.VITE_SUPABASE_ANON_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          ''
      ),
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.VITE_SUPABASE_URL ||
          'https://rtohqtpkkhmmshcthnbl.supabase.co'
      ),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          process.env.VITE_SUPABASE_ANON_KEY ||
          ''
      ),
    },
    plugins: [react(), tailwindcss(), vercelOutputDirSyncPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 2000,
      target: ['es2015', 'chrome58', 'safari11'],
      cssTarget: 'chrome58',
    },
  };
});


