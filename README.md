# PokéTwin: Biometric & SQL / Power BI Analytics Edition (v2.5)

PokéTwin features real-time facial expression and color-vibe scanning matched against the original 151 Kanto Pokémon, combined with a built-in **Data Analytics Engine** that generates relational schemas for SQL and Microsoft Power BI.

---

## 🌟 New Features in v2.5

1. **Trainer Name Identification**:
   - Trainers can enter their name before scanning.
   - Name is persistent across browser sessions and appears directly on:
     - Match greeting: *(e.g., "Garvish, your Kanto Spirit Twin is Gengar!")*
     - Downloadable Collectible ID Passport *(e.g., "TRAINER: GARVISH | SILPH CO.")*
     - Live Analytics Event Log.

2. **Built-in SQL & Power BI Analytics Hub**:
   - Open the **"📊 SQL & Power BI Hub"** directly in the app.
   - Live KPI Cards: **Total User Scans**, **Unique Trainers**, **Avg Sync Rate %**, and **Shiny Encounters**.
   - Recent Trainer Scans log table.

3. **1-Click Pipeline Data Exporters**:
   - **Download Fact Scans (CSV)**: Generates `poketwin_fact_user_scans.csv` formatted with foreign keys and biometric scores for Power BI.
   - **Download Dim Pokémon (CSV)**: Generates `poketwin_dim_pokemon.csv` for the 151 Pokémon dimension table.
   - **Download SQL Script**: Generates table DDL, foreign key constraints, indexes, and analytical window functions.