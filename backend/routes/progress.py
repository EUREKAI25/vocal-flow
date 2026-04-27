from fastapi import APIRouter, Depends
from auth import current_user
from database import get_conn

router = APIRouter(prefix="/progress", tags=["progress"])

PROGRAMS = ["language", "scat_training", "scat_creator", "transformation"]


@router.get("/stats")
def get_stats(user: dict = Depends(current_user)):
    with get_conn() as conn:
        totals = conn.execute(
            "SELECT program, COUNT(*) as count FROM recordings WHERE user_id=? GROUP BY program",
            (user["id"],),
        ).fetchall()

        weekly = conn.execute(
            """SELECT program,
                      AVG(score_similarity) as avg_similarity,
                      AVG(score_intonation) as avg_intonation,
                      AVG(score_rhythm)     as avg_rhythm,
                      AVG(score_intensity)  as avg_intensity,
                      AVG(score_relief)     as avg_relief
               FROM recordings
               WHERE user_id=? AND created_at >= datetime('now', '-7 days')
               GROUP BY program""",
            (user["id"],),
        ).fetchall()

        monthly = conn.execute(
            """SELECT strftime('%Y-%m', created_at) as month,
                      AVG(score_relief)     as avg_relief,
                      AVG(score_similarity) as avg_similarity,
                      AVG(score_rhythm)     as avg_rhythm,
                      COUNT(*)              as count
               FROM recordings WHERE user_id=?
               GROUP BY month ORDER BY month DESC LIMIT 6""",
            (user["id"],),
        ).fetchall()

    return {
        "totals": {r["program"]: r["count"] for r in totals},
        "weekly": [dict(r) for r in weekly],
        "monthly": [dict(r) for r in monthly],
    }


@router.get("/advice")
def get_advice(user: dict = Depends(current_user)):
    """Génère un bilan simple par règles (sans IA)."""
    with get_conn() as conn:
        row = conn.execute(
            """SELECT AVG(score_relief) as relief,
                      AVG(score_similarity) as similarity,
                      AVG(score_rhythm) as rhythm,
                      AVG(score_intonation) as intonation,
                      AVG(score_monotony) as monotony
               FROM recordings WHERE user_id=? AND created_at >= datetime('now', '-30 days')""",
            (user["id"],),
        ).fetchone()

    if not row or row["relief"] is None:
        return {"advice": "Commence par enregistrer quelques sessions pour obtenir un bilan !"}

    lines = []
    if row["relief"] and row["relief"] < 40:
        lines.append("Ton relief vocal est encore faible — varie davantage les durées et les silences.")
    elif row["relief"] and row["relief"] > 70:
        lines.append("Excellent relief vocal ce mois-ci, belle variété !")

    if row["similarity"] and row["similarity"] < 40:
        lines.append("La similarité avec le modèle est encore basse — ralentis le segment et imprègne-toi avant d'enregistrer.")
    elif row["similarity"] and row["similarity"] > 75:
        lines.append("Belle précision par rapport au modèle !")

    if row["rhythm"] and row["rhythm"] < 40:
        lines.append("Le rythme manque de régularité — travaille les segments courts en boucle.")

    if row["monotony"] and row["monotony"] > 60:
        lines.append("Tu es encore un peu monotone — exagère les variations de pitch, même si ça semble beaucoup.")

    if row["intonation"] and row["intonation"] < 40:
        lines.append("L'intonation est à travailler — écoute le modèle et mime l'émotion, pas seulement les notes.")

    if not lines:
        lines.append("Bonne progression globale ce mois-ci, continue !")

    return {"advice": " ".join(lines)}
