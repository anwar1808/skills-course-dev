/* All lesson content. PDF facts kept intact; narrative / instructions / feedback written in Annie's voice. */

const LESSONS = [
  {
    num: 1,
    id: 'what-is-a-skill',
    title: 'What is a skill',
    chapter: 'Chapter 1 · Fundamentals',
    tint: 'var(--green)',
    content: `
      <p><strong>A skill is a folder. That's it.</strong></p>
      <p>Inside the folder sits one required file — <code>SKILL.md</code> — and a few optional ones. Claude reads the folder, loads what it needs, and from then on knows how you work.</p>
      <p>The magic isn't in the files. It's in never having to re-explain yourself to Claude again.</p>

      <h3>What's in a skill</h3>
      <ul>
        <li><code>SKILL.md</code> — <strong>required.</strong> Markdown with YAML frontmatter. Tells Claude what the skill does, when to use it, and how.</li>
        <li><code>scripts/</code> — optional. Executable code (Python, Bash).</li>
        <li><code>references/</code> — optional. Documentation Claude pulls in when it needs to.</li>
        <li><code>assets/</code> — optional. Templates, fonts, icons — whatever the skill needs to produce output.</li>
      </ul>

      <h3>Progressive disclosure — the thing that makes it efficient</h3>
      <p>Skills don't dump everything into context at once. They load in three tiers.</p>
      <ol>
        <li><strong>Level 1 — YAML frontmatter.</strong> Always loaded in Claude's system prompt. Lets Claude decide whether the skill is relevant without reading the whole thing.</li>
        <li><strong>Level 2 — SKILL.md body.</strong> Loaded when Claude decides the skill is relevant right now.</li>
        <li><strong>Level 3 — linked files.</strong> Loaded only when Claude specifically needs them.</li>
      </ol>
      <p>Tokens cost money. Context is finite. This tiering is how a specialised skill pays for itself.</p>

      <h3>Composability + portability</h3>
      <p>Claude can load multiple skills at once. Yours doesn't own the context — write it as if others are in the room too.</p>
      <p>The same skill works on Claude.ai, Claude Code, and the API. Build it once, use it everywhere.</p>

      <h3>Kitchen analogy</h3>
      <p>If you also have an MCP server connected, here's the shape:</p>
      <ul>
        <li><strong>MCP</strong> = the professional kitchen. Tools, ingredients, equipment.</li>
        <li><strong>Skill</strong> = the recipe. The step-by-step that turns those tools into something useful.</li>
      </ul>
      <p>MCP is <em>what</em> Claude can do. The skill is <em>how</em> it should actually do it.</p>
    `,
    exercise: {
      type: 'file-tree',
      title: 'Build a valid skill folder',
      kicker: 'Exercise 1 of 9',
      brief: `<p><strong>Your goal: assemble a skill folder Claude will accept.</strong></p>
<p>Below is an empty folder called <code>my-skill/</code>. Underneath it is a palette of items you can add — some are legitimate, some are traps that look plausible but would break your skill.</p>
<p><strong>How to play:</strong></p>
<ul>
  <li>Click an item in the palette to add it to the folder.</li>
  <li>Click the × beside an added item to remove it.</li>
  <li>When you think the folder is right, click <em>Check folder</em>.</li>
</ul>
<p><strong>A valid folder must:</strong></p>
<ul>
  <li>Include one file called <code>SKILL.md</code> — exact case, exact spelling.</li>
  <li>Include no files or folders that don't belong in a skill folder.</li>
  <li>Optional folders (<code>scripts/</code>, <code>references/</code>, <code>assets/</code>) are fine to add but not required.</li>
</ul>
<p class="muted">Spotting the traps is the point. If the check fails, the feedback tells you what's wrong so you can fix it.</p>`,
      folderName: 'my-skill',
      palette: [
        { label: 'SKILL.md', isFile: true, valid: true },
        { label: 'scripts/', isFile: false, valid: true },
        { label: 'references/', isFile: false, valid: true },
        { label: 'assets/', isFile: false, valid: true },
        { label: 'README.md', isFile: true, valid: false, reason: 'No README.md inside a skill folder. Documentation goes in SKILL.md or references/.' },
        { label: 'skill.md', isFile: true, valid: false, reason: 'Case-sensitive. Must be SKILL.md, exactly.' },
        { label: 'SKILL.MD', isFile: true, valid: false, reason: 'Case-sensitive. Must be SKILL.md, exactly.' },
        { label: 'NOTES.md', isFile: true, valid: false, reason: 'Random files don\'t belong in a skill folder. Everything lives in SKILL.md, references/, or assets/.' },
      ],
      require: ['SKILL.md'],
      feedback: {
        ok: 'Clean. That\'s a valid skill folder.',
        missingRequired: 'SKILL.md is missing. That\'s the one file you can\'t skip.',
        hasForbidden: (reason) => reason,
      }
    }
  },

  {
    num: 2,
    id: 'planning-use-cases',
    title: 'Planning and use cases',
    chapter: 'Chapter 2 · Planning and design',
    tint: 'var(--pink)',
    content: `
      <p><strong>Skills fail for one reason more than any other: no-one defined what the skill was for.</strong></p>
      <p>Before you write anything, pin down two or three concrete use cases. If you can't describe what the user is trying to do, you can't tell Claude how to help.</p>

      <h3>What a good use case looks like</h3>
      <pre><code>Use Case: Project Sprint Planning
Trigger: User says "help me plan this sprint" or "create sprint tasks"
Steps:
  1. Fetch current project status from Linear (via MCP)
  2. Analyse team velocity and capacity
  3. Suggest task prioritisation
  4. Create tasks in Linear with proper labels and estimates
Result: Fully planned sprint with tasks created</code></pre>
      <p>Four things: name, trigger, steps, result. Until you can write those for your skill, don't write the skill.</p>

      <h3>Anthropic's three categories</h3>
      <p>Every skill they've seen falls into one of three buckets. Knowing which bucket yours is in tells you which patterns apply and which examples to copy.</p>

      <div class="callout category-1">
        <span class="callout-label">Category 1 · Document &amp; asset creation</span>
        <p><strong>Produces consistent, high-quality output</strong> — documents, decks, apps, designs. No external tools required; uses Claude's built-in capabilities. Think: a skill that turns a brand brief into an on-brand pitch deck.</p>
      </div>

      <div class="callout category-2">
        <span class="callout-label">Category 2 · Workflow automation</span>
        <p><strong>Multi-step processes that benefit from consistent methodology</strong>, often across multiple MCP servers. Think: the skill that walks you through creating another skill — step-by-step, with validation gates.</p>
      </div>

      <div class="callout category-3">
        <span class="callout-label">Category 3 · MCP enhancement</span>
        <p><strong>Workflow guidance layered on an existing MCP integration.</strong> The MCP gives Claude the tools; the skill tells it how to use them well. Think: Sentry's code-review skill that turns error-monitoring data into actual pull-request fixes.</p>
      </div>

      <h3>Success criteria — know before you build</h3>
      <p>Aim for rigour, accept an element of vibes. Still — decide upfront what "working" means:</p>
      <ul>
        <li><strong>Quantitative:</strong> triggers on 90% of relevant queries. Completes workflow in X tool calls. Zero failed API calls per run.</li>
        <li><strong>Qualitative:</strong> users don't need to prompt Claude about next steps. Workflow completes without correction. Consistent results across sessions.</li>
      </ul>
      <p>If you can't name one metric per bucket, you can't tell when the skill is done.</p>
    `,
    exercise: {
      type: 'categorize',
      title: 'Sort 8 skill ideas into the right category',
      kicker: 'Exercise 2 of 9',
      brief: `<p><strong>Your goal: sort eight skill ideas into Anthropic's three categories.</strong></p>
<p>Drag each idea into the bin where it belongs. Or click an item, then click a bin.</p>
<p class="muted">Category 1 produces polished output using Claude's built-ins. Category 2 runs a multi-step workflow with consistent methodology. Category 3 sits on top of an existing MCP integration.</p>`,
      bins: [
        { id: 'cat1', label: 'Category 1', title: 'Document & asset creation', hint: 'Consistent, high-quality output using Claude\'s built-in capabilities.' },
        { id: 'cat2', label: 'Category 2', title: 'Workflow automation', hint: 'Multi-step processes with consistent methodology.' },
        { id: 'cat3', label: 'Category 3', title: 'MCP enhancement', hint: 'Workflow guidance layered on an existing MCP integration.' },
      ],
      items: [
        { text: 'Generate on-brand pitch decks from a brief', answer: 'cat1' },
        { text: 'Turn Sentry error data into GitHub PR fixes', answer: 'cat3' },
        { text: 'Walk users through creating a new skill, step-by-step', answer: 'cat2' },
        { text: 'Produce quarterly compliance reports as polished PDFs', answer: 'cat1' },
        { text: 'Manage sprint planning in Linear with validation gates', answer: 'cat2' },
        { text: 'Coordinate design handoff across Figma, Drive, Linear, and Slack MCPs', answer: 'cat3' },
        { text: 'Apply your team\'s style guide to any PowerPoint deck', answer: 'cat1' },
        { text: 'Onboard a new customer end-to-end via your payment MCP', answer: 'cat3' },
      ],
      feedback: {
        ok: 'All eight in the right buckets. Moving on.',
        bad: (n) => `${n} wrong. Have another look — the differentiator is whether the skill needs tools outside Claude (Cat 3), runs a multi-step process (Cat 2), or produces polished output with built-ins (Cat 1).`
      }
    }
  },

  {
    num: 3,
    id: 'file-structure',
    title: 'File structure, names, and rules',
    chapter: 'Chapter 2 · Planning and design',
    tint: 'var(--pink)',
    content: `
      <p><strong>Skills are strict about names.</strong> Get them wrong and Claude won't load your skill at all — no error messages to guide you, just silence. So: the rules.</p>

      <h3>The folder layout</h3>
<pre><code>your-skill-name/
├── SKILL.md              # Required
├── scripts/              # Optional — executable code
│   ├── process_data.py
│   └── validate.sh
├── references/           # Optional — documentation
│   ├── api-guide.md
│   └── examples/
└── assets/               # Optional — templates, fonts, icons
    └── report-template.md</code></pre>

      <h3>The non-negotiables</h3>
      <h4><code>SKILL.md</code> naming</h4>
      <ul>
        <li>Exactly <code>SKILL.md</code>. Case-sensitive.</li>
        <li>Not <code>skill.md</code>. Not <code>SKILL.MD</code>. Not <code>Skill.md</code>.</li>
      </ul>

      <h4>Folder naming — kebab-case only</h4>
      <div class="example-pair">
        <div class="example example-good"><span class="example-label">✓ Works</span>notion-project-setup</div>
        <div class="example example-bad"><span class="example-label">✗ Breaks</span>Notion Project Setup
notion_project_setup
NotionProjectSetup</div>
      </div>

      <h4>No README.md inside the skill folder</h4>
      <p>Everything goes in <code>SKILL.md</code> or <code>references/</code>. If you're publishing on GitHub, the repo-level <code>README.md</code> is fine — but don't put one <em>inside</em> the skill folder.</p>

      <h3>Security — what's forbidden</h3>
      <ul>
        <li><strong>No XML angle brackets</strong> (<code>&lt;</code> <code>&gt;</code>) in frontmatter. They'd be interpreted as system instructions.</li>
        <li><strong>No names starting with "claude" or "anthropic".</strong> Reserved.</li>
      </ul>

      <h3>Optional YAML fields worth knowing</h3>
      <ul>
        <li><code>license</code> — if you're open-sourcing (MIT, Apache-2.0).</li>
        <li><code>compatibility</code> — up to 500 chars on environment requirements.</li>
        <li><code>metadata</code> — custom key-value pairs. Author, version, mcp-server name.</li>
      </ul>
      <p>None of these are required. But if you share a skill publicly, fill them in — they're how other people understand what they're installing.</p>
    `,
    exercise: {
      type: 'fix-names',
      title: 'Fix four broken names',
      kicker: 'Exercise 3 of 9',
      brief: `<p><strong>Your goal: rewrite four broken names so Claude would actually load them.</strong></p>
<p>Each row below shows an invalid name. Type the fix in the box.</p>
<p class="muted">Rules to remember: kebab-case only, exact <code>SKILL.md</code> casing, no names starting with "claude" or "anthropic".</p>`,
      items: [
        { prompt: 'Folder name:', broken: 'Linear Sprint Planning/', correct: 'linear-sprint-planning/', hint: 'Kebab-case: lowercase, hyphens, no spaces.' },
        { prompt: 'File inside a skill folder:', broken: 'skill.md', correct: 'SKILL.md', hint: 'Exact case.' },
        { prompt: 'Folder name:', broken: 'notion_project_setup/', correct: 'notion-project-setup/', hint: 'Hyphens, not underscores.' },
        { prompt: 'Folder name:', broken: 'claude-email-assistant/', correct: 'email-assistant/', hint: 'Names starting with "claude" are reserved. Pick a different prefix.', acceptAny: (s) => /^[a-z0-9]+(-[a-z0-9]+)*\/?$/.test(s) && !s.startsWith('claude') && !s.startsWith('anthropic') && s.length > 2 }
      ],
      feedback: {
        ok: 'Four for four. Names sorted.',
        bad: (n) => `${n} to fix. Kebab-case, exact SKILL.md, no reserved prefixes.`
      }
    }
  },

  {
    num: 4,
    id: 'description-field',
    title: 'The description field — where skills live or die',
    chapter: 'Chapter 2 · Planning and design',
    tint: 'var(--pink)',
    content: `
      <p><strong>The description field is the most important thing you write.</strong></p>
      <p>It's level-one disclosure: the one bit of your skill that's always in Claude's system prompt. It's how Claude decides whether your skill is relevant to a given message. Get it right and the skill triggers when it should. Get it wrong and the skill is invisible.</p>

      <h3>The shape of a good description</h3>
      <pre><code>[What it does] + [When to use it] + [Key capabilities]</code></pre>
      <p>Three jobs. Every good description does all three. Every bad one skips at least one.</p>

      <h3>Good descriptions</h3>
      <div class="example example-good"><span class="example-label">✓ Specific, actionable, trigger phrases</span>description: Analyzes Figma design files and generates developer handoff documentation. Use when user uploads .fig files, asks for "design specs", "component documentation", or "design-to-code handoff".</div>

      <div class="example example-good"><span class="example-label">✓ Clear value proposition</span>description: End-to-end customer onboarding workflow for PayFlow. Handles account creation, payment setup, and subscription management. Use when user says "onboard new customer", "set up subscription", or "create PayFlow account".</div>

      <h3>Bad descriptions</h3>
      <div class="example example-bad"><span class="example-label">✗ Too vague</span>description: Helps with projects.</div>
      <div class="example example-bad"><span class="example-label">✗ No triggers</span>description: Creates sophisticated multi-page documentation systems.</div>
      <div class="example example-bad"><span class="example-label">✗ Too technical, no user-language triggers</span>description: Implements the Project entity model with hierarchical relationships.</div>

      <h3>Rules for the field</h3>
      <ul>
        <li>Under 1024 characters.</li>
        <li>No XML angle brackets (<code>&lt;</code> <code>&gt;</code>).</li>
        <li>Include specific trigger phrases users would actually say.</li>
        <li>Mention file types if relevant (.csv, .fig, .md).</li>
        <li>Write what the user gets, not the implementation.</li>
      </ul>

      <h3>Debugging the description</h3>
      <p>Ask Claude: <em>"When would you use the [skill name] skill?"</em> Claude will quote the description back. Adjust based on what's missing.</p>
    `,
    exercise: {
      type: 'rewrite-descriptions',
      title: 'Rewrite three bad descriptions',
      kicker: 'Exercise 4 of 9',
      brief: `<p><strong>Your goal: rewrite three bad descriptions so Claude would actually trigger on them.</strong></p>
<p>Each description below is broken in a different way. Rewrite each in the format <strong>[what it does] + [when to use it] + [trigger phrases]</strong>.</p>
<p class="muted">A live check runs as you type. It looks for trigger phrases, length (80–1024 chars), no XML angle brackets, and at least one "use when" cue.</p>`,
      items: [
        { broken: 'description: Helps with projects.', skill: 'A skill that manages Linear sprint planning — creating tasks, assigning labels, tracking status.', id: 'linear' },
        { broken: 'description: Creates sophisticated multi-page documentation systems.', skill: 'A skill that generates API reference docs from OpenAPI specs — with code samples, rate-limiting notes, and error tables.', id: 'docs' },
        { broken: 'description: Implements the Project entity model with hierarchical relationships.', skill: 'A skill that sets up a new project workspace in ProjectHub — creating pages, databases, and templates from a brief.', id: 'projecthub' },
      ],
      feedback: {
        ok: 'All three readable, specific, and triggerable.',
        bad: (issues) => `Not quite. Issues: ${issues}`
      }
    }
  },

  {
    num: 5,
    id: 'writing-instructions',
    title: 'Writing instructions Claude will actually follow',
    chapter: 'Chapter 2 · Planning and design',
    tint: 'var(--pink)',
    content: `
      <p><strong>The description decides <em>if</em> Claude loads your skill. The instructions decide what happens next.</strong></p>
      <p>The body of SKILL.md is just Markdown. The trick isn't formatting — it's being specific enough that Claude doesn't have to guess, and short enough that it doesn't drown in your prose.</p>

      <h3>Recommended structure</h3>
      <pre><code># Your Skill Name

## Instructions

### Step 1: [First major step]
Clear explanation of what happens.

Example:
\`\`\`bash
python scripts/fetch_data.py --project-id PROJECT_ID
\`\`\`
Expected output: [what success looks like]

## Examples
### Example 1: [common scenario]
User says: "..."
Actions: ...
Result: ...

## Troubleshooting
### Error: [Common error message]
Cause: [why it happens]
Solution: [how to fix]</code></pre>

      <h3>Be specific and actionable</h3>
      <div class="example-pair">
        <div class="example example-good"><span class="example-label">✓ Good</span>Run \`python scripts/validate.py --input {filename}\` to check data format.
If validation fails, common issues include:
- Missing required fields (add them to the CSV)
- Invalid date formats (use YYYY-MM-DD)</div>
        <div class="example example-bad"><span class="example-label">✗ Bad</span>Validate the data before proceeding.</div>
      </div>

      <h3>Include error handling explicitly</h3>
      <p>Don't trust Claude to invent its own error recovery. Name the likely failures.</p>
      <pre><code>## Common Issues

### MCP Connection Failed
If you see "Connection refused":
1. Verify MCP server is running: Check Settings > Extensions
2. Confirm API key is valid
3. Try reconnecting: Settings > Extensions > [Your Service] > Reconnect</code></pre>

      <h3>Use progressive disclosure properly</h3>
      <p>Keep SKILL.md focused on core instructions. Move anything long into <code>references/</code> and link to it.</p>
      <pre><code>Before writing queries, consult \`references/api-patterns.md\` for:
- Rate limiting guidance
- Pagination patterns
- Error codes and handling</code></pre>
      <p>Target: <strong>SKILL.md under 5,000 words.</strong> Past that, Claude starts to lose focus and your skill gets slower.</p>

      <h3>The three buckets</h3>
      <ul>
        <li><strong>SKILL.md</strong> — the how. Short, actionable, the steps Claude takes every time.</li>
        <li><strong>references/</strong> — the reference manual. Long-form docs Claude pulls in when it needs them.</li>
        <li><strong>assets/</strong> — the raw materials. Templates, images, fonts the skill outputs or uses.</li>
      </ul>
    `,
    exercise: {
      type: 'sort-files',
      title: 'Sort 8 items into the right folder',
      kicker: 'Exercise 5 of 9',
      brief: `<p><strong>Your goal: put eight pieces of content in the right folder.</strong></p>
<p>Three homes: <code>SKILL.md</code>, <code>references/</code>, or <code>assets/</code>. Drag each item where it belongs.</p>
<p class="muted">Core how-to steps Claude runs every time → <code>SKILL.md</code>. Long reference docs Claude only sometimes needs → <code>references/</code>. Raw files the skill outputs or uses → <code>assets/</code>.</p>`,
      bins: [
        { id: 'skill', label: 'SKILL.md', title: 'SKILL.md', hint: 'Core instructions. Short, actionable, every-time steps.' },
        { id: 'refs', label: 'references/', title: 'references/', hint: 'Detailed reference docs. Loaded only when needed.' },
        { id: 'assets', label: 'assets/', title: 'assets/', hint: 'Raw files: templates, images, fonts, output scaffolds.' },
      ],
      items: [
        { text: 'The five main steps to onboard a new customer', answer: 'skill' },
        { text: 'An 80-page OAuth reference covering every endpoint', answer: 'refs' },
        { text: 'Your company\'s brand logo (.png)', answer: 'assets' },
        { text: 'A welcome email template (markdown, with merge fields)', answer: 'assets' },
        { text: 'A 200-row error-code lookup table', answer: 'refs' },
        { text: '"Before each action, validate required inputs" — a rule applied every run', answer: 'skill' },
        { text: 'A bundled monospace .woff2 font file', answer: 'assets' },
        { text: 'API pagination patterns (cursor vs offset, with examples)', answer: 'refs' },
      ],
      feedback: {
        ok: 'All eight sorted. Progressive disclosure sorted too.',
        bad: (n) => `${n} wrong. If it\'s raw material Claude uses → assets/. If it\'s a long doc only sometimes needed → references/. If Claude does it every single run → SKILL.md.`
      }
    }
  },

  {
    num: 6,
    id: 'testing-iteration',
    title: 'Testing and iteration',
    chapter: 'Chapter 3 · Testing and iteration',
    tint: 'var(--purple)',
    content: `
      <p><strong>A skill that works on your machine, once, in your hands is not a skill. It's a coincidence.</strong></p>
      <p>Testing a skill means proving three things: it triggers when it should, it does the right thing when it runs, and it's measurably better than not having it.</p>

      <h3>Three ways to test</h3>
      <ul>
        <li><strong>Manual testing</strong> in Claude.ai. Fastest. No setup. Good for the first pass.</li>
        <li><strong>Scripted testing</strong> in Claude Code. Automate test cases you keep re-running.</li>
        <li><strong>Programmatic testing</strong> via the skills API. Full evaluation suites. For anything deployed at scale.</li>
      </ul>
      <p>Match the rigour to the stakes. An internal skill for five teammates is not an enterprise skill for 5,000.</p>

      <blockquote><strong>Pro tip:</strong> iterate on a single task until it works end-to-end. <em>Then</em> expand to more test cases. The most effective skill creators use Claude's in-context learning on one task, extract the winning approach into the skill, and go from there.</blockquote>

      <h3>The three test areas</h3>

      <h4>1. Triggering tests</h4>
      <p>Does the skill load when it should? Does it stay quiet when it shouldn't?</p>
      <pre><code>Should trigger:
- "Help me set up a new ProjectHub workspace"
- "I need to create a project in ProjectHub"
- "Initialize a ProjectHub project for Q4 planning"

Should NOT trigger:
- "What's the weather in San Francisco?"
- "Help me write Python code"
- "Create a spreadsheet" (unless your skill handles sheets)</code></pre>

      <h4>2. Functional tests</h4>
      <p>When it runs, does it produce valid output with zero API errors and proper edge-case handling?</p>

      <h4>3. Performance comparison</h4>
      <p>Same task, with skill vs without. Count API calls. Count tokens. Count clarifying questions. Count user corrections. If the "with skill" numbers aren't meaningfully better, the skill isn't doing enough work.</p>

      <h3>Signals you got the description wrong</h3>
      <div class="example-pair">
        <div class="example example-good"><span class="example-label">✓ Undertriggering → fix</span>Symptoms: skill doesn't load when it should. Users enabling it manually. Support questions about when to use it.
Fix: more detail and trigger phrases in the description.</div>
        <div class="example example-bad"><span class="example-label">✗ Overtriggering → fix</span>Symptoms: skill loads on irrelevant queries. Users disable it. Confusion about its purpose.
Fix: negative triggers ("Do NOT use for X"), tighter scope.</div>
      </div>

      <h3>Use the skill-creator skill</h3>
      <p>Anthropic ship a <code>skill-creator</code> skill. It reviews your skill, flags vague descriptions, suggests trigger phrases, spots structural problems. Use it. It's 15 minutes to a better first draft.</p>
    `,
    exercise: {
      type: 'write-triggers',
      title: 'Write six test queries',
      kicker: 'Exercise 6 of 9',
      brief: `<p><strong>Your goal: write a triggering test suite for a skill you've just built.</strong></p>
<p>Imagine you've shipped a skill called <strong>compliance-review</strong> that reviews financial documents for regulatory compliance — sanctions lists, jurisdictional allowances, risk assessment.</p>
<p>Write three queries that <strong>should</strong> trigger it, and three that <strong>should not</strong>.</p>
<p class="muted">Negative triggers should be plausible and adjacent — not absurd. "What's 2 + 2?" is too easy. Think: queries that are close enough to compliance work to be a realistic false positive.</p>`,
      shouldCount: 3,
      shouldNotCount: 3,
      bannedTermsInShouldNot: ['compliance', 'sanctions', 'regulatory', 'aml', 'kyc', 'jurisdiction', 'financial document', 'regulation'],
      feedback: {
        ok: 'Six plausible queries, three on each side. You\'d have a decent triggering test suite.',
        bad: (issues) => `Not there yet: ${issues}`
      }
    }
  },

  {
    num: 7,
    id: 'distribution-sharing',
    title: 'Distribution and positioning',
    chapter: 'Chapter 4 · Distribution and sharing',
    tint: 'var(--blue)',
    content: `
      <p><strong>Once your skill works, shipping it is the easy bit. Positioning it is not.</strong></p>

      <h3>How people actually install skills today</h3>
      <ol>
        <li>Download the skill folder.</li>
        <li>Zip it (if it isn't already).</li>
        <li>Upload to Claude.ai → Settings → Capabilities → Skills.</li>
        <li>Or drop it in Claude Code's skills directory.</li>
      </ol>
      <p>Organisations can now deploy skills workspace-wide — automatic updates, centralised management. Use that if you have the admin rights.</p>

      <h3>Recommended approach — host on GitHub</h3>
      <ol>
        <li><strong>Public repo</strong> with a clear repo-level README (not inside the skill folder), example usage, and screenshots.</li>
        <li>If you have an MCP server too — link from the MCP docs to the skill. Explain why using both is better than either alone.</li>
        <li>Provide a quick-start installation guide so a new user can be up in minutes, not hours.</li>
      </ol>

      <h3>API vs Claude.ai — which surface?</h3>
      <p>Rule of thumb: if a human is going to use it directly, ship it to Claude.ai. If code is going to call it, ship it via the API.</p>
      <ul>
        <li><strong>Claude.ai / Claude Code</strong> — end-user workflows, manual testing, ad-hoc use.</li>
        <li><strong>API</strong> — applications, production deployments at scale, agent systems.</li>
      </ul>

      <h3>Positioning — the thing most people get wrong</h3>
      <p>People describe their skill by what's in it. The good positioning describes what the user <em>gets</em>.</p>

      <div class="example-pair">
        <div class="example example-good"><span class="example-label">✓ Outcome-led</span>"The ProjectHub skill enables teams to set up complete project workspaces in seconds — including pages, databases, and templates — instead of spending 30 minutes on manual setup."</div>
        <div class="example example-bad"><span class="example-label">✗ Feature-led</span>"The ProjectHub skill is a folder containing YAML frontmatter and Markdown instructions that calls our MCP server tools."</div>
      </div>

      <p>The first one earns installs. The second one explains itself to no one.</p>

      <h3>If you also have an MCP</h3>
      <p>Pitch them together. The MCP gives Claude access; the skill teaches Claude the workflow. Together they enable AI-powered <em>[your thing]</em>. Without the skill, your MCP users are staring at a toolbox with no instructions.</p>
    `,
    exercise: {
      type: 'rewrite-positioning',
      title: 'Rewrite a feature-y blurb into outcome-led',
      kicker: 'Exercise 7 of 9',
      brief: `<p><strong>Your goal: rewrite a feature-led skill blurb so a real user would care.</strong></p>
<p>Below is a terrible positioning blurb for a skill called FlockLedger, which manages poultry inventory and breed tracking for hobbyists.</p>
<div class="example example-bad"><span class="example-label">✗ Starting point</span>The FlockLedger skill is a folder containing YAML frontmatter and Markdown instructions that calls our MCP server tools to manage entity relationships in the poultry database.</div>
<p>Rewrite it. What does the user actually <em>get</em>? How much time does it save them? What does it replace?</p>
<p class="muted">A live check runs as you type. It looks for outcome words (minutes, seconds, instead of, without), checks you've dropped the implementation jargon (YAML, Markdown, folder, frontmatter, entity), and expects a length of 60–400 characters.</p>`,
      feedback: {
        ok: 'That\'s a blurb a user would actually click on.',
        bad: (issues) => `Nearly. ${issues}`
      }
    }
  },

  {
    num: 8,
    id: 'patterns',
    title: 'The five patterns',
    chapter: 'Chapter 5 · Patterns and troubleshooting',
    tint: 'var(--sage)',
    content: `
      <p><strong>There's no original pattern. Every skill looks like one of five.</strong></p>
      <p>Not because skills are unoriginal — because these are the shapes that work. Pick the one that fits your problem and you've already answered half the design questions.</p>

      <h3>Before you pick — problem-first or tool-first?</h3>
      <p>The Home Depot test. Do users walk in saying "I need to fix a kitchen cabinet" (problem-first)? Or do they pick up a drill and ask how to use it (tool-first)?</p>
      <ul>
        <li><strong>Problem-first:</strong> "I need to set up a project workspace." Skill orchestrates MCP calls in the right sequence. Users describe outcomes; the skill handles tools.</li>
        <li><strong>Tool-first:</strong> "I have Notion MCP connected." Skill teaches Claude best practices for using the connected tool. Users have access; skill provides expertise.</li>
      </ul>
      <p>Most skills lean one way. Knowing which tells you which pattern below applies.</p>

      <h3>Pattern 1 · Sequential workflow orchestration</h3>
      <p>Multi-step processes in a specific order, with dependencies between steps. <strong>Use when</strong> order matters and each step feeds the next.</p>
      <pre><code>### Step 1: Create account (create_customer)
### Step 2: Set up payment (setup_payment_method)
Wait for payment method verification
### Step 3: Create subscription (customer_id from step 1)
### Step 4: Send welcome email</code></pre>
      <p>Keys: explicit step ordering, dependencies between steps, validation at each stage, rollback instructions for failures.</p>

      <h3>Pattern 2 · Multi-MCP coordination</h3>
      <p>Workflows that span multiple services — Figma, Drive, Linear, Slack, whatever. <strong>Use when</strong> no single tool does the full job.</p>
      <p>Keys: clear phase separation (Phase 1: Figma, Phase 2: Drive, Phase 3: Linear, Phase 4: Slack), data passing between MCPs, validation before moving to the next phase, centralised error handling.</p>

      <h3>Pattern 3 · Iterative refinement</h3>
      <p>Output quality improves with iteration. <strong>Use when</strong> the first draft is never the final draft.</p>
      <pre><code>### Initial Draft
### Quality Check (run validation script)
### Refinement Loop: address issues, regenerate, re-validate, repeat
### Finalisation</code></pre>
      <p>Keys: explicit quality criteria, validation scripts (not vibes), knowing when to stop iterating.</p>

      <h3>Pattern 4 · Context-aware tool selection</h3>
      <p>Same outcome, different tool depending on input. <strong>Use when</strong> the right tool depends on file type, size, user, or environment.</p>
      <pre><code>Decision tree:
- Large files (&gt;10MB) → cloud storage MCP
- Collaborative docs → Notion / Docs MCP
- Code files → GitHub MCP
- Temporary files → local storage</code></pre>
      <p>Keys: clear decision criteria, fallback options, transparency — tell the user why that tool was chosen.</p>

      <h3>Pattern 5 · Domain-specific intelligence</h3>
      <p>The skill adds expertise beyond tool access. <strong>Use when</strong> the domain has rules that must be applied before the tool runs.</p>
      <pre><code>### Before processing (compliance check)
- Check sanctions lists
- Verify jurisdiction allowances
- Assess risk level
- Document compliance decision

IF compliance passed → call MCP → process
ELSE → flag for review → create compliance case</code></pre>
      <p>Keys: domain expertise embedded in logic, compliance before action, comprehensive audit trail, clear governance.</p>
    `,
    exercise: {
      type: 'match-patterns',
      title: 'Match five problems to the right pattern',
      kicker: 'Exercise 8 of 9',
      brief: `<p><strong>Your goal: match five real problems to the right design pattern.</strong></p>
<p>Each row below describes a skill-shaped job. Pick the pattern from the dropdown that fits best.</p>
<p class="muted">Re-read the "Use when" line for each pattern above — that's the decider.</p>`,
      patterns: [
        { id: 'p1', label: 'Pattern 1 · Sequential workflow orchestration' },
        { id: 'p2', label: 'Pattern 2 · Multi-MCP coordination' },
        { id: 'p3', label: 'Pattern 3 · Iterative refinement' },
        { id: 'p4', label: 'Pattern 4 · Context-aware tool selection' },
        { id: 'p5', label: 'Pattern 5 · Domain-specific intelligence' },
      ],
      items: [
        { prompt: 'Onboarding a new customer — create account, set up payment, create subscription, send welcome email. Each step depends on the last.', answer: 'p1' },
        { prompt: 'Design-to-development handoff: export from Figma, store in Drive, create Linear tasks, post to Slack #engineering.', answer: 'p2' },
        { prompt: 'Generate a quarterly report, run a quality check, fix issues, regenerate, repeat until the checker passes.', answer: 'p3' },
        { prompt: 'Storing a file — choose between cloud storage, Notion, GitHub, or local based on file type and size.', answer: 'p4' },
        { prompt: 'Payment processing that must first run sanctions checks, verify jurisdiction, assess risk, and log an audit trail before the transaction.', answer: 'p5' },
      ],
      feedback: {
        ok: 'Five for five. You\'d pick the right shape for a new skill on day one.',
        bad: (n) => `${n} wrong. Re-read the "use when" line for each pattern — that\'s the decider.`
      }
    }
  },

  {
    num: 9,
    id: 'troubleshooting',
    title: 'Troubleshooting',
    chapter: 'Chapter 5 · Patterns and troubleshooting',
    tint: 'var(--sage)',
    content: `
      <p><strong>Skills fail quietly.</strong> No stack trace. No error modal. Just Claude ignoring your skill or triggering it at the wrong time. Here's how to diagnose, in rough order of how often each happens.</p>

      <h3>Skill won't upload</h3>
      <ul>
        <li><strong>"Could not find SKILL.md in uploaded folder"</strong> → the file isn't named exactly <code>SKILL.md</code>. Rename. Case-sensitive.</li>
        <li><strong>"Invalid frontmatter"</strong> → YAML formatting issue. Check <code>---</code> delimiters (one at top, one at bottom), no unclosed quotes, no tabs instead of spaces.</li>
        <li><strong>"Invalid skill name"</strong> → spaces or capitals in the name. Must be kebab-case.</li>
      </ul>

      <h3>Skill doesn't trigger</h3>
      <p>Symptom: Claude never loads the skill automatically. Fix: rewrite the description. The quick checklist —</p>
      <ul>
        <li>Is it too generic? ("Helps with projects" won't work)</li>
        <li>Does it include phrases users actually say?</li>
        <li>Does it mention relevant file types?</li>
      </ul>
      <p>Debug trick: <em>"When would you use the [skill name] skill?"</em> Claude quotes the description back. Adjust based on what's missing.</p>

      <h3>Skill triggers too often</h3>
      <p>Symptom: skill loads on irrelevant queries. Users disable it.</p>
      <ol>
        <li><strong>Add negative triggers.</strong> "Advanced data analysis for CSV files. Use for statistical modeling, regression, clustering. Do NOT use for simple data exploration (use data-viz skill instead)."</li>
        <li><strong>Be more specific.</strong> "Processes documents" → "Processes PDF legal documents for contract review."</li>
        <li><strong>Clarify scope.</strong> Name the surface the skill is for, and what it's not for.</li>
      </ol>

      <h3>Instructions not followed</h3>
      <p>Skill loads fine, but Claude ignores what you wrote. Three usual causes:</p>
      <ul>
        <li><strong>Instructions too verbose</strong> — bullet points beat paragraphs. Move detail to <code>references/</code>.</li>
        <li><strong>Instructions buried</strong> — critical rules at the top. Use <code>## Important</code> or <code>## Critical</code> headers. Repeat key points.</li>
        <li><strong>Ambiguous language</strong> — "validate things properly" means nothing. "CRITICAL: Before calling create_project, verify: (1) project name non-empty (2) at least one team member assigned (3) start date not in the past" means something.</li>
      </ul>
      <p>Advanced technique: for critical validations, bundle a script. Code is deterministic. Language interpretation isn't.</p>

      <h3>MCP connection issues</h3>
      <p>Symptom: skill loads, MCP calls fail. Checklist:</p>
      <ol>
        <li>Verify MCP server is connected (Settings → Extensions → status = "Connected").</li>
        <li>Check authentication — API keys valid, OAuth tokens refreshed, scopes granted.</li>
        <li>Test the MCP independently — call it without the skill. If it fails there, it's not a skill issue.</li>
        <li>Verify tool names match exactly — case-sensitive.</li>
      </ol>

      <h3>Large context issues</h3>
      <p>Symptom: skill slow or responses degrade. Two fixes:</p>
      <ol>
        <li><strong>Shrink SKILL.md.</strong> Move detail to <code>references/</code>. Target under 5,000 words.</li>
        <li><strong>Reduce enabled skills.</strong> If you have more than 20–50 enabled, be selective. Too many skills means Claude spends context deciding which one to use.</li>
      </ol>
    `,
    exercise: {
      type: 'debug-skill',
      title: 'Diagnose four broken SKILL.md files',
      kicker: 'Exercise 9 of 9',
      brief: `<p><strong>Your goal: diagnose four broken SKILL.md snippets.</strong></p>
<p>Each snippet below fails for a different reason. Pick the correct diagnosis from the dropdown beneath it.</p>
<p class="muted">If you're stuck, use the hint underneath each snippet. These are the exact silent-fail modes the previous lesson covers.</p>`,
      items: [
        { snippet: `---
name: My Cool Skill
description: Does things
---`, answer: 'name-format', hint: 'Look at the name value.' },
        { snippet: `---
name: data-tool
description: <analyzes> CSV data files
---`, answer: 'xml-brackets', hint: 'Look at the description value character-by-character.' },
        { snippet: `name: chart-maker
description: Creates charts from CSV data`, answer: 'no-delimiters', hint: 'What\'s at the top and bottom of a frontmatter block?' },
        { snippet: `---
name: claude-helper
description: Helps Claude perform tasks faster
---`, answer: 'reserved-name', hint: 'There are two reserved name prefixes.' },
      ],
      options: [
        { id: 'name-format', label: 'Name has spaces and capitals — must be kebab-case' },
        { id: 'xml-brackets', label: 'XML angle brackets in frontmatter — forbidden (security restriction)' },
        { id: 'no-delimiters', label: 'Missing --- delimiters at top and bottom of frontmatter' },
        { id: 'reserved-name', label: 'Name starts with a reserved prefix ("claude" or "anthropic")' },
        { id: 'too-long', label: 'Description exceeds 1024 characters' },
        { id: 'vague-description', label: 'Description too vague — missing trigger phrases' },
      ],
      feedback: {
        ok: 'Four correct diagnoses. You\'ve just saved future-you an hour of silent-fail debugging.',
        bad: (n) => `${n} wrong. Use the hints.`
      }
    }
  },

  {
    num: 10,
    id: 'capstone',
    title: 'Capstone — build your own skill',
    chapter: 'Final · Apply everything',
    tint: 'var(--orange)',
    content: `
      <p><strong>One real skill. Yours. Downloadable. Installable.</strong></p>
      <p>Everything you've learned in the previous nine lessons lands here. Fill in the form on the right. The validator checks your work live. When every check is green, download the .zip and install it in Claude.ai or Claude Code.</p>

      <h3>How to install your skill</h3>
      <h4>Claude.ai</h4>
      <ol>
        <li>Go to <strong>Settings → Capabilities → Skills</strong>.</li>
        <li>Click <strong>Upload skill</strong>, select the .zip you just downloaded.</li>
        <li>Toggle it on.</li>
      </ol>

      <h4>Claude Code</h4>
      <ol>
        <li>Unzip the file.</li>
        <li>Move the folder to <code>~/.claude/skills/</code>.</li>
        <li>Restart Claude Code (or run <code>/skills</code> to see it).</li>
      </ol>

      <h3>If this is your first skill</h3>
      <p>Pick something boring you do every week. The boring thing is where skills pay the most. Brief → deck. Standup notes → Linear tickets. Weekly report → PDF. Boring → repeatable → skill.</p>
      <p>You'll iterate. That's expected. The skill you ship today won't be the skill that's in production in a month. Ship the first version anyway.</p>
    `,
    exercise: {
      type: 'capstone',
      title: 'Build a real SKILL.md',
      kicker: 'Capstone',
      brief: `<p><strong>Your goal: build a real SKILL.md you can install into Claude today.</strong></p>
<p>Fill in each field on the left. The live preview on the right shows exactly what Claude will see. The validator below it tracks what's still missing.</p>
<p>When every check is green, download the <code>.zip</code> and install it in Claude.ai (Settings → Capabilities → Skills) or drop the folder into <code>~/.claude/skills/</code> for Claude Code.</p>
<p class="muted">Your draft saves automatically as you type. Close the tab, come back tomorrow, pick up where you left off.</p>`
    }
  }
];

// expose
window.LESSONS = LESSONS;
