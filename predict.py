from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import os

# Load model
model = load_model("food_multi_model.h5")

# Load and preprocess image (⚠️ match training size: 150x150)
img_path = "test_image1.jpg"  # 🔁 Replace with actual image file name if needed
img = image.load_img(img_path, target_size=(128, 128))
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0) / 255.0  # Normalize

# Predict
predictions = model.predict(img_array)
predicted_index = np.argmax(predictions)

# Get class labels (sorted alphabetically)
class_dir = "C:/FOOD_PREDICTION/backend/dataset/train"
class_names = sorted(os.listdir(class_dir))

print("✅ Predicted class:", class_names[predicted_index])

