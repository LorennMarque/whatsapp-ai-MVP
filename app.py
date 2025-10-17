from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from supabase import create_client, Client
import dotenv
import os
import urllib.parse

dotenv.load_dotenv()
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "your-secret-key-here")

def get_auth_url():
    """Generate Google OAuth URL"""
    return supabase.auth.sign_in_with_oauth({
        "provider": "google",
        "options": {
            "redirect_to": f"{request.url_root}auth/callback"
        }
    })

@app.route('/')
def index():
    # Check if user is authenticated
    user = session.get('user')
    return render_template('index.html', user=user)

@app.route('/auth/google')
def auth_google():
    """Initiate Google OAuth flow"""
    try:
        auth_response = get_auth_url()
        return redirect(auth_response.url)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/auth/callback')
def auth_callback():
    """Handle OAuth callback - redirect to frontend with tokens"""
    return render_template('auth_callback.html')

@app.route('/auth/set-session', methods=['POST'])
def set_session():
    """Set session from frontend with tokens"""
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        refresh_token = data.get('refresh_token')
        
        if not access_token:
            return jsonify({"error": "Access token required"}), 400
        
        # Set the session with the access token
        supabase.auth.set_session(access_token, refresh_token or '')
        
        # Get user info
        user_response = supabase.auth.get_user(access_token)
        
        if user_response.user:
            session['user'] = {
                'id': user_response.user.id,
                'email': user_response.user.email,
                'name': user_response.user.user_metadata.get('full_name', ''),
                'avatar_url': user_response.user.user_metadata.get('avatar_url', '')
            }
            session['access_token'] = access_token
            session['refresh_token'] = refresh_token or ''
            
            return jsonify({"success": True, "user": session['user']})
        else:
            return jsonify({"error": "Failed to get user info"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/auth/signup', methods=['POST'])
def signup():
    """Handle user signup with email and password"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email y contraseña son requeridos"}), 400
        
        # Sign up user with Supabase
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "email_redirect_to": f"{request.url_root}auth/callback"
            }
        })
        
        if auth_response.user:
            # Set session with the user data
            session['user'] = {
                'id': auth_response.user.id,
                'email': auth_response.user.email,
                'name': auth_response.user.user_metadata.get('full_name', ''),
                'avatar_url': auth_response.user.user_metadata.get('avatar_url', '')
            }
            
            if auth_response.session:
                session['access_token'] = auth_response.session.access_token
                session['refresh_token'] = auth_response.session.refresh_token
            
            return jsonify({"success": True, "user": session['user']})
        else:
            return jsonify({"error": "Error al crear la cuenta"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/auth/logout')
def logout():
    """Logout user"""
    session.clear()
    return redirect(url_for('index'))

@app.route('/generate-agent', methods=['POST'])
def generate_agent():
    """Handle agent generation request"""
    user = session.get('user')
    if not user:
        return jsonify({"error": "Authentication required"}), 401
    
    data = request.get_json()
    prompt = data.get('prompt', '')
    
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    
    # Here you would implement your agent generation logic
    # For now, just return a success response
    return jsonify({
        "message": "Agent generation started",
        "user_id": user['id']
    })

@app.route('/chat')
def chat():
    """Chat interface"""
    user = session.get('user')
    if not user:
        return redirect(url_for('index'))
    
    # Get initial message from query parameter
    initial_message = request.args.get('message', '')
    
    return render_template('chat.html', user=user, initial_message=initial_message)

@app.route('/send-message', methods=['POST'])
def send_message():
    """Handle sending messages in chat"""
    user = session.get('user')
    if not user:
        return jsonify({"error": "Authentication required"}), 401
    
    data = request.get_json()
    message = data.get('message', '')
    
    if not message:
        return jsonify({"error": "Message is required"}), 400
    
    # Here you would implement your message processing logic
    # For now, just return a success response
    return jsonify({
        "success": True,
        "message": "Message sent successfully"
    })

if __name__ == '__main__':
    app.run(debug=True)
