# vocalFlow

Web app d'entraînement vocal — scat, langues, progression.

## Programmes
- 🗣 **Travailler une langue** — intonation, rythme, comparaison pitch
- 🎷 **S'entraîner au scat** — segments en boucle, imitation
- ✨ **Créer du scat** — karaoké syllabique, relief vocal

## Stack
- Frontend : React 18 + Vite
- Backend : FastAPI + SQLite
- Auth : JWT (30j)

## Lancer en local

### Backend
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 init_db.py           # crée la DB + premier user
uvicorn main:app --port 8765 --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # → http://localhost:5173
```

## VPS — Setup initial
```bash
# Cloner
git clone https://github.com/EUREKAI25/vocal-flow /opt/vocal-flow

# Backend
python3 -m venv /opt/vocal-flow/venv
/opt/vocal-flow/venv/bin/pip install -r /opt/vocal-flow/backend/requirements.txt

# Données
mkdir -p /opt/vocal-flow/data/uploads

# .env
echo "JWT_SECRET_KEY=$(openssl rand -hex 32)" > /opt/vocal-flow/.env

# Init DB + user
cd /opt/vocal-flow/backend
DB_PATH=/opt/vocal-flow/data/vocal_flow.db \
  UPLOADS_DIR=/opt/vocal-flow/data/uploads \
  /opt/vocal-flow/venv/bin/python3 init_db.py --username nathalie

# Service
cp /opt/vocal-flow/deploy/vocal-flow.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now vocal-flow

# Frontend build
cd /opt/vocal-flow/frontend && npm ci && npm run build

# Nginx
cp /opt/vocal-flow/deploy/nginx.conf /etc/nginx/sites-available/vocal-flow
ln -s /etc/nginx/sites-available/vocal-flow /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## Limites MVP
- Extraction voix (séparation instrumentale) : bouton prévu, non implémenté
- Import URL distant : non implémenté (upload fichier uniquement)
- Détection pitch : autocorrélation approximative (suffisant pour usage)
- Scores rythme/intonation/intensité : approximation (V2 → analyse plus fine)
