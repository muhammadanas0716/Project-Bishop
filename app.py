from flask import Flask, request, redirect, jsonify, session, url_for
import stripe
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file if available

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Random secret key for session management

# Configure your Stripe credentials
STRIPE_CLIENT_ID = os.getenv("STRIPE_CLIENT_ID")  # Replace with your Stripe client ID
STRIPE_CLIENT_SECRET = os.getenv("STRIPE_CLIENT_SECRET")  # Replace with your Stripe client secret
REDIRECT_URI = "http://localhost:5000/callback"  # Your app's redirect URI

stripe.api_key = STRIPE_CLIENT_SECRET

@app.route("/")
def home():
    # Redirect users to the Stripe OAuth page for authentication
    stripe_auth_url = (
        f"https://connect.stripe.com/oauth/authorize?response_type=code&client_id={STRIPE_CLIENT_ID}"
        f"&scope=read_write&redirect_uri={REDIRECT_URI}"
    )
    return f'<a href="{stripe_auth_url}">Connect with Stripe</a>'

@app.route("/callback")
def callback():
    # Handle the OAuth callback from Stripe
    code = request.args.get('code')
    if not code:
        return jsonify({"error": "Authorization code not provided"}), 400

    # Exchange authorization code for an access token
    try:
        response = stripe.OAuth.token(
            grant_type='authorization_code',
            code=code
        )
        # Save the token (access_token) and account details for API requests
        access_token = response['access_token']
        account_id = response['stripe_user_id']
        session['access_token'] = access_token
        session['account_id'] = account_id
        return redirect(url_for('fetch_total_revenue'))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/fetch_total_revenue")
def fetch_total_revenue():
    # Fetch total revenue from the connected Stripe account
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({"error": "User not authenticated"}), 401

    # Use the Stripe API with the user's access token to fetch balance/charges
    try:
        stripe.api_key = access_token  # Set the API key to the user's token

        # Retrieve balance transactions (simplified example)
        balance_transactions = stripe.BalanceTransaction.list()
        total_revenue = sum(
            tx['amount'] for tx in balance_transactions['data'] if tx['type'] == 'charge'
        )
        # Convert to dollars if needed (assuming cents)
        total_revenue_in_dollars = total_revenue / 100.0

        return jsonify({"total_revenue": total_revenue_in_dollars})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
