/* App bootstrap: router, sidebar, content render, progress, localStorage, dialog. */

/* glossary for hover-tooltips on technical terms */
const GLOSSARY = {
  'YAML frontmatter': 'The metadata block at the top of SKILL.md — wrapped between --- delimiters. Tells Claude what the skill is called and when to load it. Always-in-context.',
  'YAML': 'A human-readable data format used for config files. Skills use it for the metadata block at the top of SKILL.md.',
  'frontmatter': 'The metadata block at the top of SKILL.md — wrapped between --- delimiters. Claude reads it to decide whether a skill applies.',
  'MCP server': 'A running service that implements the Model Context Protocol — exposing a specific app\'s tools (Linear, Notion, Sentry, Figma, etc.) to Claude.',
  'MCP': 'Model Context Protocol. The open standard Anthropic publishes so Claude can talk to external tools and services.',
  'context': 'The working memory of a Claude conversation. Everything loaded — system prompt, files, prior messages — competes for a limited amount of space.',
  'progressive disclosure': 'Loading information in tiers: metadata always, main instructions only when relevant, linked files only when needed. Keeps skills efficient.',
  'system prompt': 'The hidden instructions Claude receives at the start of every conversation. Skill metadata (frontmatter) lives here.',
  'kebab-case': 'Lowercase words joined by hyphens: my-skill-name. Required format for skill folder names.',
  'Markdown': 'A lightweight text-formatting syntax. The body of SKILL.md is written in Markdown.',
  'Claude Code': 'Anthropic\'s command-line tool. Skills installed here live in ~/.claude/skills/.',
  'Claude.ai': 'The chat interface at claude.ai. Skills get installed via Settings → Capabilities → Skills.',
  'skills API': 'The programmatic surface for managing skills, via the Messages API\'s container.skills parameter.',
  'tool calls': 'When Claude invokes an external tool (e.g. an MCP tool). Counted as a metric during skill performance testing.',
  'tokens': 'The units of text Claude reads and produces. Longer skills cost more tokens to keep in context.',
  'trigger phrases': 'The words or patterns in a user\'s message that tell Claude a skill is relevant. Missing them = skill never loads.',
  'negative triggers': 'Phrases in a description that tell Claude when NOT to use the skill. Fix for over-triggering.',
  'composability': 'The ability for multiple skills to coexist without interfering with each other.',
  'portability': 'The same skill working on Claude.ai, Claude Code, and the API without modification.',
  'skill-creator': 'A built-in Anthropic skill that helps you design, review, and refine other skills.',
  'Agent SDK': 'Anthropic\'s SDK for building custom agents. Supports skills out of the box.',
};

function wireGlossary(root) {
  const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
  for (const term of terms) wrapTermOnce(root, term);
}
function wrapTermOnce(root, term) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let p = node.parentNode;
      while (p && p !== root.parentNode) {
        const tag = p.tagName;
        if (tag === 'CODE' || tag === 'PRE' || tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
        if (p.classList && (p.classList.contains('term') || p.classList.contains('exercise-kicker') || p.classList.contains('chapter-tag') || p.classList.contains('example-label'))) return NodeFilter.FILTER_REJECT;
        p = p.parentNode;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?<![\\w-])(${escaped})(?![\\w-])`);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue;
    const m = re.exec(text);
    if (!m) continue;
    const before = text.slice(0, m.index);
    const matched = m[1];
    const after = text.slice(m.index + matched.length);
    const span = document.createElement('span');
    span.className = 'term';
    span.setAttribute('tabindex', '0');
    span.setAttribute('data-term', term);
    span.textContent = matched;
    const tip = document.createElement('span');
    tip.className = 'term-tip';
    tip.textContent = GLOSSARY[term];
    span.appendChild(tip);
    span.addEventListener('click', (e) => { e.stopPropagation(); span.classList.toggle('open'); });
    const parent = node.parentNode;
    if (before) parent.insertBefore(document.createTextNode(before), node);
    parent.insertBefore(span, node);
    if (after) parent.insertBefore(document.createTextNode(after), node);
    parent.removeChild(node);
    return;
  }
}
document.addEventListener('click', (e) => {
  if (e.target.closest('.term')) return;
  document.querySelectorAll('.term.open').forEach(n => n.classList.remove('open'));
});

(function () {
  const STORAGE_KEY = 'skills-course-progress';
  const CAPSTONE_KEY = 'skills-course-capstone';

  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');

  const state = loadProgress();

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { completed: [] };
      const obj = JSON.parse(raw);
      return { completed: Array.isArray(obj.completed) ? obj.completed : [] };
    } catch { return { completed: [] }; }
  }
  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: state.completed })); } catch {}
  }
  function isDone(num) { return state.completed.includes(num); }
  function markDone(num) {
    if (!state.completed.includes(num)) { state.completed.push(num); saveProgress(); renderSidebar(); renderProgressBar(); }
  }
  function unmarkDone(num) {
    state.completed = state.completed.filter(n => n !== num);
    saveProgress(); renderSidebar(); renderProgressBar();
  }

  function renderProgressBar() {
    const total = LESSONS.length;
    const done = state.completed.length;
    progressFill.style.width = `${(done / total) * 100}%`;
    progressLabel.textContent = `${done} / ${total}`;
  }

  function renderSidebar() {
    sidebar.innerHTML = '';
    sidebar.append(el('h3', { class: 'sidebar-title' }, 'Course'));
    const ul = el('ul', { class: 'sidebar-list' });
    sidebar.append(ul);
    const hash = location.hash || '#/';
    const current = parseHash(hash);
    const homeItem = el('li', { class: 'sidebar-item' + (current.route === 'home' ? ' active' : ''), onclick: () => go('#/') }, [
      el('span', { class: 'sidebar-badge', style: 'background: var(--orange); color: white;' }, '✻'),
      el('span', { class: 'sidebar-text' }, 'Overview'),
    ]);
    ul.append(homeItem);
    for (const L of LESSONS) {
      const done = isDone(L.num);
      const active = current.route === 'lesson' && current.num === L.num;
      const li = el('li', { class: `sidebar-item${done ? ' done' : ''}${active ? ' active' : ''}`, onclick: () => go(`#/lesson/${L.num}`) }, [
        el('span', { class: 'sidebar-badge' }, done ? '' : String(L.num)),
        el('span', { class: 'sidebar-text' }, L.title),
      ]);
      ul.append(li);
    }
  }

  function parseHash(hash) {
    const m = /^#\/lesson\/(\d+)/.exec(hash);
    if (m) return { route: 'lesson', num: +m[1] };
    return { route: 'home' };
  }

  function go(hash) { location.hash = hash; }

  function render() {
    const route = parseHash(location.hash || '#/');
    if (route.route === 'home') renderHome();
    else renderLesson(route.num);
    renderSidebar();
    renderProgressBar();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function renderHome() {
    content.innerHTML = '';
    const hero = el('div', { class: 'hero' });
    hero.append(
      el('div', { class: 'chapter-tag', style: 'color: rgba(255,255,255,0.85); margin-bottom: 0.8rem;' }, [
        el('span', { class: 'chapter-tag-dot', style: 'background: white;' }),
        'An interactive course based on Anthropic\'s Complete Guide'
      ]),
      el('h1', {}, 'Claude repeats itself. Skills fix that.'),
      el('p', {}, 'This course turns Anthropic\'s 33-page guide into something you can actually do. Ten lessons. Nine hands-on exercises. One real skill at the end — yours to deploy to Claude.'),
      el('div', { class: 'hero-actions' }, [
        el('button', { class: 'btn-primary', onclick: () => go('#/lesson/1') }, state.completed.length > 0 ? 'Continue' : 'Start'),
        el('button', { class: 'btn-ghost', onclick: () => go(`#/lesson/${LESSONS.length}`) }, 'Jump to capstone'),
      ])
    );
    content.append(hero);

    const grid = el('div', { class: 'home-grid' });
    for (const L of LESSONS) {
      const card = el('div', { class: `home-card${isDone(L.num) ? ' done' : ''}`, style: `--tint: ${L.tint}`, onclick: () => go(`#/lesson/${L.num}`) }, [
        el('div', { class: 'home-card-num' }, `${String(L.num).padStart(2, '0')} · ${L.chapter}`),
        el('div', { class: 'home-card-title' }, L.title),
        el('div', { class: 'home-card-desc' }, cardDesc(L)),
      ]);
      grid.append(card);
    }
    content.append(grid);

    const notesBlock = el('div', { style: 'margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--line); color: var(--muted); font-size: 0.9rem;' }, [
      el('p', {}, 'Your progress is saved in your browser\'s local storage. It never leaves this device. Use Settings (top right) to export it as JSON if you want a backup or to move between machines.'),
      el('p', {}, 'Built from Anthropic\'s "The Complete Guide to Building Skills for Claude" (April 2026).')
    ]);
    content.append(notesBlock);
  }

  function cardDesc(L) {
    const desc = {
      1: 'What a skill is, what\'s in the folder, progressive disclosure.',
      2: 'Pin down use cases before writing anything. The three categories.',
      3: 'File and folder naming rules. What breaks a skill silently.',
      4: 'The description field — the one Claude reads to decide.',
      5: 'Instructions Claude will actually follow. Progressive disclosure in practice.',
      6: 'Triggering, functional, and performance testing.',
      7: 'How people install skills. And how to position yours.',
      8: 'The five shapes every skill takes. Pick the right one.',
      9: 'The six failure modes and how to diagnose each.',
      10: 'Build a real SKILL.md with a live validator. Download the .zip.',
    };
    return desc[L.num] || '';
  }

  function renderLesson(num) {
    const L = LESSONS.find(l => l.num === num);
    if (!L) { go('#/'); return; }

    content.innerHTML = '';

    const header = el('div', { class: 'lesson-header tinted', style: `--tint: ${L.tint}` });
    header.append(
      el('div', { class: 'chapter-tag' }, [el('span', { class: 'chapter-tag-dot', style: `background: ${L.tint}` }), L.chapter]),
      el('h1', {}, `${L.num}. ${L.title}`),
    );
    content.append(header);

    const body = el('div', { class: 'lesson-body', html: L.content });
    content.append(body);
    wireGlossary(body);

    // exercise
    const exBox = el('div', { class: 'exercise' });
    const briefNode = el('div', { class: 'exercise-instructions', html: L.exercise.brief || '' });
    exBox.append(
      el('div', { class: 'exercise-kicker' }, L.exercise.kicker || 'Exercise'),
      el('h3', {}, L.exercise.title),
      briefNode
    );
    content.append(exBox);
    wireGlossary(briefNode);

    const renderer = Exercises[L.exercise.type];
    if (renderer) {
      renderer(exBox, L, (success) => {
        if (success) markDone(L.num); else unmarkDone(L.num);
      });
    } else {
      exBox.append(el('p', { class: 'muted' }, `(Exercise type "${L.exercise.type}" not implemented.)`));
    }

    // nav
    const nav = el('div', { class: 'lesson-nav' });
    if (L.num > 1) nav.append(el('button', { class: 'btn-ghost', onclick: () => go(`#/lesson/${L.num - 1}`) }, '← Previous'));
    else nav.append(el('button', { class: 'btn-ghost', onclick: () => go('#/') }, '← Overview'));
    nav.append(el('div', { class: 'spacer' }));
    if (L.num < LESSONS.length) nav.append(el('button', { class: 'btn-primary', onclick: () => go(`#/lesson/${L.num + 1}`) }, 'Next →'));
    else nav.append(el('button', { class: 'btn-primary', onclick: () => go('#/') }, 'Finish →'));
    content.append(nav);
  }

  /* settings dialog */
  const dlg = document.getElementById('settingsDialog');
  document.getElementById('openSettings').addEventListener('click', () => dlg.showModal());
  document.getElementById('exportBtn').addEventListener('click', () => {
    const data = {
      progress: loadProgress(),
      capstone: (() => { try { return JSON.parse(localStorage.getItem(CAPSTONE_KEY) || '{}'); } catch { return {}; } })(),
      exportedAt: new Date().toISOString(),
      source: 'skills-course',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `skills-course-progress-${new Date().toISOString().slice(0,10)}.json`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
  });
  document.getElementById('importInput').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.progress && Array.isArray(data.progress.completed)) {
        state.completed = data.progress.completed;
        saveProgress();
      }
      if (data.capstone) {
        localStorage.setItem(CAPSTONE_KEY, JSON.stringify(data.capstone));
      }
      dlg.close();
      render();
      alert('Progress imported.');
    } catch (err) {
      alert('Import failed — is this a skills-course export file?');
    }
    e.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all progress and clear the capstone draft? This cannot be undone.')) return;
    state.completed = []; saveProgress();
    try { localStorage.removeItem(CAPSTONE_KEY); } catch {}
    dlg.close(); render();
  });

  window.addEventListener('hashchange', render);
  render();
})();
