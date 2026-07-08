from flask import Blueprint, request, jsonify
from auth_middleware_backend import auth_required
import numpy as np
from sklearn.linear_model import LinearRegression

predictions_bp = Blueprint("predictions", __name__)


@predictions_bp.route("/forecast", methods=["POST"])
@auth_required
def forecast():
    body = request.get_json(silent=True) or {}
    data = body.get("data", [])
    periods = int(body.get("periods", 30))

    if not data or len(data) < 3:
        return jsonify({"error": "Au moins 3 points de donnees requis"}), 400
    if periods < 1 or periods > 365:
        return jsonify({"error": "Periods doit etre entre 1 et 365"}), 400

    try:
        y = np.array([float(v) for v in data])
        X = np.arange(len(y)).reshape(-1, 1)

        model = LinearRegression()
        model.fit(X, y)

        future_X = np.arange(len(y), len(y) + periods).reshape(-1, 1)
        forecast_values = model.predict(future_X).tolist()
        r2 = float(model.score(X, y))
        slope = float(model.coef_[0])

        return jsonify({
            "forecast": forecast_values,
            "confidence": round(max(0.0, r2), 3),
            "trend": "hausse" if slope > 0 else "baisse" if slope < 0 else "stable",
            "slope": round(slope, 4),
            "periods": periods
        }), 200
    except (ValueError, TypeError) as e:
        return jsonify({"error": "Donnees invalides", "detail": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Erreur de prevision", "detail": str(e)}), 500


@predictions_bp.route("/recommendations", methods=["POST"])
@auth_required
def recommendations():
    body = request.get_json(silent=True) or {}
    data = body.get("data", [])
    product_name = body.get("product_name", "Produit")[:100]
    periods = int(body.get("periods", 30))

    if not data or len(data) < 3:
        return jsonify({"error": "Au moins 3 points de donnees requis"}), 400

    try:
        y = np.array([float(v) for v in data])
        X = np.arange(len(y)).reshape(-1, 1)

        model = LinearRegression()
        model.fit(X, y)

        slope = float(model.coef_[0])
        r2 = float(model.score(X, y))
        last_value = float(y[-1])
        avg_value = float(np.mean(y))
        threshold = 0.05 * abs(avg_value) if avg_value != 0 else 0.01

        recs = []

        if slope > threshold:
            recs.append(f"Tendance haussiere detectee pour {product_name} (+{slope:.2f}/periode). Envisagez d'augmenter vos stocks.")
        elif slope < -threshold:
            recs.append(f"Tendance baissiere detectee pour {product_name} ({slope:.2f}/periode). Reduisez les commandes et revoyez la strategie.")
        else:
            recs.append(f"{product_name} est stable. Optimisez les couts operationnels.")

        if r2 > 0.8:
            recs.append("Signal fort — la tendance est claire et fiable (R2 > 0.8).")
        elif r2 > 0.5:
            recs.append("Signal modere — la tendance est visible mais avec prudence (R2 entre 0.5 et 0.8).")
        else:
            recs.append("Signal faible — les donnees sont volatiles. Collectez plus de donnees avant de decider (R2 < 0.5).")

        next_value = float(model.predict([[len(y) + periods]])[0])
        change_pct = ((next_value - last_value) / abs(last_value) * 100) if last_value != 0 else 0
        recs.append(f"Dans {periods} periodes : valeur estimee a {next_value:.2f} (soit {change_pct:+.1f}% vs aujourd'hui).")

        return jsonify({
            "recommendations": recs,
            "confidence": round(max(0.0, r2), 3),
            "trend": "hausse" if slope > 0 else "baisse" if slope < 0 else "stable"
        }), 200
    except (ValueError, TypeError) as e:
        return jsonify({"error": "Donnees invalides", "detail": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Erreur de recommandation", "detail": str(e)}), 500
