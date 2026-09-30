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
function postProcess(container, key) {
  // 注意：此处 container 尚未插入 DOM，closest() 查不到父级 section，
  // 因此必须用 section key 判断，不能靠 closest。
  const isEducation = key === 'education';

  container.querySelectorAll('h3').forEach(h3 => {
    const div = document.createElement('div');
    div.className = isEducation ? 'entry-bar entry-bar--plain' : 'entry-bar';
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
  const email      = cfg['email']            || '';
  const phone      = cfg['phone']            || '';
  const location   = cfg['location']         || '';
  const avatarUrl  = cfg['avatar_url']       || '';
  const summary    = cfg[`summary_${lang}`]  || cfg['summary'] || '';

  const el = document.getElementById('resume-header');
  if (!el) return;

  // Avatar: real image or placeholder box.
  // 原图未裁切，宽度由 .rh-avatar 控制，height:auto 保持 2:3 原始比例。
  // 这里不写 width/height 属性，避免与 CSS 冲突而拉伸照片。
  const avatarHtml = avatarUrl
    ? `<img class="rh-avatar" src="${avatarUrl}" alt="avatar" />`
    : `<div class="rh-avatar rh-avatar-placeholder"><i class="bi bi-person-fill"></i></div>`;

  // Contact row items: phone | email | location
  const items = [];
  if (phone)      items.push(`<span class="rh-ci"><i class="bi bi-telephone-fill"></i>${phone}</span>`);
  if (email)      items.push(`<span class="rh-ci"><i class="bi bi-envelope-fill"></i><a href="mailto:${email}">${email}</a></span>`);
  if (location)   items.push(`<span class="rh-ci"><i class="bi bi-geo-alt-fill"></i>${location}</span>`);
  const contactRow = items.join('<span class="rh-cdot">·</span>');

  el.innerHTML = `
    <div class="rh-top">
      <div class="rh-left">
        <h1 class="rh-name">${name}</h1>
        <div class="rh-contact-row">${contactRow}</div>
        ${summary ? `<div class="rh-summary">${summary}</div>` : ''}
      </div>
      <div class="rh-right">${avatarHtml}</div>
    </div>
  `;

  // Topbar
  const tbName = document.getElementById('topbar-name');
  if (tbName) tbName.textContent = name;

  // Page title
  document.title = cfg[`page_title_${lang}`] || cfg['page_title'] || name;
}

/* ---------- 标记「强调条目」 ----------
   对含 <em>（斜体）的条目加 .is-emph，用于把「论文条目」从奖项的
   年份对齐网格（.sec-body--awards > ul > li:not(.is-emph)）中排除。

   ⚠️ 依赖：contents/{zh,en}/awards.md 里论文那一条必须保留 *斜体* 标记
   （markdown 单星号），否则这里判不出来，论文会被当成奖项套上两列网格。
   论文的「SCI 一区 | 第一作者」为与奖项保持一致的正文色而不加粗 —— 
   本函数只依赖斜体，与字重无关。

   注意：不要改用 li:not(:has(em)) 当选择器 —— 那会命中全文档所有
   列表项，把工作经历/技能的要点也套上两列网格。 */
function markEmphasisItems(body) {
  body.querySelectorAll(':scope > ul > li').forEach(li => {
    if (li.querySelector('em')) li.classList.add('is-emph');
  });
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
  // 带上 section key，便于按区块写样式（如 .sec-body--awards）
  body.className = `sec-body sec-body--${key}`;
  body.innerHTML = html;
  markEmphasisItems(body);
  postProcess(body, key);

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

/* ---------- Export: PDF / PNG ---------- */
function exportFileName(ext) {
  const name = (CONFIG[`name_${CURRENT_LANG}`] || CONFIG['name'] || 'resume').replace(/\s+/g, '');
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${name}_简历_${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}.${ext}`;
}

/* PDF：走浏览器原生打印，在「另存为 PDF」里输出的矢量文字可选中、可搜索。
   版面由 main.css 的 @media print 控制（隐藏顶栏、去阴影、A4 边距）。 */
function exportPdf() {
  window.print();
}

/* PNG：用 html2canvas 把简历整块截成长图 */
async function exportPng(btn) {
  if (!window.html2canvas) {
    alert('图片导出库未加载，请检查 static/js/html2canvas.min.js');
    return;
  }
  const target = document.getElementById('resume-wrap');
  if (!target) return;

  const label = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.textContent = '生成中…'; }

  try {
    const canvas = await window.html2canvas(target, {
      backgroundColor: '#ffffff',
      scale: 2,                 // 2 倍图，文字更清晰
      useCORS: true,
      logging: false,
      windowWidth: target.scrollWidth,
      windowHeight: target.scrollHeight,
    });

    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    if (!blob) throw new Error('canvas.toBlob 返回空');

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName('png');
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    console.error('[resume] PNG 导出失败:', e);
    alert('图片导出失败：' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = label; }
  }
}

function initExport() {
  const pdf = document.getElementById('btnPdf');
  const png = document.getElementById('btnPng');
  if (pdf) pdf.addEventListener('click', exportPdf);
  if (png) png.addEventListener('click', () => exportPng(png));
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
    loadSections(CURRENT_LANG);
  });
}

/* ---------- Boot ---------- */
window.addEventListener('DOMContentLoaded', async () => {
  initLangToggle();
  initExport();
  try {
    const raw = await fetchText(CONTENT_DIR + CONFIG_FILE);
    CONFIG = jsyaml.load(raw);
    CURRENT_LANG = CONFIG['default_lang'] || 'zh';
    const btn = document.getElementById('langToggle');
    if (btn) btn.textContent = CURRENT_LANG === 'zh' ? 'EN' : '中文';
    document.documentElement.lang = CURRENT_LANG;
    buildHeader(CONFIG, CURRENT_LANG);
    await loadSections(CURRENT_LANG);
  } catch(e) {
    console.error('[resume] Boot error:', e);
    const m = document.getElementById('resume-main');
    if (m) m.innerHTML = `<p style="color:red;padding:20px">加载失败：${e.message}</p>`;
  }
});
