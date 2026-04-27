# vocalFlow — Suivi projet

## Objectif
Web app vocal training mobile-first : scat, langue (italien), enregistrement, analyse pitch, relief vocal.

## Statut : 🟢 en cours de build

## Stack
- Frontend : React + Vite (mobile-first, dark theme)
- Backend : FastAPI (Python) + SQLite
- Auth : JWT (simple, multi-user ready)
- VPS : /opt/vocal-flow (IONOS 212.227.80.241)
- GitHub : EUREKAI25/vocal-flow

## 3 programmes MVP
1. **Langue** — phrase + audio modèle + enregistrement + comparaison pitch
2. **Scat Training** — import audio, segments, boucle, enregistrement, comparaison
3. **Scat Créateur** — karaoké syllabique, banques de style, relief vocal

## V2 prévue
- Transformation de scat (sensuel → percussif…)
- Bibliothèque enregistrements avec progression
- Bilan mensuel "conseil de classe"
- Sélection micro externe

## Historique

### 2026-04-27 — Session 1
- [x] Brief extrait de conversation ChatGPT (scat_langues.json)
- [x] Architecture définie : React + FastAPI + SQLite + VPS
- [x] Auth simple (JWT) prévue dès MVP
- [~] Build en cours
