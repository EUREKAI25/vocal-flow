# vocalFlow — Suivi projet

## Objectif
Web app vocal training mobile-first : scat, langue (italien), enregistrement, analyse pitch, relief vocal.

## Statut : 🟢 MVP déployé — https://vocal.eurkai.com

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
- [x] Build complet — 36 fichiers, React + FastAPI + SQLite
- [x] GitHub : https://github.com/EUREKAI25/vocal-flow
- [x] VPS : /opt/vocal-flow — service vocal-flow.service actif
- [x] DNS : vocal.eurkai.com → 212.227.80.241
- [x] SSL : Let's Encrypt (expire 2026-07-26)
- [x] DB init + user nathalie créé (pwd: vocalFlow2026!)
- [x] Tests login + health HTTPS ✓

**URL prod : https://vocal.eurkai.com**
**Credentials : nathalie / vocalFlow2026!**
