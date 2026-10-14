# 🎯 CS2 Tactical Stratbook - Map Pool & Ardoise Tactique

> Application web moderne dédiée à la préparation stratégique, au tracé tactique et à l'organisation du playbook d'une équipe compétitive sur le pool actif de **Counter-Strike 2**.

---

## 🌟 Présentation du Projet

**CS2 Tactical Stratbook** est une solution conçue pour les capitaines (IGL), coachs et joueurs compétitifs Counter-Strike 2. L'application offre une ardoise tactique vectorielle interactive superposée aux **véritables minimaps radar officielles Source 2**, permettant de dessiner des exécutions, de poser des repères d'utilitaires (Smokes, Flashbangs, Molotovs, HE, C4) et d'organiser vos stratégies par phase d'achat et par camp.

---

## 🗺️ Fonctionnalités Clés

### 1. Véritables Vues du Dessus Source 2 (Radar Overviews)
- Minimaps officielles haute résolution issues des assets officiels du jeu pour les **7 cartes actives de compétition** :
  - `Mirage`, `Inferno`, `Nuke`, `Anubis`, `Ancient`, `Dust II`, `Vertigo`.
- Superposition dynamique des repères d'utilitaires avec coordonnées précises.

### 2. Ardoise Tactique Vectorielle (Drawing Board)
- **Outils de dessin :**
  - **Pinceau libre :** Traçage fluide des déplacements ou des pushs.
  - **Flèches directionnelles :** Lignes avec pointe de flèche orientée automatique pour les prises d'espace.
  - **Lignes droites :** Délimitation de lignes de mire, crossfires et ouvertures.
  - **Zones / Cercles tactiques :** Mise en évidence de zones de contrôle de carte ou de contention.
  - **Tampons d'utilitaires (Stamps) :** Pose instantanée de marqueurs (`Smoke`, `Flashbang`, `Molotov`, `HE Frag`, `C4 / Plante`).
- **Palette compétitive CS2 :**
  - Orange T-Side (`#f97316`), Bleu CT-Side (`#38bdf8`), Jaune Flash (`#eab308`), Rouge Danger (`#ef4444`), Vert Refrag (`#22c55e`), Blanc Neutre (`#f8fafc`).
- **Contrôles d'édition :**
  - Épaisseur du trait ajustable (Fin, Moyen, Épais).
  - Historique complet : **Annuler** (`Undo`), **Rétablir** (`Redo`), et **Effacer tout**.
  - **Persistance automatique :** Chaque tracé est vectorisé en JSON et sauvegardé dans la base SQLite locale.

### 3. Gestion & Organisation du Strat Book
- **Filtres rapides :**
  - Camp : *T-Side*, *CT-Side*, ou *Tous*.
  - Phase d'achat : *Pistol round*, *Eco / Semi-buy*, *Force buy*, *Full buy*.
  - Recherche textuelle instantanée dans les titres et les notes.
- **Détails de chaque stratégie :**
  - Description détaillée de l'exécution et repères d'alignement.
  - Missions et assignations par rôle (*IGL, Entry, Support, Sniper AWP, Lurker*).
  - Liste des utilitaires avec type de lancer (*Jumpthrow, Left-click, W-jumpthrow, Run-throw*).
  - Création, modification et suppression intuitives.

---

## 🚀 Démarrage Rapide

### Option A : Raccourci Bureau (Recommandé)
Double-cliquez directement sur l'icône **`CS2 Tactical HQ`** présente sur votre Bureau Windows. Le script lance automatiquement le backend et l'interface web, puis ouvre votre navigateur.

### Option B : Lancement Manuel
Dans le dossier du projet, double-cliquez sur :
```
start.bat
```
Ou lancez les services séparément :
- **Backend :**
  ```powershell
  cd backend
  .\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --host 127.0.0.1
  ```
- **Frontend :**
  ```powershell
  cd frontend
  npm run dev
  ```

L'interface est accessible à l'adresse : **`http://127.0.0.1:5173`**
La documentation Swagger de l'API est disponible à : **`http://127.0.0.1:8000/docs`**
