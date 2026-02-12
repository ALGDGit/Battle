# Battle

Browser game project organized as a static web app.

## How to launch

Install dependencies and build TypeScript:

```bash
npm install
npm run build
```

Start a local web server (required because the game loads JSON/sprites with `fetch`):

```bash
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080
```

## Game summary

The game currently has two main modes:

- `History Mode`
- `Arena Mode`

### History Mode

- You begin by selecting from unlocked eggs.
- Eggs hatch into assigned `Baby I` characters.
- Winning the Final Challenge unlocks new eggs over time.
- You manage your character through:
  - Feed
  - Train
  - Battle
  - Evolution progression across stages (`Baby I` to `Ultimate`)
- Consumable items and status effects are part of battle strategy.

### Arena Mode

- You pick both your fighter and your opponent directly.
- Arena picks are limited to characters you have already played in History Mode.
- Arena is for direct battles; History progression systems (like evolution flow) are separate.

### Battle and progression highlights

- Standard attacks are always available.
- Special attacks:
  - Only available from `Child` stage onward.
  - Trigger 20% of turns (instead of standard attack).
  - Element rules:
    - `Vaccine`: deals 1, heals 1, 50% paralyze chance.
    - `Data`: deals 2, 50% confuse chance.
    - `Virus`: 50% poison chance; critical special hits deal 4.
- Item drops:
  - 20% chance per completed battle to drop at least one item.
- Evolution:
  - If evolution fails after a win, the next evolution chance gets +1% (resets after a successful evolution).

## Project structure

```text
.
├── index.html
├── src
│   ├── js
│   │   ├── constants.js
│   │   ├── dom.js
│   │   ├── game.js
│   │   └── state.js
│   ├── ts
│   │   ├── constants.ts
│   │   ├── dom.ts
│   │   ├── game.ts
│   │   └── state.ts
│   └── styles
│       └── main.css
└── data
    ├── characters.json
    ├── sprites/
    └── ui/
```
