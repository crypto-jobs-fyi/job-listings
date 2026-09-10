import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '../../categories.config.js';
import { generatePagesConfig } from '../generate-entry-points.js';

const rootDir = process.cwd();
const viteConfig = readFileSync(path.join(rootDir, 'vite.config.js'), 'utf-8');
const app = readFileSync(path.join(rootDir, 'src', 'App.svelte'), 'utf-8');
const topMenu = readFileSync(path.join(rootDir, 'src', 'components', 'TopMenu.svelte'), 'utf-8');
const homePage = readFileSync(path.join(rootDir, 'src', 'pages', 'HomePage.svelte'), 'utf-8');

describe('generated entry points', () => {
  it('keeps every configured route, HTML file, JavaScript entry point, and Vite input aligned', () => {
    const pages = generatePagesConfig();

    expect(pages).toHaveLength(1 + CATEGORIES.length * 3 + 4);
    expect(new Set(pages.map((page) => page.path)).size).toBe(pages.length);

    for (const page of pages) {
      const htmlPath = path.join(rootDir, page.path);
      const entryPath = path.join(rootDir, 'src', `${page.entryPoint}.js`);
      const html = readFileSync(htmlPath, 'utf-8');

      expect(existsSync(htmlPath), `${page.path} should exist`).toBe(true);
      expect(existsSync(entryPath), `src/${page.entryPoint}.js should exist`).toBe(true);
      expect(html).toContain(`<script type="module" src="/src/${page.entryPoint}.js"></script>`);
      expect(viteConfig).toContain(`'./${page.path}'`);
      expect(app).toContain(`pageConfig.type === '${page.type}'`);
    }
  });

  it('keeps category job and company navigation targets reachable', () => {
    expect(homePage).toContain('href="/{category.id}-jobs.html"');
    expect(homePage).toContain('href="/{category.id}-companies.html"');

    for (const category of CATEGORIES) {
      const jobsRoute = `/${category.id}-jobs.html`;
      const companiesRoute = `/${category.id}-companies.html`;

      expect(topMenu).toContain(`href="${jobsRoute}"`);
      expect(topMenu).toContain(`href="${companiesRoute}"`);
    }
  });
});