/* Capstone builder — live SKILL.md authoring with validator + .zip download */

Exercises['capstone'] = function (container, lesson, onComplete) {
  const fb = feedbackEl();

  const state = loadDraft();

  const wrap = el('div', { class: 'capstone' });
  const form = el('div', { class: 'capstone-form' });
  const preview = el('div', { class: 'capstone-preview' });
  wrap.append(form, preview);

  // form fields
  const nameField = textField('Skill name', 'kebab-case, no spaces, no capitals, not starting with "claude" or "anthropic"', state.name, 'e.g. chicken-egg-tracker');
  const descField = textareaField('Description (required)', 'What it does + when to use it + trigger phrases. Under 1024 chars. No < or > brackets.', state.description, 'description: [what it does] + [when to use it] + [trigger phrases]');
  const authorField = textField('Author (optional)', 'Your name or handle.', state.author, 'e.g. anwar1808');
  const versionField = textField('Version (optional)', 'Start at 1.0.0 and bump as you iterate.', state.version, '1.0.0');
  const instructionsField = textareaField('Instructions (the body of SKILL.md)', 'Markdown. What Claude should do, step by step. Include examples and troubleshooting. Keep under 5,000 words.', state.instructions, '## Instructions\n\n### Step 1: [First major step]\nClear explanation of what happens.\n\n## Examples\n\n### Example 1: [common scenario]\nUser says: "..."\nActions: ...\nResult: ...\n\n## Troubleshooting\n\n### Error: [Common error message]\nCause: [why it happens]\nSolution: [how to fix]');

  form.append(nameField.wrap, descField.wrap, authorField.wrap, versionField.wrap, instructionsField.wrap);

  // preview
  const previewPre = el('pre', {}, [el('code', {})]);
  preview.append(el('h4', {}, `Preview · SKILL.md`), previewPre);

  // validator
  const validator = el('div', { class: 'validator' });
  preview.append(validator);

  // actions
  const actions = el('div', { class: 'exercise-actions' });
  const downloadBtn = el('button', { class: 'btn-primary', disabled: true }, 'Download as .zip');
  const copyBtn = el('button', { class: 'btn-secondary' }, 'Copy SKILL.md');
  const resetBtn = el('button', { class: 'btn-ghost' }, 'Reset capstone');
  actions.append(downloadBtn, copyBtn, resetBtn);

  function getState() {
    return {
      name: nameField.input.value.trim(),
      description: descField.input.value.trim(),
      author: authorField.input.value.trim(),
      version: versionField.input.value.trim(),
      instructions: instructionsField.input.value,
    };
  }

  function buildYAML(s) {
    let y = '---\n';
    y += `name: ${s.name || 'your-skill-name'}\n`;
    const descOneLine = (s.description || '[description]').replace(/\n+/g, ' ');
    y += `description: ${descOneLine}\n`;
    if (s.author || s.version) {
      y += `metadata:\n`;
      if (s.author) y += `  author: ${s.author}\n`;
      if (s.version) y += `  version: ${s.version}\n`;
    }
    y += '---\n';
    return y;
  }
  function buildMd(s) {
    const yaml = buildYAML(s);
    const body = (s.instructions || '').trim() || `# ${s.name || 'your-skill-name'}\n\n## Instructions\n\n(add your instructions here)`;
    return `${yaml}\n${body}\n`;
  }

  function validate(s) {
    const md = buildMd(s);
    const checks = [
      { id: 'name-present', label: 'Name present', pass: s.name.length > 0 },
      { id: 'name-kebab', label: 'Name is kebab-case (lowercase, hyphens, no spaces/caps/underscores)', pass: /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.name) },
      { id: 'name-not-reserved', label: 'Name does not start with "claude" or "anthropic"', pass: s.name.length > 0 && !/^(claude|anthropic)/.test(s.name) },
      { id: 'desc-present', label: 'Description present', pass: s.description.length > 0 },
      { id: 'desc-length', label: 'Description between 80 and 1024 characters', pass: s.description.length >= 80 && s.description.length <= 1024 },
      { id: 'desc-no-xml', label: 'Description has no < or > angle brackets', pass: !/[<>]/.test(s.description) },
      { id: 'desc-has-trigger', label: 'Description includes a "use when" style trigger cue', pass: /\buse\s+when\b|\bwhen\s+user\b|\bwhen\s+someone\b|\btriggers?\s+on\b/i.test(s.description) },
      { id: 'instr-present', label: 'Instructions body present (at least a heading)', pass: /##?\s+\w+/.test(s.instructions || '') || (s.instructions || '').trim().length > 40 },
      { id: 'size', label: 'SKILL.md under 5,000 words', pass: md.trim().split(/\s+/).length < 5000 },
    ];
    return checks;
  }

  function renderValidator(checks) {
    validator.innerHTML = '';
    validator.append(el('h4', {}, 'Live validator'));
    const ul = el('ul');
    for (const c of checks) {
      const li = el('li', { class: c.pass ? 'pass' : 'fail' }, [el('span', { class: 'check' }), c.label]);
      ul.append(li);
    }
    validator.append(ul);
  }

  function refresh() {
    const s = getState();
    saveDraft(s);
    const md = buildMd(s);
    previewPre.querySelector('code').textContent = md;
    const checks = validate(s);
    renderValidator(checks);
    const allPass = checks.every(c => c.pass);
    downloadBtn.disabled = !allPass;
    if (allPass) { setFeedback(fb, true, 'All green. You\'re ready to ship.'); onComplete(true); }
    else { clearFeedback(fb); onComplete(false); }
  }

  for (const f of [nameField, descField, authorField, versionField, instructionsField]) {
    f.input.addEventListener('input', refresh);
  }

  downloadBtn.addEventListener('click', async () => {
    const s = getState();
    if (typeof JSZip === 'undefined') { alert('JSZip failed to load — check your internet connection and refresh.'); return; }
    const zip = new JSZip();
    const folder = zip.folder(s.name);
    folder.file('SKILL.md', buildMd(s));
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${s.name}.zip`;
    document.body.append(a);
    a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
  });

  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(buildMd(getState())); copyBtn.textContent = 'Copied ✓'; setTimeout(() => copyBtn.textContent = 'Copy SKILL.md', 1400); }
    catch { alert('Clipboard permission denied. Select the preview text and copy manually.'); }
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm('Clear the capstone draft? This cannot be undone.')) return;
    localStorage.removeItem('skills-course-capstone');
    nameField.input.value = ''; descField.input.value = ''; authorField.input.value = ''; versionField.input.value = ''; instructionsField.input.value = '';
    refresh();
  });

  container.append(wrap, actions, fb);
  refresh();
};

function textField(label, hint, value, placeholder) {
  const wrap = el('div', { class: 'field' });
  wrap.append(el('label', {}, label));
  const input = el('input', { type: 'text', value: value || '', placeholder: placeholder || '', autocomplete: 'off', spellcheck: 'false' });
  wrap.append(input);
  if (hint) wrap.append(el('div', { class: 'small muted' }, hint));
  return { wrap, input };
}
function textareaField(label, hint, value, placeholder) {
  const wrap = el('div', { class: 'field' });
  wrap.append(el('label', {}, label));
  const input = el('textarea', { placeholder: placeholder || '', rows: '8' });
  input.value = value || '';
  wrap.append(input);
  if (hint) wrap.append(el('div', { class: 'small muted' }, hint));
  return { wrap, input };
}
function saveDraft(s) { try { localStorage.setItem('skills-course-capstone', JSON.stringify(s)); } catch {} }
function loadDraft() {
  try { return JSON.parse(localStorage.getItem('skills-course-capstone') || '{}'); }
  catch { return {}; }
}
