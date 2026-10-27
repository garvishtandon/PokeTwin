# PokéTwin: Kanto 151 Pokédex Edition

PokéTwin is an interactive client-side web application that scans a user's photo or live webcam selfie, extracts dominant color palettes, luminance, contrast, and saturation, and matches the user's personal "vibe" to their soulmate among the **original 151 Kanto Pokémon** (#001 Bulbasaur to #151 Mew).

---

## 📁 Project Structure

```
poketwin-kanto151/
├── index.html         # Main Pokédex application interface
├── pokemon-data.js    # Complete 151 Kanto Pokémon database (IDs, typings, moves, RGB palettes, lore)
├── app.js             # Computer vision color analysis, Web Audio synthesizer, camera, and logic
├── style.css          # Cyberpunk / classic Kanto Pokédex theme styles
└── README.md          # Setup and deployment documentation
```

---

## ✨ Features

- **All 151 Original Kanto Pokémon**: Exclusively featuring Generation 1 (#001 Bulbasaur through #151 Mew).
- **Official High-Res PokeAPI Artworks**: High-resolution artwork rendered for every species.
- **1-in-10 Shiny Roll Chance**: Rare shiny encounters trigger shiny official sprites, golden badges, and custom victory fanfares.
- **5-Factor Trait Engine**: Measures Energy, Chill/Zen, Cuteness, Mystery, and Bravery.
- **Camera & Instant Mood Presets**: Snap a live selfie (with mirror correction) or choose from 6 Kanto-themed instant test palettes (*Pallet Sunrise, Cinnabar Magma, Cerulean Coast, Viridian Forest, Lavender Tower, Celadon Neon*).
- **Interactive 151 Roster Drawer**: Search and filter all 151 species by type and ID at any time.
- **Web Audio 8-Bit Synthesizer**: Realistic Pokédex scanning sounds and victory chimes without external audio files.
- **Collectible Trainer Passport PNG Export**: Download a dual-portrait ID card with your photo and your Pokémon twin.

---

## 🚀 How to Run Locally

Because PokéTwin is built using pure HTML, CSS, and modern vanilla JavaScript:

1. Double-click `index.html` to open it in your browser.
2. For webcam permissions, run a lightweight local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

---

## 🌐 How to Deploy Live for Free

### 1. Netlify Drop (30 seconds, no terminal)
- Go to [app.netlify.com/drop](https://app.netlify.com/drop).
- Drag and drop this folder directly into the window.
- Your site is immediately live with HTTPS!

### 2. GitHub Pages
- Push this folder to a GitHub repository.
- Go to **Settings > Pages > Branch: main / root** and click Save.