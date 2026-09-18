"""
Subscription management routes for F&B monetization.
Handles Stripe checkout, webhooks, and usage tracking.
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, date
import stripe
import os
from functools import wraps
from models import User, db  # Adjust imports per your setup
import logging

logger = logging.getLogger(__name__)

subscriptions_bp = Blueprint('subscriptions', __name__)

# Stripe configuration
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://stockpredi.vercel.app')

# Stripe Product IDs
STRIPE_PRICES = {
    'free': None,  # No charge
    'pro': os.getenv('STRIPE_F&B_PRO', 'price_1234pro'),
    'enterprise': os.getenv('STRIPE_F&B_ENTERPRISE', 'price_1234ent')
}

# Forecast limits per tier
FORECAST_LIMITS = {
    'free': 1,
    'pro': 10,
    'enterprise': 999  # Unlimited
}

def auth_required(f):
    """Decorator to require authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return {'error': 'Missing authentication token'}, 401
        
        token = auth_header.split(' ')[1]
        # Verify token (implement based on your auth system)
        user_id = verify_token(token)  # Your token verification function
        if not user_id:
            return {'error': 'Invalid token'}, 401
        
        return f(user_id, *args, **kwargs)
    return decorated_function

@subscriptions_bp.route('/create-session', methods=['POST'])
@auth_required
def create_checkout_session(user_id):
    """Create Stripe checkout session for F&B upgrade."""
    try:
        data = request.json
        tier = data.get('tier')
        
        if tier not in ['pro', 'enterprise']:
            return {'error': f'Invalid tier: {tier}'}, 400
        
        price_id = STRIPE_PRICES.get(tier)
        if not price_id:
            return {'error': f'No price configured for tier: {tier}'}, 500
        
        # Get user
        user = db.session.query(User).filter(User.id == user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        # Create Stripe checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                }
            ],
            mode='subscription',
            success_url=f'{FRONTEND_URL}/fob/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{FRONTEND_URL}/fob/pricing',
            customer_email=user.email,
            metadata={
                'user_id': str(user_id),
                'tier': tier,
                'sector': 'fob'
            }
        )
        
        logger.info(f'Checkout session created for user {user_id}: {session.id}')
        return {'checkout_url': session.url, 'session_id': session.id}, 200
        
    except stripe.error.StripeError as e:
        logger.error(f'Stripe error: {e}')
        return {'error': f'Stripe error: {str(e)}'}, 500
    except Exception as e:
        logger.error(f'Unexpected error: {e}')
        return {'error': 'Internal server error'}, 500

@subscriptions_bp.route('/webhook', methods=['POST'])
def handle_stripe_webhook():
    """Handle Stripe webhook events."""
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f'Invalid payload: {e}')
        return {'error': 'Invalid payload'}, 400
    except stripe.error.SignatureVerificationError as e:
        logger.error(f'Invalid signature: {e}')
        return {'error': 'Invalid signature'}, 400
    
    # Handle subscription.created
    if event['type'] == 'customer.subscription.created':
        subscription = event['data']['object']
        user_id = subscription.get('metadata', {}).get('user_id')
        tier = subscription.get('metadata', {}).get('tier')
        
        if not user_id or not tier:
            logger.warning(f'Missing metadata in subscription: {subscription}')
            return {'status': 'warning'}, 200
        
        # Update user
        user = db.session.query(User).filter(User.id == user_id).first()
        if user:
            user.stripe_subscription_id = subscription['id']
            user.stripe_subscription_tier = tier
            user.stripe_subscription_status = subscription['status']
            user.subscription_started_at = datetime.fromtimestamp(subscription['created'])
            user.forecast_limit_monthly = FORECAST_LIMITS.get(tier, 1)
            user.forecast_reset_date = date.today()
            
            db.session.add(user)
            db.session.commit()
            
            logger.info(f'User {user_id} upgraded to {tier} tier')
    
    # Handle subscription.updated (upgrades/downgrades)
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        previous = event['data'].get('previous_attributes', {})
        user_id = subscription.get('metadata', {}).get('user_id')
        tier = subscription.get('metadata', {}).get('tier')
        
        if user_id and tier:
            user = db.session.query(User).filter(User.id == user_id).first()
            if user:
                old_tier = user.stripe_subscription_tier
                user.stripe_subscription_tier = tier
                user.stripe_subscription_status = subscription['status']
                user.forecast_limit_monthly = FORECAST_LIMITS.get(tier, 1)
                
                db.session.add(user)
                db.session.commit()
                
                logger.info(f'User {user_id} changed from {old_tier} to {tier}')
    
    # Handle subscription.deleted (cancellations)
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        user_id = subscription.get('metadata', {}).get('user_id')
        
        if user_id:
            user = db.session.query(User).filter(User.id == user_id).first()
            if user:
                user.stripe_subscription_tier = 'free'
                user.stripe_subscription_status = 'canceled'
                user.subscription_ended_at = datetime.fromtimestamp(subscription['ended_at'])
                user.forecast_limit_monthly = FORECAST_LIMITS['free']
                
                db.session.add(user)
                db.session.commit()
                
                logger.info(f'User {user_id} subscription canceled')
    
    return {'status': 'success'}, 200

@subscriptions_bp.route('/tier', methods=['GET'])
@auth_required
def get_subscription_tier(user_id):
    """Get current subscription tier and usage."""
    try:
        user = db.session.query(User).filter(User.id == user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        # Get today's usage
        today = date.today()
        from models import ForecastUsage  # Adjust import
        usage = db.session.query(ForecastUsage).filter(
            ForecastUsage.user_id == user_id,
            ForecastUsage.forecast_date == today
        ).first()
        
        used_today = usage.forecast_count if usage else 0
        limit = user.forecast_limit_monthly
        
        return {
            'tier': user.stripe_subscription_tier,
            'status': user.stripe_subscription_status,
            'limit': limit,
            'used_today': used_today,
            'remaining': limit - used_today,
            'subscription_started': user.subscription_started_at.isoformat() if user.subscription_started_at else None,
            'upgrade_url': f'{FRONTEND_URL}/fob/pricing'
        }, 200
        
    except Exception as e:
        logger.error(f'Error getting tier: {e}')
        return {'error': 'Internal server error'}, 500

# Export the blueprint
__all__ = ['subscriptions_bp']
