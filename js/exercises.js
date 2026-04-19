/* Exercise renderers + validators.
   Each renderer gets (container, lesson, onComplete). It owns its DOM and calls onComplete(true|false) to mark state. */

const Exercises = {};

/* -------- helpers -------- */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) if (c != null) node.append(c.nodeType ? c : document.createTextNode(c));
  return node;
}
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function feedbackEl() { return el('div', { class: 'exercise-feedback', role: 'status' }); }
function setFeedback(node, ok, msg) { node.textContent = msg; node.className = `exercise-feedback show ${ok ? 'ok' : 'bad'}`; }
function clearFeedback(node) { node.className = 'exercise-feedback'; node.textContent = ''; }

/* -------- 1. file-tree -------- */
Exercises['file-tree'] = function (container, lesson, onComplete) {
  const cfg = lesson.exercise;
  const tree = [];
  const treeNode = el('div', { class: 'filetree' });
  const emptyHint = el('div', { class: 'filetree-empty' }, `${cfg.folderName}/  (empty — add files from the palette below)`);
  const paletteNode = el('div', { class: 'file-palette' });
  const fb = feedbackEl();
  const actions = el('div', { class: 'exercise-actions' });
  const checkBtn = el('button', { class: 'btn-primary' }, 'Check folder');
  const resetBtn = el('button', { class: 'btn-ghost' }, 'Reset');
  actions.append(checkBtn, resetBtn);

  function renderTree() {
    treeNode.innerHTML = '';
    treeNode.append(el('div', { class: 'filetree-row' }, [el('span', { class: 'icon' }, '📁'), `${cfg.folderName}/`]));
    if (tree.length === 0) { treeNode.append(el('div', { style: 'margin-left: 1.2rem; color: #8a8275; font-style: italic; font-size: 0.85rem; margin-top: 0.3rem;' }, 'empty — add files from the palette')); return; }
    for (const [idx, item] of tree.entries()) {
      const row = el('div', { class: 'filetree-row', style: 'margin-left: 1.2rem;' }, [
        el('span', { class: 'icon' }, item.isFile ? '📄' : '📁'),
        item.label,
        el('button', { class: 'remove', title: 'Remove', onclick: () => { tree.splice(idx, 1); renderTree(); clearFeedback(fb); } }, '×')
      ]);
      treeNode.append(row);
    }
  }
  function renderPalette() {
    paletteNode.innerHTML = '';
    for (const p of cfg.palette) {
      const btn = el('button', { class: 'palette-item', onclick: () => {
        if (tree.find(t => t.label === p.label)) return;
        tree.push(p); renderTree(); clearFeedback(fb);
      }}, `+ ${p.label}`);
      paletteNode.append(btn);
    }
  }

  checkBtn.addEventListener('click', () => {
    // check required
    for (const req of cfg.require) {
      if (!tree.find(t => t.label === req)) { setFeedback(fb, false, cfg.feedback.missingRequired); onComplete(false); return; }
    }
    // check forbidden
    const forbidden = tree.find(t => t.valid === false);
    if (forbidden) { setFeedback(fb, false, cfg.feedback.hasForbidden(forbidden.reason)); onComplete(false); return; }
    setFeedback(fb, true, cfg.feedback.ok); onComplete(true);
  });
  resetBtn.addEventListener('click', () => { tree.length = 0; renderTree(); clearFeedback(fb); onComplete(false); });

  container.append(treeNode, paletteNode, actions, fb);
  renderTree(); renderPalette();
};

/* -------- 2. categorize (drag-drop bins) -------- */
function buildDnD(container, lesson, onComplete) {
  const cfg = lesson.exercise;
  const state = Object.fromEntries(cfg.bins.map(b => [b.id, []]));
  state.pool = shuffle(cfg.items.map((it, i) => ({ ...it, idx: i })));
  const fb = feedbackEl();
  const actions = el('div', { class: 'exercise-actions' });
  const checkBtn = el('button', { class: 'btn-primary' }, 'Check answers');
  const resetBtn = el('button', { class: 'btn-ghost' }, 'Reset');
  actions.append(checkBtn, resetBtn);

  const area = el('div', { class: 'dnd-area' });
  const poolSide = el('div');
  const binSide = el('div', { class: 'dnd-bins' });
  area.append(poolSide, binSide);

  let selectedIdx = null;

  function render() {
    poolSide.innerHTML = '';
    const pool = el('div', { class: 'dnd-pool' }, [el('h4', {}, 'Unsorted')]);
    for (const it of state.pool) {
      const n = el('div', { class: 'dnd-item' + (selectedIdx === it.idx ? ' selected' : ''), draggable: 'true', 'data-idx': it.idx }, it.text);
      attachItemHandlers(n, it);
      pool.append(n);
    }
    poolSide.append(pool);

    binSide.innerHTML = '';
    for (const bin of cfg.bins) {
      const items = state[bin.id];
      const binNode = el('div', { class: 'dnd-bin', 'data-bin': bin.id }, [
        el('span', { class: 'dnd-bin-label' }, bin.label),
        el('div', { class: 'dnd-bin-title' }, bin.title),
        el('div', { class: 'dnd-bin-hint' }, bin.hint),
      ]);
      for (const it of items) {
        const status = it._checked ? (it.answer === bin.id ? ' correct' : ' wrong') : '';
        const n = el('div', { class: 'dnd-item' + status + (selectedIdx === it.idx ? ' selected' : ''), draggable: 'true', 'data-idx': it.idx }, it.text);
        attachItemHandlers(n, it);
        binNode.append(n);
      }
      attachBinHandlers(binNode, bin.id);
      binSide.append(binNode);
    }
    attachPoolHandlers(pool);
  }

  function attachItemHandlers(n, it) {
    n.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', it.idx); n.classList.add('dragging'); });
    n.addEventListener('dragend', () => n.classList.remove('dragging'));
    n.addEventListener('click', () => {
      selectedIdx = (selectedIdx === it.idx) ? null : it.idx; render();
    });
  }
  function attachBinHandlers(binNode, binId) {
    binNode.addEventListener('dragover', (e) => { e.preventDefault(); binNode.classList.add('drag-over'); });
    binNode.addEventListener('dragleave', () => binNode.classList.remove('drag-over'));
    binNode.addEventListener('drop', (e) => { e.preventDefault(); binNode.classList.remove('drag-over'); move(+e.dataTransfer.getData('text/plain'), binId); });
    binNode.addEventListener('click', (e) => {
      if (selectedIdx == null) return;
      if (e.target.classList.contains('dnd-item')) return;
      move(selectedIdx, binId); selectedIdx = null;
    });
  }
  function attachPoolHandlers(pool) {
    pool.addEventListener('dragover', (e) => e.preventDefault());
    pool.addEventListener('drop', (e) => { e.preventDefault(); move(+e.dataTransfer.getData('text/plain'), 'pool'); });
  }
  function move(idx, dest) {
    let item, from;
    for (const key of ['pool', ...cfg.bins.map(b => b.id)]) {
      const arr = state[key]; const pos = arr.findIndex(x => x.idx === idx);
      if (pos >= 0) { [item] = arr.splice(pos, 1); from = key; break; }
    }
    if (!item) return;
    item._checked = false;
    state[dest].push(item);
    clearFeedback(fb); render();
  }

  checkBtn.addEventListener('click', () => {
    if (state.pool.length > 0) { setFeedback(fb, false, `${state.pool.length} still unsorted. Put each one in a bin.`); onComplete(false); return; }
    let wrong = 0;
    for (const bin of cfg.bins) for (const it of state[bin.id]) { it._checked = true; if (it.answer !== bin.id) wrong++; }
    render();
    if (wrong === 0) { setFeedback(fb, true, cfg.feedback.ok); onComplete(true); }
    else { setFeedback(fb, false, cfg.feedback.bad(wrong)); onComplete(false); }
  });
  resetBtn.addEventListener('click', () => {
    for (const bin of cfg.bins) state[bin.id].length = 0;
    state.pool = shuffle(cfg.items.map((it, i) => ({ ...it, idx: i })));
    clearFeedback(fb); render(); onComplete(false);
  });

  container.append(area, actions, fb);
  render();
}
Exercises['categorize'] = buildDnD;
Exercises['sort-files'] = buildDnD;

/* -------- 3. fix-names -------- */
Exercises['fix-names'] = function (container, lesson, onComplete) {
  const cfg = lesson.exercise;
  const fb = feedbackEl();
  const inputs = [];
  const wrap = el('div');

  for (const [i, it] of cfg.items.entries()) {
    const sub = el('div', { class: 'subtask' });
    sub.append(el('div', { class: 'subtask-prompt' }, it.prompt));
    sub.append(el('div', { class: 'muted small' }, [el('span', {}, 'Broken: '), el('code', {}, it.broken)]));
    const inp = el('input', { type: 'text', placeholder: 'Type the fix…', autocomplete: 'off', spellcheck: 'false' });
    sub.append(el('div', { class: 'field' }, [inp]));
    sub.append(el('div', { class: 'hint' }, it.hint));
    wrap.append(sub);
    inputs.push({ inp, it, sub });
  }
  const actions = el('div', { class: 'exercise-actions' });
  const checkBtn = el('button', { class: 'btn-primary' }, 'Check answers');
  const resetBtn = el('button', { class: 'btn-ghost' }, 'Reset');
  actions.append(checkBtn, resetBtn);

  checkBtn.addEventListener('click', () => {
    let wrong = 0;
    for (const { inp, it, sub } of inputs) {
      const v = inp.value.trim();
      const norm = (s) => s.trim().toLowerCase();
      const ok = it.acceptAny ? it.acceptAny(v) : norm(v) === norm(it.correct);
      sub.className = 'subtask ' + (ok ? 'correct' : 'wrong');
      if (!ok) wrong++;
    }
    if (wrong === 0) { setFeedback(fb, true, cfg.feedback.ok); onComplete(true); }
    else { setFeedback(fb, false, cfg.feedback.bad(wrong)); onComplete(false); }
  });
  resetBtn.addEventListener('click', () => { inputs.forEach(({ inp, sub }) => { inp.value = ''; sub.className = 'subtask'; }); clearFeedback(fb); onComplete(false); });

  container.append(wrap, actions, fb);
};

/* -------- 4. rewrite-descriptions -------- */
Exercises['rewrite-descriptions'] = function (container, lesson, onComplete) {
  const cfg = lesson.exercise;
  const fb = feedbackEl();
  const wrap = el('div');
  const entries = [];

  for (const it of cfg.items) {
    const sub = el('div', { class: 'subtask' });
    sub.append(el('div', { class: 'subtask-prompt' }, `Rewrite this:`));
    sub.append(el('div', { class: 'example example-bad', style: 'margin: 0.4rem 0 0.6rem;' }, it.broken));
    sub.append(el('div', { class: 'small muted', style: 'margin-bottom: 0.5rem;' }, `Context: ${it.skill}`));
    const ta = el('textarea', { placeholder: 'description: [what it does] + [when to use it] + [trigger phrases]' });
    sub.append(ta);
    const live = el('div', { class: 'small muted', style: 'margin-top: 0.4rem;' });
    sub.append(live);
    wrap.append(sub);
    entries.push({ it, ta, sub, live });
    ta.addEventListener('input', () => updateLive(ta, live));
  }
  function updateLive(ta, live) {
    const v = ta.value.trim();
    const issues = evalDescription(v);
    live.textContent = issues.length === 0 ? '✓ Reads well.' : `Missing: ${issues.join(', ')}`;
    live.style.color = issues.length === 0 ? 'var(--ok)' : 'var(--muted)';
  }
  function evalDescription(v) {
    const issues = [];
    if (v.length < 80) issues.push('more detail (under 80 chars)');
    if (v.length > 1024) issues.push('too long (>1024 chars)');
    if (/[<>]/.test(v)) issues.push('XML angle brackets forbidden');
    const hasUseWhen = /\buse\s+when\b|\bwhen\s+user\b|\bwhen\s+someone\b|\bwhen\s+the\s+user\b|\btriggers?\s+on\b/i.test(v);
    if (!hasUseWhen) issues.push('"Use when" phrase');
    const quoted = (v.match(/"[^"]{2,}"/g) || []).length;
    const triggerVerbs = /\b(sprint|tasks?|tickets?|onboard|setup|create|generate|analyz|review|plan|fetch|build|design|deploy|process|compliance|workspace|document|report)\b/gi;
    const verbHits = (v.match(triggerVerbs) || []).length;
    if (quoted < 1 && verbHits < 3) issues.push('specific trigger phrases');
    return issues;
  }

  const actions = el('div', { class: 'exercise-actions' });
  const checkBtn = el('button', { class: 'btn-primary' }, 'Check answers');
  const resetBtn = el('button', { class: 'btn-ghost' }, 'Reset');
  actions.append(checkBtn, resetBtn);

  checkBtn.addEventListener('click', () => {
    const allIssues = [];
    for (const { ta, sub, it } of entries) {
      const issues = evalDescription(ta.value.trim());
      sub.className = 'subtask ' + (issues.length === 0 ? 'correct' : 'wrong');
      if (issues.length) allIssues.push(`${it.id}: ${issues.join(', ')}`);
    }
    if (allIssues.length === 0) { setFeedback(fb, true, cfg.feedback.ok); onComplete(true); }
    else { setFeedback(fb, false, cfg.feedback.bad(allIssues.join(' · '))); onComplete(false); }
  });
  resetBtn.addEventListener('click', () => { entries.forEach(({ ta, sub, live }) => { ta.value = ''; sub.className = 'subtask'; live.textContent = ''; }); clearFeedback(fb); onComplete(false); });

  container.append(wrap, actions, fb);
};

/* -------- 5. write-triggers -------- */
Exercises['write-triggers'] = function (container, lesson, onComplete) {
  const cfg = lesson.exercise;
  const fb = feedbackEl();

  const wrap = el('div');
  const shouldBox = el('div', { class: 'subtask' }, [el('div', { class: 'subtask-prompt' }, `✓ Three queries that should trigger the skill`)]);
  const shouldInputs = [];
  for (let i = 0; i < cfg.shouldCount; i++) {
    const inp = el('input', { type: 'text', placeholder: `Should trigger — query ${i+1}` });
    shouldBox.append(el('div', { class: 'field' }, [inp]));
    shouldInputs.push(inp);
  }
  const shouldNotBox = el('div', { class: 'subtask' }, [el('div', { class: 'subtask-prompt' }, `✗ Three queries that should NOT trigger the skill`)]);
  const shouldNotInputs = [];
  for (let i = 0; i < cfg.shouldNotCount; i++) {
    const inp = el('input', { type: 'text', placeholder: `Should NOT trigger — query ${i+1}` });
    shouldNotBox.append(el('div', { class: 'field' }, [inp]));
    shouldNotInputs.push(inp);
  }
  wrap.append(shouldBox, shouldNotBox);

  const actions = el('div', { class: 'exercise-actions' });
  const checkBtn = el('button', { class: 'btn-primary' }, 'Check answers');
  const resetBtn = el('button', { class: 'btn-ghost' }, 'Reset');
  actions.append(checkBtn, resetBtn);

  checkBtn.addEventListener('click', () => {
    const issues = [];
    const shouldVals = shouldInputs.map(i => i.value.trim());
    const shouldNotVals = shouldNotInputs.map(i => i.value.trim());
    if (shouldVals.some(v => v.length < 10)) issues.push('at least 10 chars per "should" query');
    if (shouldNotVals.some(v => v.length < 10)) issues.push('at least 10 chars per "should NOT" query');
    const shouldHasCue = shouldVals.every(v => cfg.bannedTermsInShouldNot.some(t => v.toLowerCase().includes(t)) || /\b(review|check|audit|verify|scan|validate|analyz|report)\b/i.test(v));
    if (!shouldHasCue) issues.push('"should" queries need domain cues (compliance, review, audit, etc.)');
    const shouldNotClean = shouldNotVals.every(v => !cfg.bannedTermsInShouldNot.some(t => v.toLowerCase().includes(t)));
    if (!shouldNotClean) issues.push('"should NOT" queries accidentally contain the skill\'s own domain terms');
    if (issues.length === 0) { setFeedback(fb, true, cfg.feedback.ok); onComplete(true); }
    else { setFeedback(fb, false, cfg.feedback.bad(issues.join(' · '))); onComplete(false); }
  });
  resetBtn.addEventListener('click', () => { [...shouldInputs, ...shouldNotInputs].forEach(i => i.value = ''); clearFeedback(fb); onComplete(false); });

  container.append(wrap, actions, fb);
};

/* -------- 6. rewrite-positioning -------- */
Exercises['rewrite-positioning'] = function (container, lesson, onComplete) {
  const cfg = lesson.exercise;
  const fb = feedbackEl();
  const ta = el('textarea', { placeholder: 'Rewrite the blurb — focus on what the user gets, how much time it saves, what it replaces.', rows: '5' });
  const live = el('div', { class: 'small muted', style: 'margin-top: 0.4rem;' });

  ta.addEventListener('input', () => { update(); });
  function evalBlurb(v) {
    const issues = [];
    if (v.length < 60) issues.push('too short (under 60 chars)');
    if (v.length > 400) issues.push('too long (over 400 chars)');
    const outcomeWords = /\b(minutes|seconds|instead of|without|in one|enables|so you can|faster|automated|save)\b/i;
    if (!outcomeWords.test(v)) issues.push('no outcome language ("instead of", "minutes", "enables", "without")');
    const jargon = /\b(YAML|Markdown|frontmatter|folder|entity|MCP server tools|schema|JSON|Claude Agent)\b/;
    if (jargon.test(v)) issues.push('drop the implementation jargon');
    return issues;
  }
  function update() {
    const issues = evalBlurb(ta.value.trim());
    live.textContent = issues.length === 0 ? '✓ Outcome-led.' : `Still need: ${issues.join(', ')}`;
    live.style.color = issues.length === 0 ? 'var(--ok)' : 'var(--muted)';
  }
  const actions = el('div', { class: 'exercise-actions' });
  const checkBtn = el('button', { class: 'btn-primary' }, 'Check answer');
  const resetBtn = el('button', { class: 'btn-ghost' }, 'Reset');
  actions.append(checkBtn, resetBtn);

  checkBtn.addEventListener('click', () => {
    const issues = evalBlurb(ta.value.trim());
    if (issues.length === 0) { setFeedback(fb, true, cfg.feedback.ok); onComplete(true); }
    else { setFeedback(fb, false, cfg.feedback.bad(issues.join(', '))); onComplete(false); }
  });
  resetBtn.addEventListener('click', () => { ta.value = ''; live.textContent = ''; clearFeedback(fb); onComplete(false); });

  container.append(el('div', { class: 'field' }, [ta]), live, actions, fb);
};

/* -------- 7. match-patterns -------- */
Exercises['match-patterns'] = function (container, lesson, onComplete) {
  const cfg = lesson.exercise;
  const fb = feedbackEl();
  const wrap = el('div');

  const rows = cfg.items.map((it, i) => {
    const row = el('div', { class: 'match-row' });
    row.append(el('div', { class: 'match-prompt' }, it.prompt));
    const select = el('select', {});
    select.append(el('option', { value: '' }, 'Select a pattern…'));
    for (const p of cfg.patterns) select.append(el('option', { value: p.id }, p.label));
    row.append(select);
    wrap.append(row);
    return { row, select, it };
  });

  const actions = el('div', { class: 'exercise-actions' });
  const checkBtn = el('button', { class: 'btn-primary' }, 'Check answers');
  const resetBtn = el('button', { class: 'btn-ghost' }, 'Reset');
  actions.append(checkBtn, resetBtn);

  checkBtn.addEventListener('click', () => {
    let wrong = 0;
    for (const { row, select, it } of rows) {
      const ok = select.value === it.answer;
      row.style.background = ok ? 'rgba(191, 218, 191, 0.25)' : 'rgba(242, 188, 181, 0.25)';
      if (!ok) wrong++;
    }
    if (wrong === 0) { setFeedback(fb, true, cfg.feedback.ok); onComplete(true); }
    else { setFeedback(fb, false, cfg.feedback.bad(wrong)); onComplete(false); }
  });
  resetBtn.addEventListener('click', () => { rows.forEach(({ row, select }) => { select.value = ''; row.style.background = ''; }); clearFeedback(fb); onComplete(false); });

  container.append(wrap, actions, fb);
};

/* -------- 8. debug-skill -------- */
Exercises['debug-skill'] = function (container, lesson, onComplete) {
  const cfg = lesson.exercise;
  const fb = feedbackEl();
  const wrap = el('div');

  const rows = cfg.items.map((it, i) => {
    const sub = el('div', { class: 'subtask' });
    sub.append(el('div', { class: 'subtask-prompt' }, `Snippet ${i+1}:`));
    sub.append(el('pre', {}, [el('code', {}, it.snippet)]));
    const select = el('select', {});
    select.append(el('option', { value: '' }, 'Diagnose the issue…'));
    for (const opt of cfg.options) select.append(el('option', { value: opt.id }, opt.label));
    sub.append(el('div', { class: 'field' }, [select]));
    sub.append(el('div', { class: 'hint' }, it.hint));
    wrap.append(sub);
    return { sub, select, it };
  });

  const actions = el('div', { class: 'exercise-actions' });
  const checkBtn = el('button', { class: 'btn-primary' }, 'Check answers');
  const resetBtn = el('button', { class: 'btn-ghost' }, 'Reset');
  actions.append(checkBtn, resetBtn);

  checkBtn.addEventListener('click', () => {
    let wrong = 0;
    for (const { sub, select, it } of rows) {
      const ok = select.value === it.answer;
      sub.className = 'subtask ' + (ok ? 'correct' : 'wrong');
      if (!ok) wrong++;
    }
    if (wrong === 0) { setFeedback(fb, true, cfg.feedback.ok); onComplete(true); }
    else { setFeedback(fb, false, cfg.feedback.bad(wrong)); onComplete(false); }
  });
  resetBtn.addEventListener('click', () => { rows.forEach(({ sub, select }) => { select.value = ''; sub.className = 'subtask'; }); clearFeedback(fb); onComplete(false); });

  container.append(wrap, actions, fb);
};

window.Exercises = Exercises;
