import os
import numpy as np
from datetime import datetime, date
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, errors
from werkzeug.security import generate_password_hash, check_password_hash
from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing import image

from extract_expiry_dates import extract_expiry_date

# --- Flask App ---
app = Flask(__name__)
CORS(app)

# --- MongoDB Connection ---
try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client["Food_prediction"]
    users_collection = db["users"]
    food_predictions_collection = db["food_predictions"]
except errors.ConnectionFailure as e:
    print(f"[ERROR] Could not connect to MongoDB: {e}")

# --- Load Trained Model ---
model_path = "food_multi_model.h5"
if not os.path.exists(model_path):
    raise FileNotFoundError(f"❌ Model not found at: {model_path}")
model = load_model(model_path)

# --- Class Names (Must match training order exactly) ---
# # class_names = [
# #     'freshapples', 'freshbanana', 'freshbittergroud', 'freshcapsicum', 'freshcucumber',
# #     'freshokra', 'freshoranges', 'freshpotato', 'freshtomato',
# #     'rottenapples', 'rottenbanana', 'rottenbittergroud', 'rottencapsicum', 'rottencucumber',
# #     'rottenokra', 'rottenoranges', 'rottenpotato', 'rottentomato'
# # ]
# model.class_names = class_names

# -------------------- Registration --------------------
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'user')

        if not username or not email or not password:
            return jsonify({"message": "All fields are required"}), 400

        if users_collection.find_one({"email": email}):
            return jsonify({"message": "Email already registered"}), 409

        hashed_password = generate_password_hash(password)

        users_collection.insert_one({
            "username": username,
            "email": email,
            "password": hashed_password,
            "role": role
        })

        return jsonify({"message": "Registration successful"}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

# -------------------- Login --------------------
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = users_collection.find_one({"email": email})
        if not user or not check_password_hash(user['password'], password):
            return jsonify({"message": "Invalid credentials"}), 401

        return jsonify({
            "message": "Login successful",
            "username": user['username'],
            "role": user.get('role', 'user')
        }), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

# -------------------- Image Upload & Prediction --------------------
@app.route('/process-image', methods=['POST'])
def process_image():
    image_file = request.files.get('image')
    food_type = request.form.get('food_type')

    if not image_file:
        return jsonify({'success': False, 'message': 'No image uploaded'}), 400

    if food_type == 'packed':
        try:
            temp_path = f"temp_image_{datetime.now().timestamp()}.jpg"
            image_file.save(temp_path)

            extracted_dates = extract_expiry_date(temp_path)
            os.remove(temp_path)

            if not extracted_dates or extracted_dates[0] == 'No valid date found':
                return jsonify({'success': False, 'message': 'Could not extract expiry date'}), 422

            expiry = datetime.strptime(extracted_dates[0], "%Y-%m-%d").date()
            today = date.today()
            days_left = (expiry - today).days

            food_predictions_collection.insert_one({
                "food_type": "packed",
                "expiry_date": expiry.strftime('%Y-%m-%d'),
                "days_left": days_left,
                "is_expired": days_left < 0,
                "timestamp": datetime.now()
            })

            message = "Food is already expired!" if days_left < 0 else f"Food will expire in {days_left} days"
            return jsonify({'success': True, 'message': message}), 200

        except Exception as e:
            return jsonify({'success': False, 'message': f'OCR Error: {str(e)}'}), 500

    elif food_type == 'non-packed':
        try:
            os.makedirs("temp_uploads", exist_ok=True)
            temp_path = os.path.join("temp_uploads", f"temp_{datetime.now().timestamp()}.jpg")
            image_file.save(temp_path)

            # Preprocess image
            img = image.load_img(temp_path, target_size=(128, 128))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0) / 255.0

            # Predict
            predictions = model.predict(img_array)[0]
            predicted_index = np.argmax(predictions)
            predicted_class = model.class_names[predicted_index]
            confidence = float(predictions[predicted_index])
            freshness = 'fresh' if predicted_class.startswith('fresh') else 'rotten'

            # Save to DB
            food_predictions_collection.insert_one({
                "food_type": "non-packed",
                "predicted_class": predicted_class,
                "freshness": freshness,
                "confidence": round(confidence, 4),
                "timestamp": datetime.now()
            })

            os.remove(temp_path)

            return jsonify({
                'success': True,
                'freshness': freshness,
                'predicted_class': predicted_class,
                'confidence': round(confidence, 4),
                'message': f"Food is predicted to be {freshness.upper()} ({predicted_class}) with {(confidence * 100):.2f}% confidence"
            }), 200

        except Exception as e:
            return jsonify({'success': False, 'message': f'CNN Error: {str(e)}'}), 500

    else:
        return jsonify({'success': False, 'message': 'Invalid food type'}), 400

# -------------------- Get All Predictions --------------------
@app.route('/predictions', methods=['GET'])
def get_predictions():
    try:
        predictions = []
        for doc in food_predictions_collection.find().sort("timestamp", -1):
            doc['_id'] = str(doc['_id'])
            if isinstance(doc.get('timestamp'), datetime):
                doc['timestamp'] = doc['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
            predictions.append(doc)
        return jsonify(predictions), 200
    except Exception as e:
        return jsonify({"message": f"Fetch error: {str(e)}"}), 500

# -------------------- Health Check --------------------
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "UP"}), 200

# -------------------- Run App --------------------
if __name__ == '__main__':
    app.run(debug=True)   