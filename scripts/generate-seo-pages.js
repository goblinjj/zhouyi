#!/usr/bin/env node
/**
 * SEO Static Page Generator
 * Generates static HTML pages for hexagrams, stars, and classics
 * to make content indexable by search engines.
 */

const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const SITE = 'https://zhouyi.goblin.top';

// ─── Helpers ───

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nl2br(text) {
  if (!text) return '';
  return escapeHtml(text).replace(/\n/g, '<br>\n');
}

function truncate(text, len = 150) {
  if (!text) return '';
  const clean = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.length > len ? clean.slice(0, len) + '…' : clean;
}

function mkdir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Parse a JS file that uses `export default { ... }` or `export default [ ... ]`
 * Returns the parsed object/array.
 */
function parseJsExport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Remove export default
  content = content.replace(/export\s+default\s+/, '');
  // Remove trailing semicolons
  content = content.replace(/;\s*$/, '');
  // Use Function constructor to evaluate
  return new Function(`return (${content})`)();
}

// ─── HTML Template ───

function htmlPage({ title, description, canonical, bodyHtml, ogType = 'article', jsonLd = null, breadcrumbs = [] }) {
  const ldScript = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '';
  const breadcrumbHtml = breadcrumbs.length > 0
    ? `<nav class="breadcrumb">${breadcrumbs.map((b, i) =>
        i < breadcrumbs.length - 1
          ? `<a href="${b.url}">${escapeHtml(b.name)}</a><span class="sep">›</span>`
          : `<span class="current">${escapeHtml(b.name)}</span>`
      ).join('')}</nav>`
    : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} - 周易占卜</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="周易占卜">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link href="https://fonts.loli.net/css2?family=Noto+Serif+SC:wght@400;600;700&family=Ma+Shan+Zheng&display=swap" rel="stylesheet">
${ldScript}
<style>
:root {
  --bg-color: #f4ece1;
  --bg-paper: #faf6ef;
  --text-color: #3a2e2a;
  --text-muted: #7a6b5d;
  --accent-color: #8b2500;
  --accent-gold: #b8860b;
  --accent-gold-light: #d4a84b;
  --border-color: #c4a97d;
  --border-light: #ddd0bc;
  --shadow-color: rgba(74, 52, 32, 0.12);
}
* { box-sizing: border-box; }
body {
  font-family: "Noto Serif SC", "Songti SC", "STSong", "SimSun", serif;
  background-color: var(--bg-color);
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(196,169,125,0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(196,169,125,0.1) 0%, transparent 50%);
  color: var(--text-color);
  margin: 0;
  padding: 24px 16px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.container {
  max-width: 860px;
  width: 100%;
  background: var(--bg-paper);
  padding: 40px 36px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 2px 20px var(--shadow-color), inset 0 0 80px rgba(196,169,125,0.06);
  position: relative;
}
.container::before, .container::after {
  content: '◆';
  position: absolute;
  color: var(--border-color);
  font-size: 10px;
  opacity: 0.6;
}
.container::before { top: 8px; left: 10px; }
.container::after { top: 8px; right: 10px; }
h1 {
  font-family: "Ma Shan Zheng", "Noto Serif SC", serif;
  color: var(--accent-color);
  font-size: 2em;
  margin: 0 0 8px;
  text-align: center;
}
.subtitle {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.95em;
  margin-bottom: 24px;
}
.breadcrumb {
  font-size: 0.85em;
  color: var(--text-muted);
  margin-bottom: 20px;
}
.breadcrumb a {
  color: var(--accent-gold);
  text-decoration: none;
}
.breadcrumb a:hover { text-decoration: underline; }
.breadcrumb .sep { margin: 0 6px; }
.section {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px dashed var(--border-light);
}
.section:last-child { border-bottom: none; }
.section-title {
  font-size: 1.1em;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 3px solid var(--accent-gold);
}
.section-content {
  line-height: 1.9;
  font-size: 0.95em;
  text-align: justify;
}
.classical-text {
  background: rgba(196,169,125,0.08);
  padding: 14px 16px;
  border-radius: 4px;
  border-left: 3px solid var(--accent-gold-light);
  margin: 10px 0;
  line-height: 2;
}
.palace-tag {
  display: inline-block;
  background: var(--accent-gold);
  color: #fff;
  padding: 2px 10px;
  border-radius: 3px;
  font-size: 0.85em;
  margin-right: 8px;
}
.category-tag {
  display: inline-block;
  background: var(--accent-color);
  color: #fff;
  padding: 2px 10px;
  border-radius: 3px;
  font-size: 0.85em;
  margin-right: 8px;
}
.gong-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  margin-top: 12px;
}
.gong-item {
  background: rgba(196,169,125,0.06);
  border: 1px solid var(--border-light);
  border-radius: 4px;
  padding: 10px 14px;
}
.gong-item-title {
  font-weight: 600;
  color: var(--accent-gold);
  margin-bottom: 4px;
  font-size: 0.9em;
}
.gong-item-text {
  font-size: 0.88em;
  line-height: 1.7;
  color: var(--text-color);
}
.nav-links {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.nav-links a {
  color: var(--accent-gold);
  text-decoration: none;
  font-size: 0.9em;
}
.nav-links a:hover { text-decoration: underline; }
.line-section {
  margin: 20px 0;
  padding: 16px;
  background: rgba(196,169,125,0.04);
  border-radius: 4px;
  border: 1px solid var(--border-light);
}
.line-title {
  font-weight: 700;
  color: var(--accent-color);
  font-size: 1.05em;
  margin-bottom: 8px;
}
.sub-section {
  margin: 14px 0;
  padding: 12px 16px;
  background: rgba(196,169,125,0.05);
  border-radius: 4px;
  border: 1px solid var(--border-light);
}
.sub-section h3 {
  font-size: 1em;
  color: var(--accent-gold);
  margin: 0 0 8px;
}
@media (max-width: 600px) {
  body { padding: 12px 8px; }
  .container { padding: 24px 16px; }
  h1 { font-size: 1.5em; }
  .gong-grid { grid-template-columns: 1fr; }
}
</style>
</head>
<body>
<div class="container">
${breadcrumbHtml}
${bodyHtml}
</div>
</body>
</html>`;
}

// ─── Hexagram Pages (64) ───

function generateHexagramPages() {
  const outDir = path.join(DIST, 'hexagram', 'gua');
  mkdir(outDir);

  const dataDir = path.resolve(__dirname, '..', 'hexagram', 'public', 'data', 'takashima');
  const urls = [];
  const lineLabels = ['初', '二', '三', '四', '五', '上'];

  for (let id = 1; id <= 64; id++) {
    const jsonPath = path.join(dataDir, `${id}.json`);
    if (!fs.existsSync(jsonPath)) {
      console.warn(`  Warning: ${jsonPath} not found, skipping`);
      continue;
    }

    const hex = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const title = `第${id}卦 ${hex.name}`;
    const description = truncate(hex.modern_guaci || hex.guaci || hex.general_text || '', 150);
    const canonical = `${SITE}/hexagram/gua/${id}.html`;

    let bodyHtml = `<h1>${escapeHtml(title)}</h1>`;

    // Subtitle with palace
    const subtitleParts = [];
    if (hex.palace) subtitleParts.push(`<span class="palace-tag">${escapeHtml(hex.palace)}</span>`);
    if (hex.pinyin) subtitleParts.push(escapeHtml(hex.pinyin.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')));
    if (subtitleParts.length) bodyHtml += `<div class="subtitle">${subtitleParts.join(' ')}</div>`;

    // 卦辞
    if (hex.guaci) {
      bodyHtml += `<div class="section">
        <div class="section-title">卦辞</div>
        <div class="classical-text">${nl2br(hex.guaci)}</div>
        ${hex.modern_guaci ? `<div class="section-content">${nl2br(hex.modern_guaci)}</div>` : ''}
      </div>`;
    }

    // 总注
    if (hex.general_text) {
      bodyHtml += `<div class="section">
        <div class="section-title">总注</div>
        <div class="classical-text">${nl2br(hex.general_text)}</div>
        ${hex.modern_general_text ? `<div class="section-content">${nl2br(hex.modern_general_text)}</div>` : ''}
      </div>`;
    }

    // 高岛易断总论
    if (hex.takashima_general) {
      bodyHtml += `<div class="section">
        <div class="section-title">高岛易断（总断）</div>
        <div class="classical-text">${nl2br(hex.takashima_general)}</div>
        ${hex.modern_takashima_general ? `<div class="section-content">${nl2br(hex.modern_takashima_general)}</div>` : ''}
      </div>`;
    }

    // 六爻
    if (hex.lines) {
      for (let i = 1; i <= 6; i++) {
        const line = hex.lines[String(i)];
        if (!line) continue;
        const label = lineLabels[i - 1];
        bodyHtml += `<div class="line-section">
          <div class="line-title">${escapeHtml(label)}爻</div>
          ${line.text ? `<div class="classical-text">${nl2br(line.text)}</div>` : ''}
          ${line.modern_text ? `<div class="section-content">${nl2br(line.modern_text)}</div>` : ''}
          ${line.takashima_explanation ? `<div class="section"><div class="section-title">${escapeHtml(label)}爻 · 高岛易断</div><div class="classical-text">${nl2br(line.takashima_explanation)}</div></div>` : ''}
          ${line.modern_takashima_explanation ? `<div class="section-content">${nl2br(line.modern_takashima_explanation)}</div>` : ''}
        </div>`;
      }

      // 用九/用六
      const extra = hex.lines['7'];
      if (extra) {
        bodyHtml += `<div class="line-section">
          <div class="line-title">用九/用六</div>
          ${extra.text ? `<div class="classical-text">${nl2br(extra.text)}</div>` : ''}
          ${extra.modern_text ? `<div class="section-content">${nl2br(extra.modern_text)}</div>` : ''}
          ${extra.guaci ? `<div class="classical-text">${nl2br(extra.guaci)}</div>` : ''}
          ${extra.modern_guaci ? `<div class="section-content">${nl2br(extra.modern_guaci)}</div>` : ''}
          ${extra.takashima_explanation ? `<div class="section"><div class="section-title">用九/用六 · 高岛易断</div><div class="classical-text">${nl2br(extra.takashima_explanation)}</div></div>` : ''}
          ${extra.modern_takashima_explanation ? `<div class="section-content">${nl2br(extra.modern_takashima_explanation)}</div>` : ''}
        </div>`;
      }
    }

    // Navigation
    const navParts = [];
    navParts.push('<a href="/hexagram/study.html">← 返回六十四卦</a>');
    navParts.push('<a href="/">首页</a>');
    if (id > 1) navParts.push(`<a href="/hexagram/gua/${id - 1}.html">上一卦</a>`);
    if (id < 64) navParts.push(`<a href="/hexagram/gua/${id + 1}.html">下一卦</a>`);
    bodyHtml += `<div class="nav-links">${navParts.join('')}</div>`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      url: canonical,
      isPartOf: { '@type': 'WebSite', name: '周易占卜', url: SITE },
    };

    const html = htmlPage({
      title,
      description,
      canonical,
      bodyHtml,
      jsonLd,
      breadcrumbs: [
        { name: '首页', url: '/' },
        { name: '六十四卦', url: '/hexagram/study.html' },
        { name: hex.name },
      ],
    });

    fs.writeFileSync(path.join(outDir, `${id}.html`), html, 'utf8');
    urls.push(canonical);
  }

  console.log(`  Generated ${urls.length} hexagram pages`);
  return urls;
}

// ─── Star Pages (53) ───

function generateStarPages() {
  const outDir = path.join(DIST, 'astrology', 'star');
  mkdir(outDir);

  const starsDir = path.resolve(__dirname, '..', 'Astrology', 'src', 'data', 'stars');
  const files = fs.readdirSync(starsDir).filter(f => f.endsWith('.js') && f !== '模板.js');
  const urls = [];

  const GONG_NAMES = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '交友宫', '官禄宫', '田宅宫', '福禄宫', '父母宫'];

  for (const file of files) {
    const filePath = path.join(starsDir, file);
    let star;
    try {
      star = parseJsExport(filePath);
    } catch (e) {
      console.warn(`  Warning: Failed to parse ${file}: ${e.message}`);
      continue;
    }

    const filename = path.basename(file, '.js');
    const title = `${star.title} - 紫微斗数星耀详解`;
    const description = truncate(star.all || star['经典'] || `${star.title}星耀在紫微斗数中的赋性与十二宫解读`, 150);
    const canonical = `${SITE}/astrology/star/${filename}.html`;

    let bodyHtml = `<h1>${escapeHtml(star.title)}</h1>`;

    // Category
    if (star.category) {
      bodyHtml += `<div class="subtitle"><span class="category-tag">${escapeHtml(star.category.title)}</span></div>`;
    }

    // 经典原文
    if (star['经典']) {
      bodyHtml += `<div class="section">
        <div class="section-title">经典原文</div>
        <div class="classical-text">${nl2br(star['经典'])}</div>
      </div>`;
    }

    // 总述
    if (star.all) {
      bodyHtml += `<div class="section">
        <div class="section-title">总述</div>
        <div class="section-content">${nl2br(star.all)}</div>
      </div>`;
    }

    // 十二宫
    const gongEntries = GONG_NAMES.filter(g => star[g]);
    if (gongEntries.length > 0) {
      bodyHtml += `<div class="section">
        <div class="section-title">十二宫解读</div>
        <div class="gong-grid">
          ${gongEntries.map(g => `<div class="gong-item">
            <div class="gong-item-title">${escapeHtml(g)}</div>
            <div class="gong-item-text">${nl2br(star[g])}</div>
          </div>`).join('\n')}
        </div>
      </div>`;
    }

    // Navigation
    bodyHtml += `<div class="nav-links">
      <a href="/astrology/stars">← 返回星耀列表</a>
      <a href="/">首页</a>
    </div>`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${star.title} - 紫微斗数星耀`,
      description,
      url: canonical,
      isPartOf: { '@type': 'WebSite', name: '周易占卜', url: SITE },
    };

    const html = htmlPage({
      title,
      description,
      canonical,
      bodyHtml,
      jsonLd,
      breadcrumbs: [
        { name: '首页', url: '/' },
        { name: '紫微斗数', url: '/astrology/' },
        { name: '星耀', url: '/astrology/stars' },
        { name: star.title },
      ],
    });

    fs.writeFileSync(path.join(outDir, `${filename}.html`), html, 'utf8');
    urls.push(canonical);
  }

  console.log(`  Generated ${urls.length} star pages`);
  return urls;
}

// ─── Classics Pages (23) ───

function generateClassicsPages() {
  const outDir = path.join(DIST, 'astrology', 'classic');
  mkdir(outDir);

  const classicsPath = path.resolve(__dirname, '..', 'Astrology', 'src', 'data', 'classics.js');
  let classics;
  try {
    classics = parseJsExport(classicsPath);
  } catch (e) {
    console.error(`  Error parsing classics.js: ${e.message}`);
    return [];
  }

  const urls = [];

  for (let i = 0; i < classics.length; i++) {
    const entry = classics[i];
    const title = `${entry.title} - 紫微斗数典籍`;
    const description = truncate(entry.content || `紫微斗数经典文献「${entry.title}」全文`, 150);
    const canonical = `${SITE}/astrology/classic/${i}.html`;

    let bodyHtml = `<h1>${escapeHtml(entry.title)}</h1>`;

    // Main content
    if (entry.content) {
      bodyHtml += `<div class="section">
        <div class="section-content classical-text">${nl2br(entry.content)}</div>
      </div>`;
    }

    // Sub-sections
    if (entry.sections && entry.sections.length > 0) {
      for (const sec of entry.sections) {
        bodyHtml += `<div class="sub-section">
          <h3>${escapeHtml(sec.title)}</h3>
          <div class="section-content">${nl2br(sec.content)}</div>
        </div>`;
      }
    }

    // Navigation
    const navParts = [];
    navParts.push('<a href="/astrology/dianji">← 返回典籍列表</a>');
    navParts.push('<a href="/">首页</a>');
    if (i > 0) navParts.push(`<a href="/astrology/classic/${i - 1}.html">上一篇</a>`);
    if (i < classics.length - 1) navParts.push(`<a href="/astrology/classic/${i + 1}.html">下一篇</a>`);
    bodyHtml += `<div class="nav-links">${navParts.join('')}</div>`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: entry.title,
      description,
      url: canonical,
      isPartOf: { '@type': 'WebSite', name: '周易占卜', url: SITE },
    };

    const html = htmlPage({
      title,
      description,
      canonical,
      bodyHtml,
      jsonLd,
      breadcrumbs: [
        { name: '首页', url: '/' },
        { name: '紫微斗数', url: '/astrology/' },
        { name: '典籍', url: '/astrology/dianji' },
        { name: entry.title },
      ],
    });

    fs.writeFileSync(path.join(outDir, `${i}.html`), html, 'utf8');
    urls.push(canonical);
  }

  console.log(`  Generated ${urls.length} classics pages`);
  return urls;
}

// ─── Sitemap ───

function generateSitemap(newUrls) {
  // Existing pages
  const existingUrls = [
    { loc: `${SITE}/`, priority: '1.0' },
    { loc: `${SITE}/astrology/`, priority: '0.9' },
    { loc: `${SITE}/hexagram/`, priority: '0.9' },
    { loc: `${SITE}/astrology/stars`, priority: '0.8' },
    { loc: `${SITE}/astrology/dianji`, priority: '0.8' },
    { loc: `${SITE}/hexagram/study.html`, priority: '0.8' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const u of existingUrls) {
    xml += `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>\n`;
  }

  for (const url of newUrls) {
    xml += `  <url>\n    <loc>${url}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  }

  xml += `</urlset>\n`;

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf8');
  console.log(`  Sitemap updated with ${existingUrls.length + newUrls.length} URLs`);
}

// ─── Main ───

function main() {
  console.log('Generating SEO static pages...');

  const allUrls = [];
  allUrls.push(...generateHexagramPages());
  allUrls.push(...generateStarPages());
  allUrls.push(...generateClassicsPages());

  generateSitemap(allUrls);

  console.log(`Done! Generated ${allUrls.length} static pages total.`);
}

main();
