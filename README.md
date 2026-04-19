# The Complete Guide to Building Skills for Claude — Interactive Course

Claude repeats itself. Skills fix that.

An interactive, hands-on course based on Anthropic's 33-page [*Complete Guide to Building Skills for Claude*](https://www.anthropic.com/) (April 2026). Ten lessons. Nine hands-on exercises. One real SKILL.md at the end — yours to deploy to Claude.

**Live:** https://anwar1808.github.io/thecompleteguidetobuildingonClaude_Apr2026

## What's inside

- Fundamentals, planning, technical requirements, the description field, writing instructions
- Testing and iteration, distribution, the five patterns, troubleshooting
- A final capstone: a live SKILL.md builder with validator and .zip export

All interactive. All in-browser. No accounts, no server. Progress saved to localStorage on your device.

## Running it locally

No build step. No dependencies beyond a static server.

```bash
git clone https://github.com/anwar1808/thecompleteguidetobuildingonClaude_Apr2026.git
cd thecompleteguidetobuildingonClaude_Apr2026
python3 -m http.server 8765
# open http://localhost:8765/
```

Or just open `index.html` in a browser.

## Structure

```
/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js         # router, progress, localStorage, dialog
│   ├── lessons.js     # lesson content
│   ├── exercises.js   # exercise renderers + validators
│   └── capstone.js    # live SKILL.md builder
└── README.md
```

## Privacy

Progress is stored in your browser's localStorage. It never leaves your device. Export it as JSON from the Settings button if you want a backup.

Analytics: [GoatCounter](https://www.goatcounter.com) — cookie-free, no consent banner needed, pageview counts only.

## Credit

Content distilled from Anthropic's *Complete Guide to Building Skills for Claude*. The guide itself is theirs; the interactive interpretation is independent.

## License

MIT. Fork it, remix it, use it in a workshop. If you make a translated or expanded version, a link back would be nice.
