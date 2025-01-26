from flask import Flask, render_template
import requests

app = Flask(__name__)

# Replace with your actual account ID and access token
account_id = '6YA27038'
access_token = 'MxvfYrrszjYuPZoiKOTdWnA0s6hr'

@app.route('/')
def index():
    # Set the endpoint URL
    url = f'https://api.tradier.com/v1/accounts/{account_id}/balances'

    # Set the headers
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Accept': 'application/json'
    }

    # Make the API request
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        # Parse the JSON response
        data = response.json()
        balances = data.get('balances', {})
        return render_template('index.html', balances=balances)
    else:
        error_message = f'Error: {response.status_code} - {response.text}'
        return render_template('index.html', error=error_message)

if __name__ == '__main__':
    app.run(debug=True)
