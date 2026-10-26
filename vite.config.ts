import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

function vercelOutputDirSyncPlugin() {
  return {
    name: 'vercel-output-dir-sync',
    closeBundle() {
      try {
        const rootDir = process.cwd();
        const distDir = path.resolve(rootDir, 'dist');
        if (!fs.existsSync(distDir)) return;

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
    plugins: [react(), tailwindcss(), vercelOutputDirSyncPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
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
