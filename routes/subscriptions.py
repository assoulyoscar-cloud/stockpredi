"""
PHASE 4 P1: Subscriptions Management
Single tier: €35 HT/month
"""
from flask import Blueprint, request, jsonify, current_app
from functools import wraps
import stripe
import os
from datetime import datetime, timedelta
import jwt
from supabase import create_client

subscriptions_bp = Blueprint('subscriptions', __name__)

# Config
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
STRIPE_PRICE_ID = os.getenv('STRIPE_PRICE_ID')  # €35 HT/month
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
JWT_SECRET = os.getenv('JWT_SECRET')

stripe.api_key = STRIPE_SECRET_KEY
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def auth_required(f):
    """Decorator: Extract user from JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Missing authorization header'}), 401
        
        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.user_id = payload['sub']
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'detail': str(e)}), 401
    
    return decorated

@subscriptions_bp.route('/create-session', methods=['POST'])
@auth_required
def create_checkout_session():
    """Create Stripe checkout session"""
    try:
        user_id = request.user_id
        
        # Get user email from Supabase
        user_data = supabase.table('users').select('email').eq('id', user_id).single().execute()
        email = user_data.data['email']
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer_email=email,
            payment_method_types=['card'],
            line_items=[{
                'price': STRIPE_PRICE_ID,
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://stockpredi.vercel.app/dashboard?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://stockpredi.vercel.app/industries/food-beverage',
            client_reference_id=user_id,
            metadata={'user_id': user_id}
        )
        
        return jsonify({'checkout_url': session.url}), 200
    
    except stripe.error.StripeError as e:
        current_app.logger.error(f'Stripe error: {str(e)}')
        return jsonify({'error': 'Stripe error', 'detail': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f'Checkout error: {str(e)}')
        return jsonify({'error': 'Checkout failed', 'detail': str(e)}), 500

@subscriptions_bp.route('/webhook', methods=['POST'])
def handle_stripe_webhook():
    """Handle Stripe subscription events"""
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except ValueError:
        current_app.logger.error('Invalid payload')
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError:
        current_app.logger.error('Invalid signature')
        return jsonify({'error': 'Invalid signature'}), 400
    
    try:
        if event['type'] == 'customer.subscription.created':
            subscription = event['data']['object']
            user_id = subscription['metadata'].get('user_id')
            
            # Update user subscription
            supabase.table('users').update({
                'stripe_subscription_id': subscription['id'],
                'stripe_subscription_status': subscription['status'],
                'subscription_started_at': datetime.fromtimestamp(subscription['created']).isoformat()
            }).eq('id', user_id).execute()
            
            # Log event
            supabase.table('subscription_logs').insert({
                'user_id': user_id,
                'event_type': 'subscription_created',
                'metadata': {'subscription_id': subscription['id'], 'status': subscription['status']}
            }).execute()
            
            current_app.logger.info(f'Subscription created for user {user_id}')
        
        elif event['type'] == 'customer.subscription.updated':
            subscription = event['data']['object']
            user_id = subscription['metadata'].get('user_id')
            
            supabase.table('users').update({
                'stripe_subscription_status': subscription['status']
            }).eq('id', user_id).execute()
            
            supabase.table('subscription_logs').insert({
                'user_id': user_id,
                'event_type': 'subscription_updated',
                'metadata': {'subscription_id': subscription['id'], 'status': subscription['status']}
            }).execute()
            
            current_app.logger.info(f'Subscription updated for user {user_id}')
        
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            user_id = subscription['metadata'].get('user_id')
            
            supabase.table('users').update({
                'stripe_subscription_status': 'canceled',
                'subscription_ended_at': datetime.utcnow().isoformat()
            }).eq('id', user_id).execute()
            
            supabase.table('subscription_logs').insert({
                'user_id': user_id,
                'event_type': 'subscription_deleted',
                'metadata': {'subscription_id': subscription['id']}
            }).execute()
            
            current_app.logger.info(f'Subscription deleted for user {user_id}')
        
        return jsonify({'received': True}), 200
    
    except Exception as e:
        current_app.logger.error(f'Webhook processing error: {str(e)}')
        return jsonify({'error': 'Processing failed', 'detail': str(e)}), 500

@subscriptions_bp.route('/tier', methods=['GET'])
@auth_required
def get_subscription_tier():
    """Get current subscription status"""
    try:
        user_id = request.user_id
        
        user_data = supabase.table('users').select(
            'stripe_subscription_status, stripe_subscription_id, subscription_started_at'
        ).eq('id', user_id).single().execute()
        
        status = user_data.data.get('stripe_subscription_status', 'inactive')
        
        return jsonify({
            'subscription_status': status,
            'subscription_id': user_data.data.get('stripe_subscription_id'),
            'subscription_started': user_data.data.get('subscription_started_at'),
            'price_eur': 35.00
        }), 200
    
    except Exception as e:
        current_app.logger.error(f'Get tier error: {str(e)}')
        return jsonify({'error': 'Failed to get tier', 'detail': str(e)}), 500
