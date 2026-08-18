/* ============================================================
   Resume scripts.js — i18n dual-language system
   ============================================================ */

const CONTENT_DIR = 'contents/';
const CONFIG_FILE = 'config.yml';
let CURRENT_LANG = 'zh';

const SECTION_DEFS = {
  experience:   { icon: 'bi-briefcase-fill' },
  projects:     { icon: 'bi-folder2-open' },
  education:    { icon: 'bi-mortarboard-fill' },
  skills:       { icon: 'bi-code-slash' },
  publications: { icon: 'bi-journal-text' },
  awards:       { icon: 'bi-award-fill' },
};

let CONFIG = {};

/* ---------- Helpers ---------- */
function fetchText(url) {
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${url}`);
    return r.text();
  });
}

function renderMd(md) {
  marked.use({ mangle: false, headerIds: false });
  return marked.parse(md);
}

/* ---------- Parse entry bar: "Company --- date | role | dept | [link text](url)" ---------- */
function parseEntryBar(innerHTML) {
  const dashIdx = innerHTML.indexOf('---');
  if (dashIdx === -1) {
    return `<span class="eb-company">${innerHTML}</span>`;
  }
  const company = innerHTML.slice(0, dashIdx).trim();
  const rest    = innerHTML.slice(dashIdx + 3).trim();
  const parts   = rest.split('|').map(s => s.trim());

  let out = `<span class="eb-company">${company}</span>`;
  out += `<span class="eb-sep"> ─── </span>`;

  parts.forEach((p, i) => {
    if (i === 0) {
      out += `<span class="eb-date">${p}</span>`;
    } else if (i === 1) {
      out += ` <span class="eb-sep">│</span> <span class="eb-role">${p}</span>`;
    } else if (i === 2) {
      out += ` <span class="eb-sep">│</span> <span class="eb-dept2">${p}</span>`;
    } else {
      // Last segment → right-aligned red link
      out += `<span class="eb-link">${p}</span>`;
    }
  });
  return out;
}

/* ---------- Post-process: h3 → entry-bar, h4 → proj-title ---------- */
function postProcess(container) {
  container.querySelectorAll('h3').forEach(h3 => {
    const div = document.createElement('div');
    div.className = 'entry-bar';
    div.innerHTML = parseEntryBar(h3.innerHTML);
    h3.replaceWith(div);
  });

  container.querySelectorAll('h4').forEach(h4 => {
    const div = document.createElement('div');
    div.className = 'proj-title';
    div.innerHTML = h4.innerHTML;
    h4.replaceWith(div);
  });
}

/* ---------- Build header ---------- */
function buildHeader(cfg, lang) {
  const name       = cfg[`name_${lang}`]    || cfg['name']    || 'Your Name';
  const github     = cfg['github_url']       || '#';
  const ghUsername = cfg['github_username']  || '';
  const email      = cfg['email']            || '';
  const phone      = cfg['phone']            || '';
  const location   = cfg['location']         || '';
  const avatarUrl  = cfg['avatar_url']       || '';
  const tagline    = cfg[`tagline_${lang}`]  || '';

  const el = document.getElementById('resume-header');
  if (!el) return;

  // Avatar: real image or placeholder box
  const avatarHtml = avatarUrl
    ? `<img class="rh-avatar" src="${avatarUrl}" alt="avatar" />`
    : `<div class="rh-avatar rh-avatar-placeholder"><i class="bi bi-person-fill"></i></div>`;

  // Contact row items: phone | email | location | github
  const items = [];
  if (phone)      items.push(`<span class="rh-ci"><i class="bi bi-telephone-fill"></i>${phone}</span>`);
  if (email)      items.push(`<span class="rh-ci"><i class="bi bi-envelope-fill"></i><a href="mailto:${email}">${email}</a></span>`);
  if (location)   items.push(`<span class="rh-ci"><i class="bi bi-geo-alt-fill"></i>${location}</span>`);
  if (ghUsername) items.push(`<span class="rh-ci"><i class="bi bi-github"></i><a href="${github}" target="_blank">${ghUsername}</a></span>`);
  const contactRow = items.join('<span class="rh-cdot">·</span>');

  el.innerHTML = `
    <div class="rh-top">
      <div class="rh-left">
        <h1 class="rh-name">${name}</h1>
        <div class="rh-contact-row">${contactRow}</div>
        ${tagline ? `<div class="rh-tagline"><i class="bi bi-mortarboard-fill"></i>${tagline}</div>` : ''}
      </div>
      <div class="rh-right">${avatarHtml}</div>
    </div>
  `;

  // Topbar
  const tbName = document.getElementById('topbar-name');
  if (tbName) tbName.textContent = name;
  const tbGh = document.getElementById('topbar-github');
  if (tbGh) tbGh.href = github;

  // Page title
  document.title = cfg[`page_title_${lang}`] || cfg['page_title'] || name;
}

/* ---------- Build section ---------- */
function buildSection(key, html, cfg, lang) {
  const label = cfg[`section_${key}_${lang}`] || cfg[`section_${key}`] || key.toUpperCase();
  const icon  = (SECTION_DEFS[key] || {}).icon || 'bi-circle-fill';

  const sec = document.createElement('section');
  sec.className = 'resume-section';
  sec.id = `sec-${key}`;

  const heading = document.createElement('h2');
  heading.className = 'sec-title';
  heading.innerHTML = `<i class="bi ${icon} sec-icon"></i>${label}`;

  const body = document.createElement('div');
  body.className = 'sec-body';
  body.innerHTML = html;
  postProcess(body);

  sec.appendChild(heading);
  sec.appendChild(body);
  return sec;
}

/* ---------- Load all sections ---------- */
async function loadSections(lang) {
  const sections = CONFIG['sections'] || Object.keys(SECTION_DEFS);
  const main = document.getElementById('resume-main');
  if (!main) return;
  main.innerHTML = '<p class="loading-hint">加载中…</p>';

  const results = await Promise.all(
    sections.map(async (key, idx) => {
      try {
        const md  = await fetchText(`${CONTENT_DIR}${lang}/${key}.md`);
        const sec = buildSection(key, renderMd(md), CONFIG, lang);
        return { idx, sec };
      } catch(e) {
        console.warn(`[resume] Missing: contents/${lang}/${key}.md`);
        return null;
      }
    })
  );

  main.innerHTML = '';
  results
    .filter(Boolean)
    .sort((a, b) => a.idx - b.idx)
    .forEach(({ sec }) => main.appendChild(sec));

  if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise();
}

/* ---------- Footer ---------- */
function buildFooter(cfg, lang) {
  const ft = document.getElementById('footer-text');
  if (ft) ft.innerHTML = cfg[`copyright_${lang}`] || cfg['copyright'] || '';
}

/* ---------- Language toggle ---------- */
function initLangToggle() {
  const btn = document.getElementById('langToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    CURRENT_LANG = CURRENT_LANG === 'zh' ? 'en' : 'zh';
    btn.textContent = CURRENT_LANG === 'zh' ? 'EN' : '中文';
    document.documentElement.lang = CURRENT_LANG;
    buildHeader(CONFIG, CURRENT_LANG);
    buildFooter(CONFIG, CURRENT_LANG);
    loadSections(CURRENT_LANG);
  });
}

/* ---------- Boot ---------- */
window.addEventListener('DOMContentLoaded', async () => {
  initLangToggle();
  try {
    const raw = await fetchText(CONTENT_DIR + CONFIG_FILE);
    CONFIG = jsyaml.load(raw);
    CURRENT_LANG = CONFIG['default_lang'] || 'zh';
    const btn = document.getElementById('langToggle');
    if (btn) btn.textContent = CURRENT_LANG === 'zh' ? 'EN' : '中文';
    document.documentElement.lang = CURRENT_LANG;
    buildHeader(CONFIG, CURRENT_LANG);
    buildFooter(CONFIG, CURRENT_LANG);
    await loadSections(CURRENT_LANG);
  } catch(e) {
    console.error('[resume] Boot error:', e);
    const m = document.getElementById('resume-main');
    if (m) m.innerHTML = `<p style="color:red;padding:20px">加载失败：${e.message}</p>`;
  }
});
