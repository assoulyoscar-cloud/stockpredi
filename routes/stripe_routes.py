import stripe
from flask import Blueprint, request, jsonify
from supabase import create_client
from config import Config
from auth_middleware_backend import auth_required

stripe_bp = Blueprint("stripe", __name__)


def get_stripe():
    stripe.api_key = Config.STRIPE_SECRET_KEY
    return stripe


def get_admin_client():
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)


@stripe_bp.route("/create-subscription", methods=["POST"])
@auth_required
def create_subscription():
    """Crée une Stripe Checkout Session et retourne l'URL de redirection.
    Si Stripe n'est pas configure (mode bypass), retourne une URL de redirection directe.
    """
    if not Config.STRIPE_SECRET_KEY or not Config.STRIPE_PRICE_ID:
        return jsonify({
            "checkout_url": f"{Config.FRONTEND_URL}/dashboard?payment=bypass"
        }), 200

    s = get_stripe()
    user_id = request.user_id
    user_email = request.user_email

    try:
        session = s.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{
                "price": Config.STRIPE_PRICE_ID,
                "quantity": 1,
            }],
            customer_email=user_email,
            success_url=f"{Config.FRONTEND_URL}/dashboard?payment=success",
            cancel_url=f"{Config.FRONTEND_URL}/dashboard?payment=cancelled",
            metadata={"user_id": user_id},
            subscription_data={
                "metadata": {"user_id": user_id}
            }
        )
        return jsonify({"checkout_url": session.url}), 200
    except stripe.StripeError as e:
        return jsonify({"error": "Erreur Stripe", "detail": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Erreur serveur", "detail": str(e)}), 500


@stripe_bp.route("/cancel-subscription", methods=["POST"])
@auth_required
def cancel_subscription():
    """Annule l'abonnement Stripe de l'utilisateur."""
    if not Config.STRIPE_SECRET_KEY:
        return jsonify({"error": "Stripe non configure"}), 503

    s = get_stripe()
    user_id = request.user_id

    try:
        supabase = get_admin_client()
        profile = supabase.table("users").select("stripe_subscription_id, stripe_customer_id") \
            .eq("id", user_id).single().execute()

        subscription_id = profile.data.get("stripe_subscription_id") if profile.data else None
        if not subscription_id:
            return jsonify({"error": "Aucun abonnement actif trouve"}), 404

        s.Subscription.cancel(subscription_id)

        supabase.table("users").update({
            "plan": "cancelled",
            "stripe_subscription_id": None
        }).eq("id", user_id).execute()

        return jsonify({"message": "Abonnement annule"}), 200
    except stripe.StripeError as e:
        return jsonify({"error": "Erreur Stripe", "detail": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Erreur serveur", "detail": str(e)}), 500


@stripe_bp.route("/status", methods=["GET"])
@auth_required
def subscription_status():
    """Retourne le plan actuel de l'utilisateur.
    Si Stripe n'est pas configure, tous les utilisateurs sont 'active' (mode bypass).
    """
    if not Config.STRIPE_SECRET_KEY:
        return jsonify({"plan": "active"}), 200
    try:
        supabase = get_admin_client()
        res = supabase.table("users").select("plan, stripe_customer_id") \
            .eq("id", request.user_id).single().execute()
        plan = res.data.get("plan", "trial") if res.data else "trial"
        return jsonify({"plan": plan}), 200
    except Exception as e:
        return jsonify({"plan": "trial"}), 200


@stripe_bp.route("/webhook", methods=["POST"])
def webhook():
    """Webhook Stripe — met a jour le plan dans Supabase apres paiement."""
    payload = request.get_data()
    sig_header = request.headers.get("Stripe-Signature", "")

    if not Config.STRIPE_WEBHOOK_SECRET:
        return jsonify({"error": "Webhook secret manquant"}), 503

    s = get_stripe()
    try:
        event = s.Webhook.construct_event(payload, sig_header, Config.STRIPE_WEBHOOK_SECRET)
    except stripe.errors.SignatureVerificationError:
        return jsonify({"error": "Signature invalide"}), 400

    supabase = get_admin_client()

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("metadata", {}).get("user_id")
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        if user_id:
            supabase.table("users").update({
                "plan": "active",
                "stripe_customer_id": customer_id,
                "stripe_subscription_id": subscription_id
            }).eq("id", user_id).execute()

    elif event["type"] in ("customer.subscription.deleted", "customer.subscription.paused"):
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")
        if customer_id:
            supabase.table("users").update({
                "plan": "cancelled",
                "stripe_subscription_id": None
            }).eq("stripe_customer_id", customer_id).execute()

    elif event["type"] == "invoice.payment_failed":
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")
        if customer_id:
            supabase.table("users").update({
                "plan": "trial"
            }).eq("stripe_customer_id", customer_id).execute()

    return jsonify({"received": True}), 200
