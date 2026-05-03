import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Paths
test_dir = 'dataset/test'

# Load model
model = load_model("food_multi_model.h5")

# Preprocess test data
test_gen = ImageDataGenerator(rescale=1./255)
test_data = test_gen.flow_from_directory(
    test_dir,
    target_size=(150, 150),
    batch_size=32,
    class_mode='categorical'
)

# Evaluate
loss, accuracy = model.evaluate(test_data)
print(f"\n✅ Test Accuracy: {accuracy * 100:.2f}%")


