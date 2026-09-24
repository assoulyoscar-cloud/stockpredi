from flask import Blueprint, request, jsonify
from supabase import create_client
from config import Config
from auth_middleware_backend import auth_required
from datetime import datetime

rgpd_bp = Blueprint("rgpd", __name__)

def get_admin_client():
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)

@rgpd_bp.route("/export", methods=["POST"])
@auth_required
def export_user_data():
    try:
        user_id = request.user_id
        supabase = get_admin_client()
        user_res = supabase.table("users").select("*").eq("id", user_id).single().execute()
        predictions_res = supabase.table("predictions").select("*").eq("user_id", user_id).execute()
        export_data = {
            "export_date": datetime.utcnow().isoformat(),
            "user_profile": {k: v for k, v in (user_res.data or {}).items() if k != "id"},
            "predictions": predictions_res.data or []
        }
        return jsonify({"status": "success", "data": export_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rgpd_bp.route("/delete", methods=["DELETE"])
@auth_required
def delete_user_data():
    try:
        user_id = request.user_id
        supabase = get_admin_client()
        supabase.table("predictions").delete().eq("user_id", user_id).execute()
        supabase.table("users").delete().eq("id", user_id).execute()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rgpd_bp.route("/status", methods=["GET"])
@auth_required
def rgpd_status():
    try:
        user_id = request.user_id
        supabase = get_admin_client()
        user_res = supabase.table("users").select("created_at").eq("id", user_id).single().execute()
        return jsonify({"status": "ok", "user_id": user_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rgpd_bp.route("/contact", methods=["POST"])
@auth_required
def rgpd_contact_request():
    return jsonify({"status": "success", "message": "Demande enregistrée"}), 200
