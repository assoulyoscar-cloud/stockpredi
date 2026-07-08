from flask import Blueprint, request, jsonify
from supabase import create_client
from config import Config
from auth_middleware_backend import auth_required

user_bp = Blueprint("user", __name__)

ALLOWED_PROFILE_FIELDS = {"name", "company", "phone"}


def get_admin_client():
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)


@user_bp.route("/profile", methods=["GET"])
@auth_required
def get_profile():
    try:
        supabase = get_admin_client()
        res = supabase.table("users").select("*").eq("id", request.user_id).single().execute()
        if not res.data:
            return jsonify({"error": "Profil introuvable"}), 404
        return jsonify(res.data), 200
    except Exception as e:
        return jsonify({"error": "Erreur serveur", "detail": str(e)}), 500


@user_bp.route("/profile", methods=["PATCH"])
@auth_required
def update_profile():
    body = request.get_json(silent=True) or {}
    updates = {k: v for k, v in body.items() if k in ALLOWED_PROFILE_FIELDS}
    if not updates:
        return jsonify({"error": "Aucun champ valide fourni"}), 400
    try:
        supabase = get_admin_client()
        res = supabase.table("users").update(updates).eq("id", request.user_id).execute()
        return jsonify({"message": "Profil mis a jour", "data": res.data}), 200
    except Exception as e:
        return jsonify({"error": "Erreur mise a jour", "detail": str(e)}), 500


@user_bp.route("/predictions", methods=["GET"])
@auth_required
def get_predictions():
    limit = min(request.args.get("limit", 20, type=int), 100)
    try:
        supabase = get_admin_client()
        res = supabase.table("predictions") \
            .select("*") \
            .eq("user_id", request.user_id) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        return jsonify({"predictions": res.data or []}), 200
    except Exception as e:
        return jsonify({"error": "Erreur chargement", "detail": str(e)}), 500
